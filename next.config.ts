import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 💡 الطريقة الجديدة والآمنة 100%
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // 👈 رابط استضافة الصور بتاعك
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
