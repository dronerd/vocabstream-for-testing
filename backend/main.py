# backend/main.py
from fastapi import FastAPI, HTTPException #HTTPException allows usage of 404 etc
from fastapi.middleware.cors import CORSMiddleware #CORS is Cross Origin Resource Sharing, needed for frontend to fetch data from backend
from pydantic import BaseModel #this defines data models, for example defining User model with username:string, password:string etc
from typing import List
from pathlib import Path  #modern method of using paths of files
import json  #for automatic creation of json files used in communication between frontend and backend
import random

app = FastAPI() #initializes application

# Allow frontend at http://localhost:3000 (CRA default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"], #all methods are allowed
    allow_headers=["*"], #all headers are allowed
)

DATA_DIR = Path(__file__).parent / "data"    #setting directory of data folder. Here, _file_means this file main.py and parent is backend folder

# Simple models
#here, BaseModel imported earlier is being used
#LoginRequest is a model for incoming login requests
#BaseModel from Pydantic automatically validates the data
#FastAPI will automatically check that all the elemnets require their desired shape(str etc)
class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str
    level: str
    total_words: int

# fake in-memory "token" and user mapping
FAKE_TOKEN = "fake-jwt-token-123"
FAKE_USER = {"username": "testuser", "level": "B2", "total_words": 1234}

@app.post("/api/login") #defines POST route at /api/login
#(POST Route is for sending data to server to create or modify something )
def login(body: LoginRequest): #FastAPI will parse JSON body into a LoginRequest object
    if not body.username: #if no username
        raise HTTPException(status_code=400, detail="username missing")
    return {"token": FAKE_TOKEN, "user": FAKE_USER} #returns the JSON response

@app.get("/api/me") #defines GET route at /api/me
#(a GET route retrieves data from server)
def me(token: str = ""): #expects a string
    if token != FAKE_TOKEN:
        raise HTTPException(status_code=401, detail="invalid token")
    return {"user": FAKE_USER}

#this is a GET route at /api/genres
# This means that when the forntend requests http://localhost:8000/api/geners, this function will run 
@app.get("/api/genres")
def genres(): # no parameters here
    # ここで返す id は data フォルダのサブフォルダ名と一致させること（例: "eiken-pre2"）
    return { #this function returns a JSON object, with one key "genres"
        "genres": [
            {"id": "word-intermediate", "title": "単語初級~中級 (CEFR A2~B1)"},
            {"id": "word-high-intermediate", "title": "単語中上級 (CEFR B2)"},
            {"id": "word-advanced", "title": "単語上級 (CEFR C1)"},
            {"id": "word-proficiency", "title": "単語熟達 (CEFR C2)"},
            {"id": "idioms-intermediate", "title": "熟語初級~中級 (CEFR A2~B1)"},
            {"id": "idioms-advanced", "title": "熟語上級 (CEFR C1)"},
            {"id": "idioms-high-intermediate", "title": "熟語中上級 (CEFR B2)"},
            {"id": "idioms-proficiency", "title": "熟語熟達 (CEFR C2)"},
            {"id": "business-entry", "title": "ビジネス入門レベル"},
            {"id": "business-intermediate", "title": "ビジネス実践レベル"},
            {"id": "business-global", "title": "ビジネスグローバルレベル"},
            {"id": "computer-science", "title": "Computer Science & Technology"},
            {"id": "medicine", "title": "Medicine & Health"},
            {"id": "economics-business", "title": "Business & Economics"},
            {"id": "environment", "title": "Environmental Science & Sustainability"},
            {"id": "law", "title": "Law & Politics"},
            {"id": "engineering", "title": "Engineering"},
        ]
    }

@app.get("/api/lessons/{genre_id}")
def lessons_for_genre(genre_id: str):
    raise HTTPException(status_code=410, detail="Lesson files moved to frontend public/data")

def _load_lesson_file(lesson_id: str): #this is an internal helper function, not API route
    """
    lesson_id 形式: <genre-folder>-lesson-<n>
    example: computer-science-lesson-5
    """
    if "-lesson-" not in lesson_id: #lesson_idの中に上の例のように-lesson-が入っているか確かめる
        raise HTTPException(status_code=400, detail="invalid lesson id format")
    
    #この作業により、genre_folder = "word-intermediate", num_str = "2"のようになる
    genre_folder, num_str = lesson_id.rsplit("-lesson-", 1)
    #builds the path to the genre directory inside DATA_DIR
    genre_dir = DATA_DIR / genre_folder
    if not genre_dir.exists() or not genre_dir.is_dir():
        raise HTTPException(status_code=404, detail="genre not found")

    # try common file name patterns
    candidates = [
        genre_dir / f"Lesson{num_str}.json",
        genre_dir / f"lesson{num_str}.json",
        genre_dir / f"Lesson{int(num_str)}.json",
        genre_dir / f"lesson{int(num_str)}.json",
    ]

    for fp in candidates: #loop over candidate filenames
        if fp.exists() and fp.is_file():
            try:
                with fp.open("r", encoding="utf-8") as f: #open it in read mode r, utf-8 encoding is for Japanese
                    data = json.load(f) #parse JSON content into Python dict/list
                return data
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"failed to read lesson file: {e}")
    #if no candidate file matched, 
    raise HTTPException(status_code=404, detail="lesson file not found")

@app.get("/api/lesson/{lesson_id}")
def lesson_detail(lesson_id: str):
     raise HTTPException(status_code=410, detail="Lesson files moved to frontend public/data. Use frontend local files under /data/... or restore backend/data.")

@app.get("/api/lesson/{lesson_id}/quiz")
def lesson_quiz(lesson_id: str):
   raise HTTPException(status_code=410, detail="Quiz generation moved to frontend. Generate quiz client-side from /data/... JSON files.")
