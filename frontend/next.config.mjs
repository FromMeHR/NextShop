/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: "standalone",
  cacheHandler:
    process.env.NODE_ENV === "production" ? "./cache-handler.mjs" : undefined,
  cacheMaxMemorySize: process.env.NODE_ENV === "production" ? 0 : undefined,
};

export default nextConfig;
