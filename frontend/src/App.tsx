
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { Analytics } from "@vercel/analytics/react"; 
import Home from "./pages/Home";
import LearnGenres from "./pages/LearnGenres";
import LessonList from "./pages/LessonList";
import Lesson from "./pages/Lesson";
import Review from "./pages/Review";
import ReviewParagraphFillin from "./pages/Review_Paragraph_Fillin";
import ReviewParagraphFillinList from "./pages/Review_Paragraph_Fillin_list";
import ReviewParagraphFillinLesson from "./pages/Review_Paragraph_Fillin_Lesson";
import ReviewThreeChoiseQuestions from "./pages/Review_Three_Choise_Questions";
import ReviewThreeChoiseQuestionsList from "./pages/Review_Three_Choise_Questions_list";
import ReviewThreeChoiseQuestionsLesson from "./pages/Review_Three_Choise_Questions_Lesson";
import Others from "./pages/Others";
import ReviewReadingComprehension from "./pages/Review_ReadingComprehension";
import ReviewReadingComprehensionList from "./pages/Review_ReadingComprehension_list";
import LandingPage from "./pages/LandingPage";
import Privacy from "./pages/Privacy";
import Prompts from "./pages/ChatGPT_prompts";
import ProgressTransport from "./pages/Progress_transport";
import StillUnderDevelopment from "./pages/Still_under_development";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const location = useLocation();

  // normalize path (remove trailing slash)
  const path = location.pathname.replace(/\/$/, "");
  const isLoginPage = path === "/login";

  // Hide BottomNav for these paths (make sure these match your routes)
  const hideBottomNavPaths = ["/login", "/"]; // if you want to hide on landing page "/"
  const hideBottomNav = hideBottomNavPaths.includes(path);

  return (
    // Wrap the whole app in HelmetProvider so any page can use <Helmet>
    <HelmetProvider>
      <AuthProvider>
        {/* Header (keeps showing across pages) */}
        <Header currentPath={location.pathname} isLoginPage={isLoginPage} />

        <div style={{ padding: 16, paddingBottom: 80 }}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/learn" element={<LearnGenres />} />
            <Route path="/learn/:genreId" element={<LessonList />} />
            <Route path="/lesson/:lessonId" element={<Lesson />} />
            <Route path="/review" element={<Review />} />
            <Route path="/review_paragraph_fillin" element={<ReviewParagraphFillin />} />
            <Route path="/review_paragraph_fillin_list/:genreId" element={<ReviewParagraphFillinList />} />
            <Route path="/review_paragraph_fillin_lesson/:lessonId" element={<ReviewParagraphFillinLesson />} />
            <Route path="/review_three_choise_questions" element={<ReviewThreeChoiseQuestions />} />
            <Route path="/review_three_choise_questions_list/:genreId" element={<ReviewThreeChoiseQuestionsList />} />
            <Route path="/review_three_choise_questions_lesson/:genreId" element={<ReviewThreeChoiseQuestionsLesson />} />
            <Route path="/others" element={<Others />} />
            <Route path="/review_reading_comprehension" element={<ReviewReadingComprehension />} />
            <Route path="/review_reading_comprehension_list" element={<ReviewReadingComprehensionList />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/progress_transport" element={<ProgressTransport />} />
            <Route path="/still_under_development" element={<StillUnderDevelopment />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {!hideBottomNav && <BottomNav />}

        {/* Add Vercel Analytics globally (at the root level) */}
        <Analytics />
      </AuthProvider>
    </HelmetProvider>
  );
}
