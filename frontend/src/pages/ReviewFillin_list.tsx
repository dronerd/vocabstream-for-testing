import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type ReviewItem = {
  id: string;
  title: string;
  subtitle?: string;
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

const REVIEW_COUNT_BY_GENRE: Record<string, number> = {
  "word-intermediate": 64,
  "word-high-intermediate": 71,
  "word-advanced": 71,
  "word-proficiency": 71,
  "idioms-intermediate": 71,
  "idioms-high-intermediate": 71,
  "idioms-advanced": 71,
  "idioms-proficiency": 71,
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

function makeReviewItems(genreId: string, count: number): ReviewItem[] {
  const arr: ReviewItem[] = [];
  for (let i = 1; i <= count; i++) {
    arr.push({ id: `${genreId}-review-minitest-${i}`, title: `MiniTest ${i}`, subtitle: `最終テスト: %`});
  }
  return arr;
}

export default function ReviewMiniTestList() {
  const { genreId } = useParams<{ genreId: string }>();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [genreTitle, setGenreTitle] = useState<string>("");
  const nav = useNavigate();

  useEffect(() => {
    if (!genreId) return;
    setGenreTitle(STATIC_GENRE_TITLES[genreId] || genreId);
    const count = REVIEW_COUNT_BY_GENRE[genreId] ?? 10;
    setItems(makeReviewItems(genreId, count));
  }, [genreId]);

  if (!genreId) {
    return (
      <div className="page-root">
        <h2 className="page-title">ジャンルが指定されていません</h2>
        <button className="back-btn" onClick={() => nav("/review")}>復習方法の一覧に戻る</button>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="page-root">
      <h2 className="page-title smaller">{genreTitle} 例文ミニテストの復習</h2>
      <button className="back-btn" onClick={() => nav("/review")}>復習方法の一覧に戻る</button>

      <div className="items-grid">
        {items.map((it) => (
          <article
            key={it.id}
            className="item-card"
            onClick={() => nav(`/review/minitest/${it.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && nav(`/review/minitest/${it.id}`)}
          >
            <div className="item-content">
              <div className="item-title">{it.title}</div>
              <div className="item-sub">{it.subtitle}</div>
            </div>

            <button
              className="start-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                nav(`/review/minitest/${it.id}`);
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
.page-root {
  padding: 10px 8px;
  padding-top: 92px;
  font-family: Inter, Arial, sans-serif;
}

.page-title { font-size: 24px; margin-bottom: 10px; }
.page-title.smaller { font-size: 22px; }
.back-btn {
  margin-bottom: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background-color: #555;
  color: #fff;
  cursor: pointer;
}

/* Layout grid: use CSS Grid for predictable columns */
.items-grid {
  display: grid;
  /* auto-fill of minmax gives flexible columns on wide screens */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  align-items: stretch;
}

/* Card style */
.item-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffd6c9, #ffb6a0);
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
  overflow: hidden;
  width: 100%;   /* grid item should fill the grid cell */
  min-width: 0;  /* allow shrinking in narrow containers */
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(255, 150, 120, 0.25);
}

.item-content {
  padding: 14px;
}

.item-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #3b0b0b;
}

.item-sub {
  font-size: 14px;
  color: #5a2e2e;
}

/* Full-width bottom button */
.start-btn {
  width: 100%;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.3);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(6px);
  padding: 10px 0;
  font-size: 15px;
  font-weight: 700;
  color: #3b0b0b;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.start-btn:hover {
  background: rgba(255,255,255,0.5);
  color: #000;
}

/* Breakpoints: adapt column counts */

/* medium-large: three columns-ish */
@media (min-width: 900px) and (max-width: 1199px) {
  .items-grid { grid-template-columns: repeat(3, 1fr); }
}

/* tablet / small desktop: two columns */
@media (max-width: 899px) and (min-width: 769px) {
  .items-grid { grid-template-columns: repeat(2, 1fr); }
}

/* default for <=768: two columns (mobile & small screens) */
/* This forces two boxes next to each other on typical mobile widths */
@media (max-width: 768px) {
  .items-grid { grid-template-columns: repeat(2, 1fr); }
  .item-title { font-size: 16px; }
  .item-sub { font-size: 13px; }
  .start-btn { font-size: 14px; padding: 8px 0; }
}

/* extra small phones: still two columns but slightly tighter */
@media (max-width: 480px) {
  .items-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .item-title { font-size: 15px; }
  .item-sub { font-size: 12px; }
  .start-btn { font-size: 13px; padding: 7px 0; }
}

/* Remove hover transform on touch devices */
@media (hover: none) {
  .item-card:hover { transform: none; }
}
`;
