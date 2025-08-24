/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any Next.js configuration here
  experimental: {
    // Enable any experimental features if needed
  },
  // Set the output file tracing root to suppress warnings
  outputFileTracingRoot: require('path').join(__dirname),
};

module.exports = nextConfig;
