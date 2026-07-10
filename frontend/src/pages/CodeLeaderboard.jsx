import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CodeLeaderboard() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  const fetchSubmissions = async () => {
    try {
      const response = await api.get("/code/my-submissions");
      setSubmissions(response.data);
    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to load submissions");
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        <div className="leetcode-hero">
          <h1>Coding Performance Leaderboard</h1>
          <p>
            Track coding submissions, scores, rank positions, runtime, and
            performance status.
          </p>

          <button onClick={() => (window.location.href = "/leetcode")}>
            Back to LeetCode Contest
          </button>
        </div>

        <div className="leetcode-section">
          <h2>Your Submissions</h2>

          {error && <p className="error">{error}</p>}

          {submissions.length === 0 ? (
            <div className="empty-state">No coding submissions found.</div>
          ) : (
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Question</th>
                    <th>Difficulty</th>
                    <th>Topic</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Runtime</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((submission, index) => (
                    <tr key={submission.id}>
                      <td>
                        <span className="rank-badge">#{index + 1}</span>
                      </td>

                      <td>{submission.question_title}</td>

                      <td>
                        <span
                          className={`difficulty-pill ${
                            submission.difficulty === "hard"
                              ? "diff-hard"
                              : submission.difficulty === "medium"
                              ? "diff-medium"
                              : "diff-easy"
                          }`}
                        >
                          {submission.difficulty.toUpperCase()}
                        </span>
                      </td>

                      <td>{submission.topic}</td>
                      <td>{submission.language}</td>

                      <td>
                        <span
                          className={
                            submission.status === "Accepted"
                              ? "accepted-badge"
                              : "improve-badge"
                          }
                        >
                          {submission.status}
                        </span>
                      </td>

                      <td>
                        <span className="score-badge">
                          {submission.score}/100
                        </span>
                      </td>

                      <td>{submission.runtime}</td>

                      <td>
                        {new Date(
                          submission.submitted_at
                        ).toLocaleString()}
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

export default CodeLeaderboard;