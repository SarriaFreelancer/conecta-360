import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir túneles de desarrollo (ngrok, cloudflare, ip local) para WebSockets HMR y Fast Refresh
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.trycloudflare.com",
    "*.loca.lt",
    "localhost:3010",
    "127.0.0.1:3010",
  ],
};

export default nextConfig;
