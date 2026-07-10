import { useState } from "react";
import { SignIn } from "@clerk/clerk-react";

function Login() {
  const [selectedRole, setSelectedRole] = useState(
    localStorage.getItem("pending_login_role") || ""
  );

  const chooseRole = (role) => {
  localStorage.setItem("pending_login_role", role);
  localStorage.setItem("user_role", role);
  setSelectedRole(role);
};

  const roles = [
    {
      key: "student",
      icon: "🎓",
      title: "Student",
      subtitle: "Interview Preparation",
      description:
        "Practice AI interviews, solve coding assessments, and analyze your preparation level.",
      points: ["AI mock interviews", "Coding practice", "Personal reports"],
      button: "Login as Student",
    },
    {
      key: "company",
      icon: "🏢",
      title: "Company",
      subtitle: "Mass Recruitment",
      description:
        "Create hiring drives, share assessment links, and track candidate performance at scale.",
      points: ["Hiring drives", "Invite links", "Candidate pipeline"],
      button: "Login as Company",
      featured: true,
    },
    {
      key: "recruiter",
      icon: "🧑‍💼",
      title: "Recruiter",
      subtitle: "AI Hiring Decisions",
      description:
        "Review candidate rankings, AI recommendations, reports, and hiring analytics.",
      points: ["AI ranking", "Shortlist badges", "Detailed reports"],
      button: "Login as Recruiter",
    },
  ];

  if (!selectedRole) {
    return (
      <div className="login-role-page">
        <div className="login-role-bg login-role-bg-one"></div>
        <div className="login-role-bg login-role-bg-two"></div>

        <div className="login-role-shell">
          <div className="login-role-top">
            <div className="login-brand">
              <div className="login-brand-icon">AI</div>
              <div>
                <h3>AI Interviewer</h3>
                <p>Proctored Interview & Coding Assessment Platform</p>
              </div>
            </div>

            <div className="login-role-badge">Secure Clerk Login</div>
          </div>

          <section className="login-role-hero">
            <div>
              <span className="login-kicker">Choose Account Type</span>
              <h1>Login to your dedicated workspace</h1>
              <p>
                Select your role before signing in. Your dashboard, tools, and
                access will be customized for that role.
              </p>
            </div>

            <div className="login-hero-stats">
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
                <span>Hiring View</span>
              </div>
            </div>
          </section>

          <div className="login-role-grid">
            {roles.map((role) => (
              <div
                key={role.key}
                className={`login-role-card ${
                  role.featured ? "login-role-card-featured" : ""
                }`}
              >
                {role.featured && (
                  <span className="popular-chip">Most Used</span>
                )}

                <div className="login-card-head">
                  <div className="login-card-icon">{role.icon}</div>
                  <div>
                    <h2>{role.title}</h2>
                    <span>{role.subtitle}</span>
                  </div>
                </div>

                <p>{role.description}</p>

                <div className="login-role-points">
                  {role.points.map((point) => (
                    <div key={point}>
                      <span>✓</span>
                      {point}
                    </div>
                  ))}
                </div>

                <button onClick={() => chooseRole(role.key)}>
                  {role.button}
                </button>
              </div>
            ))}
          </div>

          <p className="login-role-footer">
            You can create different accounts for different roles. Role-based
            access keeps student, company, and recruiter workflows separate.
          </p>
        </div>
      </div>
    );
  }

  const selectedRoleData = roles.find((role) => role.key === selectedRole);

return (
  <div className="role-login-page">
    <div className="role-login-bg role-login-bg-one"></div>
    <div className="role-login-bg role-login-bg-two"></div>

    <div className="role-login-shell">
      <button
        className="role-change-btn"
        onClick={() => {
          localStorage.removeItem("pending_login_role");
          setSelectedRole("");
        }}
      >
        ← Change Login Role
      </button>

      <div className="role-login-layout">
        <div className="role-login-info">
          <div className="login-brand">
            <div className="login-brand-icon">AI</div>
            <div>
              <h3>AI Interviewer</h3>
              <p>Secure role-based workspace</p>
            </div>
          </div>

          <div className="selected-role-chip">
            {selectedRoleData?.icon} {selectedRoleData?.title} Login
          </div>

          <h1>
            Continue as <span>{selectedRoleData?.title}</span>
          </h1>

          <p>
            You are signing in to the {selectedRoleData?.title} workspace.
            Your dashboard, tools, and access permissions will be customized
            for this role.
          </p>

          <div className="selected-role-box">
            <h3>{selectedRoleData?.subtitle}</h3>

            <div className="selected-role-points">
              {selectedRoleData?.points.map((point) => (
                <div key={point}>
                  <span>✓</span>
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="role-login-card">
          <div className="role-login-card-header">
            <h2>Sign in to continue</h2>
            <p>Use your account to access the selected workspace.</p>
          </div>

          <SignIn path="/login" routing="path" signUpUrl="/register" />
        </div>
      </div>
    </div>
  </div>
);
}

export default Login;