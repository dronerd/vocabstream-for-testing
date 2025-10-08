import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import LearnGenres from "./pages/LearnGenres";
import LessonList from "./pages/LessonList";
import Lesson from "./pages/Lesson";
import Review from "./pages/Review";
import ReviewFillin from "./pages/ReviewFillin";
import ReviewFillinList from "./pages/ReviewFillin_list";
import ReviewFillinLesson from "./pages/ReviewFillinLesson";
import ReviewMeaning from "./pages/ReviewMeaning";
import ReviewMeaningList from "./pages/ReviewMeaning_list";
import ReviewMeaningLesson from "./pages/ReviewMeaningLesson";
import Others from "./pages/Others";
import ReadingComprehension from "./pages/ReadingComprehension";
import ReadingComprehensionList from "./pages/ReadingComprehension_list";
import LandingPage from "./pages/LandingPage";
import Privacy from "./pages/Privacy";
 
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const location = useLocation();

  // normalize path (remove trailing slash) so "/landing_page/" でも判定できる
  const path = location.pathname.replace(/\/$/, "");

  // Header 用の判定（必要なら残す）
  const isLoginPage = path === "/login";

  // BottomNav を隠したいパスをここに列挙
  const hideBottomNavPaths = ["/login", "/landing_page"];
  const hideBottomNav = hideBottomNavPaths.includes(path); //true or false になる

  return (
    <AuthProvider>
      <Header currentPath={location.pathname} isLoginPage={isLoginPage} />

      <div style={{ padding: 16, paddingBottom: 80 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<LearnGenres />} />
          <Route path="/learn/:genreId" element={<LessonList />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />
          <Route path="/review" element={<Review />} />
          <Route path="/review_fillin" element={<ReviewFillin />} />
          <Route path="/review_fillin_list/:genreId" element={<ReviewFillinList />} />
          <Route path="/review_fillin_lesson/:lessonId" element={<ReviewFillinLesson />} />
          <Route path="/review_meaning" element={<ReviewMeaning />} />
          <Route path="/review_meaning_list/:genreId" element={<ReviewMeaningList />} />
          <Route path="/review_meaning_lesson/:genreId" element={<ReviewMeaningLesson />} />
          <Route path="/others" element={<Others />} />
          <Route path="/reading_comprehension" element={<ReadingComprehension />} />
          <Route path="/reading_comprehension_list" element={<ReadingComprehensionList />} />
          <Route path="/landing_page" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>

      {/* hideBottomNav が false のときだけ表示 */}
      {!hideBottomNav && <BottomNav />}
    </AuthProvider>
  );
}
