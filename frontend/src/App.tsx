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

// for indivdual AI lessons
// Removed: Eiken1Listening, Eiken1Reading, Eiken1Writing
import Eiken1Speaking from "./pages/eiken/eiken1_speaking";
import Pre1Listening from "./pages/eiken/pre1_listening";
import Pre1Speaking from "./pages/eiken/pre1_speaking";
import Pre1Reading from "./pages/eiken/pre1_reading";
import Pre1Writing from "./pages/eiken/pre1_writing";
import Pre2Listening from "./pages/eiken/pre2_listening";
import Pre2Speaking from "./pages/eiken/pre2_speaking";
import Pre2Reading from "./pages/eiken/pre2_reading";
import Pre2Writing from "./pages/eiken/pre2_writing";
import ThreeListening from "./pages/eiken/3_listening";
import ThreeSpeaking from "./pages/eiken/3_speaking";
import ThreeReading from "./pages/eiken/3_reading";
import ThreeWriting from "./pages/eiken/3_writing";
import ToeicListening from "./pages/toeic/listening";
import ToeicSpeaking from "./pages/toeic/speaking";
import ToeicReading from "./pages/toeic/reading";
import ToeicWriting from "./pages/toeic/writing";
import IeltsListening from "./pages/ielts/listening";
import IeltsSpeaking from "./pages/ielts/speaking";
import IeltsReading from "./pages/ielts/reading";
import IeltsWriting from "./pages/ielts/writing";
import ToeflListening from "./pages/toefl/listening";
import ToeflSpeaking from "./pages/toefl/speaking";
import ToeflReading from "./pages/toefl/reading";
import ToeflWriting from "./pages/toefl/writing";

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
      <Header currentPath={location.pathname} isLoginPage={isLoginPage} />

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
          {/* Individual AI lesson routes */}
          {/* Removed: /eiken1_listening, /eiken1_reading, /eiken1_writing */}
          <Route path="/eiken1_speaking" element={<Eiken1Speaking />} />
          <Route path="/pre1_listening" element={<Pre1Listening />} />
          <Route path="/pre1_speaking" element={<Pre1Speaking />} />
          <Route path="/pre1_reading" element={<Pre1Reading />} />
          <Route path="/pre1_writing" element={<Pre1Writing />} />
          <Route path="/pre2_listening" element={<Pre2Listening />} />
          <Route path="/pre2_speaking" element={<Pre2Speaking />} />
          <Route path="/pre2_reading" element={<Pre2Reading />} />
          <Route path="/pre2_writing" element={<Pre2Writing />} />
          <Route path="/3_listening" element={<ThreeListening />} />
          <Route path="/3_speaking" element={<ThreeSpeaking />} />
          <Route path="/3_reading" element={<ThreeReading />} />
          <Route path="/3_writing" element={<ThreeWriting />} />
          <Route path="/toeic_listening" element={<ToeicListening />} />
          <Route path="/toeic_speaking" element={<ToeicSpeaking />} />
          <Route path="/toeic_reading" element={<ToeicReading />} />
          <Route path="/toeic_writing" element={<ToeicWriting />} />
          <Route path="/ielts_listening" element={<IeltsListening />} />
          <Route path="/ielts_speaking" element={<IeltsSpeaking />} />
          <Route path="/ielts_reading" element={<IeltsReading />} />
          <Route path="/ielts_writing" element={<IeltsWriting />} />
          <Route path="/toefl_listening" element={<ToeflListening />} />
          <Route path="/toefl_speaking" element={<ToeflSpeaking />} />
          <Route path="/toefl_reading" element={<ToeflReading />} />
          <Route path="/toefl_writing" element={<ToeflWriting />} />
        </Routes>
      </div>

      {!hideBottomNav && <BottomNav />}

      {/* Add Vercel Analytics globally (at the root level) */}
      <Analytics />
    </AuthProvider>
  );
}
