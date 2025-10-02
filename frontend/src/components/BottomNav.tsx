import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  // "/privacy" では非表示
  if (location.pathname === "/privacy") {
    return null;
  }

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
        padding: "16px 8px",
        display: "flex",
        justifyContent: "space-around",
        height: "40px"
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
