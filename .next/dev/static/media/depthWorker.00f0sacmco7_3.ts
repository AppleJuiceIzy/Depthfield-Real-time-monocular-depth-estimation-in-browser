/// <reference lib="webworker" />

import * as ort from "onnxruntime-web";

import { loadModel } from "@/lib/loadModel";
import { normalizeDepth, rgbaToInputTensor } from "@/lib/preprocess";
import type { DepthWorkerRequest, DepthWorkerResponse } from "@/lib/workerTypes";
import { DEPTH_INPUT_SIZE } from "@/lib/workerTypes";

let initPromise: Promise<ort.InferenceSession> | null = null;
let busy = false;
let announcedWarming = false;

function post(msg: DepthWorkerResponse): void {
  self.postMessage(msg);
}

async function ensureSession(): Promise<ort.InferenceSession> {
  if (!initPromise) {
    initPromise = loadModel();
  }
  return initPromise;
}

async function handleFrame(msg: Extract<DepthWorkerRequest, { type: "frame" }>): Promise<void> {
  if (busy) {
    post({ type: "busy" });
    return;
  }

  busy = true;
  const session = await ensureSession();

  const start = performance.now();
  const input = rgbaToInputTensor(msg.rgb, msg.width, msg.height, DEPTH_INPUT_SIZE);

  const inputName = session.inputNames[0];
  const feeds: Record<string, ort.Tensor> = {
    [inputName]: new ort.Tensor("float32", input, [1, 3, DEPTH_INPUT_SIZE, DEPTH_INPUT_SIZE]),
  };

  const result = await session.run(feeds);
  const outputName = session.outputNames[0];
  const output = result[outputName];

  if (!output || !(output.data instanceof Float32Array)) {
    throw new Error("ONNX output was missing or not float32.");
  }

  let depthWidth = DEPTH_INPUT_SIZE;
  let depthHeight = DEPTH_INPUT_SIZE;

  if (output.dims.length >= 2) {
    depthHeight = output.dims[output.dims.length - 2];
    depthWidth = output.dims[output.dims.length - 1];
  }

  const rawDepth = output.data;
  const { normalized, min, max } = normalizeDepth(rawDepth);
  let sum = 0;
  for (let i = 0; i < rawDepth.length; i += 1) {
    sum += rawDepth[i];
  }
  const mean = sum / Math.max(1, rawDepth.length);
  const inferenceMs = performance.now() - start;

  post({
    type: "depth",
    frameId: msg.frameId,
    width: depthWidth,
    height: depthHeight,
    depth: normalized,
    inferenceMs,
    depthMin: min,
    depthMax: max,
    depthMean: mean,
    inputTensorShape: [1, 3, DEPTH_INPUT_SIZE, DEPTH_INPUT_SIZE],
    outputTensorShape: [1, depthHeight, depthWidth],
  });

  busy = false;
}

self.addEventListener("message", (event: MessageEvent<DepthWorkerRequest>) => {
  const payload = event.data;

  if (payload.type === "init") {
    void ensureSession()
      .then(() => {
        if (!announcedWarming) {
          post({ type: "warming" });
          announcedWarming = true;
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unknown initialization error";
        post({ type: "error", message });
      });

    return;
  }

  if (payload.type === "frame") {
    void handleFrame(payload).catch((error: unknown) => {
      busy = false;
      const message = error instanceof Error ? error.message : "Unknown inference error";
      post({ type: "error", message });
    });
  }
});

export {};
