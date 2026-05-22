# Depthfield
 
Real-time monocular depth estimation in the browser, with pose and gesture tracking layered on top. Point your webcam at the page and it estimates per-pixel distance, tracks your body and hands, and recognizes gestures.
 
**[Live demo →](https://youtu.be/HTbTCFRZhkM)** · _designed by [izy](https://www.izyanali.com/)_

https://github.com/user-attachments/assets/efacb7d4-95a0-463c-9bf1-b4baf40e5444
 
## What it does
 
Depthfield runs two computer vision models directly in the browser and fuses them:
 
- **Depth estimation** - a single webcam frame goes through Depth Anything V2 (Small) via ONNX Runtime Web, producing a per-pixel relative depth map. No stereo camera or depth sensor needed; the model infers distance from monocular cues like occlusion, perspective, and texture.
- **Pose + hand tracking** - MediaPipe detects 33 body landmarks and 21 landmarks per hand, drawn as a live skeleton.
- **Fusion** — each pose and hand landmark is annotated with the depth value sampled at its position, giving approximate 2.5D body keypoints from one camera.
- **Gesture recognition** - a rule-based classifier reads hand landmark geometry to recognize thumbs up, thumbs down, peace, pointing, fist, open palm, OK, and rock.
Everything runs on your device. Frames never leave the browser.

<img width="1455" height="906" alt="Screenshot 2026-05-21 at 6 56 05 PM" src="https://github.com/user-attachments/assets/54bc3491-be27-45e1-b8c9-f668af80d084" />

<img width="1455" height="906" alt="Screenshot 2026-05-21 at 6 55 36 PM" src="https://github.com/user-attachments/assets/6b58136f-b85d-421c-9ce6-eeb4f4080be7" />

 
## Table of Contents
 
- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Deploying](#deploying)
- [Troubleshooting](#troubleshooting)
- [Tech stack](#tech-stack)
## Quick start
 
You need [Node.js](https://nodejs.org) 18 or newer and a webcam.
 
```bash
# clone the repo
git clone https://github.com/AppleJuiceIzy/Depthfield-Real-time-monocular-depth-estimation-in-browser.git
cd Depthfield-Real-time-monocular-depth-estimation-in-browser
 
# install dependencies
npm install
 
# run the dev server
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000), allow camera access when prompted, and wait a few seconds for the depth model to load. The first load downloads the model (~95 MB), after which it's cached.
 
## How it works
 
The render loop captures webcam frames to a canvas. Each frame is sent to a Web Worker that runs the ONNX depth model off the main thread, while MediaPipe pose and hand detection run on the main thread in parallel. Results are fused at draw time and rendered to the depth canvas and overlay.
 
```
webcam → canvas → ┬→ Web Worker (ONNX depth) ─┐
                  └→ MediaPipe (pose + hands) ─┴→ fuse → render
```
 
Keeping inference in a worker is what lets the UI stay responsive while the model runs every frame.

## Project structure
 
| Path | Purpose |
|------|----------------|
| `components/DepthViewer.tsx` | Webcam capture, render loop, UI, fusion, all the wiring |
| `workers/depthWorker.ts` | Runs the ONNX session off the main thread |
| `lib/loadModel.ts` | Loads and caches the ONNX session |
| `lib/preprocess.ts` | RGBA → tensor preprocessing and depth normalization |
| `lib/colorize.ts` | Maps normalized depth to Turbo / Inferno / Grayscale colormaps |
| `lib/poseTracker.ts` | MediaPipe pose landmark detection |
| `lib/handTracker.ts` | MediaPipe hand landmark detection |
| `lib/gestureClassifier.ts` | Rule-based gesture recognition from hand geometry |
| `app/api/model/route.ts` | Same-origin proxy that serves the model file |
| `next.config.js` | Sets COEP/COOP headers for SharedArrayBuffer |
 
## Configuration
 
A few things you can tweak:
 
- **Model source** — the model is served through `app/api/model/route.ts`, which proxies a GitHub Release asset. Swap the `MODEL_URL` there to point at your own host.
- **Inference resolution** — `DEPTH_INPUT_SIZE` in `lib/workerTypes.ts` controls the model input size. Lower is faster, higher is sharper.
- **Colormaps** — add or edit colormap stops in `lib/colorize.ts`.
- **Gestures** — tune thresholds or add new gestures in `lib/gestureClassifier.ts`.
## Deploying
 
The project deploys to [Vercel](https://vercel.com) with no config changes:
 
1. Push the repo to GitHub.
2. Import it in Vercel and deploy with default Next.js settings.
3. Open the production URL over HTTPS (required for camera access) and allow the camera.
The model is served same-origin through the API route, so there are no CORS issues in production.
 
## Troubleshooting
 
**Depth panel stays black / "failed to fetch"** — the model didn't load. Check the browser console. If you see a CORS error, the model host isn't serving cross-origin; route it through `app/api/model/route.ts` instead of fetching it directly.
 
**Inference is slow** — the model falls back to single-threaded WASM when SharedArrayBuffer isn't available. Confirm `next.config.js` sets `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`, and that your host preserves those headers.
 
**Camera doesn't start** — camera access requires HTTPS (or localhost). Make sure you allowed the permission and no other app is holding the camera.
 
**Gestures are flaky** — lighting and hand angle matter. The classifier uses joint-angle geometry with temporal smoothing; tune the thresholds in `lib/gestureClassifier.ts` for your setup.
 
## Tech stack
 
- [Next.js](https://nextjs.org) + React + TypeScript
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/) — in-browser model inference
- [Depth Anything V2 (Small)](https://huggingface.co/onnx-community/depth-anything-v2-small) — the depth model
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) — pose and hand landmark detection
- Web Workers, Canvas, `getUserMedia`
