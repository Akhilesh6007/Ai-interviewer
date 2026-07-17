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
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const generateQuestion = async () => {

    if (questionCount >= totalQuestions) {
  setError("Question limit reached. Please end the interview.");
  return;
}
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

  const speakQuestion = () => {
  if (!question?.question_text) return;

  const utterance = new SpeechSynthesisUtterance(question.question_text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  } catch (err) {
    console.log("Audio recording error:", err);
    setError("Microphone permission required for audio recording.");
  }
};

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    setIsRecording(false);
  }
};


  const loadSessionDetails = async () => {
  try {
    const response = await api.get(`/interview/${sessionId}`);
    setTotalQuestions(response.data.total_questions || 5);
  } catch (err) {
    console.log("Session load error:", err.response?.data);
  }
};

  useEffect(() => {
  if (sessionId) {
    loadSessionDetails();
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

                  {question.question_type === "mcq" && question.options?.length > 0 ? (
  <div style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
    {question.options.map((option, index) => (
      <label
        key={index}
        style={{
          padding: "14px",
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "700",
          background: answer === option ? "#eef2ff" : "#ffffff",
        }}
      >
        <input
          type="radio"
          name="mcq-answer"
          value={option}
          checked={answer === option}
          onChange={(e) => setAnswer(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        {option}
      </label>
    ))}
  </div>
) : (
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
)}

                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button className="btn-dark" type="button" onClick={speakQuestion}>
                      Speak Question
                    </button>

                    {isRecording ? (
                      <button type="button" className="btn-dark" onClick={stopRecording}>
                        Stop Recording
                      </button>
                    ) : (
                      <button type="button" className="btn-dark" onClick={startRecording}>
                        Record Answer
                      </button>
                    )}
                    <button onClick={submitAnswer} disabled={submitLoading}>
                      {submitLoading ? "Evaluating..." : "Submit Answer"}
                    </button>

                    <button
                      className="btn-dark"
                      onClick={generateQuestion}
                      disabled={questionCount >= totalQuestions}
                    >
                      {questionCount >= totalQuestions ? "Limit Reached" : "Next Question"}
                    </button>
                  </div>
                  {audioUrl && (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontWeight: "800" }}>Recorded Audio Preview</p>
                      <audio controls src={audioUrl} />
                    </div>
                  )}
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