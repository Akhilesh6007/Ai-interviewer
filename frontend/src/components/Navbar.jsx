import { useEffect, useState } from "react";
import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getUserRole = async () => {
    try {
      const response = await api.get("/users/me");
      setRole(response.data.role);
    } catch (err) {
      console.log("Navbar role error:", err.response?.data);
    }
  };

  useEffect(() => {
    getUserRole();
  }, []);

  return (
    <nav className="navbar-pro">
      <div className="nav-brand-pro" onClick={() => goTo("/")}>
        <div className="brand-icon-pro">AI</div>
        <span>AI Interviewer</span>
      </div>

      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`nav-links-pro ${menuOpen ? "nav-links-open" : ""}`}>
        <button
          className={`nav-link-pro ${isActive("/") ? "nav-link-active" : ""}`}
          onClick={() => goTo("/")}
        >
          Home
        </button>

        <SignedIn>
          <button
            className={`nav-link-pro ${
              isActive("/dashboard") ||
              isActive("/student-dashboard") ||
              isActive("/company-dashboard") ||
              isActive("/recruiter")
                ? "nav-link-active"
                : ""
            }`}
            onClick={() => goTo("/dashboard")}
          >
            Dashboard
          </button>

          {role === "student" && (
            <>
              <button
                className={`nav-link-pro ${
                  isActive("/interview") || isActive("/interview/setup")
                    ? "nav-link-active"
                    : ""
                }`}
                onClick={() => goTo("/interview")}
              >
                Interview
              </button>

              <button
                className={`nav-link-pro ${
                  isActive("/leetcode") ? "nav-link-active" : ""
                }`}
                onClick={() => goTo("/leetcode")}
              >
                LeetCode
              </button>

              <button
                className={`nav-link-pro ${
                  isActive("/leaderboard") ||
                  isActive("/leetcode/leaderboard")
                    ? "nav-link-active"
                    : ""
                }`}
                onClick={() => goTo("/leaderboard")}
              >
                Leaderboard
              </button>
            </>
          )}

          {role === "company" && (
            <button
              className={`nav-link-pro ${
                isActive("/company-dashboard") ? "nav-link-active" : ""
              }`}
              onClick={() => goTo("/company-dashboard")}
            >
              Company
            </button>
          )}

          {role === "recruiter" && (
            <button
              className={`nav-link-pro ${
                isActive("/recruiter") ? "nav-link-active" : ""
              }`}
              onClick={() => goTo("/recruiter")}
            >
              Recruiter
            </button>
          )}

          

          <div className="nav-user-wrapper">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>

        <SignedOut>
          <button className="nav-link-pro" onClick={() => goTo("/login")}>
            Login
          </button>

          <button className="nav-cta-pro" onClick={() => goTo("/register")}>
            Sign Up
          </button>
        </SignedOut>
      </div>
    </nav>
  );
}

export default Navbar;