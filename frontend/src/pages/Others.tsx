import React from "react";
import { useNavigate } from "react-router-dom";

export default function Review() {
  const nav = useNavigate();

  const baseColor = "#f6c6b3";

  // Slightly lighter, reddish button tones
  const buttonColors = ["#f29c83", "#f08f76", "#ee836b"];

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
          color: #993300;
          background-color: ${baseColor};
          transition: background-color .3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .heading {
          font-size: 32px;
          margin: 4px 0 8px 0;
          color: #993300;
        }

        .subheading {
          font-size: 22px;
          margin-bottom: 18px;
          color: #cc3300;
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
          color: #993300;
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

      <h2 className="heading">単語の復習</h2>
      <h3 className="subheading">復習方法を選択</h3>

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
          アプリ使用マニュアルを見る
        </button>

        <button
          className="option-btn option-third"
          onClick={() => nav("privacy")}
          style={{ backgroundColor: buttonColors[2] }}
        >
          Privacy Policyを確認
        </button>
      </div>
    </div>
  );
}
