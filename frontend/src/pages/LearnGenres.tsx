import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Lesson = {
  id: string;
  title: string;
};

type LevelOrder = {
  [key: string]: string[];
};

// Static genres
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

  // base colors (used to create gradients)
  const levelColors = ["#ffcccc", "#fff5cc", "#ccffcc", "#cce5ff"];
  const termColors = ["#ffe4b5", "#d8bfd8", "#afeeee", "#f5deb3", "#e6e6fa", "#f08080"];

  const levelOrder: LevelOrder = {
    単語: [
      "word-intermediate",
      "word-high-intermediate",
      "word-advanced",
      "word-proficiency",
    ],
    熟語: ["idioms-intermediate", "idioms-high-intermediate", "idioms-advanced", "idioms-proficiency"],
    ビジネス表現: ["business-entry", "business-intermediate", "business-global"],
  };

  // utility: slightly darken or lighten a hex color (percent positive => lighter, negative => darker)
  function shadeColor(hex: string, percent: number) {
    const c = hex.replace("#", "");
    const num = parseInt(c, 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // return a CSS gradient string for a card — now uses a slightly lighter color for a brighter gradient
  function cardBackground(categoryName: string, index: number) {
    const base = levelOrder[categoryName] ? levelColors[index] || "#f9f9f9" : termColors[index % termColors.length];
    const lighter = shadeColor(base, 14); // 14% lighter for brighter gradients
    return `linear-gradient(135deg, ${base} 0%, ${lighter} 85%)`;
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

  // CSS-in-JSX string; keeps file self-contained.
  const css = `
    /* card base */
    .category-block {
      margin-top: 10px;
      margin-bottom: 20px;
      padding: 12px;
      background: #fff;
      border: 3px solid #666;
      border-radius: 10px;
    }

    .lessons-grid {
      display: grid;
      gap: 10px;
      width: 100%;
    }

    .lesson-card {
      padding: 12px;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      transition: transform 160ms ease, box-shadow 160ms ease, background 220ms ease;
      will-change: transform, box-shadow;
      user-select: none;
      min-height: 64px;
      backdrop-filter: blur(0.6px);
    }

    .lesson-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lesson-title {
      font-weight: 700;
    }

    /* Hover effect only on devices that support hover (prevents odd behavior on touch) */
    @media (hover: hover) and (pointer: fine) {
      .lesson-card:hover {
        transform: translateY(-4px); /* 小さく上に移動 */
        box-shadow: 0 6px 12px rgba(18, 30, 50, 0.10), 0 2px 4px rgba(18, 30, 50, 0.05);
      }
    }

    /* responsive grid columns */
    @media (max-width: 720px) {
      .lessons-grid { grid-template-columns: 1fr; }
      .lesson-card { flex-direction: column; text-align: center; }
      .lesson-image { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
    }
    @media (min-width: 721px) {
      .lessons-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lesson-image { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
    }
  `;

  return (
    <div style={{ padding: basePadding, paddingTop: basePadding + HEADER_HEIGHT }}>
      <style>{css}</style>

      <h2 style={{ fontSize: isSmall ? 25 : 32, marginBottom: 5 }}>単語の学習</h2>
      <h3 style={{ fontSize: isSmall ? 20 : 28, marginBottom: 10 }}>学習する分野の選択</h3>

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
          <div key={categoryName} className="category-block">
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
              <h3 style={{ fontSize: isSmall ? 18 : 24, fontWeight: "bold", margin: 0 }}>{categoryName}</h3>
            </div>

            <div className="lessons-grid">
              {lessons.map((lesson, index) => {
                const bg = cardBackground(categoryName, index);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                    className="lesson-card"
                    style={{
                      background: bg,
                      color: "#222",
                    }}
                  >
                    <div className="lesson-left">
                      {categoryName === "専門用語" && (
                        <img
                          className="lesson-image"
                          src={lessonImages[lesson.id.toLowerCase()] || "/images/default.jpg"}
                          alt={lesson.title}
                        />
                      )}
                      <strong className="lesson-title" style={{ fontSize: isSmall ? 16 : 18 }}>
                        {lesson.title}
                      </strong>
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
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
