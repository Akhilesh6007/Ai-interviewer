import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

function VideoFeed({ sessionId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const intervalRef = useRef(null);

  const [cameraError, setCameraError] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [faceStatus, setFaceStatus] = useState("Checking...");
  const [isCheating, setIsCheating] = useState(false);

  const lastEventTimeRef = useRef(0);

  const saveProctorEvent = async (eventType, severity, message) => {
    const now = Date.now();

    // Same event spam avoid karne ke liye 5 sec cooldown
    if (now - lastEventTimeRef.current < 5000) {
      return;
    }

    lastEventTimeRef.current = now;

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

  const setupFaceDetector = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    detectorRef.current = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsCameraOn(true);
      setCameraError("");
    } catch (error) {
      setCameraError("Camera access denied or unavailable");
      setIsCameraOn(false);
      setIsCheating(true);

      saveProctorEvent(
        "CAMERA_ACCESS_DENIED",
        "high",
        "Candidate denied camera access or camera was unavailable"
      );
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !detectorRef.current) return;

    const video = videoRef.current;

    if (video.readyState < 2) return;

    const detections = detectorRef.current.detectForVideo(
      video,
      performance.now()
    ).detections;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detections.length === 0) {
      setFaceStatus("No face detected");
      setIsCheating(true);

      saveProctorEvent(
        "NO_FACE",
        "high",
        "Candidate face was not visible"
      );

      return;
    }

    if (detections.length > 1) {
      setFaceStatus("Multiple faces detected");
      setIsCheating(true);

      saveProctorEvent(
        "MULTIPLE_FACES",
        "high",
        "Multiple faces detected during interview"
      );
    } else {
      setFaceStatus("Face detected");
      setIsCheating(false);
    }

    detections.forEach((detection) => {
      const box = detection.boundingBox;

      ctx.strokeStyle = detections.length > 1 ? "red" : "lime";
      ctx.lineWidth = 4;
      ctx.strokeRect(box.originX, box.originY, box.width, box.height);
    });
  };

  useEffect(() => {
    const init = async () => {
      await setupFaceDetector();
      await startCamera();

      intervalRef.current = setInterval(() => {
        detectFace();
      }, 1000);
    };

    init();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className={`proctor-card ${isCheating ? "proctor-card-red" : "proctor-card-green"}`}>
      <h3>Camera + Face Monitoring</h3>

      <div style={{ position: "relative", width: "100%", height: "240px" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="320"
          height="240"
          style={{
            backgroundColor: "black",
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />

        <canvas
          ref={canvasRef}
          width="320"
          height="240"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
      </div>

      {cameraError && <p style={{ color: "red" }}>{cameraError}</p>}

      <p style={{ color: isCheating ? "red" : "green" }}>
        {faceStatus}
      </p>

      {isCameraOn ? (
        <p style={{ color: "green" }}>Camera Active</p>
      ) : (
        <p style={{ color: "red" }}>Camera Not Active</p>
      )}
    </div>
  );
}

export default VideoFeed;