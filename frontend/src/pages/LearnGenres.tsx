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
  { id: "idioms-high-intermediate", title: "熟語中上級 (CEFR B2)" },
  { id: "idioms-advanced", title: "熟語上級 (CEFR C1)" },
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

export default function LearnGenres() {
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
    単語: genres.filter((g) => g.id.startsWith("word")),
    熟語: genres.filter((g) => g.id.startsWith("idioms")),
    ビジネス表現: genres.filter((g) => g.id.startsWith("business")),
    専門用語: genres.filter(
      (g) =>
        !g.id.startsWith("word") &&
        !g.id.startsWith("idioms") &&
        !g.id.startsWith("business")
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

  const blueGradients = ["#b7d7f5", "#8fc1ee", "#5fa7e8", "#3889dc"];
  const pageBackground = "#d5e7f7";

  const levelOrder: LevelOrder = {
    単語: [
      "word-intermediate",
      "word-high-intermediate",
      "word-advanced",
      "word-proficiency",
    ],
    熟語: [
      "idioms-intermediate",
      "idioms-high-intermediate",
      "idioms-advanced",
      "idioms-proficiency",
    ],
    ビジネス表現: [
      "business-entry",
      "business-intermediate",
      "business-global",
      "business-proficiency",
    ],
  };

  function cardBackground(categoryName: string, index: number) {
    if (categoryName === "単語" || categoryName === "熟語" || categoryName === "ビジネス表現") {
      return blueGradients[index] || blueGradients[blueGradients.length - 1];
    }
    const termColors = ["#ffe4b5", "#d8bfd8", "#afeeee", "#f5deb3", "#e6e6fa", "#f08080"];
    return termColors[index % termColors.length];
  }

  const HEADER_HEIGHT = isSmall ? 56 : 72;
  const basePadding = isSmall ? 12 : 20;

  const allowedLessonIds = new Set([
    "word-intermediate",
    "word-high-intermediate",
    "word-advanced",
    "word-proficiency",
  ]);

  function handleLessonClick(lessonId: string) {
    const id = lessonId.toLowerCase();
    if (allowedLessonIds.has(id)) {
      nav(`/learn/${lessonId}`);
    } else {
      nav("/still_under_development");
    }
  }

  return (
    <div className="outer-root" style={{ backgroundColor: pageBackground }}>
      {/* Global + layout styles to remove body gaps and control container width/padding */}
      <style>{`
        /* Remove default margins so background covers entire viewport */
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          background: ${pageBackground};
        }

        /* Outer wrapper spans full viewport width so no white edges appear on mobile */
        .outer-root {
          width: 100vw; /* ensure full-bleed even when viewport uses safe-area inset */
          min-height: 100vh;
          box-sizing: border-box;
          overflow-x: hidden;
          display: flex;
          justify-content: center;
          /* include device safe area so background reaches edges on iOS */
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }

        /* Main content container:
           - uses a max width but shrinks a little on very large screens so side gutters are smaller
           - uses responsive horizontal padding for comfortable spacing
        */
        .main-container {
          width: 100%;
          box-sizing: border-box;
          /* prefer using calc so container can expand a bit to the sides on large screens */
          max-width: 1200px;
          padding-left: 16px;
          padding-right: 16px;
        }

        /* on medium/large screens reduce side padding (content expands) */
        @media (min-width: 1000px) {
          .main-container {
            padding-left: 20px;
            padding-right: 20px;
            /* limit width slightly larger so gutters are smaller on big screens */
            max-width: 1280px;
          }
        }

        /* on very large screens reduce the side gap even more */
        @media (min-width: 1400px) {
          .main-container {
            padding-left: 24px;
            padding-right: 24px;
            max-width: 1400px;
          }
        }

        /* lesson-card styles kept here (moved from inline to CSS for cleanliness) */
        .lesson-card {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transition: transform .14s cubic-bezier(.2,.9,.2,1), box-shadow .14s ease;
          box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        }

        @media (hover: hover) {
          .lesson-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 36px rgba(0,0,0,0.12);
          }
          .lesson-card:focus-visible {
            outline: none;
            transform: translateY(-6px);
            box-shadow: 0 18px 36px rgba(0,0,0,0.12);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lesson-card {
            transition: none;
          }
        }
      `}</style>

      <div
        className="main-container"
        style={{
          paddingTop: basePadding + HEADER_HEIGHT,
        }}
      >
        {/* Centered titles */}
        <h2
          style={{
            fontSize: isSmall ? 26 : 38,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
            color: "#08335b",
          }}
        >
          単語の学習
        </h2>

        <h3
          style={{
            fontSize: isSmall ? 20 : 26,
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 20,
            color: "#1a4e8a",
          }}
        >
          学習する分野の選択
        </h3>

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
                background: "white",
                border: "3px solid #558ac9",
                borderRadius: 12,
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
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
                <h3
                  style={{
                    fontSize: isSmall ? 18 : 24,
                    fontWeight: "bold",
                    margin: 0,
                    color: "#1a4e8a",
                  }}
                >
                  {categoryName}
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isSmall
                    ? "1fr"
                    : "repeat(4, minmax(0, 1fr))",
                  gap: 10,
                  width: "100%",
                }}
              >
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleLessonClick(lesson.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleLessonClick(lesson.id);
                      }
                    }}
                    className="lesson-card"
                    style={{
                      background: cardBackground(categoryName, index),
                      color: "#08335b",
                      fontWeight: "bold",
                      flexDirection: isSmall ? "column" : "row",
                      textAlign: isSmall ? "center" : "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {categoryName === "専門用語" && (
                        <img
                          src={
                            lessonImages[lesson.id.toLowerCase()] ||
                            "/images/default.jpg"
                          }
                          alt={lesson.title}
                          style={{
                            width: isSmall ? 48 : 60,
                            height: isSmall ? 48 : 60,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <strong style={{ fontSize: isSmall ? 16 : 18 }}>
                        {lesson.title}
                      </strong>
                    </div>
                    <div
                      style={{
                        fontSize: isSmall ? 14 : 16,
                        fontWeight: "bold",
                        color: "#08335b",
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
    </div>
  );
}
