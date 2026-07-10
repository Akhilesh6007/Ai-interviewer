import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Report() {
  const { sessionId } = useParams();
  const { getToken } = useAuth();

  const [report, setReport] = useState(null);
  const [events, setEvents] = useState([]);
  const [hiringAnalysis, setHiringAnalysis] = useState(null);
  const [loadingHiring, setLoadingHiring] = useState(false);
  const [error, setError] = useState("");

  const getReport = async () => {
    try {
      const token = await getToken();

      const response = await api.get(`/interview/${sessionId}/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReport(response.data);
    } catch (err) {
      console.log("Report status:", err.response?.status);
      console.log("Report detail:", err.response?.data);
      setError("Failed to load report");
    }
  };

  const getProctorEvents = async () => {
    try {
      const token = await getToken();

      const response = await api.get(`/interview/${sessionId}/proctor-events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data);
    } catch (err) {
      console.log("Events status:", err.response?.status);
      console.log("Events detail:", err.response?.data);
    }
  };

  const getHiringAnalysis = async () => {
    try {
      setLoadingHiring(true);

      const token = await getToken();

      const response = await api.get(
        `/interview/${sessionId}/ai-hiring-analysis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("AI Hiring Analysis:", response.data);
      setHiringAnalysis(response.data);
    } catch (err) {
      console.log("Hiring analysis status:", err.response?.status);
      console.log("Hiring analysis detail:", err.response?.data);
    } finally {
      setLoadingHiring(false);
    }
  };

  useEffect(() => {
    getReport();
    getProctorEvents();
    getHiringAnalysis();
  }, [sessionId]);

  const getStatusClass = () => {
    if (!report) return "status-rejected";

    if (report.selection_percentage >= 80) {
      return "status-selected";
    }

    if (report.selection_percentage >= 60) {
      return "status-review";
    }

    return "status-rejected";
  };

  const getProgressColor = () => {
    if (!report) return "#dc2626";

    if (report.selection_percentage >= 80) {
      return "#16a34a";
    }

    if (report.selection_percentage >= 60) {
      return "#f59e0b";
    }

    return "#dc2626";
  };

  const getIntegrityClass = (risk) => {
    if (!risk) return "metric-card";

    const value = risk.toLowerCase();

    if (value.includes("low") || value.includes("clean")) {
      return "metric-card metric-success";
    }

    if (value.includes("medium") || value.includes("review")) {
      return "metric-card";
    }

    return "metric-card metric-danger";
  };

  return (
    <div className="report-page">
      <Navbar />

      <div className="report-container">
        <div className="report-title-row">
          <div>
            <h1>Final Interview Report</h1>
            <p className="report-subtitle">
              AI performance analysis, selection probability, proctoring audit,
              and GenAI recruiter recommendation.
            </p>
          </div>

          <button onClick={() => (window.location.href = "/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {report && (
          <>
            <div className="report-grid">
              <div className="report-card">
                <h2>Selection Score Analyzer</h2>

                <div className="score-hero">
                  <div
                    className="score-circle"
                    style={{
                      "--score": `${report.selection_percentage * 3.6}deg`,
                    }}
                  >
                    <div className="score-circle-inner">
                      <div className="score-number">
                        {report.selection_percentage}%
                      </div>
                      <div className="score-label">Selection Chance</div>
                    </div>
                  </div>

                  <div>
                    <h2>{report.selection_status}</h2>

                    <span className={`status-badge-large ${getStatusClass()}`}>
                      {report.final_status}
                    </span>

                    <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                      This score is calculated using AI answer evaluation and
                      proctoring penalties. Suspicious activity reduces the
                      final selection percentage.
                    </p>
                  </div>
                </div>

                <div className="analyzer-row">
                  <b>Final Score Progress</b>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${report.selection_percentage}%`,
                        background: getProgressColor(),
                      }}
                    ></div>
                  </div>

                  <p>
                    <b>Average AI Score:</b> {report.average_score}/10
                  </p>

                  <p>
                    <b>Proctoring Penalty:</b>{" "}
                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                      -{report.proctor_penalty}%
                    </span>
                  </p>

                  <p>
                    <b>Final Score:</b> {report.final_score}%
                  </p>
                </div>
              </div>

              <div className="report-card">
                <h2>Decision Summary</h2>

                <div className="report-explanation">
                  <p>
                    <b>Result:</b> {report.selection_status}
                  </p>

                  <p>
                    <b>Integrity Status:</b> {report.final_status}
                  </p>

                  <p>
                    <b>Note:</b> High severity proctoring events strongly
                    affect the final recommendation.
                  </p>
                </div>
              </div>
            </div>

            <div className="report-card">
              <h2>Performance Summary</h2>

              <div className="metric-grid">
                <div className="metric-card">
                  <h4>Total Questions</h4>
                  <p>{report.total_questions}</p>
                </div>

                <div className="metric-card">
                  <h4>Total Answers</h4>
                  <p>{report.total_answers}</p>
                </div>

                <div className="metric-card">
                  <h4>Average Score</h4>
                  <p>{report.average_score}/10</p>
                </div>

                <div className="metric-card">
                  <h4>Proctor Events</h4>
                  <p>{report.total_proctor_events}</p>
                </div>

                <div className="metric-card metric-danger">
                  <h4>High Severity</h4>
                  <p>{report.high_severity_events}</p>
                </div>

                <div className="metric-card metric-danger">
                  <h4>Proctor Penalty</h4>
                  <p>-{report.proctor_penalty}%</p>
                </div>

                <div className="metric-card metric-success">
                  <h4>Final Score</h4>
                  <p>{report.final_score}%</p>
                </div>

                <div className="metric-card metric-success">
                  <h4>Selection Chance</h4>
                  <p>{report.selection_percentage}%</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="report-card">
          <h2>AI Recruiter Copilot</h2>
          <p className="report-subtitle">
            GenAI-based hiring recommendation generated from interview
            performance, proctoring activity, and coding signals.
          </p>

          {loadingHiring && (
            <div className="empty-state">
              Generating AI hiring analysis...
            </div>
          )}

          {!loadingHiring && !hiringAnalysis && (
            <div className="empty-state">
              AI hiring analysis is not available yet. Check backend route:
              /interview/{sessionId}/ai-hiring-analysis
            </div>
          )}

          {hiringAnalysis && (
            <>
              <div className="metric-grid">
                <div className="metric-card metric-success">
                  <h4>Recommendation</h4>
                  <p style={{ fontSize: "20px" }}>
                    {hiringAnalysis.overall_recommendation}
                  </p>
                </div>

                <div className="metric-card">
                  <h4>Hiring Confidence</h4>
                  <p>{hiringAnalysis.hiring_confidence}%</p>
                </div>

                <div className={getIntegrityClass(hiringAnalysis.integrity_risk)}>
                  <h4>Integrity Risk</h4>
                  <p style={{ fontSize: "18px" }}>
                    {hiringAnalysis.integrity_risk}
                  </p>
                </div>
              </div>

              <div className="report-explanation">
                <h3>Technical Fit</h3>
                <p>{hiringAnalysis.technical_fit}</p>

                <h3>Communication Fit</h3>
                <p>{hiringAnalysis.communication_fit}</p>

                <h3>LeetCode Readiness</h3>
                <p>{hiringAnalysis.leetcode_readiness}</p>

                <h3>Recruiter Notes</h3>
                <p>{hiringAnalysis.recruiter_notes}</p>

                {hiringAnalysis.skill_gap_analysis &&
                  hiringAnalysis.skill_gap_analysis.length > 0 && (
                    <>
                      <h3>Skill Gap Analyzer</h3>

                      <div className="metric-grid">
                        {hiringAnalysis.skill_gap_analysis.map(
                          (item, index) => (
                            <div key={index} className="metric-card">
                              <h4>{item.skill}</h4>
                              <p style={{ fontSize: "18px" }}>{item.level}</p>
                              <small
                                style={{
                                  color: "#64748b",
                                  lineHeight: "1.5",
                                }}
                              >
                                {item.reason}
                              </small>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
              </div>

              <div className="report-grid">
                <div className="report-card">
                  <h3>Candidate Strengths</h3>

                  {hiringAnalysis.strengths?.length > 0 ? (
                    <ul>
                      {hiringAnalysis.strengths.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No strengths generated.</p>
                  )}
                </div>

                <div className="report-card">
                  <h3>Candidate Weaknesses</h3>

                  {hiringAnalysis.weaknesses?.length > 0 ? (
                    <ul>
                      {hiringAnalysis.weaknesses.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No weaknesses generated.</p>
                  )}
                </div>
              </div>

              <div className="report-card">
                <h3>Personalized Improvement Roadmap</h3>

                {hiringAnalysis.improvement_roadmap?.length > 0 ? (
                  <div className="event-list">
                    {hiringAnalysis.improvement_roadmap.map((item, index) => (
                      <div key={index} className="event-item">
                        <div className="event-line-medium"></div>

                        <div className="event-content">
                          <h4>Step {index + 1}</h4>
                          <p>{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No roadmap generated.</p>
                )}
              </div>
            </>
          )}
        </div>

        <br />

        <div className="report-card">
          <h2>Proctoring Event Logs</h2>

          {events.length === 0 && (
            <div className="empty-state">
              No suspicious activity detected.
            </div>
          )}

          <div className="event-list">
            {events.map((event) => (
              <div key={event.id} className="event-item">
                <div
                  className={
                    event.severity === "high"
                      ? "event-line-high"
                      : "event-line-medium"
                  }
                ></div>

                <div className="event-content">
                  <h4>{event.event_type}</h4>

                  <p>
                    <b>Severity:</b>{" "}
                    <span
                      style={{
                        color:
                          event.severity === "high" ? "#dc2626" : "#f59e0b",
                        fontWeight: "bold",
                      }}
                    >
                      {event.severity}
                    </span>
                  </p>

                  <p>
                    <b>Message:</b> {event.message}
                  </p>

                  <p className="event-time">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <br />

        <button onClick={() => (window.location.href = "/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Report;