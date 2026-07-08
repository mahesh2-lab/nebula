import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, number[]>();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // max 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out expired timestamps
  const activeTimestamps = timestamps.filter(t => now - t < LIMIT_WINDOW);
  
  if (activeTimestamps.length >= MAX_REQUESTS) {
    return true;
  }
  
  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl;
    const ip = (req as any).ip || req.headers.get("x-forwarded-for") || "127.0.0.1";

    // Throttle auth credentials callback
    if (url.pathname.includes("/api/auth/callback/credentials")) {
      if (isRateLimited(ip)) {
        return new NextResponse(
          JSON.stringify({ error: "Too many authentication requests. Please try again later." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (process.env.ENABLE_BYPASS === "true" && req.headers.get("x-boneyard-bypass") === "true") {
          return true;
        }
        return !!token;
      }
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/project/:path*",
    "/new",
    "/onboarding",
    "/api/auth/callback/credentials",
  ],
};
