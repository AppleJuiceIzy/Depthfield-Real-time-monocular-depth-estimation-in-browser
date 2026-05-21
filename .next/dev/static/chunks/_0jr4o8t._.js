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
                }
            }["DepthViewer.useEffect.draw"];
            lastFpsTsRef.current = performance.now();
            rafRef.current = requestAnimationFrame(draw);
            return stopLoop;
        }
    }["DepthViewer.useEffect"], [
        drawOverlay,
        isWorkerReady,
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
                            lineNumber: 328,
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
                            lineNumber: 329,
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
                            lineNumber: 332,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                lineNumber: 342,
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
                            lineNumber: 360,
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
                                    lineNumber: 385,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            lineNumber: 397,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 338,
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
                    lineNumber: 414,
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
                                    lineNumber: 419,
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
                                            lineNumber: 421,
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
                                                    lineNumber: 442,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 443,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 444,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        !overlayEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: panelStyle,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Depth Output"
                                }, void 0, false, {
                                    fileName: "[project]/components/DepthViewer.tsx",
                                    lineNumber: 453,
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
                                            lineNumber: 455,
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
                                                    lineNumber: 482,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "max: ",
                                                        depthStats.max.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 483,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "mean: ",
                                                        depthStats.mean.toFixed(3)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DepthViewer.tsx",
                                                    lineNumber: 484,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
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
                                    lineNumber: 514,
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
                                            lineNumber: 516,
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
                            lineNumber: 548,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DepthViewer.tsx",
                    lineNumber: 496,
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
_s(DepthViewer, "/p9KbbMRaD4edPQvdQQnPEfIh04=");
_c = DepthViewer;
var _c;
__turbopack_context__.k.register(_c, "DepthViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_0jr4o8t._.js.map