import { useState } from "react";

function SpeechToText({ onTextGenerated }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  const startListening = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      if (onTextGenerated) {
        onTextGenerated(transcript);
      }
    };

    recognition.onerror = () => {
      setError("Speech recognition failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div
      style={{
        border: "2px solid #ccc",
        padding: "12px",
        marginTop: "15px",
        width: "500px",
      }}
    >
      <h3>Speech to Text</h3>

      <button onClick={startListening} disabled={isListening}>
        {isListening ? "Listening..." : "Speak Answer"}
      </button>

      {isListening && (
        <p style={{ color: "green" }}>Listening to your answer...</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default SpeechToText;