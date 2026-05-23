import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///leetcode_coach.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    is_active = Column(Boolean, default=True)

class SolvedProblem(Base):
    __tablename__ = "solved_problems"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String)
    difficulty = Column(String)
    company = Column(String)
    score = Column(Integer)
    solved_at = Column(DateTime, default=datetime.now)

class MockInterview(Base):
    __tablename__ = "mock_interviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    problem_title = Column(String)
    score = Column(Float)
    time_taken = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)

class HintHistory(Base):
    __tablename__ = "hint_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    problem_title = Column(String)
    hint_level = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()