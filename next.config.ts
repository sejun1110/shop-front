import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // 권장 옵션
  compiler: {
    styledComponents: true, // ✅ styled-components SSR 활성화
  },
   // ✅ 추가: API/업로드 프록시 (동일 오리진처럼 사용)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:9999/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:9999/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
