import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function DriveCandidates() {
  const { driveId } = useParams();

  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");

  const getCandidates = async () => {
    try {
      const response = await api.get(`/company/drives/${driveId}/candidates`);
      setCandidates(response.data);
    } catch (err) {
      console.log("Drive candidates error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to load candidates");
    }
  };

  useEffect(() => {
    getCandidates();
  }, [driveId]);

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        <div className="leetcode-hero">
          <h1>Drive Candidates</h1>
          <p>
            View candidates who attempted this company hiring drive and review
            their AI interview performance.
          </p>

          <button onClick={() => (window.location.href = "/company-dashboard")}>
            Back to Company Dashboard
          </button>
        </div>

        <div className="leetcode-section">
          <h2>Candidate Attempts</h2>

          {error && <p className="error">{error}</p>}

          {candidates.length === 0 ? (
            <div className="empty-state">
              No candidates have attempted this drive yet.
            </div>
          ) : (
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Final Score</th>
                    <th>Selection</th>
                    <th>Integrity</th>
                    <th>Report</th>
                  </tr>
                </thead>

                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.session_id}>
                      <td>#{candidate.session_id}</td>
                      <td>{candidate.candidate_name}</td>
                      <td>{candidate.candidate_email}</td>
                      <td>{candidate.status}</td>

                      <td>
                        <b>{candidate.final_score}%</b>
                      </td>

                      <td>{candidate.selection_status}</td>

                      <td
                        style={{
                          color:
                            candidate.integrity_status
                              ?.toLowerCase()
                              .includes("clean")
                              ? "green"
                              : "red",
                          fontWeight: "800",
                        }}
                      >
                        {candidate.integrity_status}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            (window.location.href = `/report/${candidate.session_id}`)
                          }
                        >
                          View Report
                        </button>
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

export default DriveCandidates;