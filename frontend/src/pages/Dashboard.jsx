import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth, useUser } from "@clerk/clerk-react";

function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const { getToken } = useAuth();
  const { user } = useUser();

  const getUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const getSessions = async () => {
  try {
    const token = await getToken();

    const response = await api.get("/interview/my-sessions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setSessions(response.data);
  } catch (error) {
    console.log(error.response?.data);
    setError("Failed to load interview history");
  }
};

  useEffect(() => {
  getSessions();
}, []);

  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  ).length;

  const activeSessions = sessions.filter(
    (session) => session.status !== "completed"
  ).length;

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-hero">
          <div>
            <h1>Welcome back{user ? `, ${user.firstName || user.fullName || "Candidate"}` : ""}</h1>
            <p>
              Practice AI interviews, track proctoring events, and improve your
              coding performance with LeetCode-style contests.
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              className="btn-primary"
              onClick={() => (window.location.href = "/interview/setup")}
            >
              Start Interview
            </button>

            <button
              className="btn-dark"
              onClick={() => (window.location.href = "/leetcode")}
            >
              LeetCode Contest
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-stat-card">
            <h3>Total Interviews</h3>
            <p>{sessions.length}</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>Completed Interviews</h3>
            <p style={{ color: "#16a34a" }}>{completedSessions}</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>Active Sessions</h3>
            <p style={{ color: "#f59e0b" }}>{activeSessions}</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>Account</h3>
            <p style={{ fontSize: "18px" }}>{user?.primaryEmailAddress?.emailAddress || "Loading..."}</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div
            className="dashboard-stat-card quick-card"
            onClick={() => (window.location.href = "/interview/setup")}
          >
            <h3>AI Mock Interview</h3>
            <p style={{ fontSize: "20px" }}>Start Practice →</p>
          </div>

          <div
            className="dashboard-stat-card quick-card"
            onClick={() => (window.location.href = "/leetcode")}
          >
            <h3>LeetCode Analyzer</h3>
            <p style={{ fontSize: "20px" }}>Generate Contest →</p>
          </div>

          <div
            className="dashboard-stat-card quick-card"
            onClick={() => (window.location.href = "/leetcode/leaderboard")}
          >
            <h3>Coding Leaderboard</h3>
            <p style={{ fontSize: "20px" }}>View Rank →</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Interview History</h2>

          {error && <p className="error">{error}</p>}

          {sessions.length === 0 ? (
            <div className="empty-state">
              No interviews found. Start your first AI interview.
            </div>
          ) : (
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Role</th>
                    <th>Difficulty</th>
                    <th>Questions</th>
                    <th>Status</th>
                    <th>Started At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>#{session.id}</td>
                      <td>{session.role}</td>
                      <td>{session.difficulty}</td>
                      <td>{session.number_of_questions}</td>
                      <td>
                        <span
                          className={
                            session.status === "completed"
                              ? "session-status-completed"
                              : "session-status-started"
                          }
                        >
                          {session.status}
                        </span>
                      </td>
                      <td>{new Date(session.started_at).toLocaleString()}</td>
                      <td>
                        {session.status === "completed" ? (
                          <button
                            onClick={() =>
                              (window.location.href = `/report/${session.id}`)
                            }
                          >
                            View Report
                          </button>
                        ) : (
                          <button
                            className="btn-primary"
                            onClick={() =>
                              (window.location.href = `/interview/${session.id}`)
                            }
                          >
                            Continue
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;