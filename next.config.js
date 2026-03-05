/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pllvizrdntjbzapztxlg.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
