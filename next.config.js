/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['t.me'], // Allow images from Telegram
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'telegram.org',
        pathname: '/**',
      },
    ],
  },
  // Configure scripts from Telegram
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://*.telegram.org https://telegram.org https://*.telegram.me https://telegram.me;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
