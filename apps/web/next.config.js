/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@veltrix/shared', 'three'],
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

module.exports = nextConfig
