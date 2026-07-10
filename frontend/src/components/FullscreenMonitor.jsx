import { useEffect, useState } from "react";
import api from "../services/api";

function FullscreenMonitor({ sessionId }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exitCount, setExitCount] = useState(0);

  const saveProctorEvent = async (eventType, severity, message) => {
    try {
      await api.post(`/interview/${sessionId}/proctor-event`, {
        event_type: eventType,
        severity,
        message,
      });
    } catch (error) {
      console.log("Failed to save fullscreen event", error.response?.data);
    }
  };

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      saveProctorEvent(
        "FULLSCREEN_DENIED",
        "medium",
        "Candidate did not allow fullscreen mode"
      );
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);

      if (!active) {
        setExitCount((prev) => prev + 1);

        saveProctorEvent(
          "FULLSCREEN_EXIT",
          "high",
          "Candidate exited fullscreen mode during interview"
        );
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [sessionId]);

  return (
    <div
      style={{
        border: isFullscreen ? "3px solid green" : "3px solid red",
        padding: "10px",
        marginTop: "10px",
        width: "340px",
      }}
    >
      <h3>Fullscreen Monitoring</h3>

      <button onClick={enterFullscreen}>
        Enter Fullscreen
      </button>

      {isFullscreen ? (
        <p style={{ color: "green" }}>Fullscreen Active</p>
      ) : (
        <p style={{ color: "red" }}>Not in Fullscreen</p>
      )}

      {exitCount > 0 && (
        <p style={{ color: "red" }}>
          Fullscreen Exit Count: {exitCount}
        </p>
      )}
    </div>
  );
}

export default FullscreenMonitor;