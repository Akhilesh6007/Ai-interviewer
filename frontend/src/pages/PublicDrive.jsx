import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function PublicDrive() {
  const { inviteCode } = useParams();

  const [drive, setDrive] = useState(null);
  const [error, setError] = useState("");

  const getDrive = async () => {
    try {
      const response = await api.get(`/company/drives/public/${inviteCode}`);
      setDrive(response.data);
    } catch (err) {
      console.log("Drive public error:", err.response?.data);
      setError(err.response?.data?.detail || "Drive not found");
    }
  };

  useEffect(() => {
    getDrive();
  }, [inviteCode]);

  const startAssessment = () => {
    window.location.href = `/interview/setup?drive=${inviteCode}`;
  };

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        {error && <p className="error">{error}</p>}

        {!drive ? (
          <div className="empty-state">Loading hiring drive...</div>
        ) : (
          <>
            <div className="leetcode-hero">
              <h1>{drive.title}</h1>
              <p>
                Company assessment for <b>{drive.role}</b>. Complete the AI
                interview and coding assessment as per the configured rules.
              </p>

              <button onClick={startAssessment}>Start Assessment</button>
            </div>

            <div className="leetcode-section">
              <h2>Assessment Details</h2>

              <div className="metric-grid">
                <div className="metric-card">
                  <h4>Role</h4>
                  <p style={{ fontSize: "18px" }}>{drive.role}</p>
                </div>

                <div className="metric-card">
                  <h4>Difficulty</h4>
                  <p>{drive.difficulty}</p>
                </div>

                <div className="metric-card">
                  <h4>Interview Questions</h4>
                  <p>{drive.interview_questions}</p>
                </div>

                <div className="metric-card">
                  <h4>Coding Questions</h4>
                  <p>{drive.coding_questions}</p>
                </div>

                <div className="metric-card">
                  <h4>Duration</h4>
                  <p>{drive.duration_minutes} min</p>
                </div>

                <div className="metric-card metric-success">
                  <h4>AI Proctoring</h4>
                  <p>{drive.proctoring_enabled ? "Enabled" : "Off"}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PublicDrive;