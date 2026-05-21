import { DEPTH_INPUT_SIZE } from "@/lib/workerTypes";

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

function sampleChannel(
  rgb: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  x: number,
  y: number,
  channel: number,
): number {
  const srcX = Math.max(0, Math.min(srcWidth - 1, Math.floor(x)));
  const srcY = Math.max(0, Math.min(srcHeight - 1, Math.floor(y)));
  const idx = (srcY * srcWidth + srcX) * 4 + channel;
  return rgb[idx] / 255;
}

export function rgbaToInputTensor(
  rgb: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  size = DEPTH_INPUT_SIZE,
): Float32Array {
  const tensor = new Float32Array(1 * 3 * size * size);
  const plane = size * size;

  for (let y = 0; y < size; y += 1) {
    const srcY = (y / size) * srcHeight;

    for (let x = 0; x < size; x += 1) {
      const srcX = (x / size) * srcWidth;
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

export function normalizeDepth(values: Float32Array): { normalized: Float32Array; min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < values.length; i += 1) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const range = Math.max(max - min, 1e-6);
  const normalized = new Float32Array(values.length);

  for (let i = 0; i < values.length; i += 1) {
    normalized[i] = (values[i] - min) / range;
  }

  return { normalized, min, max };
}
