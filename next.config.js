/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Memberitahu Next.js untuk tidak mem-bundle nodemailer
    serverComponentsExternalPackages: ['nodemailer'],
  },
  webpack: (config, { isServer }) => {
    // Tambahan untuk memastikan build server-side aman
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;