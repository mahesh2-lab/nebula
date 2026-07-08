'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { DottedMap } from '@/components/magicui/dotted-map';
import { HyperText } from '@/components/magicui/hyper-text';



interface GlitchFrame {
  xR: number;
  xB: number;
  ySlice: { top: number; height: number };
  opacity: number;
}

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeFrame(): GlitchFrame {
  return {
    xR: rnd(-12, -3),
    xB: rnd(3, 12),
    ySlice: { top: rnd(10, 70), height: rnd(8, 28) },
    opacity: rnd(0.55, 0.85),
  };
}

function useGlitch() {
  const [frame, setFrame] = React.useState<GlitchFrame | null>(null);

  const trigger = React.useCallback(() => {
    // fire 3–5 rapid frames then clear
    const frames = Array.from({ length: Math.floor(rnd(3, 6)) }, makeFrame);
    let i = 0;
    const interval = setInterval(() => {
      if (i < frames.length) {
        setFrame(frames[i]);
        i++;
      } else {
        clearInterval(interval);
        setFrame(null);
      }
    }, 70);
  }, []);

  React.useEffect(() => {
    // First glitch shortly after mount
    const first = setTimeout(trigger, 1100);

    // Subsequent random glitches every 4–9 s
    let next: ReturnType<typeof setTimeout>;
    function schedule() {
      next = setTimeout(() => {
        trigger();
        schedule();
      }, rnd(4000, 9000));
    }
    schedule();

    return () => {
      clearTimeout(first);
      clearTimeout(next);
    };
  }, [trigger]);

  return frame;
}

/* ─────────────────────────────────────────────────────
   Glitched 404 — base text + two tinted offset layers
───────────────────────────────────────────────────── */
const DIGIT_STYLE: React.CSSProperties = {
  fontSize: 'clamp(5.5rem, 14vw, 10rem)',
  letterSpacing: '-0.06em',
  lineHeight: 0.9,
  fontFamily: 'inherit',
  fontWeight: 700,
};

