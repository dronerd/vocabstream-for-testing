import React from "react";
import { useNavigate } from "react-router-dom";

export default function Still_under_development() {
  const navigate = useNavigate();
  return (
    <main className="p-6 max-w-3xl mx-auto" style={{ paddingTop: "92px" }}>
      <h1 className="text-2xl font-bold mb-4">現在まだ開発中</h1>
      {/* 戻るボタン */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate(-1)} //goes back to previous page, not home
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition duration-200 hover:scale-105 active:scale-95"
        >
          <strong> ← Go Back / 戻る</strong>
        </button>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">日本語</h2>
        <p className="mb-4">
          まだ開発中。現在使える機能は：
        </p>
        <p>
          楽しみにしていてください。
        </p>
      </section>
    </main>
  );
}
