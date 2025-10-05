/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Environment variables are automatically available in Next.js
  // No need to explicitly define them in next.config.js unless for build-time configuration
}

module.exports = nextConfig
