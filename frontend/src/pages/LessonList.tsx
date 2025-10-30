import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Lesson = {
  id: string;
  title: string;
};

const STATIC_GENRE_TITLES: Record<string, string> = {
  "word-intermediate": "単語初級~中級 (CEFR A2~B1)",
  "word-high-intermediate": "単語中上級 (CEFR B2)",
  "word-advanced": "単語上級 (CEFR C1)",
  "word-proficiency": "単語熟達 (CEFR C2)",
  "idioms-intermediate": "熟語初級~中級 (CEFR A2~B1)",
  "idioms-high-intermediate": "熟語中上級 (CEFR B2)",
  "idioms-advanced": "熟語上級 (CEFR C1)",
  "idioms-proficiency": "熟語熟達 (CEFR C2)",
  "business-entry": "ビジネス入門レベル",
  "business-intermediate": "ビジネス実践レベル",
  "business-global": "ビジネスグローバルレベル",
  "computer-science": "Computer Science & Technology",
  "medicine": "Medicine & Health",
  "economics-business": "Business & Economics",
  "environment": "Environmental Science & Sustainability",
  "law": "Law & Politics",
  "engineering": "Engineering",
};

function makeLessons(genreId: string, count: number): Lesson[] {
  const arr: Lesson[] = [];
  for (let i = 1; i <= count; i++) arr.push({ id: `${genreId}-lesson-${i}`, title: `Lesson ${i}` });
  return arr;
}

const LESSON_COUNT_BY_GENRE: Record<string, number> = {
  "word-intermediate": 64,
  "word-high-intermediate": 96,
  "word-advanced": 100,
  "word-proficiency": 100,
  "idioms-intermediate": 50,
  "idioms-high-intermediate": 50,
  "idioms-advanced": 50,
  "idioms-proficiency": 50,
  "business-entry": 71,
  "business-intermediate": 71,
  "business-global": 71,
  "computer-science": 71,
  "medicine": 71,
  "economics-business": 71,
  "environment": 71,
  "law": 71,
  "engineering": 71,
};

export default function LessonList() {
  const { genreId } = useParams<{ genreId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [genreTitle, setGenreTitle] = useState<string>("");
  const nav = useNavigate();

  useEffect(() => {
    if (!genreId) return;
    setGenreTitle(STATIC_GENRE_TITLES[genreId] || genreId);
    const count = LESSON_COUNT_BY_GENRE[genreId] ?? 10;
    setLessons(makeLessons(genreId, count));
  }, [genreId]);

  if (!genreId)
    return (
      <div className="page-root">
        <h2 className="page-title">学習分野が指定されていません</h2>
        <button className="back-btn" onClick={() => nav("/learn")}>戻る</button>
        <style>{styles}</style>
      </div>
    );

  return (
    <div className="page-root">
      <h2 className="page-title">{genreTitle} - レッスン一覧</h2>
      <button className="back-btn" onClick={() => nav("/learn")}>戻る</button>

      <div className="lessons-grid">
        {lessons.map((l) => (
          <article
            key={l.id}
            className="lesson-card"
            onClick={() => nav(`/lesson/${l.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && nav(`/lesson/${l.id}`)}
          >
            <div className="lesson-content">
              <div className="lesson-title">{l.title}</div>
              <div className="lesson-meta">最終テスト: —</div>
            </div>

            <button
              className="start-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                nav(`/lesson/${l.id}`);
              }}
            >
              開始
            </button>
          </article>
        ))}
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
/* Global box sizing and reset to avoid overflow due to element sizing */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Ensure full background coverage and prevent horizontal scroll */
html, body, #root {
  margin: 0;
  padding: 0;
  background-color: #d5e7f7;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* prevent accidental horizontal scroll */
}

/* Page layout */
:root{
  --card-gap: 12px;
  --card-radius: 10px;
  --card-padding: 12px;
}

/* Page root uses 100% (not 100vw) to avoid including scrollbar width */
.page-root {
  padding: 10px 8px;
  padding-top: 92px;
  font-family: Inter, Arial, sans-serif;
  background-color: #d5e7f7;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* defensive: ensure children can't push it horizontally */
}

/* Title */
.page-title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #04204a;
}

/* Back button */
.back-btn {
  margin-bottom: 20px;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}
.back-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
}

/* Grid - use flex-start to avoid uneven spacing rounding issues that can cause overflow */
.lessons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-gap);
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0; /* defensive */
  padding: 0; /* defensive */
  width: 100%;
}

/* Lesson Card */
.lesson-card {
  flex: 0 0 calc(25% - var(--card-gap));
  background: linear-gradient(135deg, #7daae0 0%, #4c96e3 100%);
  border-radius: 30px;
  padding: var(--card-padding);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 6px 12px rgba(11,75,155,0.15);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  cursor: pointer;
  min-width: 100px;
  min-height: 130px;
}

/* Hover */
.lesson-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(11,75,155,0.22);
}

.lesson-content { padding: 0; }
.lesson-title { font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #031c3d; }
.lesson-meta { font-size: 14px; color: #052e61; }

/* Start Button inside card */
.start-btn {
  width: 100%;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.10);
  background: #0a2e73;
  padding: 8px 0;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  border-radius: 14px;
  transition: background 0.15s ease, transform 0.08s ease;
}
.start-btn:hover { background: #072456; transform: translateY(-1px); }

/* Responsive tweaks */
@media (min-width: 1200px) {
  :root { --card-gap: 16px; --card-padding: 14px; }
  .lesson-card {
    flex: 0 0 calc(25% - var(--card-gap));
    min-height: 160px;
    padding: var(--card-padding);
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .lesson-card {
    flex: 0 0 calc(25% - var(--card-gap));
    min-height: 140px;
  }
}

/* Mobile adjustments */
@media (max-width: 520px) {
  .page-root {
    padding-left: 12px;
    padding-right: 12px;
  }
  .lessons-grid { gap: 10px; justify-content: center; }
  .lesson-card {
    /* use calc that matches gap to avoid rounding overflow */
    flex: 0 0 calc(50% - 10px);
    padding: 10px;
    min-height: 110px;
    background: linear-gradient(135deg, #a3c6ef 0%, #77a8e9 100%);
  }
  .lesson-title { font-size: 16px; }
  .lesson-meta { font-size: 12px; }
  .start-btn { font-size: 13px; padding: 10px 0; }
}

/* Touch devices: disable hover effects */
@media (hover: none) {
  .lesson-card:hover { transform: none; }
}
`;
