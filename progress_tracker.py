import json
import os
from datetime import datetime, date

PROGRESS_FILE = "progress.json"

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r") as f:
            return json.load(f)
    return {
        "solved_problems": [],
        "mock_interviews": [],
        "last_solved_date": None,
        "streak": 0
    }

def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2, default=str)

def add_solved_problem(title, difficulty, company, score=10):
    progress = load_progress()
    today = str(date.today())

    # Check duplicate
    existing = [p for p in progress["solved_problems"]
                if p["title"] == title and p["solved_at"][:10] == today]
    if not existing:
        progress["solved_problems"].append({
            "title": title,
            "difficulty": difficulty,
            "company": company,
            "score": score,
            "solved_at": str(datetime.now())
        })

    # Update streak
    if progress["last_solved_date"] != today:
        if progress["last_solved_date"] == str(date.fromordinal(date.today().toordinal() - 1)):
            progress["streak"] = progress.get("streak", 0) + 1
        else:
            progress["streak"] = 1
        progress["last_solved_date"] = today

    save_progress(progress)
    return progress

def add_mock_interview(problem_title, score, time_taken):
    progress = load_progress()
    progress["mock_interviews"].append({
        "problem_title": problem_title,
        "score": score,
        "time_taken": time_taken,
        "created_at": str(datetime.now())
    })
    save_progress(progress)
    return progress

def get_stats():
    progress = load_progress()
    solved = progress["solved_problems"]
    today = str(date.today())

    # Remove duplicates for recent activity
    seen = set()
    unique_recent = []
    for item in reversed(solved):
        key = f"{item['title']}_{item['solved_at'][:10]}"
        if key not in seen:
            seen.add(key)
            unique_recent.append(item)

    return {
        "total_solved": len(solved),
        "streak": progress.get("streak", 0),
        "today_solved": len([p for p in solved if p["solved_at"][:10] == today]),
        "mock_interviews": len(progress["mock_interviews"]),
        "easy": len([p for p in solved if p["difficulty"] == "Easy"]),
        "medium": len([p for p in solved if p["difficulty"] == "Medium"]),
        "hard": len([p for p in solved if p["difficulty"] == "Hard"]),
        "google": len([p for p in solved if p["company"] == "Google"]),
        "amazon": len([p for p in solved if p["company"] == "Amazon"]),
        "meta": len([p for p in solved if p["company"] == "Meta"]),
        "microsoft": len([p for p in solved if p["company"] == "Microsoft"]),
        "recent": list(reversed(unique_recent[:10]))
    }