/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.google-analytics.com https://ssl.google-analytics.com https://*.googletagmanager.com https://tagmanager.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com https://cdnjs.cloudflare.com https://static.cloudflareinsights.com https://connect.facebook.net https://graph.facebook.com;
  style-src 'self' 'unsafe-inline' https://googletagmanager.com https://tagmanager.google.com https://fonts.googleapis.com;
  img-src 'self' blob: data: https: https://scdn.voltio.click https://voltio.click https://*.google-analytics.com https://*.googletagmanager.com https://ssl.gstatic.com https://*.google.com https://*.gstatic.com https://*.bing.com https://*.facebook.com https://*.fbcdn.net https://*.doubleclick.net;
  frame-src 'self' https://bid.g.doubleclick.net https://www.youtube.com https://www.google.com https://www.facebook.com https://discord.com;
  font-src 'self' data: https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' https://voltio.click https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://www.google.com.ua;
  upgrade-insecure-requests;
`.replace(/\n/g, "");

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: "standalone",
  htmlLimitedBots: /.*/,
  cacheHandler:
    process.env.NODE_ENV === "production" ? "./cache-handler.mjs" : undefined,
  cacheMaxMemorySize: process.env.NODE_ENV === "production" ? 0 : undefined,
  async headers() {
    return [
      {
        source: "/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
