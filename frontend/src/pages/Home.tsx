import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();

  const buttonStyles = [
    { backgroundColor: "#6fa8dc" }, // 柔らかいブルー
    { backgroundColor: "#e9967a" }, // サーモン系のレッド
    { backgroundColor: "#77dd77" }, // パステルグリーン
    { backgroundColor: "#b0b0b0" }, // ライトグレー
  ];

  const options = [
    { label: "単語を学習する", path: "/learn" },
    { label: "単語を復習する", path: "/review" },
    { label: "その他の機能", path: "/others" },
  ];

  return (
    <div className="home-container">
      {/* Inline CSS so you can drop this file in immediately */}
      <style>{`
        .home-container {
          padding: 20px;
          padding-top: 92px;
          font-family: sans-serif;
          color: #1c1c1c;
        }

        .heading {
          font-size: 50px;
          margin: 4px 0;
        }

        .subtitle {
          font-size: 20px;
          color: #000;
          margin: 8px 0 20px 0;
          line-height: 1.6;
        }

        .user-box {
          padding: 12px;
          border: 1px solid #eee;
          border-radius: 12px;
          margin-bottom: 12px;
          font-size: 30px;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }

        /* Default (large screens) grid: two columns.
           The third option will span both columns and be centered. */
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: stretch;
        }

        .option-btn {
          padding: 40px;
          border: none;
          border-radius: 12px;
          color: #1c1c1c;
          font-size: 40px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.06);
          transition: transform .12s ease, box-shadow .12s ease;
        }

        .option-btn:active {
          transform: translateY(1px);
        }

        /* Make the third (index 2) button span the full row and be centered
           on large screens so it appears centered under the top two buttons. */
        .option-third {
          grid-column: 1 / -1;
          justify-self: center;
          width: 60%;
          max-width: 520px;
        }

        .privacy-link {
          grid-column: 1 / -1;
          padding-top: 8px;
        }

        /* ===== Mobile / small screens ===== */
        @media (max-width: 600px) {
          .heading {
            font-size: 28px;
          }
          .subtitle {
            font-size: 14px;
          }
          .user-box {
            font-size: 16px;
            padding: 10px;
            border-radius: 10px;
          }
          .options-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .option-btn {
            padding: 14px 16px;
            font-size: 16px;
            border-radius: 10px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.06);
            font-weight: 700;
            text-align: left; /* easier to scan on mobile */
          }

          /* Override: on small screens the third option returns to full-width
             and the centered narrower look is removed so mobile is unchanged. */
          .option-third {
            width: 100%;
            justify-self: stretch;
            text-align: left;
          }

          .subtitle a {
            word-break: break-word;
          }
        }
      `}</style>

      {/* Main heading */}
      <h1 className="heading">Home</h1>

      {/* Subtitle / description */}
      <p className="subtitle">
        <strong>VocabStream</strong> は、
        <a
          href="https://yutokuroki.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", margin: "0 4px" }}
        >
          <strong>黒木勇人</strong>
        </a>
        が創設し個人で開発・運営している
        <a
          href="https://projectfluence.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", margin: "0 4px" }}
        >
          <strong>「Project Fluence」</strong>
        </a>
        の一環として制作された、無料の英単語学習アプリです。
      </p>

      {/* User info box */}
      <div className="user-box">
        <div>
          Level: <strong>{user?.level ?? "—"}</strong>
        </div>
        <div>
          累計獲得単語数: <strong>{user?.total_words ?? 0}</strong>
        </div>
      </div>

      {/* Option buttons */}
      <div className="options-grid">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => nav(opt.path)}
            className={`option-btn ${idx === 2 ? "option-third" : ""}`}
            style={{ ...buttonStyles[idx] }}
          >
            {opt.label}
          </button>
        ))}

        <a className="privacy-link" href="/privacy">
          <strong>Privacy Policy</strong>
        </a>
      </div>
    </div>
  );
}
