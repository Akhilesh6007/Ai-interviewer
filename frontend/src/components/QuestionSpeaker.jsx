function QuestionSpeaker({ text }) {
  const speakQuestion = () => {
    if (!text) return;

    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <div
      style={{
        border: "2px solid #ccc",
        padding: "10px",
        marginTop: "10px",
        width: "500px",
      }}
    >
      <h3>AI Interviewer Voice</h3>

      <button onClick={speakQuestion}>
        Speak Question
      </button>

      <button onClick={stopSpeaking} style={{ marginLeft: "10px" }}>
        Stop
      </button>
    </div>
  );
}

export default QuestionSpeaker;