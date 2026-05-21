(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/workerTypes.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEPTH_INPUT_SIZE",
    ()=>DEPTH_INPUT_SIZE,
    "MODEL_URL",
    ()=>MODEL_URL
]);
const MODEL_URL = "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx";
const DEPTH_INPUT_SIZE = 256;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/loadModel.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadModel",
    ()=>loadModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$onnxruntime$2d$web$2f$dist$2f$ort$2e$bundle$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/onnxruntime-web/dist/ort.bundle.min.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/workerTypes.ts [app-client] (ecmascript)");
;
;
let sessionPromise = null;
async function createSession() {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$onnxruntime$2d$web$2f$dist$2f$ort$2e$bundle$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].wasm.simd = true;
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$onnxruntime$2d$web$2f$dist$2f$ort$2e$bundle$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].wasm.numThreads = Math.max(1, Math.min(4, navigator.hardwareConcurrency ?? 2));
    const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODEL_URL"], {
        cache: "force-cache"
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch model from CDN: ${response.status} ${response.statusText}`);
    }
    const modelData = await response.arrayBuffer();
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$onnxruntime$2d$web$2f$dist$2f$ort$2e$bundle$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InferenceSession"].create(modelData, {
            executionProviders: [
                "webgpu",
                "wasm"
            ],
            graphOptimizationLevel: "all",
            enableCpuMemArena: true,
            enableMemPattern: true
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$onnxruntime$2d$web$2f$dist$2f$ort$2e$bundle$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InferenceSession"].create(modelData, {
            executionProviders: [
                "wasm"
            ],
            graphOptimizationLevel: "all",
            enableCpuMemArena: true,
            enableMemPattern: true
        });
    }
}
function loadModel() {
    if (!sessionPromise) {
        sessionPromise = createSession();
    }
    return sessionPromise;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/preprocess.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeDepth",
    ()=>normalizeDepth,
    "rgbaToInputTensor",
    ()=>rgbaToInputTensor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/workerTypes.ts [app-client] (ecmascript)");
;
const MEAN = [
    0.485,
    0.456,
    0.406
];
const STD = [
    0.229,
    0.224,
    0.225
];
function sampleChannel(rgb, srcWidth, srcHeight, x, y, channel) {
    const srcX = Math.max(0, Math.min(srcWidth - 1, Math.floor(x)));
    const srcY = Math.max(0, Math.min(srcHeight - 1, Math.floor(y)));
    const idx = (srcY * srcWidth + srcX) * 4 + channel;
    return rgb[idx] / 255;
}
function rgbaToInputTensor(rgb, srcWidth, srcHeight, size = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"]) {
    const tensor = new Float32Array(1 * 3 * size * size);
    const plane = size * size;
    for(let y = 0; y < size; y += 1){
        const srcY = y / size * srcHeight;
        for(let x = 0; x < size; x += 1){
            const srcX = x / size * srcWidth;
            const dst = y * size + x;
            const r = (sampleChannel(rgb, srcWidth, srcHeight, srcX, srcY, 0) - MEAN[0]) / STD[0];
            const g = (sampleChannel(rgb, srcWidth, srcHeight, srcX, srcY, 1) - MEAN[1]) / STD[1];
            const b = (sampleChannel(rgb, srcWidth, srcHeight, srcX, srcY, 2) - MEAN[2]) / STD[2];
            tensor[dst] = r;
            tensor[plane + dst] = g;
            tensor[plane * 2 + dst] = b;
        }
    }
    return tensor;
}
function normalizeDepth(values) {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for(let i = 0; i < values.length; i += 1){
        const v = values[i];
        if (v < min) min = v;
        if (v > max) max = v;
    }
    const range = Math.max(max - min, 1e-6);
    const normalized = new Float32Array(values.length);
    for(let i = 0; i < values.length; i += 1){
        normalized[i] = (values[i] - min) / range;
    }
    return {
        normalized,
        min,
        max
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workers/depthWorker.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/// <reference lib="webworker" />
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$onnxruntime$2d$web$2f$dist$2f$ort$2e$bundle$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/onnxruntime-web/dist/ort.bundle.min.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$loadModel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/loadModel.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$preprocess$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/preprocess.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/workerTypes.ts [app-client] (ecmascript)");
;
;
;
;
let initPromise = null;
let busy = false;
let announcedWarming = false;
function post(msg) {
    self.postMessage(msg);
}
async function ensureSession() {
    if (!initPromise) {
        initPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$loadModel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadModel"])();
    }
    return initPromise;
}
async function handleFrame(msg) {
    if (busy) {
        post({
            type: "busy"
        });
        return;
    }
    busy = true;
    const session = await ensureSession();
    const start = performance.now();
    const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$preprocess$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rgbaToInputTensor"])(msg.rgb, msg.width, msg.height, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"]);
    const inputName = session.inputNames[0];
    const feeds = {
        [inputName]: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$onnxruntime$2d$web$2f$dist$2f$ort$2e$bundle$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tensor"]("float32", input, [
            1,
            3,
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"],
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"]
        ])
    };
    const result = await session.run(feeds);
    const outputName = session.outputNames[0];
    const output = result[outputName];
    if (!output || !(output.data instanceof Float32Array)) {
        throw new Error("ONNX output was missing or not float32.");
    }
    let depthWidth = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"];
    let depthHeight = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"];
    if (output.dims.length >= 2) {
        depthHeight = output.dims[output.dims.length - 2];
        depthWidth = output.dims[output.dims.length - 1];
    }
    const rawDepth = output.data;
    const { normalized, min, max } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$preprocess$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeDepth"])(rawDepth);
    let sum = 0;
    for(let i = 0; i < rawDepth.length; i += 1){
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
        inputTensorShape: [
            1,
            3,
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"],
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workerTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPTH_INPUT_SIZE"]
        ],
        outputTensorShape: [
            1,
            depthHeight,
            depthWidth
        ]
    });
    busy = false;
}
self.addEventListener("message", (event)=>{
    const payload = event.data;
    if (payload.type === "init") {
        void ensureSession().then(()=>{
            if (!announcedWarming) {
                post({
                    type: "warming"
                });
                announcedWarming = true;
            }
        }).catch((error)=>{
            const message = error instanceof Error ? error.message : "Unknown initialization error";
            post({
                type: "error",
                message
            });
        });
        return;
    }
    if (payload.type === "frame") {
        void handleFrame(payload).catch((error)=>{
            busy = false;
            const message = error instanceof Error ? error.message : "Unknown inference error";
            post({
                type: "error",
                message
            });
        });
    }
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0~85u8i._.js.map