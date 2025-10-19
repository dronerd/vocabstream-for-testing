import React from "react";
import { useNavigate } from "react-router-dom";

export default function StillUnderDevelopment() {
  const navigate = useNavigate();
  return (
    <main className="p-6 max-w-3xl mx-auto" style={{ paddingTop: "92px" }}>
      <h1 className="text-2xl font-bold mb-4">現在、この機能は開発中です</h1>
      
      {/* 戻るボタン */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition duration-200 hover:scale-105 active:scale-95"
        >
          <strong>← 戻る / Go Back</strong>
        </button>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">機能について</h2>
        <p className="mb-4">
          現在、本機能は開発段階にあります。VocabStreamは現在、安定して動作する一部の機能のみを公開しています。
          <br />現時点で利用可能な機能は、単語学習（全レベル対象・合計3000単語程度）およびその他の機能におけるChatGPTのプロンプトのみです。
        </p>
        <p>
          今後のアップデートにて、他の学習分野や復習機能など、より多くの機能を順次提供してまいります。楽しみにしていてください！
        </p>
      </section>
    </main>
  );
}
