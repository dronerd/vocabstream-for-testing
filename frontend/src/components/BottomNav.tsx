import React from "react";
import { Link } from "react-router-dom";

export default function BottomNav() {
  const linkStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    textDecoration: "none",
    color: "#000"
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "1px solid #ddd",
        background: "#fff",
        padding: "16px 8px", // increased vertical padding
        display: "flex",
        justifyContent: "space-around",
        height: "40px" // optional: set a specific height
      }}
    >
      <Link style={linkStyle} to="/">Home</Link>
      <Link style={linkStyle} to="/learn">学習</Link>
      <Link style={linkStyle} to="/review">復習</Link>
      <Link style={linkStyle} to="/stats">統計</Link>
      <Link style={linkStyle} to="/settings">アプリについて</Link>
    </nav>
  );
}
