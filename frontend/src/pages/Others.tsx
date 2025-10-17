import React from "react";
import { useNavigate } from "react-router-dom";

export default function Review() {
  const nav = useNavigate();

  // LearnGenresと統一感のある色
  const buttonColors = ["#ffcccc", "#fff5cc", "#ccffcc", "#cce5ff"];

  return (
    <div className="review-root">
      <style>{`
        .review-root {
          padding: 20px;
          padding-top: 92px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          color: #1c1c1c;
        }

        .heading {
          font-size: 32px;
          margin: 4px 0 8px 0;
        }

        .subheading {
          font-size: 22px;
          margin-bottom: 18px;
          color: #333;
        }

        /* Grid layout: two columns on large screens */
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: stretch;
        }

        .option-btn {
          padding: 20px;
          border: 2px solid #666;
          border-radius: 12px;
          cursor: pointer;
          height: 100px;
          font-weight: 800;
          font-size: 20px;
          color: #1c1c1c;
          text-align: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.06);
          transition: transform .18s ease, box-shadow .18s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 🔹ホバー時のアニメーション */
        .option-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.08);
        }

        .option-btn:active {
          transform: translateY(1px);
        }

        /* Make the third button span both columns and be centered on large screens */
        .option-third {
          grid-column: 1 / -1;
          justify-self: center;
          width: 60%;
          max-width: 520px;
        }

        /* ===== Mobile / small screens ===== */
        @media (max-width: 600px) {
          .heading {
            font-size: 26px;
          }
          .subheading {
            font-size: 16px;
          }
          .options-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .option-btn {
            padding: 14px 16px;
            font-size: 16px;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.06);
            text-align: left;
            justify-content: flex-start;
            gap: 12px;
          }

          /* On small screens the third option returns to full-width */
          .option-third {
            width: 100%;
            justify-self: stretch;
            text-align: left;
          }
        }
      `}</style>

      <h2 className="heading">その他の機能</h2>
      <h3 className="subheading">機能を選択</h3>

      <div className="options-grid">
        <button
          className="option-btn"
          onClick={() => nav("/prompts")}
          style={{ backgroundColor: buttonColors[0] }}
        >
          ChatGPTのプロンプト
        </button>

        <button
          className="option-btn"
          onClick={() => nav("/still_under_development")}
          style={{ backgroundColor: buttonColors[2] }}
        >
          学習経過を他のデバイスに移動
        </button>

        <button
          className="option-btn option-third"
          onClick={() => nav("/privacy")}
          style={{ backgroundColor: buttonColors[3] }}
        >
          フィードバック送信・Privacy Policyを確認
        </button>
      </div>
    </div>
  );
}
