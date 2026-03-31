import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute, OnboardingRoute } from './components/Layout';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './components/Profile';
import QuizSystem from './components/QuizSystem';
import AITutor from './pages/AITutor';
import AdminDashboard from './pages/AdminDashboard';
import SubjectNotes from './pages/SubjectNotes';
import AISummaries from './pages/AISummaries';
import Flashcards from './pages/Flashcards';
import Games from './pages/Games';
import PracticeTests from './pages/PracticeTests';
import Journey from './pages/Journey';
import AboutUs from './pages/AboutUs';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/about" element={<AboutUs />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/quizzes" element={<QuizSystem />} />
            <Route path="/tutor" element={<AITutor />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* New Feature Routes */}
            <Route path="/journey" element={<Journey />} />
            <Route path="/notes" element={<SubjectNotes />} />
            <Route path="/ai-summaries" element={<AISummaries />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/games" element={<Games />} />
            <Route path="/tests" element={<PracticeTests />} />

            {/* Fallback for other routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

