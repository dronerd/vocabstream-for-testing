import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  // hide on /privacy
  if (location.pathname === "/privacy") return null;

  var style = `
    /* Container: centered and slightly lifted so it doesn't sit flush with the absolute bottom */
    .nav-bottom {
      position: fixed;
      bottom: 12px;
      left: 0;
      right: 0;
      margin: 0 auto;

      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 8px;
      padding: 8px;

      /* width control: stays narrow on phones but grows on larger screens */
      width: calc(100% - 32px);
      max-width: 900px;

      background: #fff;
      border: 2px solid #001f3f; /* dark-blue border around the entire nav — change to #000 for black */
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);

      z-index: 50;

      /* keep items on a single horizontal line; allow horizontal scroll if needed */
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* hide ugly scrollbars on webkit while still allowing scroll (optional) */
    .nav-bottom::-webkit-scrollbar { height: 6px; }
    .nav-bottom::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 6px; }

    .nav-bottom .bottom-link {
      flex: 1 1 0; /* each link grows equally */
      min-width: 0; /* important so text-overflow works inside flex */

      display: inline-block;
      text-align: center;

      font-size: 16px;  /* desktop default */
      font-weight: 600;
      text-decoration: none;
      color: #000;

      padding: 6px 8px;

      /* force long labels to truncate instead of wrapping to multiple lines */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-bottom .bottom-link.active {
      color: #0b63d6;
    }

    /* Mobile / small screens: make the nav narrower and text smaller */
    @media (max-width: 640px) {
      .nav-bottom {
        max-width: 480px;   /* narrower on mobile */
        width: calc(100% - 24px);
        padding: 6px;
        gap: 6px;
        bottom: 8px;
        border-radius: 10px;
      }

      .nav-bottom .bottom-link {
        font-size: 13px;   /* much smaller on phones */
        padding: 6px 6px;
      }
    }

    /* Extra small / very constrained widths: let user scroll horizontally */
    @media (max-width: 360px) {
      .nav-bottom { width: calc(100% - 12px); max-width: 360px; }
      .nav-bottom .bottom-link { font-size: 12px; }
    }
  `;

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("style", null, style),
    React.createElement(
      "nav",
      { className: "nav-bottom", "aria-label": "Bottom navigation" },
      React.createElement(
        Link,
        {
          to: "/",
          className: "bottom-link " + (location.pathname === "/" ? "active" : ""),
          "aria-current": location.pathname === "/" ? "page" : undefined,
        },
        "Home"
      ),

      React.createElement(
        Link,
        {
          to: "/learn",
          className: "bottom-link " + (location.pathname === "/learn" ? "active" : ""),
          "aria-current": location.pathname === "/learn" ? "page" : undefined,
        },
        "学習"
      ),

      React.createElement(
        Link,
        {
          to: "/review",
          className: "bottom-link " + (location.pathname === "/review" ? "active" : ""),
          "aria-current": location.pathname === "/review" ? "page" : undefined,
        },
        "復習"
      ),

      React.createElement(
        Link,
        {
          to: "/stats",
          className: "bottom-link " + (location.pathname === "/stats" ? "active" : ""),
          "aria-current": location.pathname === "/stats" ? "page" : undefined,
        },
        "その他の機能"
      )
    )
  );
}
