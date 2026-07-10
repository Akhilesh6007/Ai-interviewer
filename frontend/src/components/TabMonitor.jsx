import { useEffect, useState } from "react";
import api from "../services/api";

function TabMonitor({ sessionId }) {
  const [warningCount, setWarningCount] = useState(0);

  const saveProctorEvent = async (eventType, severity, message) => {
    try {
      await api.post(`/interview/${sessionId}/proctor-event`, {
        event_type: eventType,
        severity,
        message,
      });
    } catch (error) {
      console.log("Failed to save proctor event", error.response?.data);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => prev + 1);

        saveProctorEvent(
          "TAB_SWITCH",
          "high",
          "Candidate switched tab or minimized the interview window"
        );
      }
    };

    const handleBlur = () => {
      setWarningCount((prev) => prev + 1);

      saveProctorEvent(
        "WINDOW_BLUR",
        "medium",
        "Candidate moved focus away from the interview window"
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [sessionId]);

  return (
    <div
      style={{
        border: warningCount > 0 ? "3px solid red" : "3px solid green",
        padding: "10px",
        marginTop: "10px",
        width: "340px",
      }}
    >
      <h3>Tab Monitoring</h3>

      {warningCount > 0 ? (
        <p style={{ color: "red" }}>
          Warning Count: {warningCount}
        </p>
      ) : (
        <p style={{ color: "green" }}>
          No tab switching detected
        </p>
      )}
    </div>
  );
}

export default TabMonitor;