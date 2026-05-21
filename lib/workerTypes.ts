export const MODEL_URL =
  "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx";

export const DEPTH_INPUT_SIZE = 256;

type FrameMessage = {
  type: "frame";
  frameId: number;
  width: number;
  height: number;
  rgb: Uint8ClampedArray;
};

type InitMessage = {
  type: "init";
};

export type DepthWorkerRequest = InitMessage | FrameMessage;

export type DepthWorkerResponse =
  | { type: "warming" }
  | { type: "busy" }
  | {
      type: "depth";
      frameId: number;
      width: number;
      height: number;
      depth: Float32Array;
      inferenceMs: number;
    }
  | { type: "error"; message: string };
