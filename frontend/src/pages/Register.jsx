import { SignUp } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";

function Register() {
  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-left-content">
            <span className="auth-badge">Create Your Account</span>

            <h1>Start preparing for placements with AI-powered assessment.</h1>

            <p>
              Register to practice interviews, get AI answer feedback, monitor
              proctoring activity, analyze LeetCode performance, and track your
              coding rank.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <b>Smart Interview Reports</b>
                <span>View final score, selection chance, and proctor penalty.</span>
              </div>

              <div className="auth-feature">
                <b>Coding Leaderboard</b>
                <span>Track coding submissions, score, runtime, and rank.</span>
              </div>

              <div className="auth-feature">
                <b>Placement Ready</b>
                <span>Practice both HR/technical interview and coding rounds.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <SignUp
            routing="path"
            path="/register"
            signInUrl="/login"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}

export default Register;