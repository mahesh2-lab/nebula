import type { NextConfig } from "next";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://socket.hostmyidea.me';
let socketWsUrl = "";

if (socketUrl) {
  try {
    const url = new URL(socketUrl);
    const wsProto = url.protocol === "https:" ? "wss:" : "ws:";
    socketWsUrl = `${wsProto}//${url.host}`;
  } catch (e) {
    // If it's not a full parseable URL, we can leave it blank
  }
}

const socketConnectSrc = [
  "http://localhost:9002",
  "ws://localhost:9002",
  socketUrl,
  socketWsUrl
].filter(Boolean).join(" ");

const cspValue = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com; font-src 'self' data:; connect-src 'self' ${socketConnectSrc} https://github.com https://google.com https://accounts.google.com; frame-src 'self' http://*.localhost:* http://*.localhost https://*.nebula.dev https://*.hostmyidea.me:* https://*.hostmyidea.me;`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspValue,
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ['sharp-egret-inviting.ngrok-free.app', 'hostmyidea.me', '*.hostmyidea.me', 'localhost:3000'],
};

export default nextConfig;

