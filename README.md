<<<<<<< HEAD
# Depthfield

Real-time monocular depth estimation in the browser **Depth Anything V2 Small (ONNX)** and **ONNX Runtime Web**.

## Features

- Zero-backend architecture (all inference in-browser)
- Webcam split view:
  - `RGB Input` (left)
  - `Depth Output` (right)
- Colormap toggles: Turbo, Inferno, Grayscale
- Overlay mode (depth map ghosted over RGB)
- Live FPS + inference timing indicators
- Worker-based inference (`workers/depthWorker.ts`) so UI stays responsive

## Core Architecture

- `components/DepthViewer.tsx`: webcam capture, UI, frame loop, worker messaging
- `workers/depthWorker.ts`: ONNX session initialization + frame inference
- `lib/loadModel.ts`: fetches and caches ONNX model from Hugging Face CDN
- `lib/preprocess.ts`: RGBA -> tensor preprocessing and depth normalization
- `lib/colorize.ts`: maps normalized depth to RGB colormaps
- `next.config.js`: COEP/COOP headers required for SharedArrayBuffer usage

## Model Source

Loaded at runtime from:

- `https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx`

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), allow camera access, and confirm depth output is updating.

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Deploy To Vercel

1. Push this folder to a Git repository.
2. Import the repo in Vercel.
3. Keep default Next.js build settings.
4. Deploy.
5. Open the HTTPS deployment URL, allow camera permissions, and verify live depth rendering.

## Notes

- HTTPS is required for webcam access in production browsers.
- If depth does not render, verify these headers exist on responses:
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Opener-Policy: same-origin`
=======
# Depthfield: Real-time monocular depth estimation in the browser 
Single-camera real-time depth estimation in a browser. Feeds live webcam footage through Depth Anything V2 via ONNX Runtime Web - no server or LiDAR. The model infers per-pixel depth from monocular cues like occlusion and perspective, colorized live. The same primitive a robot uses to visually understand a 3D space before it can navigate it.
>>>>>>> 9fa494ec3b227e76f8506accb693cc8646d6a925
