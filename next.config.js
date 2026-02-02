/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Enable standalone output for Docker
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.NEXT_PUBLIC_FASTAPI_URL
          ? `${process.env.NEXT_PUBLIC_FASTAPI_URL.replace("/api/v1", "")}/:path*`
          : "http://127.0.0.1:8000/api/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
