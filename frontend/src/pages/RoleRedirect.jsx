import { useEffect, useState } from "react";
import api from "../services/api";

function RoleRedirect() {
  const [message, setMessage] = useState("Checking your login role...");

  const redirectByRole = async () => {
    try {
      const pendingRole = localStorage.getItem("pending_login_role");

      let role = "";

      if (
        pendingRole === "student" ||
        pendingRole === "company" ||
        pendingRole === "recruiter"
      ) {
        setMessage(`Setting your role as ${pendingRole}...`);

        const response = await api.put("/users/role", {
          role: pendingRole,
        });

        role = response.data.role;
        localStorage.removeItem("pending_login_role");
      } else {
        const response = await api.get("/users/me");
        role = response.data.role;
      }

      if (role === "student") {
        window.location.href = "/student-dashboard";
      } else if (role === "company") {
        window.location.href = "/company-dashboard";
      } else if (role === "recruiter") {
        window.location.href = "/recruiter";
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("Role redirect error:", err.response?.data);
      setMessage("Unable to detect role. Please login again.");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    }
  };

  useEffect(() => {
    redirectByRole();
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{message}</h1>
        <p>Please wait while we redirect you to your dashboard.</p>
      </div>
    </div>
  );
}

export default RoleRedirect;