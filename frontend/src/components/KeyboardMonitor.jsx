import { useEffect, useState } from "react";
import api from "../services/api";

function KeyboardMonitor({ sessionId }) {
  const [violations, setViolations] = useState(0);

  const saveProctorEvent = async (eventType, severity, message) => {
    try {
      await api.post(`/interview/${sessionId}/proctor-event`, {
        event_type: eventType,
        severity,
        message,
      });
    } catch (error) {
      console.log("Failed to save keyboard event", error.response?.data);
    }
  };

  useEffect(() => {
    const handleCopy = (e) => {
      e.preventDefault();
      setViolations((prev) => prev + 1);

      saveProctorEvent(
        "COPY_ATTEMPT",
        "medium",
        "Candidate attempted to copy text during interview"
      );
    };

    const handlePaste = (e) => {
      e.preventDefault();
      setViolations((prev) => prev + 1);

      saveProctorEvent(
        "PASTE_ATTEMPT",
        "high",
        "Candidate attempted to paste text during interview"
      );
    };

    const handleCut = (e) => {
      e.preventDefault();
      setViolations((prev) => prev + 1);

      saveProctorEvent(
        "CUT_ATTEMPT",
        "medium",
        "Candidate attempted to cut text during interview"
      );
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      setViolations((prev) => prev + 1);

      saveProctorEvent(
        "RIGHT_CLICK",
        "medium",
        "Candidate attempted to open right-click menu"
      );
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [sessionId]);

  return (
    <div
      style={{
        border: violations > 0 ? "3px solid red" : "3px solid green",
        padding: "10px",
        marginTop: "10px",
        width: "340px",
      }}
    >
      <h3>Keyboard Monitoring</h3>

      {violations > 0 ? (
        <p style={{ color: "red" }}>
          Keyboard Violations: {violations}
        </p>
      ) : (
        <p style={{ color: "green" }}>
          No copy/paste activity detected
        </p>
      )}
    </div>
  );
}

export default KeyboardMonitor;