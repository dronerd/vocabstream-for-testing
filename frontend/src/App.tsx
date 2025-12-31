import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { Analytics } from "@vercel/analytics/react"; 
import Home from "./pages/Home";
import LearnGenres from "./pages/LearnGenres";
import LessonList from "./pages/LessonList";
import Lesson from "./pages/Lesson";
import Review from "./pages/Review";
import Others from "./pages/Others";
import LandingPage from "./pages/LandingPage";
import Privacy from "./pages/Privacy";
import Prompts from "./pages/ChatGPT_prompts";
import StillUnderDevelopment from "./pages/Still_under_development";
import ReviewLessonDecide from "./pages/ReviewLessonDecide";
import ReviewLesson from "./pages/ReviewLesson";
import AIchat from "./pages/AI_chat";

export default function App() {
  const location = useLocation();

  // normalize path (remove trailing slash)
  const path = location.pathname.replace(/\/$/, "");
  const isLoginPage = path === "/login";

  // Hide BottomNav for these paths
  const hideBottomNavPaths = ["/login", "/landing_page"];
  const hideBottomNav = hideBottomNavPaths.includes(path);

  return (
    <AuthProvider>
      {path !== "/ai_chat" && <Header currentPath={location.pathname} isLoginPage={isLoginPage} />}

      <div style={{ padding: 16, paddingBottom: 80 }}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/learn" element={<LearnGenres />} />
          <Route path="/learn/:genreId" element={<LessonList />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />
          <Route path="/review" element={<Review />} />
          <Route path="/others" element={<Others />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/still_under_development" element={<StillUnderDevelopment />} />
          <Route path="/review/:genreId" element={<ReviewLessonDecide />} />
          <Route path="/review/:lessonId" element={<ReviewLesson />} />
          <Route path="/ai_chat" element={<AIchat />} />
        </Routes>
      </div>

      {!hideBottomNav && <BottomNav />}

      {/* Add Vercel Analytics globally (at the root level) */}
      <Analytics />
    </AuthProvider>
  );
}
