import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";
import VideoFeed from "../components/VideoFeed";

function InterviewRoom() {
  const { sessionId } = useParams();

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);

  const generateQuestion = async () => {
    try {
      setLoading(true);
      setError("");
      setFeedback(null);
      setAnswer("");

      const response = await api.post(`/interview/${sessionId}/question`);

      setQuestion(response.data);
      setQuestionCount((prev) => prev + 1);
    } catch (err) {
      console.log("Question error:", err.response?.data);
      setError(
        err.response?.data?.detail || "Failed to generate interview question."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!question) {
      setError("Please generate a question first.");
      return;
    }

    if (!answer.trim()) {
      setError("Please write your answer.");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");

      const response = await api.post(`/interview/${sessionId}/answer`, {
        question_id: question.id,
        answer_text: answer,
      });

      setFeedback(response.data);
    } catch (err) {
      console.log("Answer submit error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to submit answer.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const endInterview = async () => {
    try {
      await api.post(`/interview/${sessionId}/end`);
    } catch (err) {
      console.log("End interview error:", err.response?.data);
    }

    window.location.href = `/report/${sessionId}`;
  };

  useEffect(() => {
    if (sessionId) {
      generateQuestion();
    }
  }, [sessionId]);

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        <div className="leetcode-hero">
          <h1>AI Proctored Interview Room</h1>
          <p>
            Camera, microphone, tab activity, fullscreen activity, and answer
            quality will be monitored during the interview.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={endInterview}>End Interview</button>

            <button
              className="btn-dark"
              onClick={() => {
                document.documentElement.requestFullscreen?.();
              }}
            >
              Enter Fullscreen
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: "24px",
            alignItems: "start",
          }}
          className="interview-room-grid"
        >
          <div className="leetcode-section">
            <h2>Proctoring Monitor</h2>

            <VideoFeed sessionId={sessionId} />

            <div
              style={{
                marginTop: "18px",
                padding: "14px",
                borderRadius: "14px",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                color: "#9a3412",
                fontWeight: "700",
                lineHeight: "1.6",
              }}
            >
              Keep your face visible, stay in fullscreen mode, and avoid tab
              switching during the interview.
            </div>
          </div>

          <div>
            {error && <p className="error">{error}</p>}

            <div className="leetcode-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <h2>Interview Question</h2>

                <span
                  style={{
                    background: "#eef2ff",
                    color: "#1d4ed8",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontWeight: "900",
                  }}
                >
                  Question {questionCount || 1}
                </span>
              </div>

              {loading ? (
                <div className="empty-state">Generating question...</div>
              ) : question ? (
                <>
                  <div className="report-card">
                    <h3>{question.question_text}</h3>

                    {question.difficulty && (
                      <p>
                        <b>Difficulty:</b> {question.difficulty}
                      </p>
                    )}

                    {question.topic && (
                      <p>
                        <b>Topic:</b> {question.topic}
                      </p>
                    )}
                  </div>

                  <br />

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows="9"
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "14px",
                      border: "1px solid #d1d5db",
                      fontSize: "16px",
                      resize: "vertical",
                    }}
                  />

                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button onClick={submitAnswer} disabled={submitLoading}>
                      {submitLoading ? "Evaluating..." : "Submit Answer"}
                    </button>

                    <button className="btn-dark" onClick={generateQuestion}>
                      Next Question
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">No question available.</div>
              )}
            </div>

            {feedback && (
              <div className="leetcode-section">
                <h2>AI Feedback</h2>

                <div className="metric-grid">
                  <div className="metric-card metric-success">
                    <h4>AI Score</h4>
                    <p>{feedback.ai_score ?? feedback.score ?? 0}/10</p>
                  </div>

                  <div className="metric-card">
                    <h4>Status</h4>
                    <p>{feedback.status || "Evaluated"}</p>
                  </div>
                </div>

                <div className="report-card" style={{ marginTop: "20px" }}>
                  <h3>Feedback</h3>
                  <p>
                    {feedback.ai_feedback ||
                      feedback.feedback ||
                      "Your answer has been evaluated."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewRoom;