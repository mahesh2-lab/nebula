import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Redis from "ioredis";

// Create a separate connection for Subscription since ioredis blocks the client once subscribed
const REDIS_URL = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAaQZAAIgcDIyZTIzZDU5NzIyMmI0ODljODY0MTFmMjFmZmJhNDgxOA@pumped-drum-107545.upstash.io:6379';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Dedicated subscriber client
    const subscriber = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null
    });

    console.log("[SSE API] Client connected to Server-Sent Events stream.");

    // Keep-alive ping interval to prevent connection timeouts (every 15s)
    const pingInterval = setInterval(async () => {
        try {
            await writer.write(encoder.encode("event: ping\ndata: keep-alive\n\n"));
        } catch (err) {
            // Client closed connection
            clearInterval(pingInterval);
        }
    }, 15000);

    const cleanup = () => {
        console.log("[SSE API] Cleaning up SSE connection resources.");
        clearInterval(pingInterval);
        subscriber.disconnect();
        try {
            writer.close();
        } catch (_) {}
    };

    req.signal.addEventListener("abort", cleanup);

    try {
        await subscriber.subscribe("global:events");

        subscriber.on("message", async (channel, message) => {
            console.log(`[SSE API] Forwarding Redis event from channel "${channel}" to client`);
            try {
                await writer.write(encoder.encode(`event: message\ndata: ${message}\n\n`));
            } catch (err) {
                console.error("[SSE API] Failed to stream event, closing:", err);
                cleanup();
            }
        });

    } catch (err) {
        console.error("[SSE API] Error establishing subscription:", err);
        cleanup();
    }

    return new NextResponse(responseStream.readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
