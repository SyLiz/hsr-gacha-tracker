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
  env: {
    NEXT_PUBLIC_GITHUB_ASSETS_URL:
      "https://raw.githubusercontent.com/Mar-7th/StarRailRes/refs/heads/master",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/Mar-7th/StarRailRes/**",
      },
    ],
  },
};

export default nextConfig;
