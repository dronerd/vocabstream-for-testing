import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  // "/privacy" では非表示
  if (location.pathname === "/privacy") {
    return null;
  }

  return (
    <>
      {/* Inline stylesheet so you can drop this component in without adding files */}
      <style>{`
        .nav-bottom {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          border-top: 1px solid #ddd;
          background: #fff;
          padding: 16px 8px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 40px; /* desktop default kept */
          z-index: 50;
        }

        .nav-bottom .bottom-link {
          font-size: 24px;
          font-weight: 700;
          text-decoration: none;
          color: #000;
          display: inline-block;
          text-align: center;
          padding: 2px 6px;
          white-space: nowrap;
        }

        .nav-bottom .bottom-link.active {
          color: #0b63d6;
        }

        /* ===== Mobile / small screen adjustments =====
           Only applies when viewport width <= 640px.
           These styles reduce font size and allow links to wrap into two rows,
           preventing overlap while keeping desktop unchanged.
        */
        @media (max-width: 640px) {
          .nav-bottom {
            padding: 8px 6px;
            height: auto;            /* allow two-row layout */
            flex-wrap: wrap;        /* wrap links to next line */
            gap: 4px;               /* small gap between items */
          }

          .nav-bottom .bottom-link {
            font-size: 14px;        /* much smaller on phones */
            font-weight: 600;
            padding: 6px 4px;
            flex: 0 0 50%;          /* two items per row (3rd row will contain remaining) */
            box-sizing: border-box;
          }

          /* If you prefer three items on first row and two on second, change flex to 33.33% for first three using nth-child,
             but the 50% rule is a simple robust choice for many devices. */
        }
      `}</style>

      <nav className="nav-bottom" aria-label="Bottom navigation">
        <Link
          to="/"
          className={`bottom-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/learn"
          className={`bottom-link ${location.pathname === "/learn" ? "active" : ""}`}
        >
          学習
        </Link>
        <Link
          to="/review"
          className={`bottom-link ${location.pathname === "/review" ? "active" : ""}`}
        >
          復習
        </Link>
        <Link
          to="/stats"
          className={`bottom-link ${location.pathname === "/stats" ? "active" : ""}`}
        >
          統計
        </Link>
        <Link
          to="/settings"
          className={`bottom-link ${location.pathname === "/settings" ? "active" : ""}`}
        >
          アプリについて
        </Link>
      </nav>
    </>
  );
}
