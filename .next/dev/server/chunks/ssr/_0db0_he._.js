module.exports = [
"[project]/lib/colorize.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "colorizeDepth",
    ()=>colorizeDepth
]);
const TURBO_STOPS = [
    [
        48,
        18,
        59
    ],
    [
        50,
        93,
        176
    ],
    [
        34,
        170,
        132
    ],
    [
        236,
        219,
        70
    ],
    [
        245,
        109,
        36
    ],
    [
        122,
        4,
        3
    ]
];
const INFERNO_STOPS = [
    [
        0,
        0,
        4
    ],
    [
        31,
        12,
        72
    ],
    [
        85,
        15,
        109
    ],
    [
        136,
        34,
        106
    ],
    [
        186,
        54,
        85
    ],
    [
        227,
        89,
        51
    ],
    [
        249,
        140,
        10
    ],
    [
        252,
        195,
        65
    ],
    [
        252,
        255,
        164
    ]
];
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function fromStops(stops, t) {
    const n = stops.length - 1;
    const scaled = Math.max(0, Math.min(0.9999, t)) * n;
    const i = Math.floor(scaled);
    const local = scaled - i;
    const c0 = stops[i];
    const c1 = stops[i + 1];
    return [
        Math.round(lerp(c0[0], c1[0], local)),
        Math.round(lerp(c0[1], c1[1], local)),
        Math.round(lerp(c0[2], c1[2], local))
    ];
}
function sampleColor(map, v) {
    if (map === "grayscale") {
        const gray = Math.round(v * 255);
        return [
            gray,
            gray,
            gray
        ];
    }
    if (map === "inferno") {
        return fromStops(INFERNO_STOPS, v);
    }
    return fromStops(TURBO_STOPS, v);
}
function colorizeDepth(normalizedDepth, width, height, map) {
    const out = new Uint8ClampedArray(width * height * 4);
    for(let i = 0; i < normalizedDepth.length; i += 1){
        const v = Math.max(0, Math.min(1, normalizedDepth[i]));
        const [r, g, b] = sampleColor(map, v);
        const p = i * 4;
        out[p] = r;
        out[p + 1] = g;
        out[p + 2] = b;
        out[p + 3] = 255;
    }
    return out;
}
}),
"[project]/lib/gestureClassifier.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyGesture",
    ()=>classifyGesture
]);
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
function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
}
function clamp01(v) {
    return Math.max(0, Math.min(1, v));
}
function angleAt(a, b, c) {
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
    return Math.acos(cosine) * 180 / Math.PI;
}
function fingerStateFromAngle(landmarks, mcpIdx, pipIdx, tipIdx) {
    const mcp = landmarks[mcpIdx];
    const pip = landmarks[pipIdx];
    const tip = landmarks[tipIdx];
    if (!mcp || !pip || !tip) {
        return {
            angle: 0,
            state: "ambiguous",
            extendedConfidence: 0,
            curledConfidence: 0
        };
    }
    const angle = angleAt(mcp, pip, tip);
    const extendedConfidence = clamp01((angle - 160) / 20);
    const curledConfidence = clamp01((110 - angle) / 20);
    let state = "ambiguous";
    if (angle > 160) {
        state = "extended";
    } else if (angle < 110) {
        state = "curled";
    }
    return {
        angle,
        state,
        extendedConfidence,
        curledConfidence
    };
}
function gesture(label, confidence) {
    return {
        label,
        confidence: clamp01(confidence)
    };
}
function detectPeace(states, landmarks) {
    if (states.index.state !== "extended" || states.middle.state !== "extended" || states.ring.state !== "curled" || states.pinky.state !== "curled") {
        return null;
    }
    const tipDist = dist(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]);
    const mcpDist = dist(landmarks[INDEX_MCP], landmarks[MIDDLE_MCP]);
    if (tipDist <= mcpDist) {
        return null;
    }
    const openness = clamp01((tipDist / Math.max(mcpDist, 1e-6) - 1) / 0.6);
    const confidence = Math.min(states.index.extendedConfidence, states.middle.extendedConfidence, states.ring.curledConfidence, states.pinky.curledConfidence, openness);
    return gesture("peace", confidence);
}
function detectPointing(states) {
    if (states.index.state !== "extended") {
        return null;
    }
    if (states.middle.angle >= 100 || states.ring.angle >= 100 || states.pinky.angle >= 100) {
        return null;
    }
    const strictCurledMiddle = clamp01((100 - states.middle.angle) / 20);
    const strictCurledRing = clamp01((100 - states.ring.angle) / 20);
    const strictCurledPinky = clamp01((100 - states.pinky.angle) / 20);
    const confidence = Math.min(states.index.extendedConfidence, strictCurledMiddle, strictCurledRing, strictCurledPinky);
    return gesture("pointing", confidence);
}
function detectOkSign(states, landmarks) {
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
function detectThumbDirection(states, landmarks) {
    const thumbTip = landmarks[THUMB_TIP];
    const thumbBase = landmarks[THUMB_MCP];
    if (states.thumb.state !== "extended" || states.index.state !== "curled" || states.middle.state !== "curled" || states.ring.state !== "curled" || states.pinky.state !== "curled" || !thumbTip || !thumbBase) {
        return null;
    }
    const vertical = thumbBase.y - thumbTip.y;
    if (vertical > 0.03) {
        return gesture("thumbs_up", Math.min(states.thumb.extendedConfidence, states.index.curledConfidence, clamp01(vertical / 0.15)));
    }
    if (vertical < -0.03) {
        return gesture("thumbs_down", Math.min(states.thumb.extendedConfidence, states.index.curledConfidence, clamp01(-vertical / 0.15)));
    }
    return null;
}
function detectRock(states) {
    if (states.index.state === "extended" && states.middle.state === "curled" && states.ring.state === "curled" && states.pinky.state === "extended") {
        return gesture("rock", Math.min(states.index.extendedConfidence, states.middle.curledConfidence, states.ring.curledConfidence, states.pinky.extendedConfidence));
    }
    return null;
}
function detectFist(states, landmarks) {
    const wrist = landmarks[WRIST];
    if (!wrist) {
        return null;
    }
    const fingerTips = [
        INDEX_TIP,
        MIDDLE_TIP,
        RING_TIP,
        PINKY_TIP
    ];
    const distances = fingerTips.map((idx)=>dist(landmarks[idx], wrist));
    const allTipsNear = distances.every((d)=>d < 0.15);
    if (!allTipsNear) {
        return null;
    }
    const relaxedCurled = [
        states.index.angle,
        states.middle.angle,
        states.ring.angle,
        states.pinky.angle
    ].every((a)=>a < 130);
    if (!relaxedCurled) {
        return null;
    }
    const proximityConfidence = Math.min(...distances.map((d)=>clamp01((0.15 - d) / 0.08)));
    const relaxedCurlConfidence = Math.min(clamp01((130 - states.index.angle) / 40), clamp01((130 - states.middle.angle) / 40), clamp01((130 - states.ring.angle) / 40), clamp01((130 - states.pinky.angle) / 40));
    return gesture("fist", Math.min(proximityConfidence, relaxedCurlConfidence));
}
function detectOpenPalm(states) {
    const allExtended = Object.values(states).every((s)=>s.state === "extended");
    if (!allExtended) {
        return null;
    }
    return gesture("open_palm", Math.min(states.thumb.extendedConfidence, states.index.extendedConfidence, states.middle.extendedConfidence, states.ring.extendedConfidence, states.pinky.extendedConfidence));
}
function classifyGesture(landmarks) {
    if (landmarks.length < 21) {
        return gesture("none", 0);
    }
    const states = {
        thumb: fingerStateFromAngle(landmarks, THUMB_MCP, THUMB_IP, THUMB_TIP),
        index: fingerStateFromAngle(landmarks, INDEX_MCP, INDEX_PIP, INDEX_TIP),
        middle: fingerStateFromAngle(landmarks, MIDDLE_MCP, MIDDLE_PIP, MIDDLE_TIP),
        ring: fingerStateFromAngle(landmarks, RING_MCP, RING_PIP, RING_TIP),
        pinky: fingerStateFromAngle(landmarks, PINKY_MCP, PINKY_PIP, PINKY_TIP)
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
}),
"[project]/lib/handTracker.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectHands",
    ()=>detectHands,
    "initHandTracker",
    ()=>initHandTracker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs [app-ssr] (ecmascript)");
;
const HAND_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
let handLandmarkerPromise = null;
async function createHandLandmarker() {
    const vision = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FilesetResolver"].forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HandLandmarker"].createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: HAND_MODEL_URL,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
}
function initHandTracker() {
    if (!handLandmarkerPromise) {
        handLandmarkerPromise = createHandLandmarker();
    }
    return handLandmarkerPromise;
}
async function detectHands(videoElement, timestampMs) {
    const handLandmarker = await initHandTracker();
    const result = handLandmarker.detectForVideo(videoElement, timestampMs);
    return {
        landmarks: result.landmarks ?? []
    };
}
}),
"[project]/lib/poseTracker.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectPose",
    ()=>detectPose,
    "initPoseTracker",
    ()=>initPoseTracker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs [app-ssr] (ecmascript)");
