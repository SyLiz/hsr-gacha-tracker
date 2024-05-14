/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/tracker/character",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
