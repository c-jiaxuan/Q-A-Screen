/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/SingPostAI.html",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
