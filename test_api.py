import pytest
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

# ── Health Check ─────────────────────────────────────────────
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()

def test_root_api():
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json()["status"] == "running"

# ── Auth Tests ───────────────────────────────────────────────
def test_register_user():
    response = client.post("/auth/register", json={
        "username": "testuser123",
        "email": "test123@test.com",
        "password": "test123"
    })
    assert response.status_code == 200

def test_login_user():
    response = client.post("/auth/login", data={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    response = client.post("/auth/login", data={
        "username": "admin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

# ── Search Tests ─────────────────────────────────────────────
def test_search_basic():
    response = client.post("/search", json={
        "query": "two sum array"
    })
    assert response.status_code == 200
    assert "results" in response.json()

def test_search_with_company():
    response = client.post("/search", json={
        "query": "binary search",
        "company": "Google"
    })
    assert response.status_code == 200

# ── Hint Tests ───────────────────────────────────────────────
def test_get_hint():
    response = client.post("/hint", json={
        "problem_title": "Two Sum",
        "hint_level": 1
    })
    assert response.status_code == 200
    assert "hint" in response.json()

def test_get_hint_level2():
    response = client.post("/hint", json={
        "problem_title": "Two Sum",
        "hint_level": 2
    })
    assert response.status_code == 200

# ── Pattern Tests ────────────────────────────────────────────
def test_get_pattern():
    response = client.post("/pattern", json={
        "problem_title": "Two Sum"
    })
    assert response.status_code == 200
    assert "pattern" in response.json()

# ── Mock Interview Tests ─────────────────────────────────────
def test_start_mock_interview():
    response = client.post("/mock/start", json={
        "difficulty": "Easy",
        "company": "All Companies"
    })
    assert response.status_code == 200
    assert "problem" in response.json()

def test_mock_any_difficulty():
    response = client.post("/mock/start", json={
        "difficulty": "Any"
    })
    assert response.status_code == 200

# ── Progress Tests ───────────────────────────────────────────
def test_get_stats():
    response = client.get("/progress/stats")
    assert response.status_code == 200

def test_mark_solved():
    response = client.post("/progress/solved", json={
        "title": "Two Sum",
        "difficulty": "Easy",
        "company": "Google"
    })
    assert response.status_code == 200

# ── Leaderboard Test ─────────────────────────────────────────
def test_leaderboard():
    response = client.get("/db/leaderboard")
    assert response.status_code == 200
    assert "leaderboard" in response.json()

# ── Chat Test ────────────────────────────────────────────────
def test_ai_chat():
    response = client.post("/chat", json={
        "message": "How do I solve Two Sum?",
        "context": "general"
    })
    assert response.status_code == 200
    assert "response" in response.json()