import * as ort from "onnxruntime-web";

const MODEL_URL =
  "https://github.com/AppleJuiceIzy/Depthfield-Real-time-monocular-depth-estimation-in-browser/releases/download/v1.0/depth-anything-v2-small.onnx";

let sessionPromise: Promise<ort.InferenceSession> | null = null;

async function createSession(): Promise<ort.InferenceSession> {
  ort.env.wasm.simd = true;
  ort.env.wasm.numThreads = Math.max(1, Math.min(4, navigator.hardwareConcurrency ?? 2));

  const response = await fetch(MODEL_URL, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to fetch model from CDN: ${response.status} ${response.statusText}`);
  }

  const modelData = await response.arrayBuffer();

  try {
    return await ort.InferenceSession.create(modelData, {
      executionProviders: ["webgpu", "wasm"],
      graphOptimizationLevel: "all",
      enableCpuMemArena: true,
      enableMemPattern: true,
    });
  } catch {
    return ort.InferenceSession.create(modelData, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
      enableCpuMemArena: true,
      enableMemPattern: true,
    });
  }
}

export function loadModel(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = createSession();
  }

  return sessionPromise;
}
