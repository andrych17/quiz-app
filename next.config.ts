import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the output file tracing root to suppress warnings
  outputFileTracingRoot: path.join(__dirname),
  
  // Webpack configuration to help with module resolution
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    
    return config;
  },
  
  // Experimental features for better stability
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
