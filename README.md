# 🤖 InterviewIQ

> AI-powered interview preparation platform built for Google, Amazon,Microsift, Meta interviews



![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi)




![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react)




![AI](https://img.shields.io/badge/Groq-LLaMA3.3-green)




![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-blue)



---

## ✨ Features

- 🔍 **Semantic Search** — Find similar problems using AI
- 💡 **3-Level Hint Engine** — Vague → Medium → Specific hints
- ⚡ **Complexity Analyzer** — Instant Big-O analysis
- 🌿 **Pattern Detector** — Identify DSA patterns
- 👨‍💻 **AI Code Review** — Get feedback like a big tech engineer
- 🎯 **Mock Interview** — Simulate real interviews with AI
- 🤖 **AI Chat Coach** — ChatGPT for interview prep
- 📊 **Progress Dashboard** — GitHub-style streak calendar
- 🏆 **Leaderboard** — Compete with other users

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — High performance Python API
- **Groq LLaMA 3.3 70B** — State of the art LLM
- **ChromaDB** — Vector database for semantic search
- **Sentence Transformers** — Text embeddings
- **SQLite** — User data storage
- **Redis** — Caching for fast responses
- **JWT Auth** — Secure authentication

### Frontend
- **React 18** — Modern UI framework
- **React Router** — Navigation
- **Axios** — API calls
- **Vite** — Fast build tool

---


### Backend
```bash
cd backend

python add_to_problems.py
uvicorn api:app --reload
