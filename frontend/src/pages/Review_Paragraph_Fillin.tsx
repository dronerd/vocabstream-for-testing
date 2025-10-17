import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Lesson = {
  id: string;
  title: string;
};

type LevelOrder = {
  [key: string]: string[];
};

const STATIC_GENRES: Lesson[] = [
  { id: "word-intermediate", title: "単語初級~中級 (CEFR A2~B1)" },
  { id: "word-high-intermediate", title: "単語中上級 (CEFR B2)" },
  { id: "word-advanced", title: "単語上級 (CEFR C1)" },
  { id: "word-proficiency", title: "単語熟達 (CEFR C2)" },
  { id: "idioms-intermediate", title: "熟語初級~中級 (CEFR A2~B1)" },
  { id: "idioms-advanced", title: "熟語上級 (CEFR C1)" },
  { id: "idioms-high-intermediate", title: "熟語中上級 (CEFR B2)" },
  { id: "idioms-proficiency", title: "熟語熟達 (CEFR C2)" },
  { id: "business-entry", title: "ビジネス入門レベル" },
  { id: "business-intermediate", title: "ビジネス実践レベル" },
  { id: "business-global", title: "ビジネスグローバルレベル" },
  { id: "computer-science", title: "Computer Science & Technology" },
  { id: "medicine", title: "Medicine & Health" },
  { id: "economics-business", title: "Business & Economics" },
  { id: "environment", title: "Environmental Science & Sustainability" },
  { id: "law", title: "Law & Politics" },
  { id: "engineering", title: "Engineering" },
];

export default function ReviewList() {
  const [genres] = useState<Lesson[]>(STATIC_GENRES);
  const [isSmall, setIsSmall] = useState<boolean>(false);
  const nav = useNavigate();

  useEffect(() => {
    function update() {
      if (typeof window === "undefined") return;
      setIsSmall(window.innerWidth <= 720);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const categories: Record<string, Lesson[]> = {
    単語: genres.filter((g) => g.id.toLowerCase().startsWith("word")),
    熟語: genres.filter((g) => g.id.toLowerCase().startsWith("idioms")),
    ビジネス表現: genres.filter((g) => g.id.toLowerCase().startsWith("business")),
    専門用語: genres.filter(
      (g) =>
        !g.id.toLowerCase().startsWith("word") &&
        !g.id.toLowerCase().startsWith("idioms") &&
        !g.id.toLowerCase().startsWith("business")
    ),
  };

  const lessonImages: Record<string, string> = {
    "computer-science": "/CS.png",
    "medicine": "/Medicine.png",
    "law": "/Law.png",
    "economics-business": "/Business.png",
    "environment": "/Environment.png",
    "engineering": "/Engineering.png",
  };

  const levelOrder: LevelOrder = {
    単語: ["word-intermediate", "word-high-intermediate", "word-advanced", "word-proficiency"],
    熟語: ["idioms-intermediate", "idioms-high-intermediate", "idioms-advanced", "idioms-proficiency"],
    ビジネス表現: ["business-entry", "business-intermediate", "business-global"],
  };

  const levelColors = ["#ffcccc", "#fff5cc", "#ccffcc", "#cce5ff"];
  const termColors = ["#ffe4b5", "#d8bfd8", "#afeeee", "#f5deb3", "#e6e6fa", "#f08080"];

  function cardBackground(categoryName: string, index: number) {
    return levelOrder[categoryName]
      ? levelColors[index] || "#f9f9f9"
      : termColors[index % termColors.length];
  }

  const HEADER_HEIGHT = isSmall ? 56 : 72;
  const basePadding = isSmall ? 12 : 20;

  return (
    <div style={{ padding: basePadding, paddingTop: basePadding + HEADER_HEIGHT }}>
      {/* 共通スタイル：カードにホバーで上がる効果を追加 */}
      <style>{`
        .reviewlist-card {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transition: transform .14s cubic-bezier(.2,.9,.2,1), box-shadow .14s ease;
          will-change: transform, box-shadow;
          box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        }

        /* hover サポートがあるデバイスでだけ動かす */
        @media (hover: hover) {
          .reviewlist-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 36px rgba(0,0,0,0.10);
          }
          .reviewlist-card:focus-visible {
            outline: none;
            transform: translateY(-6px);
            box-shadow: 0 18px 36px rgba(0,0,0,0.10);
          }
        }

        /* 押したときの微調整（すばやく押すとき） */
        .reviewlist-card:active {
          transform: translateY(1px);
        }

        /* モーション軽減設定を尊重 */
        @media (prefers-reduced-motion: reduce) {
          .reviewlist-card {
            transition: none;
            transform: none !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.04);
          }
        }
      `}</style>

      <h2 style={{ fontSize: isSmall ? 20 : 28, marginBottom: 5 }}>文章穴埋め方式の復習</h2>
      <h3 style={{ fontSize: isSmall ? 20 : 28, marginBottom: 5 }}>復習する分野を選択</h3>

      <button
        onClick={() => nav("/review")}
        style={{
          marginBottom: 5,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#555",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        復習方法選択に戻る
      </button>

      {Object.entries(categories).map(([categoryName, lessons]) => {
        const order = levelOrder[categoryName];
        if (order) {
          lessons.sort((a, b) => {
            const idxA = order.indexOf(a.id.toLowerCase());
            const idxB = order.indexOf(b.id.toLowerCase());
            const A = idxA === -1 ? 999 : idxA;
            const B = idxB === -1 ? 999 : idxB;
            return A - B;
          });
        }

        return (
          <div
            key={categoryName}
            style={{
              marginTop: 10,
              marginBottom: 20,
              padding: 12,
              background: "#fff",
              border: "3px solid #666",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
                flexDirection: isSmall ? "column" : "row",
                gap: isSmall ? 8 : 10,
                textAlign: isSmall ? "center" : "left",
              }}
            >
              <h3 style={{ fontSize: isSmall ? 18 : 24, fontWeight: "bold", margin: 0 }}>
                {categoryName}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isSmall ? "1fr" : "repeat(4, minmax(0, 1fr))",
                gap: 10,
                width: "100%",
              }}
            >
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => nav(`/still_under_development`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      nav(`/still_under_development`);
                    }
                  }}
                  className="reviewlist-card"
                  style={{
                    background: cardBackground(categoryName, index),
                    flexDirection: isSmall ? "column" : "row",
                    textAlign: isSmall ? "center" : "left",
                    minHeight: ["英検", "TOEFL", "TOEIC"].includes(categoryName) ? 50 : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {categoryName === "専門用語" && (
                      <img
                        src={lessonImages[lesson.id.toLowerCase()] || "/images/default.jpg"}
                        alt={lesson.title}
                        style={{
                          width: isSmall ? 48 : 60,
                          height: isSmall ? 48 : 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}
                    <strong style={{ fontSize: isSmall ? 16 : 18 }}>{lesson.title}</strong>
                  </div>
                  <div
                    style={{
                      fontSize: isSmall ? 14 : 16,
                      fontWeight: "bold",
                      color: "#333",
                      marginTop: isSmall ? 8 : 0,
                    }}
                  >
                    進捗: 0%
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
