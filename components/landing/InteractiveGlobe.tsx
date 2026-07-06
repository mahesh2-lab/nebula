'use client';

import * as React from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface CityNode {
  name: string;
  code: string;
  lat: number;
  lon: number;
}

const POP_SITES: CityNode[] = [
  { name: 'San Francisco', code: 'SFO', lat: 37.7749, lon: -122.4194 },
  { name: 'New York', code: 'NYC', lat: 40.7128, lon: -74.0060 },
  { name: 'London', code: 'LHR', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', code: 'CDG', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', code: 'HND', lat: 35.6762, lon: 139.6503 },
  { name: 'Singapore', code: 'SIN', lat: 1.3521, lon: 103.8198 },
  { name: 'Sydney', code: 'SYD', lat: -33.8688, lon: 151.2093 },
  { name: 'Frankfurt', code: 'FRA', lat: 50.1109, lon: 8.6821 },
];

const CONNECTIONS = [
  { from: 'SFO', to: 'NYC' },
  { from: 'NYC', to: 'LHR' },
  { from: 'LHR', to: 'FRA' },
  { from: 'LHR', to: 'CDG' },
  { from: 'FRA', to: 'SIN' },
  { from: 'SIN', to: 'HND' },
  { from: 'HND', to: 'SFO' },
  { from: 'SIN', to: 'SYD' },
  { from: 'SYD', to: 'SFO' },
];

// Low-resolution geographical approximations of Earth continents
const CONTINENT_POLYGONS = [
  // North America
  [[-168, 65], [-120, 60], [-125, 48], [-120, 30], [-105, 20], [-85, 25], [-80, 9], [-75, 8], [-80, 20], [-60, 45], [-50, 48], [-60, 60], [-80, 80], [-100, 75]],
  // South America
  [[-80, 10], [-70, 10], [-50, -5], [-35, -5], [-40, -20], [-60, -45], [-73, -55], [-72, -40], [-80, -20]],
  // Eurasia
  [[-10, 65], [30, 70], [60, 75], [100, 75], [140, 70], [170, 65], [170, 45], [140, 35], [120, 38], [110, 15], [95, 10], [75, 10], [60, 25], [45, 15], [35, 30], [25, 35], [0, 40], [-5, 50]],
  // Africa
  [[-15, 30], [30, 30], [33, 10], [40, 10], [50, 10], [40, -15], [30, -30], [20, -35], [10, -15], [0, 5]],
  // Australia
  [[113, -22], [143, -15], [152, -32], [140, -38], [115, -35]],
  // Greenland
  [[-70, 70], [-60, 80], [-30, 80], [-40, 60]]
];

