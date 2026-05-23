import os
from groq import Groq
from dotenv import load_dotenv
import chromadb
from sentence_transformers import SentenceTransformer
import random
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# =====================
# Initialize
# =====================
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_collection("leetcode")
    print("✅ ChromaDB connected!")
except Exception as e:
    print(f"❌ ChromaDB error: {e}")
    collection = None

try:
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("✅ Sentence Transformer loaded!")
except Exception as e:
    print(f"❌ Model error: {e}")
    model = None

# =====================
# Fallback Problems
# =====================
FALLBACK_PROBLEMS = [
    {
        "title": "Two Sum",
        "difficulty": "Easy",
        "tags": "HashMap",
        "companies": "Google, Amazon"
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "tags": "Sliding Window",
        "companies": "Google, Meta"
    },
    {
        "title": "Median of Two Sorted Arrays",
        "difficulty": "Hard",
        "tags": "Binary Search",
        "companies": "Google"
    },
    {
        "title": "Number of Islands",
        "difficulty": "Medium",
        "tags": "BFS/DFS",
        "companies": "Amazon, Meta"
    },
    {
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "tags": "Stack",
        "companies": "Google, Microsoft"
    },
    {
        "title": "Merge Intervals",
        "difficulty": "Medium",
        "tags": "Sorting",
        "companies": "Google, Amazon"
    },
    {
        "title": "Word Ladder",
        "difficulty": "Hard",
        "tags": "BFS",
        "companies": "Google"
    },
    {
        "title": "LRU Cache",
        "difficulty": "Medium",
        "tags": "HashMap + LinkedList",
        "companies": "Amazon, Meta"
    },
    {
        "title": "Trapping Rain Water",
        "difficulty": "Hard",
        "tags": "Two Pointers",
        "companies": "Google, Amazon"
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "tags": "Dynamic Programming",
        "companies": "Amazon"
    },
]

# =====================
# Get Random Problem
# =====================
def get_random_problem(difficulty=None, company=None):
    """Get random problem for mock interview"""
    logger.info(f"Getting problem: difficulty={difficulty}, company={company}")

    problems = []

    # Try ChromaDB first
    if collection:
        try:
            results = collection.get()
            problems = results["metadatas"]
            logger.info(f"Found {len(problems)} problems in ChromaDB")
        except Exception as e:
            logger.error(f"ChromaDB error: {e}")
            problems = []

    # Use fallback if ChromaDB empty
    if not problems:
        problems = FALLBACK_PROBLEMS
        logger.info("Using fallback problems")

    # Filter by difficulty
    if difficulty and difficulty != "Any":
        filtered = [p for p in problems if p.get("difficulty") == difficulty]
        if filtered:
            problems = filtered

    # Filter by company
    if company and company != "All Companies":
        filtered = [p for p in problems if company in p.get("companies", "")]
        if filtered:
            problems = filtered

    if problems:
        problem = random.choice(problems)
        logger.info(f"Selected problem: {problem.get('title')}")
        return problem

    return None

# =====================
# Evaluate Solution
# =====================
def evaluate_solution(problem_title, user_approach, time_taken):
    """AI evaluates user's solution like a real Google interviewer"""
    logger.info(f"Evaluating solution for: {problem_title}")

    prompt = f"""You are a senior Google software engineer interviewing a candidate.

Problem: {problem_title}
Time taken: {time_taken} minutes
Candidate's approach: {user_approach}

Evaluate strictly on these 4 criteria:

1. ✅ Correctness (0-25 points)
   - Does the approach solve the problem correctly?
   - Are edge cases handled?

2. ⚡ Time Complexity (0-25 points)
   - What is the time complexity?
   - Is it optimal?

3. 💾 Space Complexity (0-25 points)
   - What is the space complexity?
   - Can it be improved?

4. 📝 Communication & Code Quality (0-25 points)
   - Was the approach clearly explained?
   - Is the code clean and readable?

Format your response exactly like this:

SCORES:
- Correctness: X/25
- Time Complexity: X/25
- Space Complexity: X/25
- Communication: X/25
- TOTAL: X/100

VERDICT: PASS ✅ / FAIL ❌

WHAT WAS GOOD:
[2-3 specific positive points]

WHAT TO IMPROVE:
[2-3 specific improvement points]

OPTIMAL SOLUTION HINT:
[Brief hint about the best approach without giving full code]

Be honest but encouraging like a good interviewer!"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq error: {e}")
        return f"❌ Error evaluating solution: {str(e)}"

# =====================
# Get Follow Up Questions
# =====================
def get_follow_up_questions(problem_title, user_approach):
    """Generate follow up questions like real Google interview"""
    logger.info(f"Generating followups for: {problem_title}")

    prompt = f"""You are a senior Google interviewer.

Problem just solved: {problem_title}
Candidate's approach: {user_approach}

Generate exactly 5 follow-up questions a Google interviewer would ask:

1. OPTIMIZATION question
   - Ask about improving time/space complexity

2. EDGE CASES question
   - Ask about handling tricky inputs

3. SCALABILITY question
   - Ask how solution handles millions of users/data

4. VARIATION question
   - Ask about a slight variation of the problem

5. SYSTEM DESIGN question
   - Ask how this would work in a real system

Format:
Q1 (Optimization): [question]
Q2 (Edge Cases): [question]
Q3 (Scalability): [question]
Q4 (Variation): [question]
Q5 (System Design): [question]

Keep questions challenging but fair!"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq error: {e}")
        return f"❌ Error generating followups: {str(e)}"

# =====================
# Get Problem Hint During Interview
# =====================
def get_interview_hint(problem_title, time_taken):
    """Give a small hint during mock interview"""
    logger.info(f"Getting interview hint for: {problem_title}")

    prompt = f"""The candidate has been stuck on "{problem_title}" for {time_taken} minutes.

Give ONE small hint without revealing the solution.
Keep it to 1-2 sentences maximum.
Be encouraging!"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq error: {e}")
        return "Think about what data structure would help you avoid repeated work! 💡"