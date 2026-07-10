import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const driveCode = queryParams.get("drive");

  const [form, setForm] = useState({
    role: "Frontend Developer",
    difficulty: "medium",
    number_of_questions: 5,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "number_of_questions"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const loadDriveDetails = async () => {
    if (!driveCode) return;

    try {
      const response = await api.get(`/company/drives/public/${driveCode}`);
      const drive = response.data;

      setForm((prev) => ({
        ...prev,
        role: drive.role,
        difficulty: drive.difficulty,
        number_of_questions: drive.interview_questions,
      }));
    } catch (err) {
      console.log("Drive setup load error:", err.response?.data);
    }
  };

  useEffect(() => {
    loadDriveDetails();
  }, [driveCode]);

  const startInterview = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await api.post("/interview/start", {
        role: form.role,
        difficulty: form.difficulty,
        number_of_questions: Number(form.number_of_questions),
        drive_code: driveCode,
      });

      navigate(`/interview/${response.data.id}`);
    } catch (err) {
      console.log("Status:", err.response?.status);
      console.log("Detail:", err.response?.data?.detail);
      console.log(err.response?.data);

      setError("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <Navbar />

      <div className="setup-container">
        <div className="setup-hero">
          <h1>Start AI Proctored Interview</h1>

          {driveCode && (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "18px",
                color: "#1e40af",
                fontWeight: "800",
              }}
            >
              Company Assessment Mode Active
            </div>
          )}

          <p>
            Configure your mock interview based on job role, difficulty level,
            and number of questions. During the interview, camera monitoring,
            tab tracking, fullscreen monitoring, and AI evaluation will be active.
          </p>
        </div>

        <div className="setup-grid">
          <div className="setup-card">
            <h2>Interview Configuration</h2>

            <p style={{ color: "#64748b", lineHeight: "1.6" }}>
              Choose settings carefully. Your final report will be generated
              using AI answer evaluation and proctoring activity.
            </p>

            {error && <p className="error">{error}</p>}

            <form onSubmit={startInterview}>
              <div className="setup-form-group">
                <label>Job Role</label>

                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">
                    Full Stack Developer
                  </option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Machine Learning Engineer">
                    Machine Learning Engineer
                  </option>
                  <option value="Software Engineer">Software Engineer</option>
                </select>
              </div>

              <div className="setup-form-group">
                <label>Difficulty</label>

                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="setup-form-group">
                <label>Number of Questions</label>

                <select
                  name="number_of_questions"
                  value={form.number_of_questions}
                  onChange={handleChange}
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                  <option value={9}>9 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div className="setup-warning">
                Camera permission required. For best proctoring accuracy, keep
                your face visible and avoid switching tabs.
              </div>

              <div className="setup-submit-row">
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "Starting..." : "Start Interview"}
                </button>

                <button
                  type="button"
                  className="btn-dark"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </button>
              </div>
            </form>
          </div>

          <div className="setup-side-card">
            <h3>What will be monitored?</h3>

            <div className="setup-info-list">
              <div className="setup-info-item">
                <b>Camera Proctoring</b>
                <span>No face and multiple face detection using webcam.</span>
              </div>

              <div className="setup-info-item">
                <b>Tab Activity</b>
                <span>Tab switch and window blur events will be logged.</span>
              </div>

              <div className="setup-info-item">
                <b>Keyboard Activity</b>
                <span>Copy, paste, cut, and right-click attempts are blocked.</span>
              </div>

              <div className="setup-info-item">
                <b>Fullscreen Tracking</b>
                <span>Leaving fullscreen mode will be marked as suspicious.</span>
              </div>

              <div className="setup-info-item">
                <b>AI Feedback</b>
                <span>Each answer receives AI score and improvement feedback.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup;