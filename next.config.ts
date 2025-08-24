import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the output file tracing root to suppress warnings
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
