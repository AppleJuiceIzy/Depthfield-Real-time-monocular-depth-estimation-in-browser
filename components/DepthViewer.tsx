"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { colorizeDepth, type ColormapName } from "@/lib/colorize";
import type { DepthWorkerRequest, DepthWorkerResponse } from "@/lib/workerTypes";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;

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
  const firstInferenceDoneRef = useRef(false);

  const [fps, setFps] = useState(0);
  const [inferenceMs, setInferenceMs] = useState(0);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [statusText, setStatusText] = useState("Initializing camera...");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [colormap, setColormap] = useState<ColormapName>("turbo");
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  const panelStyle = useMemo(
    () => ({
      background: "#111827",
      border: "1px solid #293244",
      borderRadius: 12,
      padding: 12,
      display: "flex",
      flexDirection: "column" as const,
      gap: 8,
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

  const drawOverlay = useCallback((rgbCtx: CanvasRenderingContext2D, depthCtx: CanvasRenderingContext2D) => {
    if (!overlayEnabledRef.current) {
      return;
    }

    rgbCtx.save();
    rgbCtx.globalAlpha = 0.35;
    rgbCtx.drawImage(depthCtx.canvas, 0, 0, rgbCtx.canvas.width, rgbCtx.canvas.height);
    rgbCtx.restore();
  }, []);

  useEffect(() => {
    colormapRef.current = colormap;
  }, [colormap]);

  useEffect(() => {
    overlayEnabledRef.current = overlayEnabled;
  }, [overlayEnabled]);

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
        const rgbCtx = rgbCanvas.getContext("2d", { willReadFrequently: true });
        if (!depthCtx || !rgbCtx) {
          busyRef.current = false;
          return;
        }

        const pixels = colorizeDepth(message.depth, message.width, message.height, colormapRef.current);
        const image = depthCtx.createImageData(message.width, message.height);
        image.data.set(pixels);
        depthCtx.putImageData(image, 0, 0);

        drawOverlay(rgbCtx, depthCtx);

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
  }, [drawOverlay]);

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

      if (video && rgbCanvas && video.readyState >= 2) {
        const rgbCtx = rgbCanvas.getContext("2d", { willReadFrequently: true });

        if (rgbCtx) {
          rgbCtx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

          frameCounterRef.current += 1;
          const now = performance.now();
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
  }, [isWorkerReady, stopLoop]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "radial-gradient(circle at top, #111827 0%, #05070d 60%)",
      }}
    >
      <section style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Browser Depth Visualizer</h1>
          <span style={{ padding: "4px 10px", borderRadius: 999, background: "#1f2937", color: "#93c5fd" }}>
            FPS: {formatFps(fps)}
          </span>
          <span style={{ padding: "4px 10px", borderRadius: 999, background: "#1f2937", color: "#c4b5fd" }}>
            Inference: {inferenceMs.toFixed(1)} ms
          </span>
          <span style={{ color: "#9ca3af" }}>{statusText}</span>
        </header>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {(["turbo", "inferno", "grayscale"] as ColormapName[]).map((name) => {
            const active = colormap === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setColormap(name)}
                style={{
                  border: `1px solid ${active ? "#60a5fa" : "#374151"}`,
                  background: active ? "#1e3a8a" : "#111827",
                  color: "#e5e7eb",
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                {name[0].toUpperCase() + name.slice(1)}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setOverlayEnabled((prev) => !prev)}
            style={{
              border: `1px solid ${overlayEnabled ? "#34d399" : "#374151"}`,
              background: overlayEnabled ? "#064e3b" : "#111827",
              color: "#e5e7eb",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Overlay: {overlayEnabled ? "On" : "Off"}
          </button>
        </div>

        {errorText ? (
          <p style={{ color: "#fca5a5", margin: 0 }}>Error: {errorText}</p>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          <div style={panelStyle}>
            <strong>RGB Input</strong>
            <canvas
              ref={rgbCanvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{ width: "100%", height: "auto", borderRadius: 10, background: "#030712" }}
            />
          </div>

          <div style={panelStyle}>
            <strong>Depth Output</strong>
            <canvas
              ref={depthCanvasRef}
              width={256}
              height={256}
              style={{ width: "100%", height: "auto", borderRadius: 10, background: "#030712", imageRendering: "pixelated" }}
            />
          </div>
        </div>

        <video ref={videoRef} playsInline muted style={{ display: "none" }} />
      </section>
    </main>
  );
}
