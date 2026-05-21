export type ColormapName = "turbo" | "inferno" | "grayscale";

const TURBO_STOPS: Array<[number, number, number]> = [
  [48, 18, 59],
  [50, 93, 176],
  [34, 170, 132],
  [236, 219, 70],
  [245, 109, 36],
  [122, 4, 3],
];

const INFERNO_STOPS: Array<[number, number, number]> = [
  [0, 0, 4],
  [31, 12, 72],
  [85, 15, 109],
  [136, 34, 106],
  [186, 54, 85],
  [227, 89, 51],
  [249, 140, 10],
  [252, 195, 65],
  [252, 255, 164],
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function fromStops(stops: Array<[number, number, number]>, t: number): [number, number, number] {
  const n = stops.length - 1;
  const scaled = Math.max(0, Math.min(0.9999, t)) * n;
  const i = Math.floor(scaled);
  const local = scaled - i;

  const c0 = stops[i];
  const c1 = stops[i + 1];

  return [
    Math.round(lerp(c0[0], c1[0], local)),
    Math.round(lerp(c0[1], c1[1], local)),
    Math.round(lerp(c0[2], c1[2], local)),
  ];
}

function sampleColor(map: ColormapName, v: number): [number, number, number] {
  if (map === "grayscale") {
    const gray = Math.round(v * 255);
    return [gray, gray, gray];
  }

  if (map === "inferno") {
    return fromStops(INFERNO_STOPS, v);
  }

  return fromStops(TURBO_STOPS, v);
}

export function colorizeDepth(
  normalizedDepth: Float32Array,
  width: number,
  height: number,
  map: ColormapName,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < normalizedDepth.length; i += 1) {
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
