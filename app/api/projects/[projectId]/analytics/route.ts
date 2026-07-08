import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redis } from "@/lib/redis";
import { getProjectById } from "@/lib/db/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const userId = (session.user as any)?.id;
    const project = await getProjectById(projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [
      reqs,
      bytes,
      latSum,
      latCount,
      regionsRaw,
      pathsRaw
    ] = await Promise.all([
      redis.get(`analytics:project:${projectId}:requests`),
      redis.get(`analytics:project:${projectId}:bandwidth`),
      redis.get(`analytics:project:${projectId}:latency_sum`),
      redis.get(`analytics:project:${projectId}:latency_count`),
      redis.hgetall(`analytics:project:${projectId}:regions`),
      redis.hgetall(`analytics:project:${projectId}:paths`)
    ]);

    const realRequests = reqs ? parseInt(reqs, 10) : 0;
    const realBandwidthBytes = bytes ? parseInt(bytes, 10) : 0;
    const realBandwidthGB = realBandwidthBytes / (1024 * 1024 * 1024);
    const realLatencySum = latSum ? parseInt(latSum, 10) : 0;
    const realLatencyCount = latCount ? parseInt(latCount, 10) : 0;

    const totalRequests = realRequests;
    const totalBandwidthGB = realBandwidthGB;
    const totalAvgLatency = realLatencyCount > 0
      ? Math.round(realLatencySum / realLatencyCount)
      : 0;

    // Timeline Hourly
    const hourSlots = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    const hourlyPromises = hourSlots.map(h =>
      redis.hgetall(`analytics:project:${projectId}:hourly:${h}`)
    );
    const hourlyResults = await Promise.all(hourlyPromises);

    const timelineData = hourSlots.map((time, idx) => {
      const hourlyData = hourlyResults[idx] || {};
      const hourReqs = hourlyData.requests ? parseInt(hourlyData.requests as string, 10) : 0;
      const hourBytes = hourlyData.bandwidth ? parseInt(hourlyData.bandwidth as string, 10) : 0;
      const hourLatSum = hourlyData.latency_sum ? parseInt(hourlyData.latency_sum as string, 10) : 0;
      const hourLatCount = hourlyData.latency_count ? parseInt(hourlyData.latency_count as string, 10) : 0;

      const avgHourLatency = hourLatCount > 0 ? Math.round(hourLatSum / hourLatCount) : 0;

      return {
        time,
        requests: hourReqs,
        bandwidth: parseFloat((hourBytes / (1024 * 1024 * 1024)).toFixed(2)),
        latency: avgHourLatency
      };
    });

    // Traffic by region
    const baseRegions = [
      { id: 'iad1', name: 'US East (N. Virginia)' },
      { id: 'sfo1', name: 'US West (San Francisco)' },
      { id: 'cdg1', name: 'EU (Paris)' },
      { id: 'sin1', name: 'Asia (Singapore)' }
    ];

    let totalRegionalRequests = 0;
    const regionMap = new Map<string, number>();

    if (regionsRaw) {
      Object.entries(regionsRaw).forEach(([reg, val]) => {
        const count = parseInt(val as string, 10);
        regionMap.set(reg, count);
        totalRegionalRequests += count;
      });
    }

    const regions = baseRegions.map(reg => {
      const count = regionMap.get(reg.id) || 0;
      const pct = totalRegionalRequests > 0 ? Math.round((count / totalRegionalRequests) * 100) : 0;
      let requestsStr = '';
      if (count >= 1000000) {
        requestsStr = (count / 1000000).toFixed(1) + 'M';
      } else {
        requestsStr = Math.round(count / 1000) + 'k';
      }
      return {
        id: reg.id,
        name: reg.name,
        requests: requestsStr,
        pct
      };
    });

    // Top URLs & Requests
    const urlMap = new Map<string, number>();

    if (pathsRaw) {
      Object.entries(pathsRaw).forEach(([path, count]) => {
        const parsedCount = parseInt(count as string, 10);
        urlMap.set(path, parsedCount);
      });
    }

    let totalUrlHits = 0;
    urlMap.forEach(v => totalUrlHits += v);

    const urls = Array.from(urlMap.entries())
      .map(([path, count]) => ({
        path,
        countVal: count,
        pct: totalUrlHits > 0 ? Math.round((count / totalUrlHits) * 100) : 0
      }))
      .sort((a, b) => b.countVal - a.countVal)
      .slice(0, 5)
      .map(u => {
        let countStr = '';
        if (u.countVal >= 1000000) {
          countStr = (u.countVal / 1000000).toFixed(1) + 'M';
        } else {
          countStr = Math.round(u.countVal / 1000) + 'k';
        }
        return {
          path: u.path,
          count: countStr,
          pct: u.pct
        };
      });

    return NextResponse.json({
      name: project.name,
      requestsUsed: totalRequests / 1000000,
      bandwidthUsed: totalBandwidthGB,
      latency: `${totalAvgLatency}ms`,
      coldStarts: '0%',
      timelineData,
      regions,
      urls
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
