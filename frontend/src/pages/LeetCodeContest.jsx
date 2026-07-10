import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function LeetCodeContest() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [contest, setContest] = useState(null);
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingContest, setLoadingContest] = useState(false);

  const fetchProfile = async () => {
    if (!username.trim()) {
      setError("Please enter LeetCode username");
      return;
    }

    try {
      setError("");
      setLoadingProfile(true);

      const response = await api.post("/leetcode/profile", { username });

      setProfile(response.data);
      setContest(null);
    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to fetch LeetCode profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const generateContest = async () => {
    if (!username.trim()) {
      setError("Please enter LeetCode username");
      return;
    }

    try {
      setError("");
      setLoadingContest(true);

      const response = await api.post("/leetcode/generate-contest", {
        username,
      });

      setContest(response.data);
    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to generate contest");
    } finally {
      setLoadingContest(false);
    }
  };

  const difficultyClass = (difficulty) => {
    if (difficulty === "hard") return "diff-hard";
    if (difficulty === "medium") return "diff-medium";
    return "diff-easy";
  };

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        <div className="leetcode-hero">
          <h1>LeetCode Performance Analyzer</h1>
          <p>
            Analyze your LeetCode profile, identify your coding level, and
            generate a personalized contest similar to real coding platforms.
          </p>

          <div className="leetcode-input-row">
            <div>
              <label>LeetCode Username</label>
              <input
                type="text"
                placeholder="Enter LeetCode username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button onClick={fetchProfile} disabled={loadingProfile}>
              {loadingProfile ? "Fetching..." : "Fetch Profile"}
            </button>

            <button
              className="btn-primary"
              onClick={generateContest}
              disabled={loadingContest}
            >
              {loadingContest ? "Generating..." : "Generate Contest"}
            </button>

            <button
              className="btn-dark"
              onClick={() => navigate("/leetcode/leaderboard")}
            >
              Leaderboard
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </div>

        {profile && (
          <div className="leetcode-section">
            <h2>Profile Overview</h2>

            <div className="leetcode-profile-grid">
              <div className="leetcode-stat-card">
                <h4>Username</h4>
                <p style={{ fontSize: "20px" }}>{profile.username}</p>
              </div>

              <div className="leetcode-stat-card">
                <h4>Global Ranking</h4>
                <p>{profile.ranking || "N/A"}</p>
              </div>

              <div className="leetcode-stat-card">
                <h4>Total Solved</h4>
                <p>{profile.total_solved}</p>
              </div>

              <div className="leetcode-stat-card">
                <h4>Easy</h4>
                <p style={{ color: "#16a34a" }}>{profile.easy_solved}</p>
              </div>

              <div className="leetcode-stat-card">
                <h4>Medium</h4>
                <p style={{ color: "#f59e0b" }}>{profile.medium_solved}</p>
              </div>

              <div className="leetcode-stat-card">
                <h4>Hard</h4>
                <p style={{ color: "#dc2626" }}>{profile.hard_solved}</p>
              </div>

              <div className="leetcode-stat-card">
                <h4>Contest Rating</h4>
                <p>
                  {profile.contest_rating
                    ? Math.round(profile.contest_rating)
                    : "N/A"}
                </p>
              </div>

              <div className="leetcode-stat-card">
                <h4>Contest Rank</h4>
                <p>{profile.global_ranking || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {contest && (
          <>
            <div className="leetcode-section">
              <div className="leetcode-contest-header">
                <div>
                  <h2>{contest.contest_title}</h2>
                  <span className="level-badge">{contest.user_level}</span>
                  <p style={{ color: "#475569", lineHeight: "1.6" }}>
                    {contest.recommendation}
                  </p>
                </div>

                <div className="leetcode-profile-grid" style={{ minWidth: "360px" }}>
                  <div className="leetcode-stat-card">
                    <h4>Easy</h4>
                    <p style={{ color: "#16a34a" }}>{contest.easy_count}</p>
                  </div>

                  <div className="leetcode-stat-card">
                    <h4>Medium</h4>
                    <p style={{ color: "#f59e0b" }}>{contest.medium_count}</p>
                  </div>

                  <div className="leetcode-stat-card">
                    <h4>Hard</h4>
                    <p style={{ color: "#dc2626" }}>{contest.hard_count}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="leetcode-section">
              <h2>Generated Coding Contest</h2>

              <div className="question-list">
                {contest.questions.map((q) => (
                  <div key={q.question_number} className="question-card-pro">
                    <div>
                      <h3>
                        Q{q.question_number}. {q.title}
                      </h3>

                      <div className="question-meta-row">
                        <span
                          className={`difficulty-pill ${difficultyClass(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty.toUpperCase()}
                        </span>

                        <span className="topic-pill">{q.topic}</span>
                      </div>

                      <p style={{ color: "#475569", lineHeight: "1.6" }}>
                        {q.description}
                      </p>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={() =>
                        navigate("/leetcode/editor", {
                          state: { question: q },
                        })
                      }
                    >
                      Solve Question
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LeetCodeContest;