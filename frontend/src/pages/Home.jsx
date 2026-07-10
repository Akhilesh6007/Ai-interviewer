import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-pro-page">
      <Navbar />

      <section className="home-hero-pro">
        <div className="home-hero-content">
          <div className="hero-chip">
            AI Proctored Interview + Coding Assessment Platform
          </div>

          <h1>
            AI-powered hiring and interview preparation platform for modern
            recruitment.
          </h1>

          <p>
            Practice interviews, detect suspicious activity, run company hiring
            drives, evaluate coding readiness, and rank candidates using AI.
          </p>

          <div className="hero-actions">
            <button onClick={() => navigate("/login")} className="hero-primary">
              Get Started
            </button>

            <button onClick={() => navigate("/login")} className="hero-secondary">
              Explore Platform
            </button>
          </div>

          <div className="hero-trust-row">
            <span>✓ AI Interview Evaluation</span>
            <span>✓ Proctoring Signals</span>
            <span>✓ Recruiter Ranking</span>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="report-card-pro">
            <div className="report-top">
              <div>
                <h3>AI Interview Report</h3>
                <p>Candidate performance summary</p>
              </div>
              <span>Live</span>
            </div>

            <div className="score-ring-pro">
              <div>
                <b>82%</b>
                <span>Selection</span>
              </div>
            </div>

            <div className="report-metrics">
              <div>
                <span>AI Answer Score</span>
                <b>8.5/10</b>
              </div>
              <div>
                <span>Proctor Status</span>
                <b className="green-text">Clean</b>
              </div>
              <div>
                <span>Coding Rank</span>
                <b>#3</b>
              </div>
            </div>
          </div>

          <div className="floating-card floating-one">
            <b>AI Decision</b>
            <span>Shortlisted</span>
          </div>

          <div className="floating-card floating-two">
            <b>Drive Attempts</b>
            <span>125+</span>
          </div>
        </div>
      </section>

      <section className="platform-section">
        <div className="section-heading">
          <span>Platform Modules</span>
          <h2>Built for students, companies, and recruiters</h2>
          <p>
            A complete assessment ecosystem with interview practice, mass hiring
            drives, candidate tracking, and AI decision support.
          </p>
        </div>

        <div className="role-showcase-grid">
          <div className="role-showcase-card">
            <div className="role-showcase-icon">🎓</div>
            <h3>Student Workspace</h3>
            <p>
              Practice AI interviews, attempt coding challenges, and analyze
              preparation reports.
            </p>
            <ul>
              <li>AI mock interview</li>
              <li>Personal score report</li>
              <li>LeetCode-style practice</li>
            </ul>
          </div>

          <div className="role-showcase-card highlighted">
            <div className="role-showcase-icon">🏢</div>
            <h3>Company Hiring Drives</h3>
            <p>
              Create assessment drives, generate invite links, and process
              candidates at scale.
            </p>
            <ul>
              <li>Mass recruitment drives</li>
              <li>Shareable assessment links</li>
              <li>Candidate attempt tracking</li>
            </ul>
          </div>

          <div className="role-showcase-card">
            <div className="role-showcase-icon">🧑‍💼</div>
            <h3>Recruiter Dashboard</h3>
            <p>
              Compare candidates using interview score, coding score, and
              integrity signals.
            </p>
            <ul>
              <li>AI candidate ranking</li>
              <li>Shortlist decisions</li>
              <li>Detailed reports</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="stats-section-pro">
        <div>
          <h2>Why this project stands out</h2>
          <p>
            Unlike a basic interview app, this platform simulates a real hiring
            workflow with authentication, role-based access, AI evaluation, and
            proctored assessment analytics.
          </p>
        </div>

        <div className="stats-grid-pro">
          <div>
            <b>3</b>
            <span>User Roles</span>
          </div>
          <div>
            <b>AI</b>
            <span>Evaluation</span>
          </div>
          <div>
            <b>360°</b>
            <span>Candidate View</span>
          </div>
          <div>
            <b>Live</b>
            <span>Proctoring</span>
          </div>
        </div>
      </section>

      <section className="features-pro-section">
        <div className="section-heading">
          <span>Core Features</span>
          <h2>Everything needed for placement and hiring assessments</h2>
        </div>

        <div className="features-pro-grid">
          <div className="feature-pro-card">
            <span>🤖</span>
            <h3>AI Mock Interview</h3>
            <p>
              Generate role-based questions and evaluate answers using AI
              scoring and feedback.
            </p>
          </div>

          <div className="feature-pro-card">
            <span>🎥</span>
            <h3>Live Proctoring</h3>
            <p>
              Track tab switch, fullscreen exit, and suspicious assessment
              activity.
            </p>
          </div>

          <div className="feature-pro-card">
            <span>💻</span>
            <h3>Coding Assessment</h3>
            <p>
              Practice LeetCode-style coding questions and track submission
              performance.
            </p>
          </div>

          <div className="feature-pro-card">
            <span>📊</span>
            <h3>Smart Reports</h3>
            <p>
              Generate final score, selection probability, integrity risk, and
              improvement roadmap.
            </p>
          </div>
        </div>
      </section>

      <section className="workflow-section-pro">
        <div className="section-heading">
          <span>Workflow</span>
          <h2>How the platform works</h2>
        </div>

        <div className="workflow-grid-pro">
          <div>
            <b>01</b>
            <h3>Choose Role</h3>
            <p>Login as Student, Company, or Recruiter.</p>
          </div>

          <div>
            <b>02</b>
            <h3>Start Assessment</h3>
            <p>Begin AI interview or company drive-based assessment.</p>
          </div>

          <div>
            <b>03</b>
            <h3>Evaluate Performance</h3>
            <p>AI evaluates answers, coding performance, and proctoring logs.</p>
          </div>

          <div>
            <b>04</b>
            <h3>Review Decision</h3>
            <p>Recruiters view ranking, shortlist status, and detailed reports.</p>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <h2>Ready to transform interview preparation and hiring?</h2>
        <p>
          Start practicing, create hiring drives, or review candidates with
          AI-powered assessment intelligence.
        </p>
        <button onClick={() => navigate("/login")}>Start Now</button>
      </section>
    </div>
  );
}

export default Home;