import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type ChatEntry = {
  sender: "user" | "llm";
  text: string;
};

export default function AI_chat() {
  const navigate = useNavigate();

  // State管理
  const [level, setLevel] = useState("A1");
  const [specialty, setSpecialty] = useState("Computer Science & Technology");
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]); // ← 型を指定
  const [recommendedWords] = useState<string[]>(["example", "test", "AI"]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newLog: ChatEntry[] = [...chatLog, { sender: "user", text: userInput }];
    setChatLog(newLog);
    setUserInput("");

    const API_URL = process.env.REACT_APP_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userInput,
        level,
        specialty,
      }),
    });


      const data = await res.json();

      const llmResponse: ChatEntry = { sender: "llm", text: data.reply || "No response" };
      setChatLog((prev) => [...prev, llmResponse]);
    } catch (error) {
      console.error(error);
      setChatLog((prev) => [...prev, { sender: "llm", text: "Error: could not get response." }]);
    }
  };


  return (
    <main className="p-6 max-w-3xl mx-auto" style={{ paddingTop: "92px" }}>
      <h1 className="text-2xl font-bold mb-6">AI会話ページ</h1>

      {/* 英語レベル選択 */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">英語レベル:</label>
        <select
          className="w-full border rounded-md p-2"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {["A1","A2","B1","B2","C1","C2"].map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      {/* 専門分野選択 */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">専門分野:</label>
        <select
          className="w-full border rounded-md p-2"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          {[
            "Computer Science & Technology",
            "Medicine & Health",
            "Business & Economics",
            "Environmental Science & Sustainability",
            "Law",
            "Politics",
            "Engineering",
          ].map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      {/* チャット表示 */}
      <div className="border rounded-md p-4 h-80 overflow-y-auto mb-4 bg-gray-50">
        {chatLog.map((entry, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-md ${entry.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}
          >
            {entry.text}
          </div>
        ))}
      </div>

      {/* ユーザー入力 */}
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-1 border rounded-md p-2 mr-2"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="ここに入力..."
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-md"
          onClick={handleSend}
        >
          送信
        </button>
      </div>

      {/* おすすめ単語 */}
      <div className="border rounded-md p-4 bg-gray-100">
        <h2 className="font-semibold mb-2">おすすめ単語</h2>
        <div className="flex flex-wrap gap-2">
          {recommendedWords.map((word, idx) => (
            <span key={idx} className="bg-green-200 px-2 py-1 rounded-md text-sm">{word}</span>
          ))}
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition duration-200 hover:scale-105 active:scale-95"
        >
          <strong> ← Go Back / 戻る</strong>
        </button>
      </div>
    </main>
  );
}
