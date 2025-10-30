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
      <style>{`
        body, html {
          background-color: #081230;
          margin: 0;
          padding: 0;
          color: #f1f1f1;
        }

        .home-container {
          padding: 20px;
          padding-top: 70px;
          font-family: sans-serif;
          background-color: #081230;
          color: #f1f1f1;
          min-height: 100vh;
        }

        .heading {
          font-size: 50px;
          margin: 4px 0;
          color: #ffffff;
          margin-top: 22px;
        }

        .subtitle {
          font-size: 20px;
          color: #e0e0e0;
          margin: 8px 0 20px 0;
          line-height: 1.6;
        }

        .subtitle a {
          color: #a8d0ff;
        }

        .user-box {
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          margin-bottom: 12px;
          font-size: 30px;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          color: #f1f1f1;
        }

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
          color: #081230;
          font-size: 40px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
          transition: transform .14s cubic-bezier(.2,.9,.2,1), box-shadow .14s ease;
          will-change: transform, box-shadow;
        }

        .option-btn:active {
          transform: translateY(1px);
        }

        @media (hover: hover) {
          .option-btn:hover {
            transform: translateY(-6px);
            box-shadow: 0 14px 30px rgba(0,0,0,0.4);
          }
          .option-btn:focus-visible {
            outline: none;
            transform: translateY(-6px);
            box-shadow: 0 14px 30px rgba(0,0,0,0.4);
          }
        }

        .option-third {
          grid-column: 1 / -1;
          justify-self: center;
          width: 60%;
          max-width: 520px;
        }

        .privacy-link {
          grid-column: 1 / -1;
          padding-top: 4px;
          color: #a8d0ff;
          font-size: 1rem;
        }

        .footer-text {
          font-size: 1rem;
        }

        @media (max-width: 600px) {
          .heading {
            font-size: 28px;
            margin-top: 1px;
          }
          .subtitle {
            font-size: 12px;
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
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            font-weight: 700;
            text-align: left;
          }
          .option-third {
            width: 100%;
            justify-self: stretch;
            text-align: left;
          }
          .privacy-link {
            font-size: 0.7rem;
          }
          .footer-text {
            font-size: 0.7rem;
          }
        }
      `}</style>

      <h1 className="heading">Home</h1>

      <p className="subtitle">
        <strong>VocabStream</strong> は、
        <a
          href="https://yutokuroki.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>黒木勇人</strong>
        </a>
        が創設し個人で開発・運営する
        <a
          href="https://projectfluence.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>「Project Fluence」</strong>
        </a>
        の一環として制作した無料の英単語学習アプリです。
        <br />
        現在は安定して動作する一部機能のみを公開し、
        <a href="/learn" style={{ textDecoration: "underline" }}><strong>約3000の単語の学習機能</strong></a>
                （熟語・ビジネス・専門用語は実装中）と、英語学習に役立つ
        <a href="/prompts" style={{ textDecoration: "underline" }}><strong>ChatGPTプロンプト集</strong></a>
                を使用できます。今後のアップデートをお楽しみに！
      </p>

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
      </div>

      <footer
        style={{
          maxWidth: "var(--container-max)",
          margin: "28px auto 0",
          padding: 18,
          textAlign: "center",
          color: "#ffffff",
        }}
      >
        <a className="privacy-link" href="/privacy">
          <strong>Privacy Policy</strong>
        </a>
        <div className="footer-text">All content © 2025 Project Fluence — 黒木 勇人</div>

      </footer>
    </div>
  );
}
