/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/tracker",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
