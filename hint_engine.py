import os
from groq import Groq
from dotenv import load_dotenv
import chromadb
from sentence_transformers import SentenceTransformer
import logging

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_or_create_collection("leetcode")
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

def ask_groq(prompt):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )
    return response.choices[0].message.content

def get_similar_problems(query, top_k=5, company="All Companies"):
    if not collection or not model:
        return []
    try:
        query_embedding = model.encode(query).tolist()
        if company != "All Companies":
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(50, collection.count())
            )
            filtered = []
            for meta in results["metadatas"][0]:
                if company in meta.get("companies", ""):
                    filtered.append(meta)
                if len(filtered) == top_k:
                    break
            return filtered if filtered else results["metadatas"][0][:top_k]
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, collection.count())
        )
        return results["metadatas"][0]
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []

def get_hint(problem_title, hint_level=1):
    level_instructions = {
        1: "Give a very vague hint. Just point to general concept. Max 2 sentences.",
        2: "Give a medium hint. Mention the data structure to use. Max 3 sentences.",
        3: "Give a specific hint. Explain approach step by step but NO code. Max 5 sentences.",
    }
    prompt = f"""You are an expert interview coach helping someone prepare for Google.
Problem: {problem_title}
Hint Level: {hint_level}/3
Instruction: {level_instructions[hint_level]}
Be encouraging and helpful!"""
    return ask_groq(prompt)

def analyze_complexity(problem_title, approach):
    prompt = f"""You are an expert interview coach.
Problem: {problem_title}
Student approach: {approach}

Analyze and give:
1. ⏰ Time Complexity: O(?)
2. 💾 Space Complexity: O(?)
3. ✅ Is this optimal? Yes/No
4. 💡 One improvement tip

Be concise and clear!"""
    return ask_groq(prompt)

def get_pattern(problem_title):
    prompt = f"""You are an expert DSA coach.
For LeetCode problem "{problem_title}":
1. 🎯 Main DSA Pattern
2. 📚 Two similar problems
3. 💡 Why this pattern fits
4. ⚡ Key insight to solve it

Keep it short and practical!"""
    return ask_groq(prompt)

def review_code(problem_title, user_code):
    prompt = f"""You are a senior Google engineer reviewing code.
Problem: {problem_title}
Code:
{user_code}

Review for:
1. ✅ Correctness
2. ⏰ Time Complexity
3. 💾 Space Complexity
4. 📝 Code Quality
5. 💡 One improvement

Be constructive and encouraging!"""
    return ask_groq(prompt)