;
const POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
let poseLandmarkerPromise = null;
async function createPoseLandmarker() {
    const vision = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FilesetResolver"].forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PoseLandmarker"].createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: POSE_MODEL_URL,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
}
function initPoseTracker() {
    if (!poseLandmarkerPromise) {
        poseLandmarkerPromise = createPoseLandmarker();
    }
    return poseLandmarkerPromise;
}
async function detectPose(videoElement, timestampMs) {
    const poseLandmarker = await initPoseTracker();
    const result = poseLandmarker.detectForVideo(videoElement, timestampMs);
    return result.landmarks[0] ?? [];
}
}),
"[project]/workers/depthWorker.ts (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/depthWorker.00f0sacmco7_3.ts" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/components/DepthViewer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DepthViewer",
    ()=>DepthViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$colorize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/colorize.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gestureClassifier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/gestureClassifier.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$handTracker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/handTracker.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$poseTracker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/poseTracker.ts [app-ssr] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("components/DepthViewer.tsx")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
"use client";
;
;
;
;
;
;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const MAX_SERIAL_LINES = 200;
const POSE_INTERVAL_MS = 33;
const HAND_INTERVAL_MS = 33;
const POSE_CONNECTIONS = [
    [
        0,
        1
    ],
    [
        1,
        2
    ],
    [
        2,
        3
    ],
    [
        3,
        7
    ],
    [
        0,
        4
    ],
    [
        4,
        5
    ],
    [
        5,
        6
    ],
    [
        6,
        8
    ],
    [
        9,
        10
    ],
    [
        11,
        12
    ],
    [
        11,
        13
    ],
    [
        13,
        15
    ],
    [
        15,
        17
    ],
    [
        15,
        19
    ],
    [
        15,
        21
    ],
    [
        17,
        19
    ],
    [
        12,
        14
    ],
    [
        14,
        16
    ],
    [
        16,
        18
    ],
    [
        16,
        20
    ],
    [
        16,
        22
    ],
    [
        18,
        20
    ],
    [
        11,
        23
    ],
    [
        12,
        24
    ],
    [
        23,
        24
    ],
    [
        23,
        25
    ],
    [
        24,
        26
    ],
    [
        25,
        27
    ],
    [
        26,
        28
    ],
    [
        27,
        29
    ],
    [
        28,
        30
    ],
    [
        29,
        31
    ],
    [
        30,
        32
    ],
    [
        27,
        31
    ],
    [
        28,
        32
    ]
];
const HAND_CONNECTIONS = [
    [
        0,
        1
    ],
    [
        1,
        2
    ],
    [
        2,
        3
    ],
    [
        3,
        4
    ],
    [
        0,
        5
    ],
    [
        5,
        6
    ],
    [
        6,
        7
    ],
    [
        7,
        8
    ],
    [
        5,
        9
    ],
    [
        9,
        10
    ],
    [
        10,
        11
    ],
    [
        11,
        12
    ],
    [
        9,
        13
    ],
    [
        13,
        14
    ],
    [
        14,
        15
    ],
    [
        15,
        16
    ],
    [
        13,
        17
    ],
    [
        17,
        18
    ],
    [
        18,
        19
    ],
    [
        19,
        20
    ],
    [
        0,
        17
    ]
];
const GESTURE_LEGEND = [
    {
        label: "thumbs_up",
        emoji: "👍",
        text: "Thumbs Up"
    },
    {
        label: "thumbs_down",
        emoji: "👎",
        text: "Thumbs Down"
    },
    {
        label: "peace",
        emoji: "✌️",
        text: "Peace"
    },
    {
        label: "pointing",
        emoji: "☝️",
        text: "Pointing"
    },
    {
        label: "fist",
        emoji: "✊",
        text: "Fist"
    },
    {
        label: "open_palm",
        emoji: "🖐️",
        text: "Open Palm"
    },
    {
        label: "ok_sign",
        emoji: "👌",
        text: "OK"
    },
    {
        label: "rock",
        emoji: "🤘",
        text: "Rock"
    }
];
function formatFps(value) {
    if (!Number.isFinite(value)) {
        return "0.0";
    }
    return value.toFixed(1);
}
function DepthViewer() {
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rgbCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const depthCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const workerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const streamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const busyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const frameIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const lastFpsTsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const frameCounterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const colormapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])("turbo");
    const overlayEnabledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const overlayAlphaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0.5);
    const overlayDepthCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const firstInferenceDoneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const serialContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const latestDepthRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const poseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const poseActiveRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const poseInFlightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lastPoseTsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const handsActiveRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const handsInFlightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lastHandsTsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const handsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const gestureHistoryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const [fps, setFps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [inferenceMs, setInferenceMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isWorkerReady, setIsWorkerReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusText, setStatusText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Initializing camera...");
    const [errorText, setErrorText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [colormap, setColormap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("turbo");
    const [overlayEnabled, setOverlayEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [overlayAlpha, setOverlayAlpha] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.5);
    const [depthStats, setDepthStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [serialOpen, setSerialOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [serialPaused, setSerialPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [serialLines, setSerialLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [poseEnabled, setPoseEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [poseCount, setPoseCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [handsEnabled, setHandsEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [handsCount, setHandsCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [activeGesture, setActiveGesture] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("none");
    const [activeGestureConfidence, setActiveGestureConfidence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [activeHandDepth, setActiveHandDepth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const panelStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            background: "#fbf8f1",
            border: "1px solid rgba(26,26,26,0.15)",
            borderRadius: 0,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
        }), []);
    const stopLoop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);
    const stopCamera = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()){
                track.stop();
            }
            streamRef.current = null;
        }
    }, []);
    const drawOverlay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((rgbCtx)=>{
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
        console.log(`drawing depth overlay, alpha=${overlayAlphaRef.current.toFixed(2)}, dims=${rgbCtx.canvas.width}x${rgbCtx.canvas.height}`);
    }, []);
    const sampleDepthAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((xNorm, yNorm)=>{
        const latestDepth = latestDepthRef.current;
        if (!latestDepth) {
            return Number.NaN;
        }
        const x = Math.max(0, Math.min(latestDepth.width - 1, Math.round(xNorm * (latestDepth.width - 1))));
        const y = Math.max(0, Math.min(latestDepth.height - 1, Math.round(yNorm * (latestDepth.height - 1))));
        return latestDepth.depth[y * latestDepth.width + x];
    }, []);
    const depthToStrokeColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((depth)=>{
        if (!Number.isFinite(depth)) {
            return "rgb(255,255,255)";
        }
        const pixel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$colorize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colorizeDepth"])(new Float32Array([
            Math.max(0, Math.min(1, depth))
        ]), 1, 1, colormapRef.current);
        return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
    }, []);
    const drawPose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((rgbCtx)=>{
        if (!poseActiveRef.current || poseRef.current.length === 0) {
            return;
        }
        const points = poseRef.current;
        for (const [aIdx, bIdx] of POSE_CONNECTIONS){
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
        for (const item of points){
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
    }, [
        depthToStrokeColor
    ]);
    const drawHands = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((rgbCtx)=>{
        if (!handsActiveRef.current || handsRef.current.length === 0) {
            return;
        }
        for (const hand of handsRef.current){
            for (const [aIdx, bIdx] of HAND_CONNECTIONS){
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
            for (const point of hand.points){
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
    }, [
        depthToStrokeColor
    ]);
    const addSerialLine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((line)=>{
        setSerialLines((prev)=>{
            const next = [
                ...prev,
                line
            ];
            if (next.length > MAX_SERIAL_LINES) {
                return next.slice(next.length - MAX_SERIAL_LINES);
            }
            return next;
        });
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        colormapRef.current = colormap;
    }, [
        colormap
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        overlayEnabledRef.current = overlayEnabled;
    }, [
        overlayEnabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        overlayAlphaRef.current = overlayAlpha;
    }, [
        overlayAlpha
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        poseActiveRef.current = poseEnabled;
        if (poseEnabled) {
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$poseTracker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initPoseTracker"])().catch((error)=>{
                const message = error instanceof Error ? error.message : "Pose tracker failed to initialize";
                setErrorText(message);
            });
        } else {
            poseRef.current = [];
        }
    }, [
        poseEnabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        handsActiveRef.current = handsEnabled;
        if (handsEnabled) {
            void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$handTracker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initHandTracker"])().catch((error)=>{
                const message = error instanceof Error ? error.message : "Hand tracker failed to initialize";
                setErrorText(message);
            });
        } else {
            handsRef.current = [];
        }
    }, [
        handsEnabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!serialOpen || !serialContainerRef.current) {
            return;
        }
        serialContainerRef.current.scrollTop = serialContainerRef.current.scrollHeight;
    }, [
        serialLines,
        serialOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const worker = new Worker(new __turbopack_context__.U(__turbopack_context__.r("[project]/workers/depthWorker.ts (static in ecmascript, tag client)")), {
            type: "module"
        });
        workerRef.current = worker;
        worker.onmessage = (event)=>{
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
                const depthCtx = depthCanvas.getContext("2d", {
                    willReadFrequently: false
                });
                if (!depthCtx) {
                    busyRef.current = false;
                    return;
                }
                const pixels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$colorize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["colorizeDepth"])(message.depth, message.width, message.height, colormapRef.current);
                const image = depthCtx.createImageData(message.width, message.height);
                image.data.set(pixels);
                depthCtx.putImageData(image, 0, 0);
                if (!overlayDepthCanvasRef.current) {
                    overlayDepthCanvasRef.current = document.createElement("canvas");
                }
                const overlayCanvas = overlayDepthCanvasRef.current;
                overlayCanvas.width = message.width;
                overlayCanvas.height = message.height;
                const overlayCtx = overlayCanvas.getContext("2d", {
                    willReadFrequently: false
                });
                if (overlayCtx) {
                    overlayCtx.putImageData(image, 0, 0);
                }
                setDepthStats({
                    min: message.depthMin,
                    max: message.depthMax,
                    mean: message.depthMean
                });
                latestDepthRef.current = {
                    depth: message.depth,
                    width: message.width,
                    height: message.height
                };
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
        const initMessage = {
            type: "init"
        };
        worker.postMessage(initMessage);
        return ()=>{
            worker.terminate();
            workerRef.current = null;
        };
    }, [
        addSerialLine,
        serialPaused
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        const start = async ()=>{
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: {
                            ideal: CANVAS_WIDTH
                        },
                        height: {
                            ideal: CANVAS_HEIGHT
                        },
                        facingMode: "user"
                    },
                    audio: false
                });
                if (!mounted) {
                    for (const track of stream.getTracks()){
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
            } catch (error) {
                const message = error instanceof Error ? error.message : "Camera permission denied or unavailable";
                setErrorText(message);
                setStatusText("Camera unavailable");
            }
        };
        void start();
        return ()=>{
            mounted = false;
            stopLoop();
            stopCamera();
        };
    }, [
        stopCamera,
        stopLoop
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const draw = ()=>{
            const video = videoRef.current;
            const rgbCanvas = rgbCanvasRef.current;
            const worker = workerRef.current;
            const now = performance.now();
            if (video && rgbCanvas && video.readyState >= 2) {
                const rgbCtx = rgbCanvas.getContext("2d", {
                    willReadFrequently: true
                });
                if (rgbCtx) {
                    rgbCtx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                    drawOverlay(rgbCtx);
                    drawPose(rgbCtx);
                    drawHands(rgbCtx);
                    if (isWorkerReady && worker && !busyRef.current) {
                        const frame = rgbCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                        busyRef.current = true;
                        frameIdRef.current += 1;
                        const msg = {
                            type: "frame",
                            frameId: frameIdRef.current,
                            width: CANVAS_WIDTH,
                            height: CANVAS_HEIGHT,
                            rgb: frame.data
                        };
                        worker.postMessage(msg);
                    }
                    if (poseActiveRef.current && !poseInFlightRef.current && now - lastPoseTsRef.current >= POSE_INTERVAL_MS) {
                        poseInFlightRef.current = true;
                        lastPoseTsRef.current = now;
                        void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$poseTracker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["detectPose"])(video, now).then((landmarks)=>{
                            const fused = landmarks.map((landmark)=>({
                                    landmark,
                                    depth: sampleDepthAt(landmark.x, landmark.y)
                                }));
                            poseRef.current = fused;
                            setPoseCount(fused.length);
                        }).catch((error)=>{
                            const message = error instanceof Error ? error.message : "Pose detection failed";
                            setErrorText(message);
                        }).finally(()=>{
                            poseInFlightRef.current = false;
                        });
                    }
                    if (handsActiveRef.current && !handsInFlightRef.current && now - lastHandsTsRef.current >= HAND_INTERVAL_MS) {
                        handsInFlightRef.current = true;
                        lastHandsTsRef.current = now;
                        void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$handTracker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["detectHands"])(video, now).then((result)=>{
                            const fusedHands = result.landmarks.map((handLandmarks)=>{
                                const points = handLandmarks.map((landmark)=>({
                                        landmark,
                                        depth: sampleDepthAt(landmark.x, landmark.y)
                                    }));
                                const avg = points.reduce((acc, p)=>acc + (Number.isFinite(p.depth) ? p.depth : 0), 0) / Math.max(1, points.length);
                                return {
                                    points,
                                    averageDepth: avg,
                                    gesture: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$gestureClassifier$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classifyGesture"])(handLandmarks)
                                };
                            });
                            handsRef.current = fusedHands;
                            setHandsCount(fusedHands.length);
                            const bestGesture = fusedHands.map((h)=>h.gesture).sort((a, b)=>b.confidence - a.confidence).find((g)=>g.label !== "none") ?? {
                                label: "none",
                                confidence: 0
                            };
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
                        }).catch((error)=>{
                            const message = error instanceof Error ? error.message : "Hand detection failed";
                            setErrorText(message);
                        }).finally(()=>{
                            handsInFlightRef.current = false;
                        });
                    }
                    frameCounterRef.current += 1;
                    const elapsed = now - lastFpsTsRef.current;
                    if (elapsed >= 500) {
                        const nextFps = frameCounterRef.current * 1000 / elapsed;
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
    }, [
        drawHands,
        drawOverlay,
        drawPose,
        isWorkerReady,
        sampleDepthAt,
        stopLoop
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            minHeight: "100vh",
            padding: "48px 28px 72px",
            background: "#f4efe6"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            style: {
                maxWidth: 1180,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 20
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    style: {
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: 14
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 6
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    style: {
                                        margin: 0,
                                        fontSize: 48,
                                        fontWeight: 400,
                                        lineHeight: 1,
                                        letterSpacing: "0.01em"
                                    },
                                    children: "Depthfield"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 644,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        fontSize: 17,
                                        fontStyle: "italic",
                                        color: "rgba(26,26,26,0.72)"
                                    },
                                    children: "Real-time monocular depth estimation in the browser"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 655,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 643,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                                fontSize: 13,
                                color: "rgba(26,26,26,0.68)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "fps ",
                                        formatFps(fps)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 676,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "inf ",
                                        inferenceMs.toFixed(1),
                                        "ms"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 677,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 666,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 642,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontStyle: "italic",
                        color: "rgba(26,26,26,0.58)",
                        fontSize: 16
                    },
                    children: statusText
                }, void 0, false, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 680,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap"
                    },
                    children: [
                        [
                            "turbo",
                            "inferno",
                            "grayscale"
                        ].map((name)=>{
                            const active = colormap === name;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: `control-button ${active ? "active" : ""}`,
                                onClick: ()=>setColormap(name),
                                children: name[0].toUpperCase() + name.slice(1)
                            }, name, false, {
                                fileName: "[project]/components/DepthViewer.tsx",
                                lineNumber: 686,
                                columnNumber: 15
                            }, this);
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: `control-button ${overlayEnabled ? "active" : ""}`,
                            onClick: ()=>setOverlayEnabled((prev)=>!prev),
                            children: [
                                "Overlay: ",
                                overlayEnabled ? "On" : "Off"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 697,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: `control-button ${poseEnabled ? "active" : ""}`,
                            onClick: ()=>setPoseEnabled((prev)=>!prev),
                            children: [
                                "Pose: ",
                                poseEnabled ? "On" : "Off"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 705,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: `control-button ${handsEnabled ? "active" : ""}`,
                            onClick: ()=>setHandsEnabled((prev)=>!prev),
                            children: [
                                "Hands: ",
                                handsEnabled ? "On" : "Off"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 713,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "#1a1a1a",
                                fontSize: 13,
                                fontStyle: "italic"
                            },
                            children: [
                                "Overlay Alpha",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: 0.1,
                                    max: 0.9,
                                    step: 0.05,
                                    value: overlayAlpha,
                                    onChange: (event)=>setOverlayAlpha(Number(event.target.value)),
                                    style: {
                                        width: 130,
                                        accentColor: "#3a5fff"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 732,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace"
                                    },
                                    children: overlayAlpha.toFixed(2)
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 741,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 721,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: `control-button ${serialOpen ? "active" : ""}`,
                            onClick: ()=>setSerialOpen((prev)=>!prev),
                            children: "Serial Monitor"
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 746,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 682,
                    columnNumber: 9
                }, this),
                errorText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#c1432d",
                        margin: 0,
                        fontStyle: "italic"
                    },
                    children: [
                        "Error: ",
                        errorText
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 756,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: 20
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: panelStyle,
                            className: "canvas-panel",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: 12,
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        fontWeight: 400
                                    },
                                    children: overlayEnabled ? "RGB + Depth Overlay" : "RGB Input"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 761,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: rgbCanvasRef,
                                            width: CANVAS_WIDTH,
                                            height: CANVAS_HEIGHT,
                                            style: {
                                                width: "100%",
                                                aspectRatio: "640 / 360",
                                                height: "auto",
                                                objectFit: "fill",
                                                borderRadius: 0,
                                                background: "#0f0f0f"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 772,
                                            columnNumber: 15
                                        }, this),
                                        overlayEnabled && depthStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
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
                                                border: "1px solid rgba(26,26,26,0.15)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "min: ",
                                                        depthStats.min.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 801,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 802,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 803,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "range: ",
                                                        (depthStats.max - depthStats.min).toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 804,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 786,
                                            columnNumber: 17
                                        }, this) : null,
                                        poseEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
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
                                                border: "1px solid rgba(26,26,26,0.15)"
                                            },
                                            children: [
                                                "Pose: ",
                                                poseCount,
                                                " landmarks | Hands: ",
                                                handsCount,
                                                " detected | Gesture: ",
                                                activeGesture,
                                                " (",
                                                activeGestureConfidence.toFixed(2),
                                                ") | Hand depth: ",
                                                activeHandDepth?.toFixed(2) ?? "n/a",
                                                "m"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 808,
                                            columnNumber: 17
                                        }, this) : null,
                                        handsEnabled && activeGesture !== "none" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
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
                                                border: "1px solid rgba(26,26,26,0.15)"
                                            },
                                            children: [
                                                activeGesture === "thumbs_up" ? "👍 THUMBS UP" : activeGesture === "thumbs_down" ? "👎 THUMBS DOWN" : activeGesture === "peace" ? "✌️ PEACE" : activeGesture === "pointing" ? "☝️ POINTING" : activeGesture === "fist" ? "✊ FIST" : activeGesture === "open_palm" ? "🖐️ OPEN PALM" : activeGesture === "ok_sign" ? "👌 OK SIGN" : "🤘 ROCK",
                                                " ",
                                                "(",
                                                activeGestureConfidence.toFixed(2),
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 828,
                                            columnNumber: 17
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 771,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginTop: 6,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontStyle: "italic",
                                                color: "#3a5fff",
                                                fontSize: 14
                                            },
                                            children: "gestures recognized →"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 868,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 16,
                                                flexWrap: "nowrap"
                                            },
                                            children: GESTURE_LEGEND.map((item)=>{
                                                const active = activeGesture === item.label;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `gesture-item ${active ? "active" : ""}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "emoji",
                                                            children: item.emoji
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/DepthViewer.tsx",
                                                            lineNumber: 874,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "label",
                                                            children: item.text
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/DepthViewer.tsx",
                                                            lineNumber: 875,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, item.label, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 873,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 869,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 867,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 760,
                            columnNumber: 11
                        }, this),
                        !overlayEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: panelStyle,
                            className: "canvas-panel",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: 12,
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        fontWeight: 400
                                    },
                                    children: "Depth Output"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 885,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: depthCanvasRef,
                                            width: 256,
                                            height: 256,
                                            style: {
                                                width: "100%",
                                                aspectRatio: "640 / 360",
                                                height: "auto",
                                                objectFit: "fill",
                                                borderRadius: 0,
                                                background: "#0f0f0f"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 896,
                                            columnNumber: 17
                                        }, this),
                                        depthStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
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
                                                border: "1px solid rgba(26,26,26,0.15)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "min: ",
                                                        depthStats.min.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 925,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 926,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 927,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "range: ",
                                                        (depthStats.max - depthStats.min).toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 928,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 910,
                                            columnNumber: 19
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 895,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 884,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                            ref: depthCanvasRef,
                            width: 256,
                            height: 256,
                            style: {
                                display: "none"
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 934,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 759,
                    columnNumber: 9
                }, this),
                serialOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        ...panelStyle,
                        padding: 0,
                        overflow: "hidden",
                        maxHeight: 260,
                        borderColor: "#1a1a1a"
                    },
                    className: "canvas-panel",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 12px",
                                borderBottom: "1px solid rgba(26,26,26,0.15)",
                                background: "#141414",
                                color: "#d8d8d8"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: 13,
                                        fontWeight: 400,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase"
                                    },
                                    children: "Serial Monitor"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 960,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        gap: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: `control-button ${serialPaused ? "active" : ""}`,
                                            onClick: ()=>setSerialPaused((prev)=>!prev),
                                            children: serialPaused ? "Resume" : "Pause"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 964,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "control-button",
                                            onClick: ()=>setSerialLines([]),
                                            children: "Clear"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 971,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 963,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 949,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: serialContainerRef,
                            style: {
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
                                backgroundImage: "repeating-linear-gradient(0deg, rgba(51,255,102,0.05) 0px, rgba(51,255,102,0.05) 1px, transparent 2px, transparent 4px)"
                            },
                            children: serialLines.length === 0 ? "No frame telemetry yet." : serialLines.join("\n")
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 976,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 939,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: "https://www.izyanali.com/",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "designed-by-izy",
                    style: {
                        marginTop: 6,
                        alignSelf: "flex-end",
                        fontStyle: "italic",
                        fontSize: 14,
                        letterSpacing: "0.02em"
                    },
                    children: "designed by izy"
                }, void 0, false, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 998,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                    ref: videoRef,
                    playsInline: true,
                    muted: true,
                    style: {
                        display: "none"
                    }
                }, void 0, false, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 1014,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/DepthViewer.tsx",
            lineNumber: 641,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/DepthViewer.tsx",
        lineNumber: 634,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_0db0_he._.js.map