function isPointInPolygon(point: [number, number], polygon: number[][]) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function InteractiveGlobe() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Precalculate land dots
  const landDots = React.useMemo(() => {
    const dots: { lat: number; lon: number }[] = [];
    const step = 5.5; // step density
    for (let lat = -80; lat <= 80; lat += step) {
      const radLat = (lat * Math.PI) / 180;
      // Adjust longitude density based on latitude to maintain consistent spacing
      const lonStep = step / Math.cos(radLat);
      for (let lon = -180; lon <= 180; lon += lonStep) {
        let inContinent = false;
        for (const poly of CONTINENT_POLYGONS) {
          if (isPointInPolygon([lon, lat], poly)) {
            inContinent = true;
            break;
          }
        }
        if (inContinent) {
          dots.push({ lat, lon });
        }
      }
    }
    return dots;
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let theta = 0; // longitude rotation offset
    const defaultTilt = (22 * Math.PI) / 180; // polar tilt perspective
    let phi = defaultTilt; // polar angle variable

    // Drag-to-rotate interaction variables
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let velocityX = 0;
    let velocityY = 0;

    // Resize handler
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = (rect?.width || 500) * dpr;
      canvas.height = (rect?.height || 400) * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const latLonToVector = (lat: number, lon: number): Point3D => {
      const p = (lat * Math.PI) / 180;
      const l = (lon * Math.PI) / 180;
      return {
        x: Math.cos(p) * Math.sin(l),
        y: Math.sin(p),
        z: Math.cos(p) * Math.cos(l),
      };
    };

    const project = (point: Point3D, rotTheta: number, rotPhi: number, r: number, cx: number, cy: number) => {
      // 1. Rotate Y-axis (globe rotation around vertical axis)
      const cosY = Math.cos(rotTheta);
      const sinY = Math.sin(rotTheta);
      const x1 = point.x * cosY + point.z * sinY;
      const z1 = -point.x * sinY + point.z * cosY;

      // 2. Rotate X-axis (globe tilt/polar axis)
      const cosX = Math.cos(rotPhi);
      const sinX = Math.sin(rotPhi);
      const y2 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;

      return {
        sx: cx + x1 * r,
        sy: cy - y2 * r,
        sz: z2, // depth factor
      };
    };

    // Mouse Interaction Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      
      theta += dx * 0.005;
      phi += dy * 0.005;
      
      // Limit vertical tilt to prevent upside-down wrapping
      phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, phi));

      velocityX = dx * 0.005;
      velocityY = dy * 0.005;

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch Interaction Handlers
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      isDragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;

      theta += dx * 0.005;
      phi += dy * 0.005;
      phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, phi));

      velocityX = dx * 0.005;
      velocityY = dy * 0.005;

      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    // Register Event Listeners
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Main animation frame
    const render = (time: number) => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.44; // Globe radius

      if (isDragging) {
        // Active rotation via user drag
      } else {
        // Apply inertia friction decay
        theta += velocityX;
        phi += velocityY;
        velocityX *= 0.95;
        velocityY *= 0.95;

        // Auto spin along the polar axis
        theta += 0.0024;
        
        // Return tilt back to default angle
        phi += (defaultTilt - phi) * 0.05;
      }

      // Sphere ambient backglow
      const bgGlow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      bgGlow.addColorStop(0, '#0a0a0d');
      bgGlow.addColorStop(0.7, '#020203');
      bgGlow.addColorStop(1, '#000000');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fill();

      // Outer atmosphere rim glow
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw standard latitude/longitude wireframe lines
      ctx.lineWidth = 0.5;
      // Parallels (horizontal grid lines)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = latLonToVector(lat, lon);
          const prj = project(pt, theta, phi, r, cx, cy);
          if (prj.sz > 0) {
            if (first) {
              ctx.moveTo(prj.sx, prj.sy);
              first = false;
            } else {
              ctx.lineTo(prj.sx, prj.sy);
            }
          }
        }
        ctx.strokeStyle = 'rgba(39, 39, 42, 0.25)';
        ctx.stroke();
      }

      // Meridians (vertical grid lines)
      for (let lon = 0; lon < 360; lon += 45) {
        ctx.beginPath();
        let first = true;
        for (let lat = -80; lat <= 80; lat += 5) {
          const pt = latLonToVector(lat, lon);
          const prj = project(pt, theta, phi, r, cx, cy);
          if (prj.sz > 0) {
            if (first) {
              ctx.moveTo(prj.sx, prj.sy);
              first = false;
            } else {
              ctx.lineTo(prj.sx, prj.sy);
            }
          }
        }
        ctx.strokeStyle = 'rgba(39, 39, 42, 0.25)';
        ctx.stroke();
      }

      // Render earth land dots (continents representation)
      for (const dot of landDots) {
        const pt = latLonToVector(dot.lat, dot.lon);
        const prj = project(pt, theta, phi, r, cx, cy);
        if (prj.sz > 0) {
          // Adjust dot alpha and size slightly near the edges to create sphericity
          const edgeAlpha = Math.max(0, prj.sz);
          ctx.fillStyle = `rgba(113, 113, 122, ${edgeAlpha * 0.45})`; // zinc-500 edge fading
          ctx.beginPath();
          ctx.arc(prj.sx, prj.sy, 1.1 * prj.sz, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Render edge connection flightpaths (3D arcs)
      ctx.lineWidth = 1.2;
      const timeMs = time * 0.001;

      CONNECTIONS.forEach((conn) => {
        const fromNode = POP_SITES.find(n => n.code === conn.from);
        const toNode = POP_SITES.find(n => n.code === conn.to);
        if (!fromNode || !toNode) return;

        const pA = latLonToVector(fromNode.lat, fromNode.lon);
        const pB = latLonToVector(toNode.lat, toNode.lon);

        ctx.beginPath();
        let first = true;
        const steps = 30;
        
        // Flightpath drawing animation over time
        const pathReveal = (timeMs * 0.2) % 1.5; // loops

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          if (t > pathReveal) break; // animating draw

          // Spherical linear interpolation approximation
          const x = pA.x + (pB.x - pA.x) * t;
          const y = pA.y + (pB.y - pA.y) * t;
          const z = pA.z + (pB.z - pA.z) * t;

          // Normalize and project arc outwards (peak height at midpoint)
          const len = Math.sqrt(x*x + y*y + z*z);
          const arcHeight = 1 + 0.12 * Math.sin(Math.PI * t);
          const pArc = {
            x: (x / len) * arcHeight,
            y: (y / len) * arcHeight,
            z: (z / len) * arcHeight,
          };

          const prj = project(pArc, theta, phi, r, cx, cy);
          if (prj.sz > 0) {
            if (first) {
              ctx.moveTo(prj.sx, prj.sy);
              first = false;
            } else {
              ctx.lineTo(prj.sx, prj.sy);
            }
          }
        }

        // Beautiful custom green grid edge glowing paths
        ctx.strokeStyle = `rgba(34, 197, 94, 0.45)`;
        ctx.stroke();
      });

      // Render active edge network nodes (POPs)
      POP_SITES.forEach((site, idx) => {
        const pt = latLonToVector(site.lat, site.lon);
        const prj = project(pt, theta, phi, r, cx, cy);

        if (prj.sz > 0) {
          // Pulse calculations
          const pulseScale = Math.sin(timeMs * 3.5 + idx) * 5 + 7;
          
          // Outer pulsing ring
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.45 * prj.sz})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(prj.sx, prj.sy, pulseScale * prj.sz, 0, 2 * Math.PI);
          ctx.stroke();

          // Center solid point
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(prj.sx, prj.sy, 3.5 * prj.sz, 0, 2 * Math.PI);
          ctx.fill();

          // Node shadow glow backing
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(prj.sx, prj.sy, 1.2 * prj.sz, 0, 2 * Math.PI);
          ctx.fill();

          // Label placement next to dot
          ctx.fillStyle = `rgba(255, 255, 255, ${prj.sz * 0.95})`;
          ctx.font = '7px Courier New, monospace';
          ctx.fillText(site.code, prj.sx + 6 * prj.sz, prj.sy + 2.5);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [landDots]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
}
