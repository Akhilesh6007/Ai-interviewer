import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [summary, setSummary] = useState(null);

  const getRankings = async () => {
    try {
      const response = await api.get("/admin/candidate-rankings");
      setCandidates(response.data);
    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to load candidate rankings");
    }
  };

  const getRecruiterSummary = async () => {
  try {
    const response = await api.get("/admin/recruiter-summary");
    setSummary(response.data);
  } catch (err) {
    console.log("Recruiter summary error:", err.response?.data);
  }
};

  useEffect(() => {
  getRankings();
  getRecruiterSummary();
}, []);


  const shortlistedCount = candidates.filter(
  (c) => c.shortlist_status === "Shortlisted"
).length;

const reviewCount = candidates.filter(
  (c) => c.shortlist_status === "Review"
).length;

const rejectedCount = candidates.filter(
  (c) => c.shortlist_status === "Rejected"
).length;

const averageRankScore =
  candidates.length > 0
    ? (
        candidates.reduce((sum, c) => sum + c.final_rank_score, 0) /
        candidates.length
      ).toFixed(2)
    : 0;


const averageInterviewScore =
  candidates.length > 0
    ? (
        candidates.reduce((sum, c) => sum + c.interview_score, 0) /
        candidates.length
      ).toFixed(2)
    : 0;

const averageCodingScore =
  candidates.length > 0
    ? (
        candidates.reduce((sum, c) => sum + c.coding_score, 0) /
        candidates.length
      ).toFixed(2)
    : 0;

const shortlistedPercent =
  candidates.length > 0
    ? ((shortlistedCount / candidates.length) * 100).toFixed(0)
    : 0;

const reviewPercent =
  candidates.length > 0
    ? ((reviewCount / candidates.length) * 100).toFixed(0)
    : 0;

const rejectedPercent =
  candidates.length > 0
    ? ((rejectedCount / candidates.length) * 100).toFixed(0)
    : 0;
    

    
const filteredCandidates =
  filter === "All"
    ? candidates
    : candidates.filter((c) => c.shortlist_status === filter);    

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        <div className="leetcode-hero">
          <h1>Recruiter Candidate Ranking Dashboard</h1>
          <p>
            Compare candidates using AI interview score, proctoring integrity,
            coding performance, and final rank score.
          </p>
        </div>
        <div className="leetcode-section">
  <h2>Recruiter Screening Summary</h2>


  <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
  {["All", "Shortlisted", "Review", "Rejected"].map((item) => (
    <button
      key={item}
      onClick={() => setFilter(item)}
      className={filter === item ? "btn-primary" : "btn-dark"}
    >
      {item}
    </button>
  ))}
</div>
{summary && (
  <div
    style={{
      marginTop: "20px",
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      borderLeft: "6px solid #2563eb",
      borderRadius: "14px",
      padding: "18px",
    }}
  >
    <h3>GenAI Recruiter Summary</h3>

    <p style={{ lineHeight: "1.6", color: "#475569" }}>
      {summary.summary}
    </p>

    <p style={{ lineHeight: "1.6" }}>
      <b>Best Candidate:</b> {summary.best_candidate}
    </p>

    <p style={{ lineHeight: "1.6" }}>
      <b>Recommended Action:</b> {summary.recommendation}
    </p>
  </div>
)}

  <div className="metric-grid">
    <div className="metric-card">
      <h4>Total Candidates</h4>
      <p>{candidates.length}</p>
    </div>

    <div className="metric-card metric-success">
      <h4>Shortlisted</h4>
      <p>{shortlistedCount}</p>
    </div>

    <div className="metric-card">
      <h4>Review</h4>
      <p>{reviewCount}</p>
    </div>

    <div className="metric-card metric-danger">
      <h4>Rejected</h4>
      <p>{rejectedCount}</p>
    </div>

    <div className="metric-card">
      <h4>Average Rank Score</h4>
      <p>{averageRankScore}</p>
    </div>
  </div>
</div>

<div className="leetcode-section">
  <h2>Recruiter Analytics</h2>

  <div className="metric-grid">
    <div className="metric-card metric-success">
      <h4>Avg Interview Score</h4>
      <p>{averageInterviewScore}%</p>
    </div>

    <div className="metric-card">
      <h4>Avg Coding Score</h4>
      <p>{averageCodingScore}/100</p>
    </div>

    <div className="metric-card">
      <h4>Avg Final Rank</h4>
      <p>{averageRankScore}</p>
    </div>
  </div>

  <div style={{ marginTop: "24px" }}>
    <h3>Selection Pipeline</h3>

    <div style={{ marginBottom: "16px" }}>
      <b>Shortlisted — {shortlistedPercent}%</b>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${shortlistedPercent}%`,
            background: "#16a34a",
          }}
        ></div>
      </div>
    </div>

    <div style={{ marginBottom: "16px" }}>
      <b>Review — {reviewPercent}%</b>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${reviewPercent}%`,
            background: "#f59e0b",
          }}
        ></div>
      </div>
    </div>

    <div style={{ marginBottom: "16px" }}>
      <b>Rejected — {rejectedPercent}%</b>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${rejectedPercent}%`,
            background: "#dc2626",
          }}
        ></div>
      </div>
    </div>
  </div>
</div>

        <div className="leetcode-section">
          <h2>AI Ranked Candidates</h2>

          {error && <p className="error">{error}</p>}

          {filteredCandidates.length === 0 ? (
            <div className="empty-state">No candidates found.</div>
          ) : (
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Interview Score</th>
                    <th>Coding Score</th>
                    <th>Selection</th>
                    <th>Integrity</th>
                    <th>Final Rank Score</th>
                    <th>AI Decision</th>
                    <th>Details</th>
                    <th>Report</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCandidates.map((candidate, index) => (
                    <tr key={candidate.user_id}>
                      <td>
                        <span className="rank-badge">#{index + 1}</span>
                      </td>

                      <td>{candidate.candidate_name}</td>
                      <td>{candidate.candidate_email}</td>

                      <td>
                        <span className="score-badge">
                          {candidate.interview_score}%
                        </span>
                      </td>

                      <td>{candidate.coding_score}/100</td>

                      <td>{candidate.selection_status}</td>

                      <td
                        style={{
                          color:
                            candidate.integrity_status
                              ?.toLowerCase()
                              .includes("clean")
                              ? "green"
                              : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {candidate.integrity_status}
                      </td>

                      <td>
                        <b>{candidate.final_rank_score}</b>
                      </td>
                      <td>
                    <span
                        style={{
                                padding: "7px 12px",
                                borderRadius: "999px",
                                fontWeight: "800",
                                background:
                                candidate.shortlist_status === "Shortlisted" ? "#dcfce7": candidate.shortlist_status === "Review" ? "#fef3c7" : "#fee2e2",
                                    color:
                                        candidate.shortlist_status === "Shortlisted" ? "#166534" : candidate.shortlist_status === "Review" ? "#92400e" : "#991b1b",
                                    }}
                                    >
                                    {candidate.shortlist_status}
                    </span>
                        </td>
                        <td>
                            <button
                                className="btn-dark"
                                onClick={() =>
                                (window.location.href = `/recruiter/candidate/${candidate.user_id}`)
                                }
                            >
                                View Details
                            </button>
                        </td>

                      <td>
                        {candidate.latest_session_id ? (
                          <button
                            onClick={() =>
                              (window.location.href = `/report/${candidate.latest_session_id}`)
                            }
                          >
                            View Report
                          </button>
                        ) : (
                          "No Report"
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

export default RecruiterDashboard;