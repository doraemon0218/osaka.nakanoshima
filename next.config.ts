import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ルートアクセスでダッシュボードを表示（404解消）
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
