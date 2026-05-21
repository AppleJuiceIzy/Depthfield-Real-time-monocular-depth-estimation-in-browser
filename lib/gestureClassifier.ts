import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

const THUMB_MCP = 2;
const THUMB_IP = 3;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_PIP = 18;
const PINKY_TIP = 20;
const WRIST = 0;

export type GestureLabel =
  | "thumbs_up"
  | "thumbs_down"
  | "peace"
  | "pointing"
  | "fist"
  | "open_palm"
  | "ok_sign"
  | "rock"
  | "none";

export type GestureResult = {
  label: GestureLabel;
  confidence: number;
};

type FingerState = {
  angle: number;
  state: "extended" | "curled" | "ambiguous";
  extendedConfidence: number;
  curledConfidence: number;
};

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function angleAt(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);
  if (magAB < 1e-6 || magCB < 1e-6) {
    return 0;
  }
  const dot = abx * cbx + aby * cby;
  const cosine = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cosine) * 180) / Math.PI;
}

function fingerStateFromAngle(landmarks: NormalizedLandmark[], mcpIdx: number, pipIdx: number, tipIdx: number): FingerState {
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const tip = landmarks[tipIdx];
  if (!mcp || !pip || !tip) {
    return {
      angle: 0,
      state: "ambiguous",
      extendedConfidence: 0,
      curledConfidence: 0,
    };
  }
  const angle = angleAt(mcp, pip, tip);
  const extendedConfidence = clamp01((angle - 160) / 20);
  const curledConfidence = clamp01((110 - angle) / 20);

  let state: FingerState["state"] = "ambiguous";
  if (angle > 160) {
    state = "extended";
  } else if (angle < 110) {
    state = "curled";
  }

  return {
    angle,
    state,
    extendedConfidence,
    curledConfidence,
  };
}

function gesture(label: GestureLabel, confidence: number): GestureResult {
  return { label, confidence: clamp01(confidence) };
}

function detectPeace(states: Record<string, FingerState>, landmarks: NormalizedLandmark[]): GestureResult | null {
  if (
    states.index.state !== "extended" ||
    states.middle.state !== "extended" ||
    states.ring.state !== "curled" ||
    states.pinky.state !== "curled"
  ) {
    return null;
  }

  const tipDist = dist(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]);
  const mcpDist = dist(landmarks[INDEX_MCP], landmarks[MIDDLE_MCP]);
  if (tipDist <= mcpDist) {
    return null;
  }

  const openness = clamp01((tipDist / Math.max(mcpDist, 1e-6) - 1) / 0.6);
  const confidence = Math.min(
    states.index.extendedConfidence,
    states.middle.extendedConfidence,
    states.ring.curledConfidence,
    states.pinky.curledConfidence,
    openness,
  );

  return gesture("peace", confidence);
}

function detectPointing(states: Record<string, FingerState>): GestureResult | null {
  if (states.index.state !== "extended") {
    return null;
  }
  if (states.middle.angle >= 100 || states.ring.angle >= 100 || states.pinky.angle >= 100) {
    return null;
  }

  const strictCurledMiddle = clamp01((100 - states.middle.angle) / 20);
  const strictCurledRing = clamp01((100 - states.ring.angle) / 20);
  const strictCurledPinky = clamp01((100 - states.pinky.angle) / 20);
  const confidence = Math.min(
    states.index.extendedConfidence,
    strictCurledMiddle,
    strictCurledRing,
    strictCurledPinky,
  );

  return gesture("pointing", confidence);
}

function detectOkSign(states: Record<string, FingerState>, landmarks: NormalizedLandmark[]): GestureResult | null {
  const thumbIndexDist = dist(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);
  if (thumbIndexDist >= 0.06) {
    return null;
  }

  if (states.middle.angle <= 150 || states.ring.angle <= 150 || states.pinky.angle <= 150) {
    return null;
  }

  const tipCloseness = clamp01((0.06 - thumbIndexDist) / 0.04);
  const extMiddle = clamp01((states.middle.angle - 150) / 20);
  const extRing = clamp01((states.ring.angle - 150) / 20);
  const extPinky = clamp01((states.pinky.angle - 150) / 20);
  const confidence = Math.min(tipCloseness, extMiddle, extRing, extPinky);

  return gesture("ok_sign", confidence);
}

