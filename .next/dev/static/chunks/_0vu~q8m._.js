(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/colorize.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/poseTracker.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectPose",
    ()=>detectPose,
    "initPoseTracker",
    ()=>initPoseTracker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs [app-client] (ecmascript)");
;
const POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
let poseLandmarkerPromise = null;
async function createPoseLandmarker() {
    const vision = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FilesetResolver"].forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PoseLandmarker"].createFromOptions(vision, {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workers/depthWorker.ts (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.q("/_next/static/media/depthWorker.00f0sacmco7_3.ts");}),
"[project]/workers/depthWorker.ts [app-client] (ecmascript, worker loader)", ((__turbopack_context__) => {

__turbopack_context__.v(function(Ctor, opts) {
    return __turbopack_context__.b(Ctor, "static/chunks/turbopack-worker-[client-fs]__next_static_chunks_12ee_mp._.js", ["static/chunks/node_modules_onnxruntime-web_dist_0rrkpzn._.js","static/chunks/_0~85u8i._.js","static/chunks/workers_depthWorker_ts_0u_uju3._.js","static/chunks/turbopack-workers_depthWorker_ts_07_dxt1._.js"], opts);
});
}),
"[project]/components/DepthViewer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DepthViewer",
    ()=>DepthViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$colorize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/colorize.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$poseTracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/poseTracker.ts [app-client] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("components/DepthViewer.tsx")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const MAX_SERIAL_LINES = 200;
const POSE_INTERVAL_MS = 33;
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
function formatFps(value) {
    if (!Number.isFinite(value)) {
        return "0.0";
    }
    return value.toFixed(1);
}
function DepthViewer() {
    _s();
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rgbCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const depthCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const workerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const streamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const busyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const frameIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const lastFpsTsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const frameCounterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const colormapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])("turbo");
    const overlayEnabledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const overlayAlphaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0.5);
    const overlayDepthCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const firstInferenceDoneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const serialContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const latestDepthRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const poseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const poseActiveRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const poseInFlightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lastPoseTsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const [fps, setFps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [inferenceMs, setInferenceMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isWorkerReady, setIsWorkerReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusText, setStatusText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Initializing camera...");
    const [errorText, setErrorText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [colormap, setColormap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("turbo");
    const [overlayEnabled, setOverlayEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [overlayAlpha, setOverlayAlpha] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.5);
    const [depthStats, setDepthStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [serialOpen, setSerialOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [serialPaused, setSerialPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [serialLines, setSerialLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [poseEnabled, setPoseEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [poseCount, setPoseCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const panelStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DepthViewer.useMemo[panelStyle]": ()=>({
                background: "#111827",
                border: "1px solid #293244",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8
            })
    }["DepthViewer.useMemo[panelStyle]"], []);
    const stopLoop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DepthViewer.useCallback[stopLoop]": ()=>{
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }
    }["DepthViewer.useCallback[stopLoop]"], []);
    const stopCamera = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DepthViewer.useCallback[stopCamera]": ()=>{
            if (streamRef.current) {
                for (const track of streamRef.current.getTracks()){
                    track.stop();
                }
                streamRef.current = null;
            }
        }
    }["DepthViewer.useCallback[stopCamera]"], []);
    const drawOverlay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DepthViewer.useCallback[drawOverlay]": (rgbCtx)=>{
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
        }
    }["DepthViewer.useCallback[drawOverlay]"], []);
    const sampleDepthAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DepthViewer.useCallback[sampleDepthAt]": (xNorm, yNorm)=>{
            const latestDepth = latestDepthRef.current;
            if (!latestDepth) {
                return Number.NaN;
            }
            const x = Math.max(0, Math.min(latestDepth.width - 1, Math.round(xNorm * (latestDepth.width - 1))));
            const y = Math.max(0, Math.min(latestDepth.height - 1, Math.round(yNorm * (latestDepth.height - 1))));
            return latestDepth.depth[y * latestDepth.width + x];
        }
    }["DepthViewer.useCallback[sampleDepthAt]"], []);
    const depthToStrokeColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DepthViewer.useCallback[depthToStrokeColor]": (depth)=>{
            if (!Number.isFinite(depth)) {
                return "rgb(255,255,255)";
            }
            const pixel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$colorize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colorizeDepth"])(new Float32Array([
                Math.max(0, Math.min(1, depth))
            ]), 1, 1, colormapRef.current);
            return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        }
    }["DepthViewer.useCallback[depthToStrokeColor]"], []);
    const drawPose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DepthViewer.useCallback[drawPose]": (rgbCtx)=>{
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
        }
    }["DepthViewer.useCallback[drawPose]"], [
        depthToStrokeColor
    ]);
    const addSerialLine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DepthViewer.useCallback[addSerialLine]": (line)=>{
            setSerialLines({
                "DepthViewer.useCallback[addSerialLine]": (prev)=>{
                    const next = [
                        ...prev,
                        line
                    ];
                    if (next.length > MAX_SERIAL_LINES) {
                        return next.slice(next.length - MAX_SERIAL_LINES);
                    }
                    return next;
                }
            }["DepthViewer.useCallback[addSerialLine]"]);
        }
    }["DepthViewer.useCallback[addSerialLine]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            colormapRef.current = colormap;
        }
    }["DepthViewer.useEffect"], [
        colormap
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            overlayEnabledRef.current = overlayEnabled;
        }
    }["DepthViewer.useEffect"], [
        overlayEnabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            overlayAlphaRef.current = overlayAlpha;
        }
    }["DepthViewer.useEffect"], [
        overlayAlpha
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            poseActiveRef.current = poseEnabled;
            if (poseEnabled) {
                void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$poseTracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initPoseTracker"])().catch({
                    "DepthViewer.useEffect": (error)=>{
                        const message = error instanceof Error ? error.message : "Pose tracker failed to initialize";
                        setErrorText(message);
                    }
                }["DepthViewer.useEffect"]);
            } else {
                poseRef.current = [];
            }
        }
    }["DepthViewer.useEffect"], [
        poseEnabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            if (!serialOpen || !serialContainerRef.current) {
                return;
            }
            serialContainerRef.current.scrollTop = serialContainerRef.current.scrollHeight;
        }
    }["DepthViewer.useEffect"], [
        serialLines,
        serialOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            const worker = __turbopack_context__.r("[project]/workers/depthWorker.ts [app-client] (ecmascript, worker loader)")(Worker, {
                type: "module"
            });
            workerRef.current = worker;
            worker.onmessage = ({
                "DepthViewer.useEffect": (event)=>{
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
                        const pixels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$colorize$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["colorizeDepth"])(message.depth, message.width, message.height, colormapRef.current);
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
                        if (!serialPaused) {
                            const ts = new Date().toISOString().slice(11, 23);
                            const line = `[${ts}] frame ${message.frameId} | inf ${message.inferenceMs.toFixed(1)}ms | depth min=${message.depthMin.toFixed(2)} max=${message.depthMax.toFixed(2)} mean=${message.depthMean.toFixed(2)}${poseSummary} | tensor ${message.inputTensorShape.join("x")} -> ${message.outputTensorShape.join("x")}`;
                            addSerialLine(line);
                        }
                        if (!firstInferenceDoneRef.current) {
                            firstInferenceDoneRef.current = true;
                            setStatusText("Model ready. Streaming depth...");
                        }
                        setInferenceMs(message.inferenceMs);
                        busyRef.current = false;
                    }
                }
            })["DepthViewer.useEffect"];
            const initMessage = {
                type: "init"
            };
            worker.postMessage(initMessage);
            return ({
                "DepthViewer.useEffect": ()=>{
                    worker.terminate();
                    workerRef.current = null;
                }
            })["DepthViewer.useEffect"];
        }
    }["DepthViewer.useEffect"], [
        addSerialLine,
        serialPaused
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            let mounted = true;
            const start = {
                "DepthViewer.useEffect.start": async ()=>{
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
                }
            }["DepthViewer.useEffect.start"];
            void start();
            return ({
                "DepthViewer.useEffect": ()=>{
                    mounted = false;
                    stopLoop();
                    stopCamera();
                }
            })["DepthViewer.useEffect"];
        }
    }["DepthViewer.useEffect"], [
        stopCamera,
        stopLoop
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DepthViewer.useEffect": ()=>{
            const draw = {
                "DepthViewer.useEffect.draw": ()=>{
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
                                void (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$poseTracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectPose"])(video, now).then({
                                    "DepthViewer.useEffect.draw": (landmarks)=>{
                                        const fused = landmarks.map({
                                            "DepthViewer.useEffect.draw.fused": (landmark)=>({
                                                    landmark,
                                                    depth: sampleDepthAt(landmark.x, landmark.y)
                                                })
                                        }["DepthViewer.useEffect.draw.fused"]);
                                        poseRef.current = fused;
                                        setPoseCount(fused.length);
                                    }
                                }["DepthViewer.useEffect.draw"]).catch({
                                    "DepthViewer.useEffect.draw": (error)=>{
                                        const message = error instanceof Error ? error.message : "Pose detection failed";
                                        setErrorText(message);
                                    }
                                }["DepthViewer.useEffect.draw"]).finally({
                                    "DepthViewer.useEffect.draw": ()=>{
                                        poseInFlightRef.current = false;
                                    }
                                }["DepthViewer.useEffect.draw"]);
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
                }
            }["DepthViewer.useEffect.draw"];
            lastFpsTsRef.current = performance.now();
            rafRef.current = requestAnimationFrame(draw);
            return stopLoop;
        }
    }["DepthViewer.useEffect"], [
        drawOverlay,
        drawPose,
        isWorkerReady,
        sampleDepthAt,
        stopLoop
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            minHeight: "100vh",
            padding: 24,
            background: "radial-gradient(circle at top, #111827 0%, #05070d 60%)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            style: {
                maxWidth: 1360,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 16
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    style: {
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                margin: 0,
                                fontSize: 28,
                                fontWeight: 700
                            },
                            children: "Browser Depth Visualizer"
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 484,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                padding: "4px 10px",
                                borderRadius: 999,
                                background: "#1f2937",
                                color: "#93c5fd"
                            },
                            children: [
                                "FPS: ",
                                formatFps(fps)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 485,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                padding: "4px 10px",
                                borderRadius: 999,
                                background: "#1f2937",
                                color: "#c4b5fd"
                            },
                            children: [
                                "Inference: ",
                                inferenceMs.toFixed(1),
                                " ms"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 488,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: "#9ca3af"
                            },
                            children: statusText
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 491,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 483,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setColormap(name),
                                style: {
                                    border: `1px solid ${active ? "#60a5fa" : "#374151"}`,
                                    background: active ? "#1e3a8a" : "#111827",
                                    color: "#e5e7eb",
                                    borderRadius: 10,
                                    padding: "8px 12px",
                                    cursor: "pointer"
                                },
                                children: name[0].toUpperCase() + name.slice(1)
                            }, name, false, {
                                fileName: "[project]/components/DepthViewer.tsx",
                                lineNumber: 498,
                                columnNumber: 15
                            }, this);
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setOverlayEnabled((prev)=>!prev),
                            style: {
                                border: `1px solid ${overlayEnabled ? "#34d399" : "#374151"}`,
                                background: overlayEnabled ? "#064e3b" : "#111827",
                                color: "#e5e7eb",
                                borderRadius: 10,
                                padding: "8px 12px",
                                cursor: "pointer"
                            },
                            children: [
                                "Overlay: ",
                                overlayEnabled ? "On" : "Off"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 516,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setPoseEnabled((prev)=>!prev),
                            style: {
                                border: `1px solid ${poseEnabled ? "#a78bfa" : "#374151"}`,
                                background: poseEnabled ? "#4c1d95" : "#111827",
                                color: "#e5e7eb",
                                borderRadius: 10,
                                padding: "8px 12px",
                                cursor: "pointer"
                            },
                            children: [
                                "Pose: ",
                                poseEnabled ? "On" : "Off"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 531,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "#cbd5e1",
                                fontSize: 12
                            },
                            children: [
                                "Overlay Alpha",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: 0.1,
                                    max: 0.9,
                                    step: 0.05,
                                    value: overlayAlpha,
                                    onChange: (event)=>setOverlayAlpha(Number(event.target.value)),
                                    style: {
                                        width: 130
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 556,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: overlayAlpha.toFixed(2)
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 565,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 546,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setSerialOpen((prev)=>!prev),
                            style: {
                                border: `1px solid ${serialOpen ? "#f59e0b" : "#374151"}`,
                                background: serialOpen ? "#78350f" : "#111827",
                                color: "#e5e7eb",
                                borderRadius: 10,
                                padding: "8px 12px",
                                cursor: "pointer"
                            },
                            children: "Serial Monitor"
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 568,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 494,
                    columnNumber: 9
                }, this),
                errorText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#fca5a5",
                        margin: 0
                    },
                    children: [
                        "Error: ",
                        errorText
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 585,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: 16
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: panelStyle,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: overlayEnabled ? "RGB + Depth Overlay" : "RGB Input"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 590,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: rgbCanvasRef,
                                            width: CANVAS_WIDTH,
                                            height: CANVAS_HEIGHT,
                                            style: {
                                                width: "100%",
                                                height: "auto",
                                                borderRadius: 10,
                                                background: "#030712"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 592,
                                            columnNumber: 15
                                        }, this),
                                        overlayEnabled && depthStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                padding: "6px 8px",
                                                borderRadius: 8,
                                                background: "rgba(2, 6, 23, 0.7)",
                                                color: "#e2e8f0",
                                                fontSize: 11,
                                                lineHeight: 1.4,
                                                fontFamily: "\"Courier New\", Courier, monospace"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "min: ",
                                                        depthStats.min.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 613,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 614,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 615,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "range: ",
                                                        (depthStats.max - depthStats.min).toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 616,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 599,
                                            columnNumber: 17
                                        }, this) : null,
                                        poseEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: "absolute",
                                                top: 10,
                                                left: 10,
                                                padding: "4px 8px",
                                                borderRadius: 8,
                                                background: "rgba(2, 6, 23, 0.65)",
                                                color: "#ddd6fe",
                                                fontSize: 11,
                                                lineHeight: 1.3,
                                                fontFamily: "\"Courier New\", Courier, monospace"
                                            },
                                            children: [
                                                "Pose: ",
                                                poseCount,
                                                " landmarks detected"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 620,
                                            columnNumber: 17
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 591,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 589,
                            columnNumber: 11
                        }, this),
                        !overlayEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: panelStyle,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Depth Output"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 642,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: depthCanvasRef,
                                            width: 256,
                                            height: 256,
                                            style: {
                                                width: "100%",
                                                height: "auto",
                                                borderRadius: 10,
                                                background: "#030712",
                                                imageRendering: "pixelated"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 644,
                                            columnNumber: 17
                                        }, this),
                                        depthStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                padding: "6px 8px",
                                                borderRadius: 8,
                                                background: "rgba(2, 6, 23, 0.7)",
                                                color: "#e2e8f0",
                                                fontSize: 11,
                                                lineHeight: 1.4,
                                                fontFamily: "\"Courier New\", Courier, monospace"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "min: ",
                                                        depthStats.min.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 671,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 672,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 673,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "range: ",
                                                        (depthStats.max - depthStats.min).toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 674,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 657,
                                            columnNumber: 19
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 643,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 641,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                            ref: depthCanvasRef,
                            width: 256,
                            height: 256,
                            style: {
                                display: "none"
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 680,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 588,
                    columnNumber: 9
                }, this),
                serialOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        ...panelStyle,
                        padding: 0,
                        overflow: "hidden",
                        maxHeight: 260
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 12px",
                                borderBottom: "1px solid #293244",
                                background: "#0b1220"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: 13
                                    },
                                    children: "Serial Monitor"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 703,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        gap: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setSerialPaused((prev)=>!prev),
                                            style: {
                                                border: "1px solid #374151",
                                                background: serialPaused ? "#1e3a8a" : "#111827",
                                                color: "#e5e7eb",
                                                borderRadius: 8,
                                                padding: "6px 10px",
                                                cursor: "pointer",
                                                fontSize: 12
                                            },
                                            children: serialPaused ? "Resume" : "Pause"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 705,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setSerialLines([]),
                                            style: {
                                                border: "1px solid #374151",
                                                background: "#111827",
                                                color: "#e5e7eb",
                                                borderRadius: 8,
                                                padding: "6px 10px",
                                                cursor: "pointer",
                                                fontSize: 12
                                            },
                                            children: "Clear"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 720,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 704,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 693,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: serialContainerRef,
                            style: {
                                padding: "10px 12px",
                                overflowY: "auto",
                                background: "#05070d",
                                color: "#9ae6b4",
                                fontSize: 12,
                                fontFamily: "\"Courier New\", Courier, monospace",
                                lineHeight: 1.5,
                                whiteSpace: "pre"
                            },
                            children: serialLines.length === 0 ? "No frame telemetry yet." : serialLines.join("\n")
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 737,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 685,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                    ref: videoRef,
                    playsInline: true,
                    muted: true,
                    style: {
                        display: "none"
                    }
                }, void 0, false, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 755,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/DepthViewer.tsx",
            lineNumber: 482,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/DepthViewer.tsx",
        lineNumber: 475,
        columnNumber: 5
    }, this);
}
_s(DepthViewer, "ljvZBaEf/17mobNyLasvSpc+r0k=");
_c = DepthViewer;
var _c;
__turbopack_context__.k.register(_c, "DepthViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0vu~q8m._.js.map