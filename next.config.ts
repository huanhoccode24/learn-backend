import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '200lab.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'statics.cdn.200lab.io',
        pathname: '**',
      }
    ],
  },
  transpilePackages: ['yjs', '@liveblocks/yjs', '@tiptap/extension-collaboration'],
  // Next.js 16 tự động xử lý phần lớn cấu hình, mình chỉ cần transpile để tránh lỗi module
};

export default nextConfig;