function GlitchDigits({ frame }: { frame: GlitchFrame | null }) {
  const text = '404';

  const clipPath = frame
    ? `polygon(0 ${frame.ySlice.top}%, 100% ${frame.ySlice.top}%, 100% ${
        frame.ySlice.top + frame.ySlice.height
      }%, 0 ${frame.ySlice.top + frame.ySlice.height}%)`
    : undefined;

  return (
    <div
      aria-label="404"
      className="relative inline-block"
      style={{ lineHeight: 0.9 }}
    >
      {/* Base — always visible, slides in once */}
      {text.split('').map((d, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block font-mono font-bold text-zinc-900"
          style={DIGIT_STYLE}
        >
          {d}
        </motion.span>
      ))}

      {/* Red channel — glitch only */}
      {frame && (
        <span
          aria-hidden
          className="absolute inset-0 font-mono font-bold pointer-events-none"
          style={{
            ...DIGIT_STYLE,
            color: 'rgba(239,68,68,0.7)',
            transform: `translateX(${frame.xR}px)`,
            clipPath,
            mixBlendMode: 'multiply',
          }}
        >
          {text}
        </span>
      )}

      {/* Blue channel — glitch only */}
      {frame && (
        <span
          aria-hidden
          className="absolute inset-0 font-mono font-bold pointer-events-none"
          style={{
            ...DIGIT_STYLE,
            color: 'rgba(59,130,246,0.7)',
            transform: `translateX(${frame.xB}px)`,
            clipPath,
            mixBlendMode: 'multiply',
          }}
        >
          {text}
        </span>
      )}

      {/* Whole-block opacity flicker */}
      {frame && (
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-white/[0.03] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, frame.opacity * 0.08, 0] }}
          transition={{ duration: 0.07 }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Map markers
───────────────────────────────────────────────────── */
const MARKERS = [
  { lat: 40.7128,  lng: -74.006,  size: 0.5, pulse: true  },
  { lat: 51.5074,  lng: -0.1278,  size: 0.5, pulse: false },
  { lat: 35.6762,  lng: 139.6503, size: 0.45,pulse: false },
  { lat: 37.7749,  lng: -122.419, size: 0.4, pulse: true  },
  { lat: -33.8688, lng: 151.2093, size: 0.35,pulse: false },
] as const;

/* ─────────────────────────────────────────────────────
   Screen-level glitch overlay (random horizontal slice
   that flashes white during a glitch frame)
───────────────────────────────────────────────────── */
function ScreenGlitch({ frame }: { frame: GlitchFrame | null }) {
  if (!frame) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 z-50"
      style={{
        top: `${frame.ySlice.top}%`,
        height: `${frame.ySlice.height * 0.3}%`,
        background: `rgba(0,0,0,${frame.opacity * 0.04})`,
        transform: `translateX(${frame.xR * 0.3}px)`,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────
   Root page
───────────────────────────────────────────────────── */
export default function NotFound() {
  const router = useRouter();
  const frame = useGlitch();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#fafafa] text-zinc-900 font-mono select-none">

      {/* Screen-wide glitch flash */}
      <AnimatePresence>{frame && <ScreenGlitch frame={frame} />}</AnimatePresence>

      {/* ── Map: right half, fading left ── */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[65%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: frame ? 0.7 : 1 }}
        transition={{ duration: frame ? 0.05 : 2.5, ease: 'easeOut' }}
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 28%, black 65%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 28%, black 65%)',
          filter: frame ? `hue-rotate(${frame.xB * 3}deg) saturate(1.4)` : 'none',
        }}
      >
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to bottom, #fafafa 0%, transparent 15%, transparent 85%, #fafafa 100%)',
          }}
        />
        <DottedMap
          width={160}
          height={80}
          mapSamples={6000}
          dotRadius={0.2}
          dotColor="rgba(0,0,0,0.11)"
          markerColor="rgba(0,0,0,0.45)"
          pulse
          markers={MARKERS as any}
          className="w-full h-full"
        />
      </motion.div>

      {/* ── Left content ── */}
      <div className="relative z-10 h-full flex flex-col justify-between px-16 py-12 max-w-xl">

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[11px] tracking-[0.2em] uppercase text-zinc-900"
        >
          Nebula
        </motion.div>

        {/* Main content */}
        <div className="flex flex-col gap-8">

          {/* Glitchable 404 */}
          <GlitchDigits frame={frame} />

          {/* Divider */}
          <motion.div
            className="h-[1px] bg-zinc-900/15 w-24"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ transformOrigin: 'left' }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Label + body */}
          <div className="flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <HyperText
                as="h1"
                duration={700}
                delay={650}
                animateOnHover
                startOnView={false}
                characterSet={['_', '-', '/', '0', '1', '#']}
                className="py-0 text-[11px] font-mono tracking-[0.2em] uppercase text-zinc-500 overflow-visible"
              >
                Page not found
              </HyperText>
            </motion.div>

            <motion.p
              className="text-[13px] text-zinc-600 leading-[1.7] max-w-[300px]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.5, ease: 'easeOut' }}
            >
              This subdomain has either drifted out of orbit, or you made it up just to see our edge servers sweat. (They are sweating).
            </motion.p>
          </div>

          {/* Actions */}
          <motion.div
            className="flex items-center gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.88, duration: 0.4 }}
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer group"
            >
              <ArrowLeft
                className="h-3 w-3 transition-transform group-hover:-translate-x-0.5"
                strokeWidth={1.5}
              />
              Go back
            </button>
          </motion.div>
        </div>

        {/* Footer line */}
        <motion.div
          className="text-[9px] tracking-[0.18em] uppercase text-zinc-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Status 404
        </motion.div>
      </div>
    </div>
  );
}
