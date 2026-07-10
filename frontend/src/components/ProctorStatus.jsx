import { useEffect, useState } from "react";
import api from "../services/api";

function ProctorStatus({ sessionId }) {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await api.get(`/interview/${sessionId}/proctor-events`);
      setEvents(response.data);
    } catch (error) {
      console.log("Failed to fetch proctor events", error.response?.data);
    }
  };

  useEffect(() => {
    fetchEvents();

    const interval = setInterval(() => {
      fetchEvents();
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const totalEvents = events.length;
  const highEvents = events.filter((event) => event.severity === "high").length;

  let status = "Clean";
  let color = "green";

  if (highEvents >= 3) {
    status = "High Cheating Risk";
    color = "red";
  } else if (totalEvents >= 3) {
    status = "Needs Review";
    color = "orange";
  }

  return (
    <div
      style={{
        border: `4px solid ${color}`,
        padding: "12px",
        marginTop: "10px",
        width: "340px",
      }}
    >
      <h3>Live Proctoring Status</h3>

      <p>
        <b>Status:</b>{" "}
        <span style={{ color: color }}>{status}</span>
      </p>

      <p>
        <b>Total Events:</b> {totalEvents}
      </p>

      <p>
        <b>High Severity Events:</b> {highEvents}
      </p>

      {events.length > 0 && (
        <div>
          <h4>Latest Event</h4>
          <p>
            <b>Type:</b> {events[0].event_type}
          </p>
          <p>
            <b>Severity:</b> {events[0].severity}
          </p>
          <p>
            <b>Message:</b> {events[0].message}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProctorStatus;