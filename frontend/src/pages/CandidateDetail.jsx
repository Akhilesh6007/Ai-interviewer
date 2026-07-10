import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CandidateDetail() {
  const { userId } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState("");

  const getCandidate = async () => {
    try {
      const response = await api.get(`/admin/candidate/${userId}`);
      setCandidate(response.data);
    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to load candidate details");
    }
  };

  useEffect(() => {
    getCandidate();
  }, [userId]);

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        <div className="leetcode-hero">
          <h1>Candidate Detail View</h1>
          <p>
            Complete recruiter view of candidate interview, coding performance,
            and assessment signals.
          </p>

          <button onClick={() => (window.location.href = "/recruiter")}>
            Back to Recruiter Dashboard
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {!candidate ? (
          <div className="empty-state">Loading candidate details...</div>
        ) : (
          <>
            <div className="leetcode-section">
              <h2>Candidate Profile</h2>

              <div className="metric-grid">
                <div className="metric-card">
                  <h4>Name</h4>
                  <p style={{ fontSize: "20px" }}>{candidate.name}</p>
                </div>

                <div className="metric-card">
                  <h4>Email</h4>
                  <p style={{ fontSize: "16px" }}>{candidate.email}</p>
                </div>

                <div className="metric-card">
                  <h4>Coding Score</h4>
                  <p>{candidate.coding_score}/100</p>
                </div>

                <div className="metric-card">
                  <h4>Latest Session</h4>
                  <p>
                    {candidate.latest_session_id
                      ? `#${candidate.latest_session_id}`
                      : "No Interview"}
                  </p>
                </div>
              </div>
            </div>

            {candidate.report && (
              <div className="leetcode-section">
                <h2>Interview Report Snapshot</h2>

                <div className="metric-grid">
                  <div className="metric-card">
                    <h4>Average Score</h4>
                    <p>{candidate.report.average_score}/10</p>
                  </div>

                  <div className="metric-card metric-success">
                    <h4>Final Score</h4>
                    <p>{candidate.report.final_score}%</p>
                  </div>

                  <div className="metric-card metric-success">
                    <h4>Selection Chance</h4>
                    <p>{candidate.report.selection_percentage}%</p>
                  </div>

                  <div className="metric-card">
                    <h4>Selection Status</h4>
                    <p style={{ fontSize: "18px" }}>
                      {candidate.report.selection_status}
                    </p>
                  </div>

                  <div className="metric-card">
                    <h4>Integrity Status</h4>
                    <p style={{ fontSize: "18px" }}>
                      {candidate.report.final_status}
                    </p>
                  </div>

                  <div className="metric-card metric-danger">
                    <h4>Proctor Events</h4>
                    <p>{candidate.report.total_proctor_events}</p>
                  </div>
                </div>

                <br />

                <button
                  onClick={() =>
                    (window.location.href = `/report/${candidate.latest_session_id}`)
                  }
                >
                  Open Full AI Report
                </button>
              </div>
            )}

            <div className="leetcode-section">
              <h2>Coding Submissions</h2>

              {candidate.submissions.length === 0 ? (
                <div className="empty-state">
                  No coding submissions found.
                </div>
              ) : (
                <div className="leaderboard-table-wrapper">
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Difficulty</th>
                        <th>Topic</th>
                        <th>Language</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Runtime</th>
                      </tr>
                    </thead>

                    <tbody>
                      {candidate.submissions.map((item) => (
                        <tr key={item.id}>
                          <td>{item.question_title}</td>

                          <td>
                            <span
                              className={`difficulty-pill ${
                                item.difficulty === "hard"
                                  ? "diff-hard"
                                  : item.difficulty === "medium"
                                  ? "diff-medium"
                                  : "diff-easy"
                              }`}
                            >
                              {item.difficulty.toUpperCase()}
                            </span>
                          </td>

                          <td>{item.topic}</td>
                          <td>{item.language}</td>
                          <td>{item.status}</td>
                          <td>
                            <b>{item.score}/100</b>
                          </td>
                          <td>{item.runtime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CandidateDetail;