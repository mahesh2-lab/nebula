import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redis } from "@/lib/redis";
import { getProjects } from "@/lib/db/queries";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectsList = await getProjects();
    const projectIds = projectsList.map(p => p.id);

    // Multi-project aggregate queries
    const promises = projectIds.map(async (projectId) => {
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

      const hourSlots = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
      const hourlyPromises = hourSlots.map(h =>
        redis.hgetall(`analytics:project:${projectId}:hourly:${h}`)
      );
      const hourlyResults = await Promise.all(hourlyPromises);

      return {
        projectId,
        requests: reqs ? parseInt(reqs, 10) : 0,
        bandwidth: bytes ? parseInt(bytes, 10) : 0,
        latencySum: latSum ? parseInt(latSum, 10) : 0,
        latencyCount: latCount ? parseInt(latCount, 10) : 0,
        regions: regionsRaw || {},
        paths: pathsRaw || {},
        hourly: hourlyResults
      };
    });

    const results = await Promise.all(promises);

    let realRequestsTotal = 0;
    let realBandwidthBytesTotal = 0;
    let realLatencySumTotal = 0;
    let realLatencyCountTotal = 0;

    const mergedRegions = new Map<string, number>();
    const mergedPaths = new Map<string, number>();

    // Populate timeline slots
    const timelineSlots = [
      { time: '00:00', requests: 0, bandwidth: 0, latencySum: 0, latencyCount: 0 },
      { time: '04:00', requests: 0, bandwidth: 0, latencySum: 0, latencyCount: 0 },
      { time: '08:00', requests: 0, bandwidth: 0, latencySum: 0, latencyCount: 0 },
      { time: '12:00', requests: 0, bandwidth: 0, latencySum: 0, latencyCount: 0 },
      { time: '16:00', requests: 0, bandwidth: 0, latencySum: 0, latencyCount: 0 },
      { time: '20:00', requests: 0, bandwidth: 0, latencySum: 0, latencyCount: 0 },
      { time: '24:00', requests: 0, bandwidth: 0, latencySum: 0, latencyCount: 0 }
    ];

    results.forEach(res => {
      realRequestsTotal += res.requests;
      realBandwidthBytesTotal += res.bandwidth;
      realLatencySumTotal += res.latencySum;
      realLatencyCountTotal += res.latencyCount;

      // Aggregate regions
      Object.entries(res.regions).forEach(([reg, val]) => {
        const parsed = parseInt(val as string, 10);
        const existing = mergedRegions.get(reg) || 0;
        mergedRegions.set(reg, existing + parsed);
      });

      // Aggregate paths
      Object.entries(res.paths).forEach(([path, val]) => {
        const parsed = parseInt(val as string, 10);
        const existing = mergedPaths.get(path) || 0;
        mergedPaths.set(path, existing + parsed);
      });

      // Aggregate hourly
      res.hourly.forEach((hourData, idx) => {
        const hr = timelineSlots[idx];
        if (hr) {
          const hourReqs = hourData.requests ? parseInt(hourData.requests as string, 10) : 0;
          const hourBytes = hourData.bandwidth ? parseInt(hourData.bandwidth as string, 10) : 0;
          const hourLatSum = hourData.latency_sum ? parseInt(hourData.latency_sum as string, 10) : 0;
          const hourLatCount = hourData.latency_count ? parseInt(hourData.latency_count as string, 10) : 0;

          hr.requests += hourReqs;
          hr.bandwidth += hourBytes / (1024 * 1024 * 1024);
          hr.latencySum += hourLatSum;
          hr.latencyCount += hourLatCount;
        }
      });
    });

    const totalRequests = realRequestsTotal;
    const totalBandwidth = realBandwidthBytesTotal / (1024 * 1024 * 1024);
    const totalAvgLatency = realLatencyCountTotal > 0
      ? (realLatencySumTotal / realLatencyCountTotal).toFixed(1)
      : "0";

    // Format Regions
    let totalRegionalRequests = 0;
    mergedRegions.forEach(v => totalRegionalRequests += v);

    const regions = Array.from(mergedRegions.entries()).map(([reg, val]) => {
      const pct = totalRegionalRequests > 0 ? Math.round((val / totalRegionalRequests) * 100) : 0;
      let requestsStr = '';
      if (val >= 1000000) {
        requestsStr = (val / 1000000).toFixed(1) + 'M';
      } else {
        requestsStr = Math.round(val / 1000) + 'k';
      }
      let regionName = 'Unknown Region';
      if (reg === 'iad1') regionName = 'US East (N. Virginia)';
      else if (reg === 'sfo1') regionName = 'US West (San Francisco)';
      else if (reg === 'cdg1') regionName = 'EU (Paris)';
      else if (reg === 'sin1') regionName = 'Asia (Singapore)';

      return {
        id: reg,
        name: regionName,
        requests: requestsStr,
        pct
      };
    });

    // Format Top URLs
    let totalUrlHits = 0;
    mergedPaths.forEach(v => totalUrlHits += v);

    const urls = Array.from(mergedPaths.entries())
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
      requestsUsed: totalRequests / 1000000,
      bandwidthUsed: totalBandwidth,
      latency: `${totalAvgLatency}ms`,
      coldStarts: '0%',
      timelineData: timelineSlots.map(t => {
        const avgLat = t.latencyCount > 0 ? Math.round(t.latencySum / t.latencyCount) : 0;
        return {
          time: t.time,
          requests: t.requests,
          bandwidth: parseFloat(t.bandwidth.toFixed(2)),
          latency: avgLat
        };
      }),
      regions,
      urls
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
