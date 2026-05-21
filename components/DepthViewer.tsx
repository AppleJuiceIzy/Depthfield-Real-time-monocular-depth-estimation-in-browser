"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

import { colorizeDepth, type ColormapName } from "@/lib/colorize";
import { classifyGesture, type GestureLabel, type GestureResult } from "@/lib/gestureClassifier";
import { detectHands, initHandTracker } from "@/lib/handTracker";
import { detectPose, initPoseTracker } from "@/lib/poseTracker";
import type { DepthWorkerRequest, DepthWorkerResponse } from "@/lib/workerTypes";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const MAX_SERIAL_LINES = 200;
const POSE_INTERVAL_MS = 33;
const HAND_INTERVAL_MS = 33;
const POSE_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 29],
  [28, 30],
  [29, 31],
  [30, 32],
  [27, 31],
  [28, 32],
];
const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];
const GESTURE_LEGEND: Array<{ label: GestureLabel; emoji: string; text: string }> = [
  { label: "thumbs_up", emoji: "👍", text: "Thumbs Up" },
  { label: "thumbs_down", emoji: "👎", text: "Thumbs Down" },
  { label: "peace", emoji: "✌️", text: "Peace" },
  { label: "pointing", emoji: "☝️", text: "Pointing" },
  { label: "fist", emoji: "✊", text: "Fist" },
  { label: "open_palm", emoji: "🖐️", text: "Open Palm" },
  { label: "ok_sign", emoji: "👌", text: "OK" },
  { label: "rock", emoji: "🤘", text: "Rock" },
];

type DepthStats = {
  min: number;
  max: number;
  mean: number;
};

type LandmarkWithDepth = {
  landmark: NormalizedLandmark;
  depth: number;
};
type HandWithDepth = {
  points: LandmarkWithDepth[];
  averageDepth: number;
  gesture: GestureResult;
};

function formatFps(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.0";
  }
  return value.toFixed(1);
}

