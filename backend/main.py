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
            {"id": "word-intermediate", "title": "単語初級~中級 (CEFRA2~B1)"},
            {"id": "word-high-intermediate", "title": "単語中上級 (CEFRB2)"},
            {"id": "word-advanced", "title": "単語上級 (CEFRC1)"},
            {"id": "word-proficiency", "title": "単語熟達 (CEFRC2)"},
            {"id": "idioms-intermediate", "title": "熟語初級~中級 (CEFRA2~B1)"},
            {"id": "idioms-advanced", "title": "熟語上級 (CEFRC1)"},
            {"id": "idioms-high-intermediate", "title": "熟語中上級 (CEFRB2)"},
            {"id": "idioms-proficiency", "title": "熟語熟達 (CEFRC2)"},
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
    # data/<genre_id>/ 内の Lesson*.json を数えて動的に返す（ファイルが無ければ 404）
    genre_dir = DATA_DIR / genre_id
    if not genre_dir.exists() or not genre_dir.is_dir():
        raise HTTPException(status_code=404, detail="genre not found")

    # 見つかった LessonNN.json を列挙して Lesson 数を決定
    lesson_files = sorted([   #ここのsortではアルファベット順になってしまう
        p.name
        for p in genre_dir.iterdir()
        #p.is_file()でファイルのみ数える、
        #p.name.lower().startswith("lesson")でlessonから始まるファイルだけ数えられる
        #p.suffix.lower()=".json"で.jsonファイルだけ数える
        if p.is_file() and p.name.lower().startswith("lesson") and p.suffix.lower() == ".json"])
        #以上のコードの実行によりlesson_files は["Lesson1.json", "Lesson2.json", "Lesson10.json"]のようになる
    lessons = [] 
    for p in lesson_files:
        # p 例: Lesson1.json -> extract number
        name = p  # file name, like "Lesson1.json"
        import re
        #this extracts number from filename.
        #lesson is to match the word lesson
        #\s* allows optinonal spaces
        #\([0-9]+) captures one or more digits
        #example, "Lesson1.json" matches 1
        m = re.search(r"lesson\s*([0-9]+)", name, flags=re.IGNORECASE)
        if m:
            num = int(m.group(1))
        else:
            # skip if no number found
            continue
        #lessonのリストに入れる, creates dictionary for each lesson
        lessons.append({
            "id": f"{genre_id}-lesson-{num}", 
            "title": f"Lesson {num}", 
            "progress": 0
        })

    # sort by lesson number
    # x["id"].rsplit("-", 1)[1]は"word-intermediate-lesson-10" → ["word-intermediate-lesson", "10"] → "10".のように抽出できる
    lessons.sort(key=lambda x: int(x["id"].rsplit("-", 1)[1])) #intで囲んで整数にしてる
    return {"genre": genre_id, "lessons": lessons}

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
    data = _load_lesson_file(lesson_id) #上で作った関数を使用している
    # basic fields
    words = data.get("words", [])
    title = data.get("title", f"Lesson {lesson_id}")
    paragraph = data.get("paragraph", "")

    # review paragraphs (support a couple of common key variants)
    paragraph_review1 = data.get("paragraph_review1") or data.get("paragraphReview1") or data.get("paragraph_review_1") or ""
    paragraph_review2 = data.get("paragraph_review2") or data.get("paragraphReview2") or data.get("paragraph_review_2") or ""
    paragraph_review3 = data.get("paragraph_review3") or data.get("paragraphReview3") or data.get("paragraph_review_3") or ""

    return {
        "lesson_id": lesson_id,
        "title": title,
        "paragraph": paragraph,
        "paragraph_review1": paragraph_review1,
        "paragraph_review2": paragraph_review2,
        "paragraph_review3": paragraph_review3,
        "words": words,
        "total_words": len(words),
        "raw": data,   
    }


@app.get("/api/lesson/{lesson_id}/quiz")
def lesson_quiz(lesson_id: str):
    data = _load_lesson_file(lesson_id)
    words = data.get("words", [])
    if not words:
        raise HTTPException(status_code=404, detail="no words in lesson")

    # quiz 用に word と example（あるいは meaning）を用いる
    # 例: 穴埋めは example 中の単語を下線に置き換える。選択肢は同レッスン中の他の単語から選ぶ。
    # here, a pool of usable words are being made
    #only words with "word" field are kept
    pool = [{"word": w.get("word"), "example": w.get("example", "")} for w in words if w.get("word")]
    if len(pool) < 3:
        # 最低 3 語必要（正答 + 2 誤答）
        #at least three words are required
        raise HTTPException(status_code=400, detail="not enough words for quiz")

    #generate the questions
    questions = [] #the list to store questions
    for w in pool:
        correct = w["word"] 
        # distractors: 同レッスンからランダムに2つ
        #すでに選んだcorrectじゃないものを選んでリストを作っている
        other_words = [x["word"] for x in pool if x["word"] != correct] 
        #すぐ上で作ったother_wordsリストからランダムで２つ選んでいる
        distractors = random.sample(other_words, k=2) if len(other_words) >= 2 else other_words
        choices = distractors + [correct] #choices is a new list
        random.shuffle(choices) #shuffle the order of contents in list
        answer_index = choices.index(correct) #the position of correct word

        # blank sentence: example 中の正答を置換（大文字小文字を考慮）
        example = w.get("example", "")
        blank_sentence = example.replace(correct, "____") #replaces the correct word with ___
        if blank_sentence == example:  #this == means turning into ___ was unsuccessful
            # then, try capitalized first letter
            blank_sentence = example.replace(correct.capitalize(), "____")
            if blank_sentence == example: # even this does not work... then last resort
                blank_sentence = "____ " + example #puts ___ at start of sentnece
        
        #store the question object
        questions.append({
            "word": correct,
            "sentence": example,
            "blank_sentence": blank_sentence,
            "choices": choices,
            "answer_index": answer_index
        })

    return {"lesson_id": lesson_id, "questions": questions}
