import React, { useState } from "react";

export default function Settings() {
  const [showJapanese, setShowJapanese] = useState(true);
  const [playSound, setPlaySound] = useState(true);

  const toggleStyle = {
    position: "relative" as const,
    width: "50px",
    height: "24px",
    background: "#ccc",
    borderRadius: "24px",
    cursor: "pointer",
    transition: "background 0.3s",
    marginRight: "12px", // space between toggle and text
  };

  const knobStyle = (on: boolean) => ({
    position: "absolute" as const,
    top: "2px",
    left: on ? "26px" : "2px",
    width: "20px",
    height: "20px",
    background: "#fff",
    borderRadius: "50%",
    transition: "left 0.3s",
  });

  const optionStyle = {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
    fontSize: "20px",
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "32px", marginBottom: "30px" }}>設定</h2>

      <div style={optionStyle}>
        <div
          style={{ ...toggleStyle, background: showJapanese ? "#4caf50" : "#ccc" }}
          onClick={() => setShowJapanese(!showJapanese)}
        >
          <div style={knobStyle(showJapanese)}></div>
        </div>
        <span>日本語訳表示</span>
      </div>

      <div style={optionStyle}>
        <div
          style={{ ...toggleStyle, background: playSound ? "#4caf50" : "#ccc" }}
          onClick={() => setPlaySound(!playSound)}
        >
          <div style={knobStyle(playSound)}></div>
        </div>
        <span>音声再生</span>
      </div>
      <a href="/privacy" target="_blank"><strong>Privacy Policy</strong></a>
    </div>
  );
}
