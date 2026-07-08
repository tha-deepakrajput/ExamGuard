"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProctoring } from "./proctoring-provider";

type FaceStatus = "loading" | "ok" | "no_face" | "multiple_faces" | "error" | "off";

export function WebcamMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<unknown>(null);
  const animFrameRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("loading");
  const [expanded, setExpanded] = useState(false);

  const { logViolation } = useProctoring();

  // Consecutive violation tracking
  const noFaceCountRef = useRef(0);
  const multiFaceCountRef = useRef(0);
  const NO_FACE_THRESHOLD = 5; // frames before logging
  const MULTI_FACE_THRESHOLD = 3;

  // ── Start webcam ──
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setFaceStatus("loading");
    } catch (err) {
      console.error("[WebcamMonitor] Camera access denied:", err);
      setCameraActive(false);
      setFaceStatus("error");
    }
  }, []);

  // ── Load face detection model ──
  const loadDetector = useCallback(async () => {
    try {
      // Dynamic imports to avoid SSR issues
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();

      const faceDetection = await import("@tensorflow-models/face-detection");
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detector = await faceDetection.createDetector(model, {
        runtime: "tfjs",
        maxFaces: 5,
      });
      detectorRef.current = detector;
      setFaceStatus("ok");
      return detector;
    } catch (err) {
      console.error("[WebcamMonitor] Failed to load face detector:", err);
      setFaceStatus("error");
      return null;
    }
  }, []);

  // ── Detection loop ──
  const runDetection = useCallback(async () => {
    const detector = detectorRef.current as {
      estimateFaces: (
        input: HTMLVideoElement
      ) => Promise<{ box: { xMin: number; yMin: number; width: number; height: number } }[]>;
    } | null;
    const video = videoRef.current;

    if (!detector || !video || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    try {
      const faces = await detector.estimateFaces(video);

      if (faces.length === 0) {
        noFaceCountRef.current++;
        multiFaceCountRef.current = 0;
        if (noFaceCountRef.current >= NO_FACE_THRESHOLD) {
          setFaceStatus("no_face");
          if (noFaceCountRef.current === NO_FACE_THRESHOLD) {
            logViolation("no_face", "No face detected in webcam feed");
          }
        }
      } else if (faces.length > 1) {
        multiFaceCountRef.current++;
        noFaceCountRef.current = 0;
        if (multiFaceCountRef.current >= MULTI_FACE_THRESHOLD) {
          setFaceStatus("multiple_faces");
          if (multiFaceCountRef.current === MULTI_FACE_THRESHOLD) {
            logViolation("multiple_faces", `${faces.length} faces detected in webcam feed`);
          }
        }
      } else {
        noFaceCountRef.current = 0;
        multiFaceCountRef.current = 0;
        setFaceStatus("ok");
      }

      // Draw face boxes on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (const face of faces) {
            const { xMin, yMin, width, height } = face.box;
            ctx.strokeStyle = faces.length === 1 ? "#22c55e" : "#ef4444";
            ctx.lineWidth = 2;
            ctx.strokeRect(xMin, yMin, width, height);
          }
        }
      }
    } catch {
      // Detection error, continue
    }

    // Run at ~5 fps for performance
    setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(runDetection);
    }, 200);
  }, [logViolation]);

  // ── Initialize ──
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await startCamera();
      if (mounted) {
        await loadDetector();
        animFrameRef.current = requestAnimationFrame(runDetection);
      }
    };

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera, loadDetector, runDetection]);

  // ── Status indicator ──
  const statusConfig = {
    loading: { color: "bg-blue-500", pulse: true, label: "Loading..." },
    ok: { color: "bg-emerald-500", pulse: false, label: "Face OK" },
    no_face: { color: "bg-red-500", pulse: true, label: "No face!" },
    multiple_faces: { color: "bg-red-500", pulse: true, label: "Multiple faces!" },
    error: { color: "bg-amber-500", pulse: false, label: "Camera error" },
    off: { color: "bg-gray-500", pulse: false, label: "Camera off" },
  };

  const currentStatus = statusConfig[faceStatus];

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {/* Camera feed */}
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-300 cursor-pointer bg-black",
          faceStatus === "ok"
            ? "border-emerald-500/50"
            : faceStatus === "no_face" || faceStatus === "multiple_faces"
            ? "border-red-500/50 shadow-red-500/20"
            : "border-border/50",
          expanded ? "w-72 h-52" : "w-36 h-28"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover mirror"
          style={{ transform: "scaleX(-1)" }}
          muted
          playsInline
          autoPlay
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Status indicator overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              currentStatus.color,
              currentStatus.pulse && "animate-pulse"
            )}
          />
          <span className="text-[10px] text-white font-medium">
            {currentStatus.label}
          </span>
        </div>

        {/* Camera status icons */}
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <CameraOff className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Warning overlay for violations */}
        {(faceStatus === "no_face" || faceStatus === "multiple_faces") && (
          <div className="absolute bottom-0 inset-x-0 p-1.5 bg-red-500/90 backdrop-blur-sm">
            <div className="flex items-center gap-1 justify-center">
              <AlertTriangle className="w-3 h-3 text-white" />
              <span className="text-[10px] text-white font-semibold">
                {faceStatus === "no_face" ? "Look at screen" : "Only 1 person allowed"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