export function DepthViewer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rgbCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const depthCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const frameIdRef = useRef(0);
  const lastFpsTsRef = useRef(0);
  const frameCounterRef = useRef(0);
  const colormapRef = useRef<ColormapName>("turbo");
  const overlayEnabledRef = useRef(false);
  const overlayAlphaRef = useRef(0.5);
  const overlayDepthCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const firstInferenceDoneRef = useRef(false);
  const serialContainerRef = useRef<HTMLDivElement | null>(null);
  const latestDepthRef = useRef<{ depth: Float32Array; width: number; height: number } | null>(null);
  const poseRef = useRef<LandmarkWithDepth[]>([]);
  const poseActiveRef = useRef(false);
  const poseInFlightRef = useRef(false);
  const lastPoseTsRef = useRef(0);
  const handsActiveRef = useRef(true);
  const handsInFlightRef = useRef(false);
  const lastHandsTsRef = useRef(0);
  const handsRef = useRef<HandWithDepth[]>([]);
  const gestureHistoryRef = useRef<GestureResult[]>([]);

  const [fps, setFps] = useState(0);
  const [inferenceMs, setInferenceMs] = useState(0);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [statusText, setStatusText] = useState("Initializing camera...");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [colormap, setColormap] = useState<ColormapName>("turbo");
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [overlayAlpha, setOverlayAlpha] = useState(0.5);
  const [depthStats, setDepthStats] = useState<DepthStats | null>(null);
  const [serialOpen, setSerialOpen] = useState(false);
  const [serialPaused, setSerialPaused] = useState(false);
  const [serialLines, setSerialLines] = useState<string[]>([]);
  const [poseEnabled, setPoseEnabled] = useState(false);
  const [poseCount, setPoseCount] = useState(0);
  const [handsEnabled, setHandsEnabled] = useState(true);
  const [handsCount, setHandsCount] = useState(0);
  const [activeGesture, setActiveGesture] = useState<GestureLabel>("none");
  const [activeGestureConfidence, setActiveGestureConfidence] = useState(0);
  const [activeHandDepth, setActiveHandDepth] = useState<number | null>(null);

  const panelStyle = useMemo(
    () => ({
      background: "#fbf8f1",
      border: "1px solid rgba(26,26,26,0.15)",
      borderRadius: 0,
      padding: 12,
      display: "flex",
      flexDirection: "column" as const,
      gap: 8,
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    }),
    [],
  );

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }, []);

  const drawOverlay = useCallback((rgbCtx: CanvasRenderingContext2D) => {
    if (!overlayEnabledRef.current) {
      return;
    }

    const overlayCanvas = overlayDepthCanvasRef.current;
    if (!overlayCanvas) {
      return;
    }

    rgbCtx.save();
    rgbCtx.globalAlpha = overlayAlphaRef.current;
    rgbCtx.drawImage(overlayCanvas, 0, 0, rgbCtx.canvas.width, rgbCtx.canvas.height);
    rgbCtx.restore();
    rgbCtx.globalAlpha = 1.0;
    console.log(
      `drawing depth overlay, alpha=${overlayAlphaRef.current.toFixed(2)}, dims=${rgbCtx.canvas.width}x${rgbCtx.canvas.height}`,
    );
  }, []);

  const sampleDepthAt = useCallback(
    (xNorm: number, yNorm: number): number => {
      const latestDepth = latestDepthRef.current;
      if (!latestDepth) {
        return Number.NaN;
      }
      const x = Math.max(0, Math.min(latestDepth.width - 1, Math.round(xNorm * (latestDepth.width - 1))));
      const y = Math.max(0, Math.min(latestDepth.height - 1, Math.round(yNorm * (latestDepth.height - 1))));
      return latestDepth.depth[y * latestDepth.width + x];
    },
    [],
  );

  const depthToStrokeColor = useCallback(
    (depth: number): string => {
      if (!Number.isFinite(depth)) {
        return "rgb(255,255,255)";
      }
      const pixel = colorizeDepth(new Float32Array([Math.max(0, Math.min(1, depth))]), 1, 1, colormapRef.current);
      return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
    },
    [],
  );

  const drawPose = useCallback(
    (rgbCtx: CanvasRenderingContext2D) => {
      if (!poseActiveRef.current || poseRef.current.length === 0) {
        return;
      }

      const points = poseRef.current;

      for (const [aIdx, bIdx] of POSE_CONNECTIONS) {
        const a = points[aIdx];
        const b = points[bIdx];
        if (!a || !b) {
          continue;
        }
        const avgDepth = (a.depth + b.depth) / 2;
        rgbCtx.strokeStyle = depthToStrokeColor(avgDepth);
        rgbCtx.lineWidth = 2.5;
        rgbCtx.beginPath();
        rgbCtx.moveTo(a.landmark.x * CANVAS_WIDTH, a.landmark.y * CANVAS_HEIGHT);
        rgbCtx.lineTo(b.landmark.x * CANVAS_WIDTH, b.landmark.y * CANVAS_HEIGHT);
        rgbCtx.stroke();
      }

      for (const item of points) {
        const x = item.landmark.x * CANVAS_WIDTH;
        const y = item.landmark.y * CANVAS_HEIGHT;
        rgbCtx.fillStyle = depthToStrokeColor(item.depth);
        rgbCtx.strokeStyle = "#ffffff";
        rgbCtx.lineWidth = 1.2;
        rgbCtx.beginPath();
        rgbCtx.arc(x, y, 5, 0, Math.PI * 2);
        rgbCtx.fill();
        rgbCtx.stroke();
      }
    },
    [depthToStrokeColor],
  );

  const drawHands = useCallback(
    (rgbCtx: CanvasRenderingContext2D) => {
      if (!handsActiveRef.current || handsRef.current.length === 0) {
        return;
      }

      for (const hand of handsRef.current) {
        for (const [aIdx, bIdx] of HAND_CONNECTIONS) {
          const a = hand.points[aIdx];
          const b = hand.points[bIdx];
          if (!a || !b) {
            continue;
          }
          const avgDepth = (a.depth + b.depth) / 2;
          rgbCtx.strokeStyle = depthToStrokeColor(avgDepth);
          rgbCtx.lineWidth = 2;
          rgbCtx.beginPath();
          rgbCtx.moveTo(a.landmark.x * CANVAS_WIDTH, a.landmark.y * CANVAS_HEIGHT);
          rgbCtx.lineTo(b.landmark.x * CANVAS_WIDTH, b.landmark.y * CANVAS_HEIGHT);
          rgbCtx.stroke();
        }

        for (const point of hand.points) {
          const x = point.landmark.x * CANVAS_WIDTH;
          const y = point.landmark.y * CANVAS_HEIGHT;
          rgbCtx.fillStyle = depthToStrokeColor(point.depth);
          rgbCtx.strokeStyle = "#ffffff";
          rgbCtx.lineWidth = 1;
          rgbCtx.beginPath();
          rgbCtx.arc(x, y, 3.5, 0, Math.PI * 2);
          rgbCtx.fill();
          rgbCtx.stroke();
        }
      }
    },
    [depthToStrokeColor],
  );

  const addSerialLine = useCallback((line: string) => {
    setSerialLines((prev) => {
      const next = [...prev, line];
      if (next.length > MAX_SERIAL_LINES) {
        return next.slice(next.length - MAX_SERIAL_LINES);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    colormapRef.current = colormap;
  }, [colormap]);

  useEffect(() => {
    overlayEnabledRef.current = overlayEnabled;
  }, [overlayEnabled]);

  useEffect(() => {
    overlayAlphaRef.current = overlayAlpha;
  }, [overlayAlpha]);

  useEffect(() => {
    poseActiveRef.current = poseEnabled;
    if (poseEnabled) {
      void initPoseTracker().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Pose tracker failed to initialize";
        setErrorText(message);
      });
    } else {
      poseRef.current = [];
    }
  }, [poseEnabled]);

  useEffect(() => {
    handsActiveRef.current = handsEnabled;
    if (handsEnabled) {
      void initHandTracker().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Hand tracker failed to initialize";
        setErrorText(message);
      });
    } else {
      handsRef.current = [];
    }
  }, [handsEnabled]);

  useEffect(() => {
    if (!serialOpen || !serialContainerRef.current) {
      return;
    }

    serialContainerRef.current.scrollTop = serialContainerRef.current.scrollHeight;
  }, [serialLines, serialOpen]);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/depthWorker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<DepthWorkerResponse>) => {
      const message = event.data;

      if (message.type === "warming") {
        setIsWorkerReady(true);
        setStatusText("Model warming up...");
        return;
      }

      if (message.type === "busy") {
        return;
      }

      if (message.type === "error") {
        setErrorText(message.message);
        setStatusText("Worker error");
        busyRef.current = false;
        return;
      }

      if (message.type === "depth") {
        const depthCanvas = depthCanvasRef.current;
        const rgbCanvas = rgbCanvasRef.current;
        if (!depthCanvas || !rgbCanvas) {
          busyRef.current = false;
          return;
        }

        const depthCtx = depthCanvas.getContext("2d", { willReadFrequently: false });
        if (!depthCtx) {
          busyRef.current = false;
          return;
        }

        const pixels = colorizeDepth(message.depth, message.width, message.height, colormapRef.current);
        const image = depthCtx.createImageData(message.width, message.height);
        image.data.set(pixels);
        depthCtx.putImageData(image, 0, 0);

        if (!overlayDepthCanvasRef.current) {
          overlayDepthCanvasRef.current = document.createElement("canvas");
        }
        const overlayCanvas = overlayDepthCanvasRef.current;
        overlayCanvas.width = message.width;
        overlayCanvas.height = message.height;
        const overlayCtx = overlayCanvas.getContext("2d", { willReadFrequently: false });
        if (overlayCtx) {
          overlayCtx.putImageData(image, 0, 0);
        }

        setDepthStats({
          min: message.depthMin,
          max: message.depthMax,
          mean: message.depthMean,
        });
        latestDepthRef.current = { depth: message.depth, width: message.width, height: message.height };

        let poseSummary = "";
        if (poseActiveRef.current && poseRef.current.length > 0) {
          const nose = poseRef.current[0];
          const leftWrist = poseRef.current[15];
          poseSummary = ` | pose ${poseRef.current.length}pts | nose depth=${nose?.depth?.toFixed(2) ?? "n/a"} | wrist_l depth=${leftWrist?.depth?.toFixed(2) ?? "n/a"}`;
        }
        let handSummary = "";
        if (handsActiveRef.current && handsRef.current.length > 0) {
          const firstHand = handsRef.current[0];
          handSummary = ` | hands ${handsRef.current.length} | gesture=${firstHand.gesture.label}(${firstHand.gesture.confidence.toFixed(2)}) | hand_depth=${firstHand.averageDepth.toFixed(2)}`;
        }

        if (!serialPaused) {
          const ts = new Date().toISOString().slice(11, 23);
          const line = `[${ts}] frame ${message.frameId} | inf ${message.inferenceMs.toFixed(1)}ms | depth min=${message.depthMin.toFixed(2)} max=${message.depthMax.toFixed(2)} mean=${message.depthMean.toFixed(2)}${poseSummary}${handSummary} | tensor ${message.inputTensorShape.join("x")} -> ${message.outputTensorShape.join("x")}`;
          addSerialLine(line);
        }

        if (!firstInferenceDoneRef.current) {
          firstInferenceDoneRef.current = true;
          setStatusText("Model ready. Streaming depth...");
        }
        setInferenceMs(message.inferenceMs);
        busyRef.current = false;
      }
    };

    const initMessage: DepthWorkerRequest = { type: "init" };
    worker.postMessage(initMessage);

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [addSerialLine, serialPaused]);

  useEffect(() => {
    let mounted = true;

    const start = async (): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: CANVAS_WIDTH },
            height: { ideal: CANVAS_HEIGHT },
            facingMode: "user",
          },
          audio: false,
        });

        if (!mounted) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;

        if (!video) {
          return;
        }

        video.srcObject = stream;
        await video.play();
        setStatusText("Camera ready. Waiting for model...");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Camera permission denied or unavailable";
        setErrorText(message);
        setStatusText("Camera unavailable");
      }
    };

    void start();

    return () => {
      mounted = false;
      stopLoop();
      stopCamera();
    };
  }, [stopCamera, stopLoop]);

  useEffect(() => {
    const draw = (): void => {
      const video = videoRef.current;
      const rgbCanvas = rgbCanvasRef.current;
      const worker = workerRef.current;
      const now = performance.now();

      if (video && rgbCanvas && video.readyState >= 2) {
        const rgbCtx = rgbCanvas.getContext("2d", { willReadFrequently: true });

        if (rgbCtx) {
          rgbCtx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          drawOverlay(rgbCtx);
          drawPose(rgbCtx);
          drawHands(rgbCtx);

          if (isWorkerReady && worker && !busyRef.current) {
            const frame = rgbCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            busyRef.current = true;
            frameIdRef.current += 1;

            const msg: DepthWorkerRequest = {
              type: "frame",
              frameId: frameIdRef.current,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              rgb: frame.data,
            };

            worker.postMessage(msg);
          }

          if (poseActiveRef.current && !poseInFlightRef.current && now - lastPoseTsRef.current >= POSE_INTERVAL_MS) {
            poseInFlightRef.current = true;
            lastPoseTsRef.current = now;
            void detectPose(video, now)
              .then((landmarks) => {
                const fused: LandmarkWithDepth[] = landmarks.map((landmark) => ({
                  landmark,
                  depth: sampleDepthAt(landmark.x, landmark.y),
                }));
                poseRef.current = fused;
                setPoseCount(fused.length);
              })
              .catch((error: unknown) => {
                const message = error instanceof Error ? error.message : "Pose detection failed";
                setErrorText(message);
              })
              .finally(() => {
                poseInFlightRef.current = false;
              });
          }

          if (handsActiveRef.current && !handsInFlightRef.current && now - lastHandsTsRef.current >= HAND_INTERVAL_MS) {
            handsInFlightRef.current = true;
            lastHandsTsRef.current = now;
            void detectHands(video, now)
              .then((result) => {
                const fusedHands: HandWithDepth[] = result.landmarks.map((handLandmarks) => {
                  const points = handLandmarks.map((landmark) => ({
                    landmark,
                    depth: sampleDepthAt(landmark.x, landmark.y),
                  }));
                  const avg =
                    points.reduce((acc, p) => acc + (Number.isFinite(p.depth) ? p.depth : 0), 0) /
                    Math.max(1, points.length);
                  return {
                    points,
                    averageDepth: avg,
                    gesture: classifyGesture(handLandmarks),
                  };
                });

                handsRef.current = fusedHands;
                setHandsCount(fusedHands.length);
                const bestGesture =
                  fusedHands
                    .map((h) => h.gesture)
                    .sort((a, b) => b.confidence - a.confidence)
                    .find((g) => g.label !== "none") ?? { label: "none" as const, confidence: 0 };

                gestureHistoryRef.current.push(bestGesture);
                if (gestureHistoryRef.current.length > 3) {
                  gestureHistoryRef.current.shift();
                }

                if (gestureHistoryRef.current.length === 3) {
                  const [g0, g1, g2] = gestureHistoryRef.current;
                  if (g0.label === g1.label && g1.label === g2.label) {
                    setActiveGesture(g2.label);
                    setActiveGestureConfidence((g0.confidence + g1.confidence + g2.confidence) / 3);
                  }
                }
                setActiveHandDepth(fusedHands[0]?.averageDepth ?? null);
              })
              .catch((error: unknown) => {
                const message = error instanceof Error ? error.message : "Hand detection failed";
                setErrorText(message);
              })
              .finally(() => {
                handsInFlightRef.current = false;
              });
          }

          frameCounterRef.current += 1;
          const elapsed = now - lastFpsTsRef.current;
          if (elapsed >= 500) {
            const nextFps = (frameCounterRef.current * 1000) / elapsed;
            setFps(nextFps);
            frameCounterRef.current = 0;
            lastFpsTsRef.current = now;
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    lastFpsTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(draw);
    return stopLoop;
  }, [drawHands, drawOverlay, drawPose, isWorkerReady, sampleDepthAt, stopLoop]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 28px 72px",
        background: "#f4efe6",
      }}
    >
      <section style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 48,
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "0.01em",
              }}
            >
              Depthfield
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 17,
                fontStyle: "italic",
                color: "rgba(26,26,26,0.72)",
              }}
            >
              Real-time monocular depth estimation in the browser
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
              fontSize: 13,
              color: "rgba(26,26,26,0.68)",
            }}
          >
            <span>fps {formatFps(fps)}</span>
            <span>inf {inferenceMs.toFixed(1)}ms</span>
          </div>
        </header>
        <div style={{ fontStyle: "italic", color: "rgba(26,26,26,0.58)", fontSize: 16 }}>{statusText}</div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {(["turbo", "inferno", "grayscale"] as ColormapName[]).map((name) => {
            const active = colormap === name;
            return (
              <button
                key={name}
                type="button"
                className={`control-button ${active ? "active" : ""}`}
                onClick={() => setColormap(name)}
              >
                {name[0].toUpperCase() + name.slice(1)}
              </button>
            );
          })}

          <button
            type="button"
            className={`control-button ${overlayEnabled ? "active" : ""}`}
            onClick={() => setOverlayEnabled((prev) => !prev)}
          >
            Overlay: {overlayEnabled ? "On" : "Off"}
          </button>

          <button
            type="button"
            className={`control-button ${poseEnabled ? "active" : ""}`}
            onClick={() => setPoseEnabled((prev) => !prev)}
          >
            Pose: {poseEnabled ? "On" : "Off"}
          </button>

          <button
            type="button"
            className={`control-button ${handsEnabled ? "active" : ""}`}
            onClick={() => setHandsEnabled((prev) => !prev)}
          >
            Hands: {handsEnabled ? "On" : "Off"}
          </button>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#1a1a1a",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Overlay Alpha
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={overlayAlpha}
              onChange={(event) => setOverlayAlpha(Number(event.target.value))}
              style={{ width: 130, accentColor: "#3a5fff" }}
            />
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace" }}>
              {overlayAlpha.toFixed(2)}
            </span>
          </label>

          <button
            type="button"
            className={`control-button ${serialOpen ? "active" : ""}`}
            onClick={() => setSerialOpen((prev) => !prev)}
          >
            Serial Monitor
          </button>
        </div>

        {errorText ? (
          <p style={{ color: "#c1432d", margin: 0, fontStyle: "italic" }}>Error: {errorText}</p>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <div style={panelStyle} className="canvas-panel">
            <strong
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 400,
              }}
            >
              {overlayEnabled ? "RGB + Depth Overlay" : "RGB Input"}
            </strong>
            <div style={{ position: "relative" }}>
              <canvas
                ref={rgbCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                  width: "100%",
                  aspectRatio: "640 / 360",
                  height: "auto",
                  objectFit: "fill",
                  borderRadius: 0,
                  background: "#0f0f0f",
                }}
              />
              {overlayEnabled && depthStats ? (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    padding: "6px 8px",
                    borderRadius: 0,
                    background: "rgba(244,239,230,0.9)",
                    color: "#1a1a1a",
                    fontSize: 11,
                    lineHeight: 1.4,
                    fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                    border: "1px solid rgba(26,26,26,0.15)",
                  }}
                >
                  <div>min: {depthStats.min.toFixed(3)}</div>
                  <div>max: {depthStats.max.toFixed(3)}</div>
                  <div>mean: {depthStats.mean.toFixed(3)}</div>
                  <div>range: {(depthStats.max - depthStats.min).toFixed(3)}</div>
                </div>
              ) : null}
              {poseEnabled ? (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    padding: "5px 9px",
                    borderRadius: 0,
                    background: "rgba(244,239,230,0.88)",
                    color: "#1a1a1a",
                    fontSize: 11,
                    lineHeight: 1.3,
                    fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                    border: "1px solid rgba(26,26,26,0.15)",
                  }}
                >
                  Pose: {poseCount} landmarks | Hands: {handsCount} detected | Gesture: {activeGesture} (
                  {activeGestureConfidence.toFixed(2)}) | Hand depth: {activeHandDepth?.toFixed(2) ?? "n/a"}m
                </div>
              ) : null}
              {handsEnabled && activeGesture !== "none" ? (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "10px 16px",
                    borderRadius: 0,
                    background: "rgba(244,239,230,0.86)",
                    color: "#1a1a1a",
                    fontSize: 30,
                    fontWeight: 400,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    transition: "opacity 0.2s ease",
                    opacity: 1,
                    border: "1px solid rgba(26,26,26,0.15)",
                  }}
                >
                  {activeGesture === "thumbs_up"
                    ? "👍 THUMBS UP"
                    : activeGesture === "thumbs_down"
                      ? "👎 THUMBS DOWN"
                      : activeGesture === "peace"
                        ? "✌️ PEACE"
                        : activeGesture === "pointing"
                          ? "☝️ POINTING"
                          : activeGesture === "fist"
                            ? "✊ FIST"
                            : activeGesture === "open_palm"
                              ? "🖐️ OPEN PALM"
                              : activeGesture === "ok_sign"
                                ? "👌 OK SIGN"
                                : "🤘 ROCK"}{" "}
                  ({activeGestureConfidence.toFixed(2)})
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontStyle: "italic", color: "#3a5fff", fontSize: 14 }}>gestures recognized →</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "nowrap" }}>
                {GESTURE_LEGEND.map((item) => {
                  const active = activeGesture === item.label;
                  return (
                    <div key={item.label} className={`gesture-item ${active ? "active" : ""}`}>
                      <div className="emoji">{item.emoji}</div>
                      <div className="label">{item.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {!overlayEnabled ? (
            <div style={panelStyle} className="canvas-panel">
              <strong
                style={{
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                }}
              >
                Depth Output
              </strong>
              <div style={{ position: "relative" }}>
                <canvas
                  ref={depthCanvasRef}
                  width={256}
                  height={256}
                  style={{
                    width: "100%",
                    aspectRatio: "640 / 360",
                    height: "auto",
                    objectFit: "fill",
                    borderRadius: 0,
                    background: "#0f0f0f",
                  }}
                />
                {depthStats ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      padding: "6px 8px",
                      borderRadius: 0,
                      background: "rgba(244,239,230,0.9)",
                      color: "#1a1a1a",
                      fontSize: 11,
                      lineHeight: 1.4,
                      fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                      border: "1px solid rgba(26,26,26,0.15)",
                    }}
                  >
                    <div>min: {depthStats.min.toFixed(3)}</div>
                    <div>max: {depthStats.max.toFixed(3)}</div>
                    <div>mean: {depthStats.mean.toFixed(3)}</div>
                    <div>range: {(depthStats.max - depthStats.min).toFixed(3)}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <canvas ref={depthCanvasRef} width={256} height={256} style={{ display: "none" }} />
          )}
        </div>

        {serialOpen ? (
          <div
            style={{
              ...panelStyle,
              padding: 0,
              overflow: "hidden",
              maxHeight: 260,
              borderColor: "#1a1a1a",
            }}
            className="canvas-panel"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                borderBottom: "1px solid rgba(26,26,26,0.15)",
                background: "#141414",
                color: "#d8d8d8",
              }}
            >
              <strong style={{ fontSize: 13, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Serial Monitor
              </strong>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className={`control-button ${serialPaused ? "active" : ""}`}
                  onClick={() => setSerialPaused((prev) => !prev)}
                >
                  {serialPaused ? "Resume" : "Pause"}
                </button>
                <button type="button" className="control-button" onClick={() => setSerialLines([])}>
                  Clear
                </button>
              </div>
            </div>
            <div
              ref={serialContainerRef}
              style={{
                padding: "10px 12px",
                overflowY: "auto",
                background: "#0a0a0a",
                color: "#33ff66",
                fontSize: 12,
                fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                lineHeight: 1.5,
                whiteSpace: "pre",
                textShadow: "0 0 4px rgba(51,255,102,0.45)",
                position: "relative",
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(51,255,102,0.05) 0px, rgba(51,255,102,0.05) 1px, transparent 2px, transparent 4px)",
              }}
            >
              {serialLines.length === 0 ? "No frame telemetry yet." : serialLines.join("\n")}
            </div>
          </div>
        ) : null}

        <a
          href="https://www.izyanali.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="designed-by-izy"
          style={{
            marginTop: 6,
            alignSelf: "flex-end",
            fontStyle: "italic",
            fontSize: 14,
            letterSpacing: "0.02em",
          }}
        >
          designed by izy
        </a>

        <video ref={videoRef} playsInline muted style={{ display: "none" }} />
      </section>
    </main>
  );
}
