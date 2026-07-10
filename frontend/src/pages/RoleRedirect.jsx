import { useEffect, useState } from "react";
import api from "../services/api";

function RoleRedirect() {
  const [message, setMessage] = useState("Checking your login role...");

  const goByRole = (role) => {
    if (role === "student") {
      window.location.href = "/student-dashboard";
    } else if (role === "company") {
      window.location.href = "/company-dashboard";
    } else if (role === "recruiter") {
      window.location.href = "/recruiter";
    } else {
      window.location.href = "/login";
    }
  };

  const redirectByRole = async () => {
    const pendingRole = localStorage.getItem("pending_login_role");
    const storedRole = localStorage.getItem("user_role");

    if (
      pendingRole === "student" ||
      pendingRole === "company" ||
      pendingRole === "recruiter"
    ) {
      localStorage.setItem("user_role", pendingRole);
      localStorage.removeItem("pending_login_role");

      try {
        await api.put("/users/role", { role: pendingRole });
      } catch (err) {
        console.log("Backend not available online, using local role.");
      }

      goByRole(pendingRole);
      return;
    }

    try {
      const response = await api.get("/users/me");
      const role = response.data.role;

      localStorage.setItem("user_role", role);
      goByRole(role);
      return;
    } catch (err) {
      console.log("Backend role fetch failed, using local role.");
    }

    if (storedRole) {
      goByRole(storedRole);
      return;
    }

    setMessage("Unable to detect role. Please login again.");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
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