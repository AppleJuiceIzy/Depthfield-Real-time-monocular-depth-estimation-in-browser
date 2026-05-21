import { NextResponse } from "next/server";

const MODEL_URL =
  "https://github.com/AppleJuiceIzy/Depthfield-Real-time-monocular-depth-estimation-in-browser/releases/download/v1.0/depth-anything-v2-small.onnx";

export const runtime = "edge";

export async function GET() {
  const upstream = await fetch(MODEL_URL);
  if (!upstream.ok) {
    return new NextResponse("Failed to fetch model", { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
