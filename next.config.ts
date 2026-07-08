import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ignore the mediapipe dependency since we use the native tfjs runtime.
    // This prevents the "Export FaceDetection doesn't exist in target module" error.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mediapipe/face_detection": path.resolve(__dirname, "src/lib/mock-mediapipe.js"),
    };
    return config;
  },
  // Ensure Turbopack also aliases the package to avoid the error and silent failure
  turbopack: {
    resolveAlias: {
      "@mediapipe/face_detection": "./src/lib/mock-mediapipe.js",
    },
  },
};

export default nextConfig;
