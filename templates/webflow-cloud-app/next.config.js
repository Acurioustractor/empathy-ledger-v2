/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from Empathy Ledger and common storage providers
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'empathyledger.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Enable experimental features for Webflow Cloud
  experimental: {
    // Server Actions for form handling
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.webflow.io'],
    },
  },
}

module.exports = nextConfig
