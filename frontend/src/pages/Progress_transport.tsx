
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TestPage(){
  const nav = useNavigate();
  return (
    <div
    style={{ paddingTop: "92px" }}>
      
      <h2>学習経過を他のデバイスに移動する</h2>
      <button
        onClick={() => nav("/others")}
        style={{
          marginBottom: 5,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#555",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        戻る
      </button>
    </div>
  );
}
