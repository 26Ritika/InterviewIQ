import os
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta
from sqlalchemy.orm import Session
import redis
import json
import logging

from hint_engine import get_similar_problems, get_hint, analyze_complexity, get_pattern, review_code, ask_groq
from mock_interview import get_random_problem, evaluate_solution, get_follow_up_questions
from progress_tracker import add_solved_problem, add_mock_interview, get_stats
from database import get_db, init_db, SolvedProblem, MockInterview, HintHistory
from auth import create_access_token, create_user, authenticate_user, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    redis_client.ping()
    REDIS_AVAILABLE = True
    print("✅ Redis connected!")
except:
    REDIS_AVAILABLE = False
    print("⚠️ Redis not available")

def cache_get(key):
    if not REDIS_AVAILABLE: return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except: return None

def cache_set(key, value, expire=3600):
    if not REDIS_AVAILABLE: return
    try: redis_client.setex(key, expire, json.dumps(value))
    except: pass

app = FastAPI(
    title="Interview IQ API",
    description="AI-powered DSA coaching API built for Interview Prep",
    version="2.0.0"
)

init_db()

def create_default_user():
    from database import SessionLocal, User
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if not existing:
            create_user(db, "admin", "admin@leetcode.com", "admin123")
            print("✅ Default admin user created!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

create_default_user()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    company: Optional[str] = "All Companies"
    top_k: Optional[int] = 5

class HintRequest(BaseModel):
    problem_title: str
    hint_level: Optional[int] = 1

class ComplexityRequest(BaseModel):
    problem_title: str
    approach: str

class PatternRequest(BaseModel):
    problem_title: str

class CodeReviewRequest(BaseModel):
    problem_title: str
    code: str

class MockRequest(BaseModel):
    difficulty: Optional[str] = "Any"
    company: Optional[str] = "All Companies"

class EvaluateRequest(BaseModel):
    problem_title: str
    approach: str
    time_taken: int

class FollowUpRequest(BaseModel):
    problem_title: str
    approach: str

class SolvedRequest(BaseModel):
    title: str
    difficulty: str
    company: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = "general"

@app.get("/api")
def root():
    return {
        "message": "🤖 InterviewIQ AI Coach API",
        "status": "running",
        "features": [
            "Semantic Search", "AI Hints", "Complexity Analysis",
            "Pattern Detection", "Code Review", "Mock Interview",
            "AI Chat", "Progress Tracking", "Leaderboard"
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "redis": REDIS_AVAILABLE}

@app.post("/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    from database import User
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists!")
    new_user = create_user(db, user.username, user.email, user.password)
    return {"message": f"✅ User {user.username} created!", "username": new_user.username}

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Wrong username or password!")
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "created_at": str(current_user.created_at)
    }

@app.post("/search")
def search_problems(request: SearchRequest):
    try:
        cache_key = f"search:{request.query}:{request.company}"
        cached = cache_get(cache_key)
        if cached: return cached
        problems = get_similar_problems(request.query, top_k=request.top_k, company=request.company)
        seen = set()
        unique = []
        for p in problems:
            if p["title"] not in seen:
                seen.add(p["title"])
                unique.append(p)
        result = {"query": request.query, "company": request.company, "results": unique, "count": len(unique)}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/hint")
def get_problem_hint(request: HintRequest):
    try:
        cache_key = f"hint:{request.problem_title}:{request.hint_level}"
        cached = cache_get(cache_key)
        if cached: return cached
        hint = get_hint(request.problem_title, request.hint_level)
        result = {"problem": request.problem_title, "hint_level": request.hint_level, "hint": hint}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/complexity")
def analyze_problem_complexity(request: ComplexityRequest):
    try:
        analysis = analyze_complexity(request.problem_title, request.approach)
        return {"problem": request.problem_title, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pattern")
def detect_pattern(request: PatternRequest):
    try:
        cache_key = f"pattern:{request.problem_title}"
        cached = cache_get(cache_key)
        if cached: return cached
        pattern = get_pattern(request.problem_title)
        result = {"problem": request.problem_title, "pattern": pattern}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/review")
def review_code_endpoint(request: CodeReviewRequest):
    try:
        review = review_code(request.problem_title, request.code)
        return {"problem": request.problem_title, "review": review}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mock/start")
def start_mock_interview(request: MockRequest):
    try:
        problem = get_random_problem(request.difficulty, request.company)
        if not problem:
            raise HTTPException(status_code=404, detail="No problems found!")
        return {"problem": problem, "time_limit": 45, "message": "Good luck!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mock/evaluate")
def evaluate_mock_solution(request: EvaluateRequest):
    try:
        evaluation = evaluate_solution(request.problem_title, request.approach, request.time_taken)
        return {"problem": request.problem_title, "evaluation": evaluation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mock/followup")
def get_followup_questions(request: FollowUpRequest):
    try:
        followups = get_follow_up_questions(request.problem_title, request.approach)
        return {"problem": request.problem_title, "followup_questions": followups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/progress/solved")
def mark_problem_solved(request: SolvedRequest):
    try:
        score = {"Easy": 10, "Medium": 20, "Hard": 30}
        progress = add_solved_problem(request.title, request.difficulty, request.company, score=score.get(request.difficulty, 10))
        return {"message": f"✅ {request.title} marked as solved!", "total_solved": len(progress["solved_problems"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress/stats")
def get_progress_stats():
    try:
        return get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/db/solved")
def db_mark_solved(request: SolvedRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        score = {"Easy": 10, "Medium": 20, "Hard": 30}
        problem = SolvedProblem(
            user_id=current_user.id, title=request.title,
            difficulty=request.difficulty, company=request.company,
            score=score.get(request.difficulty, 10)
        )
        db.add(problem)
        db.commit()
        return {"message": f"✅ {request.title} saved!", "user": current_user.username}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/db/my-progress")
def get_my_progress(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        solved = db.query(SolvedProblem).filter(SolvedProblem.user_id == current_user.id).all()
        mocks = db.query(MockInterview).filter(MockInterview.user_id == current_user.id).all()
        return {
            "username": current_user.username,
            "total_solved": len(solved),
            "easy": len([p for p in solved if p.difficulty == "Easy"]),
            "medium": len([p for p in solved if p.difficulty == "Medium"]),
            "hard": len([p for p in solved if p.difficulty == "Hard"]),
            "mock_interviews": len(mocks),
            "total_score": sum(p.score for p in solved),
            "recent_problems": [
                {"title": p.title, "difficulty": p.difficulty, "company": p.company, "solved_at": str(p.solved_at)}
                for p in solved[-5:]
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/db/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    try:
        from database import User
        from sqlalchemy import func
        results = db.query(
            User.username,
            func.count(SolvedProblem.id).label("total"),
            func.sum(SolvedProblem.score).label("score")
        ).join(SolvedProblem, User.id == SolvedProblem.user_id, isouter=True
        ).group_by(User.id).order_by(func.sum(SolvedProblem.score).desc()).limit(10).all()
        return {
            "leaderboard": [
                {"rank": i + 1, "username": r.username, "problems_solved": r.total or 0, "total_score": r.score or 0}
                for i, r in enumerate(results)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def ai_chat(request: ChatRequest):
    try:
        prompt = f"""You are an expert LeetCode and DSA coach helping someone prepare for Google interview.

User message: {request.message}

Give a helpful, encouraging response. Keep it concise and practical.
If they ask about a specific problem, give hints without full solution.
If they ask about concepts, explain clearly with examples.
Use emojis to make it friendly!"""
        response = ask_groq(prompt)
        return {"response": response, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Serve React Frontend (MUST BE LAST) ──────────────────────
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend/dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=f"{frontend_dist}/assets"), name="assets")

@app.get("/")
def serve_frontend():
    index = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index):
        return FileResponse(index)
    return {"message": "Frontend not built. Run: cd frontend && npm run build"}

@app.get("/{full_path:path}")
def catch_all(full_path: str):
    file = os.path.join(frontend_dist, full_path)
    if os.path.exists(file):
        return FileResponse(file)
    index = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index):
        return FileResponse(index)
    return {"message": "Frontend not found"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)