import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

const HAND_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

type HandDetection = {
  landmarks: NormalizedLandmark[][];
};

let handLandmarkerPromise: Promise<HandLandmarker> | null = null;

async function createHandLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: HAND_MODEL_URL,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

export function initHandTracker(): Promise<HandLandmarker> {
  if (!handLandmarkerPromise) {
    handLandmarkerPromise = createHandLandmarker();
  }

  return handLandmarkerPromise;
}

export async function detectHands(
  videoElement: HTMLVideoElement,
  timestampMs: number,
): Promise<HandDetection> {
  const handLandmarker = await initHandTracker();
  const result: HandLandmarkerResult = handLandmarker.detectForVideo(videoElement, timestampMs);
  return {
    landmarks: result.landmarks ?? [],
  };
}
