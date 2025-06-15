/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add support for importing JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    // Avoid bundling Firebase Admin SDK on the client
    if (!isServer) {
      // Exclude Firebase Admin SDK from client bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Provide empty modules for Node.js modules used by Firebase Admin SDK
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // Enable experimental features for server components
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002", "localhost:3003"],
    },
  },
}

module.exports = nextConfig 