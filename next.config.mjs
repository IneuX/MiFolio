/** @type {import('next').NextConfig} */
const nextConfig = {
  // 注释掉 output: "export" 以支持中间件
  // output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
