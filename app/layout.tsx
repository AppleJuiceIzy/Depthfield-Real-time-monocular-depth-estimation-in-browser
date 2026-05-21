import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Browser Depth Visualizer",
  description: "Real-time client-side depth map visualizer powered by ONNX Runtime Web.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
