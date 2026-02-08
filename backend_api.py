from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
from pathlib import Path
import pandas as pd
import hashlib

app = FastAPI(title="K-CRM API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path("realestatecrm.db")

class UserRegister(BaseModel):
    username: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    user_id: int
    full_name: str
    password: Optional[str] = None

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS properties (
            property_id TEXT PRIMARY KEY,
            property_type TEXT,
            sell_price REAL,
            avg_market_price REAL,
            address TEXT,
            status TEXT,
            created_at DATETIME
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            lead_id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id TEXT,
            lead_score REAL,
            lead_priority TEXT,
            FOREIGN KEY(property_id) REFERENCES properties(property_id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            full_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

@app.on_event("startup")
async def startup():
    if not DB_PATH.exists():
        init_db()

@app.get("/health")
async def health():
    return {"status": "healthy", "database": "connected" if DB_PATH.exists() else "uninitialized"}

@app.post("/api/register")
async def register(user: UserRegister):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)",
            (user.username, get_password_hash(user.password), user.full_name)
        )
        conn.commit()
        return {"message": "User created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        conn.close()

@app.post("/api/login")
async def login(user: UserLogin):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, full_name, password_hash FROM users WHERE username = ?",
        (user.username,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row and row[3] == get_password_hash(user.password):
        return {
            "id": row[0],
            "username": row[1],
            "full_name": row[2],
            "token": f"mock-token-{row[0]}"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")

@app.put("/api/user/update")
async def update_user(update: UserUpdate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        if update.password and update.password.strip():
            cursor.execute(
                "UPDATE users SET full_name = ?, password_hash = ? WHERE id = ?",
                (update.full_name, get_password_hash(update.password), update.user_id)
            )
        else:
            cursor.execute(
                "UPDATE users SET full_name = ? WHERE id = ?",
                (update.full_name, update.user_id)
            )
        conn.commit()
        return {"message": "User updated successfully", "full_name": update.full_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/dashboard/metrics")
async def get_metrics():
    return {
        "total_properties": 9155,
        "sold_count": 2860,
        "conversion_rate": 31.2,
        "critical_leads": 187,
        "owner_pain_count": 2891,
        "portfolio_value": 299500000000
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)