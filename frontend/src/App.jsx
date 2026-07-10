import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";

import api from "./services/api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewRoom from "./pages/InterviewRoom";
import Report from "./pages/Report";
import LeetCodeContest from "./pages/LeetCodeContest";
import CodingEditor from "./pages/CodingEditor";
import CodeLeaderboard from "./pages/CodeLeaderboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDetail from "./pages/CandidateDetail";

import RoleRedirect from "./pages/RoleRedirect";
import CompanyDashboard from "./pages/CompanyDashboard";
import PublicDrive from "./pages/PublicDrive";
import DriveCandidates from "./pages/DriveCandidates";

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
}

function PublicOnlyRoute({ children }) {
  return (
    <>
      <SignedOut>{children}</SignedOut>
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
    </>
  );
}

function RoleProtectedRoute({ children, allowedRole }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await api.get("/users/me");
        const role = response.data.role;

        if (role === allowedRole) {
          setStatus("allowed");
        } else {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        console.log("Role guard error:", err.response?.data);
        window.location.href = "/login";
      }
    };

    checkRole();
  }, [allowedRole]);

  if (status === "checking") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Checking access...</h2>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login/*"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register/*"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/signup/*"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRole="student">
              <Dashboard />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
          path="/company/drives/:driveId/candidates"
            element={
          <ProtectedRoute>
            <DriveCandidates />
          </ProtectedRoute>
          }
      />

      

      <Route
        path="/company-dashboard"
        element={
          <ProtectedRoute>
              <RoleProtectedRoute allowedRole="company">
                <CompanyDashboard />
              </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/setup"
        element={
          <ProtectedRoute>
            <InterviewSetup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview/:sessionId"
        element={
          <ProtectedRoute>
            <InterviewRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report/:sessionId"
        element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leetcode"
        element={
          <ProtectedRoute>
            <LeetCodeContest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leetcode/editor"
        element={
          <ProtectedRoute>
            <CodingEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leetcode/leaderboard"
        element={
          <ProtectedRoute>
            <CodeLeaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <CodeLeaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter"
        element={
          <ProtectedRoute>
              <RoleProtectedRoute allowedRole="recruiter">
                <RecruiterDashboard />
              </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/drive/:inviteCode"
        element={
        <ProtectedRoute>
          <PublicDrive />
        </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/candidate/:userId"
        element={
          <ProtectedRoute>
            <CandidateDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}

export default App;