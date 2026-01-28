/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Dimatikan sementara untuk mengurangi double render yang memakan RAM saat dev/build
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['nodemailer', 'postgres'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;