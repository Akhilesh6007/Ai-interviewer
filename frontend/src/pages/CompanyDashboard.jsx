import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function CompanyDashboard() {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({
    title: "",
    role: "",
    difficulty: "medium",
    interview_questions: 5,
    coding_questions: 2,
    duration_minutes: 60,
    proctoring_enabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  

  const getDrives = async () => {
    try {
      const response = await api.get("/company/drives");
      setDrives(response.data);
    } catch (err) {
      console.log("Drive fetch error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to load hiring drives");
    }
  };

  const createDrive = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.post("/company/drives", {
        ...form,
        interview_questions: Number(form.interview_questions),
        coding_questions: Number(form.coding_questions),
        duration_minutes: Number(form.duration_minutes),
      });

      setForm({
        title: "",
        role: "",
        difficulty: "medium",
        interview_questions: 5,
        coding_questions: 2,
        duration_minutes: 60,
        proctoring_enabled: true,
      });

      getDrives();
    } catch (err) {
      console.log("Drive create error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to create hiring drive");
    } finally {
      setLoading(false);
    }
  };
  const seedDemoData = async () => {
  try {
    setDemoLoading(true);
    setError("");

    const response = await api.post("/demo/seed");

    alert(
      `Demo data created successfully!\nCandidates: ${response.data.candidates_created}\nDrive ID: ${response.data.drive_id}`
    );

    getDrives();
  } catch (err) {
    console.log("Demo seed error:", err.response?.data);
    setError(err.response?.data?.detail || "Failed to create demo data");
  } finally {
    setDemoLoading(false);
  }
};

  const totalCandidates = drives.reduce(
    (sum, drive) => sum + (drive.candidates_count || 0),
  0
);
const totalShortlisted = drives.reduce(
  (sum, drive) => sum + (drive.shortlisted_count || 0),
  0
);

const totalReview = drives.reduce(
  (sum, drive) => sum + (drive.review_count || 0),
  0
);

const totalRejected = drives.reduce(
  (sum, drive) => sum + (drive.rejected_count || 0),
  0
);

  useEffect(() => {
    getDrives();
  }, []);

  return (
    <div className="leetcode-page">
      <Navbar />

      <div className="leetcode-container">
        <div className="leetcode-hero">
          <h1>Company Hiring Dashboard</h1>
          <p>
            <button
                className="btn-dark"
                onClick={seedDemoData}
                disabled={demoLoading}
                style={{ marginTop: "18px" }}
            >
                    {demoLoading ? "Creating Demo Data..." : "Generate Demo Hiring Data"}
            </button>
            Create assessment drives, process candidates in bulk, and track
            hiring analytics.
          </p>
            <button
                className="btn-dark"
                onClick={seedDemoData}
                disabled={demoLoading}
                style={{ marginTop: "18px" }}
            >
                    {demoLoading ? "Creating Demo Data..." : "Generate Demo Hiring Data"}
            </button>
        </div>

        <div className="metric-grid">
  <div className="metric-card">
    <h4>Assessment Drives</h4>
    <p>{drives.length}</p>
  </div>

  <div className="metric-card">
    <h4>Total Candidates</h4>
    <p>{totalCandidates}</p>
  </div>

  <div className="metric-card metric-success">
    <h4>Shortlisted</h4>
    <p>{totalShortlisted}</p>
  </div>

  <div className="metric-card">
    <h4>Review</h4>
    <p>{totalReview}</p>
  </div>

  <div className="metric-card metric-danger">
    <h4>Rejected</h4>
    <p>{totalRejected}</p>

          </div>

          <div className="metric-card metric-success">
            <h4>Active Drives</h4>
            <p>{drives.filter((d) => d.status === "active").length}</p>
          </div>

          <div className="metric-card">
            <h4>Total Candidates</h4>
            <p>{totalCandidates}</p>
          </div>

          <div className="metric-card metric-danger">
            <h4>Rejected</h4>
            <p>0</p>
          </div>
        </div>

        <div className="leetcode-section">
          <h2>Create Hiring Drive</h2>

          {error && <p className="error">{error}</p>}

          <form onSubmit={createDrive}>
            <div className="form-grid">
              <div>
                <label>Drive Title</label>
                <input
                  type="text"
                  placeholder="Example: Fresher Frontend Hiring 2026"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label>Role</label>
                <input
                  type="text"
                  placeholder="Example: Frontend Developer"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label>Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: e.target.value })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label>Interview Questions</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.interview_questions}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      interview_questions: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Coding Questions</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.coding_questions}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      coding_questions: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Duration Minutes</label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duration_minutes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "18px",
                fontWeight: "700",
              }}
            >
              <input
                type="checkbox"
                checked={form.proctoring_enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    proctoring_enabled: e.target.checked,
                  })
                }
              />
              Enable AI Proctoring
            </label>

            <button style={{ marginTop: "22px" }} disabled={loading}>
              {loading ? "Creating..." : "Create Hiring Drive"}
            </button>
          </form>
        </div>

        <div className="leetcode-section">
          <h2>Your Hiring Drives</h2>

          {drives.length === 0 ? (
            <div className="empty-state">No hiring drives created yet.</div>
          ) : (
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Role</th>
                    <th>Difficulty</th>
                    <th>Interview Qs</th>
                    <th>Coding Qs</th>
                    <th>Duration</th>
                    <th>Proctoring</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Shortlisted</th>
                    <th>Review</th>
                    <th>Rejected</th>
                    <th>Invite Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {drives.map((drive) => (
                    <tr key={drive.id}>
                      <td>{drive.title}</td>
                      <td>{drive.role}</td>
                      <td>{drive.difficulty}</td>
                      <td>{drive.interview_questions}</td>
                      <td>{drive.coding_questions}</td>
                      <td>{drive.duration_minutes} min</td>
                      <td>{drive.proctoring_enabled ? "Enabled" : "Off"}</td>
                      <td><b>{drive.status}</b></td>
                      <td><b>{drive.candidates_count || 0}</b></td>
                     <td style={{ color: "green", fontWeight: "800" }}>{drive.shortlisted_count || 0}</td>

                    <td style={{ color: "#92400e", fontWeight: "800" }}>{drive.review_count || 0}</td>
                    <td style={{ color: "red", fontWeight: "800" }}>{drive.rejected_count || 0}</td>
                      <td><b>{drive.candidates_count || 0}</b></td>
                      <td>
                            {drive.invite_code ? (
                        <button
                            onClick={() => {
                            const inviteLink = `${window.location.origin}/drive/${drive.invite_code}`;
                            navigator.clipboard.writeText(inviteLink);
                            alert(`Invite link copied:\n${inviteLink}`);
                            }}
                            >
                                Copy Link
                        </button>
                            ) : (
                            "No Link"
                            )}
                     </td>
                     <td>
                        <button
                            className="btn-dark"
                            onClick={() =>
                            (window.location.href = `/company/drives/${drive.id}/candidates`)
                            }
                        >
                            View Candidates
                        </button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;