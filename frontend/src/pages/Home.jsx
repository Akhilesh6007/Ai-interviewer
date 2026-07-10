import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "@clerk/clerk-react";

function Home() {
    const navigate = useNavigate();
    const { isSignedIn } = useAuth();
  

  return (
    <div className="landing-page">
      <Navbar />
      

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div>
            <span className="landing-badge">
              AI Proctored Interview + Coding Assessment Platform
            </span>

            <h1>
              Practice interviews, detect cheating, and improve coding rank.
            </h1>

            <p>
              A complete AI-powered placement preparation platform with mock
              interviews, live proctoring, AI feedback, LeetCode performance
              analysis, coding contests, and leaderboard tracking.
            </p>

            <div className="landing-actions">
              <button
                className="btn-primary"
                onClick={() => navigate(isSignedIn ? "/dashboard" : "/register")}
              >
                Get Started
              </button>

              <button
                className="btn-dark"
                onClick={() => navigate(isSignedIn ? "/leetcode" : "/login")}
              >
                Try LeetCode Contest
              </button>
            </div>
          </div>

          <div className="landing-preview-card">
            <div className="preview-top">
              <div>
                <h3 style={{ margin: 0 }}>AI Interview Report</h3>
                <p style={{ color: "#64748b", margin: "6px 0 0" }}>
                  Candidate performance summary
                </p>
              </div>

              <span className="preview-pill">Live</span>
            </div>

            <div className="preview-score">
              <div className="preview-score-inner">
                <b>75%</b>
                <span>Selection</span>
              </div>
            </div>

            <div className="preview-list">
              <div className="preview-row">
                <span>AI Answer Score</span>
                <b>8.2/10</b>
              </div>

              <div className="preview-row">
                <span>Proctor Status</span>
                <b style={{ color: "#16a34a" }}>Clean</b>
              </div>

              <div className="preview-row">
                <span>Coding Rank</span>
                <b>#1</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-title">
          <h2>Everything needed for placement preparation</h2>
          <p>
            This platform combines interview preparation, proctoring, coding
            practice, and analytics into one professional assessment system.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Mock Interview</h3>
            <p>
              Generate role-based interview questions and evaluate answers using
              AI scoring and feedback.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3>Live Proctoring</h3>
            <p>
              Detect no-face, multiple-face, tab switch, fullscreen exit, and
              suspicious activity during interviews.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>LeetCode Contest</h3>
            <p>
              Analyze LeetCode performance and generate personalized
              LeetCode-style coding contests.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Reports</h3>
            <p>
              Show selection percentage, final score, proctor penalty, answer
              quality, and coding leaderboard.
            </p>
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="landing-section">
          <div className="section-title">
            <h2>How it works</h2>
            <p>
              Simple workflow for candidates preparing for technical interviews.
            </p>
          </div>

          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Register and access your personal preparation dashboard.</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">2</div>
              <h3>Start Interview</h3>
              <p>Choose role, difficulty, number of questions, and begin.</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">3</div>
              <h3>Attempt Coding Contest</h3>
              <p>Connect LeetCode profile and solve generated questions.</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">4</div>
              <h3>View Analytics</h3>
              <p>Check report, selection chance, proctor logs, and ranking.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="cta-box">
          <h2>Ready to improve your interview performance?</h2>
          <p>
            Start practicing with AI interviews and personalized coding contests.
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate(isSignedIn ? "/dashboard" : "/register")}
          >
            Start Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;