function detectThumbDirection(states: Record<string, FingerState>, landmarks: NormalizedLandmark[]): GestureResult | null {
  const thumbTip = landmarks[THUMB_TIP];
  const thumbBase = landmarks[THUMB_MCP];
  if (
    states.thumb.state !== "extended" ||
    states.index.state !== "curled" ||
    states.middle.state !== "curled" ||
    states.ring.state !== "curled" ||
    states.pinky.state !== "curled" ||
    !thumbTip ||
    !thumbBase
  ) {
    return null;
  }

  const vertical = thumbBase.y - thumbTip.y;
  if (vertical > 0.03) {
    return gesture(
      "thumbs_up",
      Math.min(states.thumb.extendedConfidence, states.index.curledConfidence, clamp01(vertical / 0.15)),
    );
  }
  if (vertical < -0.03) {
    return gesture(
      "thumbs_down",
      Math.min(states.thumb.extendedConfidence, states.index.curledConfidence, clamp01((-vertical) / 0.15)),
    );
  }
  return null;
}

function detectRock(states: Record<string, FingerState>): GestureResult | null {
  if (
    states.index.state === "extended" &&
    states.middle.state === "curled" &&
    states.ring.state === "curled" &&
    states.pinky.state === "extended"
  ) {
    return gesture(
      "rock",
      Math.min(
        states.index.extendedConfidence,
        states.middle.curledConfidence,
        states.ring.curledConfidence,
        states.pinky.extendedConfidence,
      ),
    );
  }
  return null;
}

function detectFist(states: Record<string, FingerState>, landmarks: NormalizedLandmark[]): GestureResult | null {
  const wrist = landmarks[WRIST];
  if (!wrist) {
    return null;
  }
  const fingerTips = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
  const distances = fingerTips.map((idx) => dist(landmarks[idx], wrist));
  const allTipsNear = distances.every((d) => d < 0.15);
  if (!allTipsNear) {
    return null;
  }

  const relaxedCurled = [states.index.angle, states.middle.angle, states.ring.angle, states.pinky.angle].every(
    (a) => a < 130,
  );
  if (!relaxedCurled) {
    return null;
  }

  const proximityConfidence = Math.min(...distances.map((d) => clamp01((0.15 - d) / 0.08)));
  const relaxedCurlConfidence = Math.min(
    clamp01((130 - states.index.angle) / 40),
    clamp01((130 - states.middle.angle) / 40),
    clamp01((130 - states.ring.angle) / 40),
    clamp01((130 - states.pinky.angle) / 40),
  );
  return gesture("fist", Math.min(proximityConfidence, relaxedCurlConfidence));
}

function detectOpenPalm(states: Record<string, FingerState>): GestureResult | null {
  const allExtended = Object.values(states).every((s) => s.state === "extended");
  if (!allExtended) {
    return null;
  }
  return gesture(
    "open_palm",
    Math.min(
      states.thumb.extendedConfidence,
      states.index.extendedConfidence,
      states.middle.extendedConfidence,
      states.ring.extendedConfidence,
      states.pinky.extendedConfidence,
    ),
  );
}

export function classifyGesture(landmarks: NormalizedLandmark[]): GestureResult {
  if (landmarks.length < 21) {
    return gesture("none", 0);
  }

  const states = {
    thumb: fingerStateFromAngle(landmarks, THUMB_MCP, THUMB_IP, THUMB_TIP),
    index: fingerStateFromAngle(landmarks, INDEX_MCP, INDEX_PIP, INDEX_TIP),
    middle: fingerStateFromAngle(landmarks, MIDDLE_MCP, MIDDLE_PIP, MIDDLE_TIP),
    ring: fingerStateFromAngle(landmarks, RING_MCP, RING_PIP, RING_TIP),
    pinky: fingerStateFromAngle(landmarks, PINKY_MCP, PINKY_PIP, PINKY_TIP),
  };

  const okSign = detectOkSign(states, landmarks);
  if (okSign && okSign.confidence > 0) {
    return okSign;
  }

  const peace = detectPeace(states, landmarks);
  if (peace && peace.confidence > 0) {
    return peace;
  }

  const pointing = detectPointing(states);
  if (pointing && pointing.confidence > 0) {
    return pointing;
  }

  const thumbDirection = detectThumbDirection(states, landmarks);
  if (thumbDirection && thumbDirection.confidence > 0) {
    return thumbDirection;
  }

  const rock = detectRock(states);
  if (rock && rock.confidence > 0) {
    return rock;
  }

  const fist = detectFist(states, landmarks);
  if (fist && fist.confidence > 0) {
    return fist;
  }

  const openPalm = detectOpenPalm(states);
  if (openPalm && openPalm.confidence > 0) {
    return openPalm;
  }

  return gesture("none", 0);
}
