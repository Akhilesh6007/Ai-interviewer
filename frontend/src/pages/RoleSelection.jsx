import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function RoleSelection() {
  const [loading, setLoading] = useState("");

  const chooseRole = async (role) => {
    try {
      setLoading(role);

      await api.put("/users/role", {
        role: role,
      });

      if (role === "student") {
        window.location.href = "/student-dashboard";
      } else if (role === "company") {
        window.location.href = "/company-dashboard";
      } else if (role === "recruiter") {
        window.location.href = "/recruiter";
      }
    } catch (err) {
  console.log("ROLE UPDATE ERROR:", err);
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);

  alert(
    err.response?.data?.detail ||
      err.response?.data?.message ||
      "Failed to update role"
  );
} finally {
      setLoading("");
    }
  };

  return (
    <div className="role-page">
      <Navbar />

      <div className="role-container">
        <div className="role-hero">
          <span className="role-kicker">AI Interviewer Platform</span>
          <h1>Choose Your Role</h1>
          <p>
            Select how you want to use the platform. Your dashboard and tools
            will be customized based on your role.
          </p>
        </div>

        <div className="role-grid">
          <div className="role-card">
            <div className="role-icon">🎓</div>
            <h2>Student</h2>
            <p>
              Practice AI interviews, attempt coding assessments, and analyze
              your preparation performance.
            </p>

            <ul>
              <li>AI interview practice</li>
              <li>Personal performance report</li>
              <li>LeetCode-style coding practice</li>
            </ul>

            <button
              onClick={() => chooseRole("student")}
              disabled={loading === "student"}
            >
              {loading === "student" ? "Saving..." : "Continue as Student"}
            </button>
          </div>

          <div className="role-card role-featured">
            <div className="role-icon">🏢</div>
            <h2>Company</h2>
            <p>
              Run mass hiring drives, manage candidates, and shortlist talent
              using AI-powered assessment analytics.
            </p>

            <ul>
              <li>Mass recruitment dashboard</li>
              <li>Candidate pipeline tracking</li>
              <li>Bulk assessment processing</li>
            </ul>

            <button
              onClick={() => chooseRole("company")}
              disabled={loading === "company"}
            >
              {loading === "company" ? "Saving..." : "Continue as Company"}
            </button>
          </div>

          <div className="role-card">
            <div className="role-icon">🧑‍💼</div>
            <h2>Recruiter</h2>
            <p>
              Review candidate reports, compare applicants, and use AI hiring
              recommendations for faster decisions.
            </p>

            <ul>
              <li>AI candidate ranking</li>
              <li>Recruiter analytics</li>
              <li>Hiring recommendation reports</li>
            </ul>

            <button
              onClick={() => chooseRole("recruiter")}
              disabled={loading === "recruiter"}
            >
              {loading === "recruiter" ? "Saving..." : "Continue as Recruiter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;