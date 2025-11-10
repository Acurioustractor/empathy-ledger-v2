/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration to handle module loading issues
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle module resolution issues with React 19 and Next.js 15
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    };

    // Add fallback for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },

  // React Strict Mode (moved to main config)
  reactStrictMode: false,
  
  // Experimental features for Next.js 14
  experimental: {
    // No experimental features for stability
  },

  // Compiler options for styled-jsx and other CSS-in-JS compatibility
  compiler: {
    // Enable styled-jsx for compatibility
    styledJsx: true,
  },

  // Development indicators configuration
  // devIndicators.buildActivity is deprecated in Next.js 15

  // Handle static asset optimization
  images: {
    unoptimized: true, // Temporarily disable image optimization to avoid conflicts
  },

  // Output file tracing configuration (removed for Next.js 14 compatibility)
  
  // Skip ESLint during build for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript errors during build for production deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
