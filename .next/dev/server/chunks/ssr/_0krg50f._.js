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
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const MAX_SERIAL_LINES = 200;
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
    const panelStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            background: "#111827",
            border: "1px solid #293244",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8
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
                if (!serialPaused) {
                    const ts = new Date().toISOString().slice(11, 23);
                    const line = `[${ts}] frame ${message.frameId} | inference ${message.inferenceMs.toFixed(1)}ms | depth min=${message.depthMin.toFixed(2)} max=${message.depthMax.toFixed(2)} mean=${message.depthMean.toFixed(2)} | tensor ${message.inputTensorShape.join("x")} -> ${message.outputTensorShape.join("x")}`;
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
            if (video && rgbCanvas && video.readyState >= 2) {
                const rgbCtx = rgbCanvas.getContext("2d", {
                    willReadFrequently: true
                });
                if (rgbCtx) {
                    rgbCtx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                    drawOverlay(rgbCtx);
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
                    frameCounterRef.current += 1;
                    const now = performance.now();
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
        drawOverlay,
        isWorkerReady,
        stopLoop
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            minHeight: "100vh",
            padding: 24,
            background: "radial-gradient(circle at top, #111827 0%, #05070d 60%)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            style: {
                maxWidth: 1360,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 16
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    style: {
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                margin: 0,
                                fontSize: 28,
                                fontWeight: 700
                            },
                            children: "Browser Depth Visualizer"
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 328,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            lineNumber: 329,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            lineNumber: 332,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: "#9ca3af"
                            },
                            children: statusText
                        }, void 0, false, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 335,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 327,
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
                                lineNumber: 342,
                                columnNumber: 15
                            }, this);
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                            lineNumber: 360,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "#cbd5e1",
                                fontSize: 12
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
                                        width: 130
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 385,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: overlayAlpha.toFixed(2)
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 394,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 375,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                            lineNumber: 397,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 338,
                    columnNumber: 9
                }, this),
                errorText ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                    lineNumber: 414,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: 16
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: panelStyle,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: overlayEnabled ? "RGB + Depth Overlay" : "RGB Input"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 419,
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
                                                height: "auto",
                                                borderRadius: 10,
                                                background: "#030712"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 421,
                                            columnNumber: 15
                                        }, this),
                                        overlayEnabled && depthStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "min: ",
                                                        depthStats.min.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 442,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 443,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 444,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "range: ",
                                                        (depthStats.max - depthStats.min).toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 445,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 428,
                                            columnNumber: 17
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 420,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 418,
                            columnNumber: 11
                        }, this),
                        !overlayEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: panelStyle,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Depth Output"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 453,
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
                                                height: "auto",
                                                borderRadius: 10,
                                                background: "#030712",
                                                imageRendering: "pixelated"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 455,
                                            columnNumber: 17
                                        }, this),
                                        depthStats ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "min: ",
                                                        depthStats.min.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 482,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 483,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 484,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "range: ",
                                                        (depthStats.max - depthStats.min).toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 485,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DepthViewer.tsx",
                                            lineNumber: 468,
                                            columnNumber: 19
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 454,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 452,
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
                            lineNumber: 491,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 417,
                    columnNumber: 9
                }, this),
                serialOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        ...panelStyle,
                        padding: 0,
                        overflow: "hidden",
                        maxHeight: 260
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 12px",
                                borderBottom: "1px solid #293244",
                                background: "#0b1220"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: 13
                                    },
                                    children: "Serial Monitor"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 514,
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
                                            lineNumber: 516,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                            lineNumber: 531,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 515,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DepthViewer.tsx",
                            lineNumber: 504,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            lineNumber: 548,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 496,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                    ref: videoRef,
                    playsInline: true,
                    muted: true,
                    style: {
                        display: "none"
                    }
                }, void 0, false, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 566,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/DepthViewer.tsx",
            lineNumber: 326,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/DepthViewer.tsx",
        lineNumber: 319,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_0krg50f._.js.map