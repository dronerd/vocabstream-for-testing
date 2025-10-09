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
  "word-intermediate": 71,
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
    arr.push({ id: `${genreId}-review-minitest-${i}`, title: `MiniTest ${i}`, subtitle: `例文 ${i}` });
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
            <div>
              <div className="item-title">{it.title}</div>
              <div className="item-sub">{it.subtitle}</div>
            </div>

            <div className="item-actions">
              <button
                className="start-btn"
                onClick={(ev) => {
                  ev.stopPropagation();
                  nav(`/review/minitest/${it.id}`);
                }}
              >
                開始
              </button>
            </div>
          </article>
        ))}
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.page-root {
  padding: 8px 6px; /* even less side padding so 4 columns fit comfortably */
  padding-top: 92px;
  font-family: Inter, Arial, sans-serif;
}
.page-title { font-size: 24px; margin-bottom: 8px; }
.page-title.smaller { font-size: 20px; }
.back-btn {
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 8px;
  border: none;
  background-color: #555;
  color: #fff;
  cursor: pointer;
}

.items-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* reduced gap */
  justify-content: space-between;
}

.item-card {
  flex: 0 0 calc(25% - 8px); /* 4 items per row */
  background-color: #fef3c7;
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 3px 6px rgba(0,0,0,0.06);
  transition: transform 0.12s ease;
  cursor: pointer;
  min-width: 72px;
}

.item-card:focus { outline: 2px solid rgba(6,95,70,0.18); }
.item-card:hover { transform: translateY(-3px); }

.item-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.item-sub { font-size: 10px; color: #666; }

.item-actions { display: flex; gap: 6px; margin-top: 8px; }
.start-btn {
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  background-color: #065f46;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
}

/* small screens: keep 4 columns but slightly reduce sizes so they fit */
@media (max-width: 520px) {
  .item-card { flex: 0 0 calc(25% - 6px); padding: 6px; }
  .item-title { font-size: 11px; }
  .item-sub { font-size: 9px; }
  .start-btn { font-size: 10px; padding: 4px 6px; }
}

@media (hover: none) {
  .item-card:hover { transform: none; }
}
`;
