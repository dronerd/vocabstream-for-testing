import React from "react";
import { useNavigate } from "react-router-dom";

export default function StillUnderDevelopment() {
  const navigate = useNavigate();
  return (
    <main className="p-6 max-w-3xl mx-auto" style={{ paddingTop: "92px" }}>
      <h1 className="text-2xl font-bold mb-4">復習レッスン</h1>
      
      {/* 戻るボタン */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition duration-200 hover:scale-105 active:scale-95"
        >
          <strong>← 戻る / Go Back</strong>
        </button>
      </div>

      
    </main>
  );
}
