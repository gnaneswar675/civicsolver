import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getToken, getUserRole } from './utils/auth';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportProblem from './pages/ReportProblem';
import ProblemsList from './pages/ProblemsList';
import HeadDashboard from './pages/HeadDashboard';
import UserDashboard from './pages/UserDashboard';
import HeadProblemsList from './pages/HeadProblemsList';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';
import './App.css';

function App() {
  const isLoggedIn = !!getToken();
  const userRole = getUserRole();

  return (
    <Router>
      <Header />
      <Routes>
        {/* Landing Page:
            - Unauthenticated users: Landing page displays ONLY 3 active issues.
            - Authenticated Citizens: redirected to Citizen Dashboard (displaying all issues).
            - Authenticated Heads: redirected to Head Dashboard (displaying all issues).
        */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? (userRole === 'head'
                ? <Navigate to="/head" replace />
                : <Navigate to="/dashboard" replace />
              )
              : <ProblemsList showLandingPage={true} />
          }
        />

        {/* /problems Access Control:
            - Unauthenticated users: redirected to Login (they only see 3 issues on /).
            - Authenticated Citizens: redirected to Citizen Dashboard (where all issues are displayed).
            - Authenticated Heads: redirected to Head Problems Overview (where all issues are displayed).
        */}
        <Route
          path="/problems"
          element={
            isLoggedIn
              ? (userRole === 'head'
                ? <Navigate to="/head/problems" replace />
                : <Navigate to="/dashboard" replace />
              )
              : <Navigate to="/login" state={{ returnTo: '/dashboard', message: 'Please sign in to view the complete community problems directory.' }} replace />
          }
        />

        {/* Citizen Dashboard (Authenticated Citizens: views all reported issues) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Head Official Dashboard (Authenticated Heads: views all reported issues) */}
        <Route
          path="/head/dashboard"
          element={
            <ProtectedRoute role="head">
              <HeadDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/head"
          element={
            <ProtectedRoute role="head">
              <HeadDashboard />
            </ProtectedRoute>
          }
        />

        {/* Head Community Problems List (Authenticated Heads) */}
        <Route
          path="/head/problems"
          element={
            <ProtectedRoute role="head">
              <HeadProblemsList />
            </ProtectedRoute>
          }
        />

        {/* Report Problem (Authenticated Citizens) */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportProblem />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to={userRole === 'head' ? '/head' : '/dashboard'} replace />
              : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn
              ? <Navigate to={userRole === 'head' ? '/head' : '/dashboard'} replace />
              : <Register />
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
