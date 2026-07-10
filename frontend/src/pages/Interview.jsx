import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

import VideoFeed from "../components/VideoFeed";
import TabMonitor from "../components/TabMonitor";
import KeyboardMonitor from "../components/KeyboardMonitor";
import FullscreenMonitor from "../components/FullscreenMonitor";
import ProctorStatus from "../components/ProctorStatus";
import VoiceRecorder from "../components/VoiceRecorder";
import SpeechToText from "../components/SpeechToText";
import QuestionSpeaker from "../components/QuestionSpeaker";

function Interview() {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [question, setQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState("");

  const getSession = async () => {
    try {
      const response = await api.get(`/interview/${sessionId}`);
      setSession(response.data);
    } catch (err) {
      setError("Failed to load interview session");
    }
  };

  const generateQuestion = async () => {
    try {
      setError("");
      setFeedback(null);
      setAnswerText("");

      const response = await api.post(
        `/interview/${sessionId}/question?question_number=${questionNumber}`
      );

      setQuestion(response.data);
    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to generate question");
    }
  };

  const submitAnswer = async () => {
    if (!question) {
      setError("Please generate a question first");
      return;
    }

    if (!answerText.trim()) {
      setError("Please write or speak your answer");
      return;
    }

    try {
      setError("");

      const response = await api.post(`/interview/${sessionId}/answer`, {
        question_id: question.id,
        answer_text: answerText,
      });

      setFeedback(response.data);
    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to submit answer");
    }
  };

  const nextQuestion = () => {
    setQuestionNumber((prev) => prev + 1);
    setQuestion(null);
    setAnswerText("");
    setFeedback(null);
    setAudioBlob(null);
  };

  const endInterview = async () => {
    try {
      await api.post(`/interview/${sessionId}/end`);
      window.location.href = `/report/${sessionId}`;
    } catch (err) {
      setError("Failed to end interview");
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  return (
    <div className="interview-shell">
      <div className="interview-topbar">
        <div className="interview-brand">
          <h2>AI Proctored Interview</h2>
          <span>HackerRank-style secure interview environment</span>
        </div>

        <div className="interview-top-actions">
          <button className="btn-muted" onClick={() => (window.location.href = "/dashboard")}>
            Dashboard
          </button>
          <button className="btn-danger" onClick={endInterview}>
            End Interview
          </button>
        </div>
      </div>

      <div className="interview-main">
        <div className="interview-left">
          {session && (
            <div className="session-strip">
              <div className="session-chip">
                <b>Role:</b> {session.role}
              </div>
              <div className="session-chip">
                <b>Difficulty:</b> {session.difficulty}
              </div>
              <div className="session-chip">
                <b>Status:</b> {session.status}
              </div>
              <div className="session-chip">
                <b>Session:</b> #{session.id}
              </div>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <div className="question-workspace">
            <div className="workspace-header">
              <h2>Question {questionNumber}</h2>

              <div className="action-row" style={{ marginTop: 0 }}>
                {!question && (
                  <button className="btn-primary" onClick={generateQuestion}>
                    Generate Question
                  </button>
                )}

                <button className="btn-danger" onClick={endInterview}>
                  Finish Test
                </button>
              </div>
            </div>

            <div className="workspace-body">
              {!question && (
                <div className="question-box">
                  <h3>Ready to begin?</h3>
                  <p>
                    Click <b>Generate Question</b> to start your AI interview.
                    Keep your camera on, stay in fullscreen, and avoid tab switching.
                  </p>
                </div>
              )}

              {question && (
                <>
                  <div className="question-box">
                    <h3>AI Interviewer Question</h3>
                    <p>{question.question_text}</p>
                  </div>

                  <QuestionSpeaker text={question.question_text} />

                  <h3>Your Answer</h3>

                  <textarea
                    className="answer-editor"
                    placeholder="Write your answer here, or use speech-to-text below..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />

                  <div className="action-row">
                    <SpeechToText
                      onTextGenerated={(text) =>
                        setAnswerText((prev) => (prev ? prev + " " + text : text))
                      }
                    />

                    <VoiceRecorder onRecordingComplete={(blob) => setAudioBlob(blob)} />
                  </div>

                  <div className="action-row">
                    <button className="btn-primary" onClick={submitAnswer}>
                      Submit Answer
                    </button>

                    {feedback && (
                      <button className="btn-dark" onClick={nextQuestion}>
                        Next Question
                      </button>
                    )}
                  </div>
                </>
              )}

              {feedback && (
                <div className="feedback-panel">
                  <h3>AI Evaluation</h3>
                  <p>
                    <b>Score:</b> {feedback.ai_score}/10
                  </p>

                  <pre>{feedback.ai_feedback}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="interview-sidebar">
          <VideoFeed sessionId={sessionId} />
          <TabMonitor sessionId={sessionId} />
          <KeyboardMonitor sessionId={sessionId} />
          <FullscreenMonitor sessionId={sessionId} />
          <ProctorStatus sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}

export default Interview;