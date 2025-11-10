import React from "react";
import { useNavigate } from "react-router-dom";

export default function Review() {
  const nav = useNavigate();

  const baseColor = "#d8f3dc";

  // Slightly lighter, reddish button tones
  const buttonColors = ["#a0d0b7ff", "#60b389ff", "#2f7f59ff", "#174d34ff"];


  return (
    <div className="review-root">
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background-color: ${baseColor};
          overflow-x: hidden;
        }

        .review-root {
          min-height: 100vh;
          width: 100%;
          padding: 20px;
          padding-top: 92px;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          color: #40916c;
          background-color: ${baseColor};
          transition: background-color .3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .heading {
          font-size: 32px;
          margin: 4px 0 8px 0;
          color: #0d2b1d;
        }

        .subheading {
          font-size: 22px;
          margin-bottom: 18px;
          color: #1b4332;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: stretch;
          width: 100%;
          max-width: 900px;
        }

        .option-btn {
          padding: 20px;
          border: 2px solid rgba(0,0,0,0.15);
          border-radius: 14px;
          cursor: pointer;
          height: 100px;
          font-weight: 800;
          font-size: 20px;
          color: #0d2b1d;
          text-align: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          transition: transform .18s ease, box-shadow .18s ease, filter .2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .option-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.12);
          filter: brightness(1.05);
        }

        .option-btn:active {
          transform: translateY(1px);
          filter: brightness(0.95);
        }

        .option-third {
          grid-column: 1 / -1;
          justify-self: center;
          width: 60%;
          max-width: 520px;
        }

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
            text-align: left;
            justify-content: flex-start;
            gap: 12px;
          }

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
          style={{ backgroundColor: buttonColors[1] }}
        >
          AI会話機能
        </button>

        <button
          className="option-btn"
          onClick={() => nav("/still_under_development")}
          style={{ backgroundColor: buttonColors[2] }}
        >
          アプリ使用マニュアルを見る
        </button>

        <button
          className="option-btn"
          onClick={() => nav("/privacy")}
          style={{ backgroundColor: buttonColors[3] }}
        >
          Privacy Policyを確認
        </button>
      </div>
    </div>
  );
}
