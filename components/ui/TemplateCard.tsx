"use client";

import { useState } from "react";

type TemplateCardProps = {
  title?: string;
  description?: string;
  funnyDesc?: string;
  logo?: string;
  variant?: "starter" | "chat" | "slack" | "api" | "fullstack";
  tags?: { label: string; color: string }[];
  featured?: boolean;
  onClick?: () => void;
};

/* ── Per-variant SVG thumbnail previews ─────────────────────────── */

function StarterPreview() {
  return (
    <svg viewBox="0 0 420 220" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <rect width="420" height="220" fill="#0a0a0a" />
      {/* top nav bar */}
      <rect x="0" y="0" width="420" height="28" fill="#111113" />
      <circle cx="14" cy="14" r="4" fill="#ef4444" />
      <circle cx="28" cy="14" r="4" fill="#eab308" />
      <circle cx="42" cy="14" r="4" fill="#22c55e" />
      <rect x="160" y="9" width="100" height="10" rx="5" fill="#1f1f23" />
      {/* sidebar */}
      <rect x="0" y="28" width="80" height="192" fill="#111113" />
      <rect x="12" y="42" width="56" height="6" rx="3" fill="#27272a" />
      <rect x="12" y="56" width="48" height="6" rx="3" fill="#1f1f23" />
      <rect x="12" y="70" width="52" height="6" rx="3" fill="#1f1f23" />
      <rect x="12" y="84" width="40" height="6" rx="3" fill="#1f1f23" />
      <rect x="8" y="100" width="64" height="8" rx="4" fill="#3b82f620" />
      <rect x="12" y="102" width="44" height="4" rx="2" fill="#3b82f6" />
      <rect x="12" y="118" width="50" height="6" rx="3" fill="#1f1f23" />
      {/* hero section */}
      <rect x="100" y="46" width="180" height="12" rx="3" fill="#27272a" />
      <rect x="100" y="66" width="260" height="7" rx="3" fill="#1f1f23" />
      <rect x="100" y="80" width="220" height="7" rx="3" fill="#18181b" />
      {/* CTA buttons */}
      <rect x="100" y="100" width="70" height="20" rx="6" fill="#3b82f6" />
      <rect x="180" y="100" width="70" height="20" rx="6" fill="#1f1f23" />
      {/* content cards */}
      <rect x="100" y="136" width="95" height="60" rx="6" fill="#111113" />
      <rect x="205" y="136" width="95" height="60" rx="6" fill="#111113" />
      <rect x="310" y="136" width="95" height="60" rx="6" fill="#111113" />
      <rect x="108" y="148" width="50" height="5" rx="2" fill="#27272a" />
      <rect x="108" y="158" width="70" height="4" rx="2" fill="#1f1f23" />
      <rect x="213" y="148" width="45" height="5" rx="2" fill="#27272a" />
      <rect x="213" y="158" width="65" height="4" rx="2" fill="#1f1f23" />
      <rect x="318" y="148" width="55" height="5" rx="2" fill="#27272a" />
      <rect x="318" y="158" width="60" height="4" rx="2" fill="#1f1f23" />
    </svg>
  );
}

function ChatPreview() {
  return (
    <svg viewBox="0 0 420 220" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <rect width="420" height="220" fill="#0a0a0a" />
      {/* top bar */}
      <rect x="0" y="0" width="420" height="28" fill="#111113" />
      <circle cx="396" cy="14" r="6" fill="#27272a" />
      <rect x="16" y="10" width="60" height="8" rx="3" fill="#27272a" />
      <circle cx="6" cy="14" r="3" fill="#22c55e" />
      {/* messages area */}
      {/* AI message left */}
      <circle cx="30" cy="52" r="10" fill="#1e1b4b" />
      <rect x="46" y="42" width="180" height="22" rx="10" fill="#1f1f23" />
      <rect x="54" y="49" width="100" height="5" rx="2" fill="#3f3f46" />
      <rect x="54" y="57" width="60" height="4" rx="2" fill="#27272a" />
      {/* User message right */}
      <rect x="220" y="78" width="160" height="22" rx="10" fill="#1d4ed8" />
      <rect x="232" y="85" width="90" height="5" rx="2" fill="#93c5fd" />
      <rect x="232" y="93" width="50" height="4" rx="2" fill="#60a5fa" />
      {/* AI message left */}
      <circle cx="30" cy="120" r="10" fill="#1e1b4b" />
      <rect x="46" y="108" width="240" height="28" rx="10" fill="#1f1f23" />
      <rect x="54" y="115" width="160" height="5" rx="2" fill="#3f3f46" />
      <rect x="54" y="123" width="120" height="4" rx="2" fill="#27272a" />
      <rect x="54" y="130" width="80" height="4" rx="2" fill="#27272a" />
      {/* User message right */}
      <rect x="260" y="150" width="120" height="20" rx="10" fill="#1d4ed8" />
      <rect x="272" y="157" width="70" height="5" rx="2" fill="#93c5fd" />
      {/* Input bar */}
      <rect x="12" y="188" width="360" height="24" rx="12" fill="#18181b" />
      <rect x="24" y="197" width="80" height="5" rx="2" fill="#3f3f46" />
      <circle cx="392" cy="200" r="10" fill="#3b82f6" />
      <path d="M388 200 L392 196 L396 200 M392 196 V204" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SlackPreview() {
  return (
    <svg viewBox="0 0 420 220" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <rect width="420" height="220" fill="#0a0a0a" />
      {/* top bar */}
      <rect x="0" y="0" width="420" height="28" fill="#111113" />
      <rect x="120" y="9" width="80" height="10" rx="5" fill="#1f1f23" />
      {/* channels sidebar */}
      <rect x="0" y="28" width="110" height="192" fill="#0d0d10" />
      <rect x="10" y="38" width="60" height="7" rx="2" fill="#27272a" />
      {/* channel items */}
      <rect x="10" y="54" width="90" height="6" rx="2" fill="#1f1f23" />
      <circle cx="16" cy="57" r="2" fill="#22c55e" />
      <rect x="10" y="66" width="75" height="6" rx="2" fill="#1f1f23" />
      <rect x="10" y="78" width="85" height="6" rx="2" fill="#7c3aed50" />
      <circle cx="16" cy="81" r="2" fill="#a855f7" />
      <rect x="10" y="90" width="70" height="6" rx="2" fill="#1f1f23" />
      <rect x="10" y="108" width="50" height="6" rx="2" fill="#3f3f46" />
      <rect x="10" y="120" width="80" height="6" rx="2" fill="#1f1f23" />
      <rect x="10" y="132" width="65" height="6" rx="2" fill="#1f1f23" />
      {/* main channel */}
      <rect x="110" y="28" width="1" height="192" fill="#1f1f23" />
      <rect x="120" y="36" width="80" height="8" rx="2" fill="#27272a" />
      {/* bot message */}
      <rect x="140" y="56" width="14" height="14" rx="3" fill="#7c3aed" />
      <rect x="148" y="60" width="4" height="4" rx="1" fill="white" />
      <rect x="146" y="66" width="4" height="2" rx="1" fill="white" />
      <rect x="160" y="56" width="50" height="5" rx="2" fill="#a1a1aa" />
      <rect x="160" y="64" width="200" height="6" rx="2" fill="#27272a" />
      <rect x="160" y="74" width="160" height="5" rx="2" fill="#1f1f23" />
      {/* code block */}
      <rect x="160" y="86" width="220" height="40" rx="4" fill="#0f0f12" />
      <rect x="170" y="94" width="120" height="5" rx="2" fill="#22c55e50" />
      <rect x="170" y="104" width="180" height="5" rx="2" fill="#3b82f650" />
      <rect x="170" y="114" width="100" height="5" rx="2" fill="#22c55e50" />
      {/* user message */}
      <circle cx="130" cy="146" r="8" fill="#1d4ed8" />
      <rect x="160" y="140" width="40" height="5" rx="2" fill="#a1a1aa" />
      <rect x="160" y="148" width="140" height="6" rx="2" fill="#27272a" />
      {/* input */}
      <rect x="120" y="190" width="286" height="22" rx="6" fill="#18181b" />
      <rect x="132" y="198" width="100" height="5" rx="2" fill="#3f3f46" />
    </svg>
  );
}

function ApiPreview() {
  return (
    <svg viewBox="0 0 420 220" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <rect width="420" height="220" fill="#0a0a0a" />
      {/* top bar */}
      <rect x="0" y="0" width="420" height="28" fill="#111113" />
      <rect x="12" y="8" width="40" height="12" rx="3" fill="#22c55e30" />
      <text x="18" y="17" fontFamily="monospace" fontSize="7" fill="#22c55e">GET</text>
      <rect x="58" y="10" width="200" height="8" rx="4" fill="#1f1f23" />
      <rect x="370" y="7" width="38" height="14" rx="4" fill="#3b82f6" />
      <text x="377" y="17" fontFamily="monospace" fontSize="7" fill="white">Send</text>
      {/* tabs */}
      <rect x="0" y="28" width="420" height="20" fill="#0d0d10" />
      <rect x="12" y="32" width="45" height="12" rx="3" fill="#3b82f620" />
      <text x="20" y="41" fontFamily="monospace" fontSize="7" fill="#3b82f6">Body</text>
      <text x="70" y="41" fontFamily="monospace" fontSize="7" fill="#71717a">Headers</text>
      <text x="120" y="41" fontFamily="monospace" fontSize="7" fill="#71717a">Params</text>
      <text x="170" y="41" fontFamily="monospace" fontSize="7" fill="#71717a">Auth</text>
      {/* JSON response */}
      <rect x="0" y="48" width="420" height="1" fill="#1f1f23" />
      {/* line numbers gutter */}
      <rect x="0" y="49" width="30" height="171" fill="#0d0d10" />
      <text x="14" y="66" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">1</text>
      <text x="14" y="80" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">2</text>
      <text x="14" y="94" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">3</text>
      <text x="14" y="108" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">4</text>
      <text x="14" y="122" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">5</text>
      <text x="14" y="136" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">6</text>
      <text x="14" y="150" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">7</text>
      <text x="14" y="164" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">8</text>
      <text x="14" y="178" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">9</text>
      <text x="14" y="192" fontFamily="monospace" fontSize="7" fill="#3f3f46" textAnchor="end">10</text>
      {/* JSON content */}
      <text x="38" y="66" fontFamily="monospace" fontSize="8" fill="#fbbf24">{"{"}</text>
      <text x="46" y="80" fontFamily="monospace" fontSize="8" fill="#a78bfa">&quot;status&quot;</text>
      <text x="98" y="80" fontFamily="monospace" fontSize="8" fill="#71717a">:</text>
      <text x="106" y="80" fontFamily="monospace" fontSize="8" fill="#22c55e">&quot;200 OK&quot;</text>
      <text x="152" y="80" fontFamily="monospace" fontSize="8" fill="#71717a">,</text>
      <text x="46" y="94" fontFamily="monospace" fontSize="8" fill="#a78bfa">&quot;data&quot;</text>
      <text x="82" y="94" fontFamily="monospace" fontSize="8" fill="#71717a">: {"{"}</text>
      <text x="58" y="108" fontFamily="monospace" fontSize="8" fill="#a78bfa">&quot;id&quot;</text>
      <text x="82" y="108" fontFamily="monospace" fontSize="8" fill="#71717a">:</text>
      <text x="90" y="108" fontFamily="monospace" fontSize="8" fill="#f97316">42</text>
      <text x="102" y="108" fontFamily="monospace" fontSize="8" fill="#71717a">,</text>
      <text x="58" y="122" fontFamily="monospace" fontSize="8" fill="#a78bfa">&quot;name&quot;</text>
      <text x="98" y="122" fontFamily="monospace" fontSize="8" fill="#71717a">:</text>
      <text x="106" y="122" fontFamily="monospace" fontSize="8" fill="#22c55e">&quot;nebula-app&quot;</text>
      <text x="178" y="122" fontFamily="monospace" fontSize="8" fill="#71717a">,</text>
      <text x="58" y="136" fontFamily="monospace" fontSize="8" fill="#a78bfa">&quot;deployed&quot;</text>
      <text x="122" y="136" fontFamily="monospace" fontSize="8" fill="#71717a">:</text>
      <text x="130" y="136" fontFamily="monospace" fontSize="8" fill="#f97316">true</text>
      <text x="58" y="150" fontFamily="monospace" fontSize="8" fill="#71717a">{"}"}</text>
      <text x="46" y="164" fontFamily="monospace" fontSize="8" fill="#71717a">,</text>
      <text x="46" y="178" fontFamily="monospace" fontSize="8" fill="#a78bfa">&quot;latency&quot;</text>
      <text x="106" y="178" fontFamily="monospace" fontSize="8" fill="#71717a">:</text>
      <text x="114" y="178" fontFamily="monospace" fontSize="8" fill="#22c55e">&quot;12ms&quot;</text>
      <text x="38" y="192" fontFamily="monospace" fontSize="8" fill="#fbbf24">{"}"}</text>
      {/* status badge */}
      <rect x="340" y="54" width="68" height="16" rx="4" fill="#22c55e20" />
      <circle cx="352" cy="62" r="3" fill="#22c55e" />
      <text x="360" y="66" fontFamily="monospace" fontSize="7" fill="#22c55e">200 OK</text>
    </svg>
  );
}

function FullstackPreview() {
  return (
    <svg viewBox="0 0 420 220" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <rect width="420" height="220" fill="#0a0a0a" />
      {/* top bar */}
      <rect x="0" y="0" width="420" height="28" fill="#111113" />
      <rect x="12" y="9" width="50" height="10" rx="3" fill="#27272a" />
      <circle cx="396" cy="14" r="6" fill="#27272a" />
      <circle cx="376" cy="14" r="6" fill="#27272a" />
      {/* sidebar */}
      <rect x="0" y="28" width="60" height="192" fill="#0d0d10" />
      <rect x="14" y="42" width="32" height="32" rx="6" fill="#1f1f23" />
      <rect x="14" y="82" width="32" height="32" rx="6" fill="#1f1f23" />
      <rect x="14" y="122" width="32" height="32" rx="6" fill="#3b82f620" />
      <rect x="14" y="162" width="32" height="32" rx="6" fill="#1f1f23" />
      {/* metric cards row */}
      <rect x="72" y="36" width="100" height="50" rx="6" fill="#111113" />
      <rect x="178" y="36" width="100" height="50" rx="6" fill="#111113" />
      <rect x="284" y="36" width="124" height="50" rx="6" fill="#111113" />
      {/* card 1 - Requests */}
      <rect x="82" y="44" width="40" height="5" rx="2" fill="#71717a" />
      <rect x="82" y="54" width="55" height="9" rx="2" fill="#22c55e" />
      <rect x="82" y="68" width="70" height="4" rx="2" fill="#1f1f23" />
      <rect x="82" y="74" width="80" height="3" rx="1" fill="#22c55e30" />
      <rect x="82" y="74" width="56" height="3" rx="1" fill="#22c55e" />
      {/* card 2 - Latency */}
      <rect x="188" y="44" width="35" height="5" rx="2" fill="#71717a" />
      <rect x="188" y="54" width="40" height="9" rx="2" fill="#3b82f6" />
      <rect x="188" y="68" width="60" height="4" rx="2" fill="#1f1f23" />
      <rect x="188" y="74" width="80" height="3" rx="1" fill="#3b82f630" />
      <rect x="188" y="74" width="32" height="3" rx="1" fill="#3b82f6" />
      {/* card 3 - Uptime */}
      <rect x="294" y="44" width="45" height="5" rx="2" fill="#71717a" />
      <rect x="294" y="54" width="60" height="9" rx="2" fill="#a855f7" />
      <rect x="294" y="68" width="80" height="4" rx="2" fill="#1f1f23" />
      <rect x="294" y="74" width="100" height="3" rx="1" fill="#a855f730" />
      <rect x="294" y="74" width="98" height="3" rx="1" fill="#a855f7" />
      {/* chart area */}
      <rect x="72" y="94" width="206" height="90" rx="6" fill="#111113" />
      <rect x="82" y="102" width="60" height="6" rx="2" fill="#27272a" />
      {/* chart line */}
      <polyline points="86,168 110,155 134,160 158,140 182,145 206,130 230,125 254,120 266,135" fill="none" stroke="#3b82f6" strokeWidth="2" />
      <polyline points="86,168 110,155 134,160 158,140 182,145 206,130 230,125 254,120 266,135 266,172 86,172" fill="#3b82f610" />
      <rect x="82" y="172" width="186" height="1" fill="#1f1f23" />
      {/* Docker containers panel */}
      <rect x="284" y="94" width="124" height="90" rx="6" fill="#111113" />
      <rect x="294" y="102" width="55" height="6" rx="2" fill="#27272a" />
      {/* container items */}
      <rect x="294" y="116" width="104" height="16" rx="4" fill="#0d0d10" />
      <circle cx="302" cy="124" r="3" fill="#22c55e" />
      <rect x="310" y="121" width="50" height="5" rx="2" fill="#27272a" />
      <rect x="294" y="138" width="104" height="16" rx="4" fill="#0d0d10" />
      <circle cx="302" cy="146" r="3" fill="#22c55e" />
      <rect x="310" y="143" width="40" height="5" rx="2" fill="#27272a" />
      <rect x="294" y="160" width="104" height="16" rx="4" fill="#0d0d10" />
      <circle cx="302" cy="168" r="3" fill="#eab308" />
      <rect x="310" y="165" width="55" height="5" rx="2" fill="#27272a" />
      {/* bottom status bar */}
      <rect x="72" y="192" width="336" height="20" rx="4" fill="#111113" />
      <circle cx="84" cy="202" r="3" fill="#22c55e" />
      <rect x="92" y="199" width="70" height="5" rx="2" fill="#27272a" />
      <rect x="340" y="199" width="50" height="5" rx="2" fill="#1f1f23" />
    </svg>
  );
}

function getPreviewSvg(variant?: string) {
  switch (variant) {
    case "starter": return <StarterPreview />;
    case "chat":    return <ChatPreview />;
    case "slack":   return <SlackPreview />;
    case "api":     return <ApiPreview />;
    case "fullstack": return <FullstackPreview />;
    default:        return <StarterPreview />;
  }
}

/* ── Main Component ─────────────────────────────────────────────── */

export default function TemplateCard({
  title = "eve Content Agent",
  description = "Draft blog posts, LinkedIn posts, release notes, and…",
  funnyDesc,
  logo = "N",
  variant,
  tags,
  featured = false,
  onClick,
}: TemplateCardProps) {
  const [hovered, setHovered] = useState(false);

  if (featured) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative block w-full h-[160px] bg-card text-card-foreground border border-border rounded-xl overflow-hidden no-underline cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] hover:border-neutral-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
        style={{
          transform: hovered ? "translateY(-3px) scale(1.01)" : "none",
        }}
      >
        <div className="flex flex-row h-full">
          {/* Left visual panel */}
          <div className="w-40 shrink-0 bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-100 dark:from-[#090B14] dark:via-[#0D1526] dark:to-[#090B14] flex items-center justify-center relative">
            <div
              className="text-4xl select-none transition-all duration-300"
              style={{
                opacity: hovered ? 0.8 : 0.5,
                transform: hovered ? "scale(1.1)" : "scale(1)",
              }}
            >
              {logo}
            </div>
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-indigo-600/80 text-[8px] font-mono text-white font-bold tracking-wider uppercase">
              Featured
            </div>
          </div>

          {/* Right info panel */}
          <div className="p-5 flex-1 flex flex-col justify-center border-l border-border bg-card">
            <div className="flex items-center gap-2">
              <h3 className={`m-0 text-sm font-bold transition-colors duration-200 ${
                hovered ? "text-indigo-600 dark:text-indigo-400" : "text-card-foreground"
              }`}>
                {title}
              </h3>
              <svg
                viewBox="0 0 16 16"
                height="12"
                width="12"
                className="flex-shrink-0 text-card-foreground transition-all duration-200"
                style={{
                  opacity: hovered ? 1 : 0,
                  transform: hovered
                    ? "translate(0, 0)"
                    : "translate(-4px, 4px)",
                }}
                aria-hidden="true"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 12 12 4M5 4h7v7"
                />
              </svg>
            </div>

            <p
              className="m-0 text-xs text-muted-foreground mt-1 leading-snug transition-all duration-200"
              style={{
                display: hovered && funnyDesc ? "none" : "block",
              }}
            >
              {description}
            </p>
            {funnyDesc && (
              <p
                className="m-0 text-xs text-muted-foreground/85 font-medium mt-1 italic leading-snug transition-all duration-200"
                style={{
                  display: hovered ? "block" : "none",
                }}
              >
                &quot;{funnyDesc}&quot;
              </p>
            )}

            {tags && tags.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="text-[9px] px-2 py-0.5 rounded-full font-mono border"
                    style={{
                      color: tag.color,
                      backgroundColor: `${tag.color}15`,
                      borderColor: `${tag.color}30`,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block w-full h-52 bg-card text-card-foreground border border-border rounded-xl overflow-hidden no-underline cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.1)] hover:border-neutral-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
      style={{
        transform: hovered ? "translateY(-4px) scale(1.02)" : "none",
      }}
    >
      {/* Text content */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <div className="flex items-center max-w-max pr-2">
          <h3 className={`m-0 text-sm leading-none font-bold whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200 ${
            hovered ? "text-blue-600 dark:text-blue-400" : "text-card-foreground"
          }`}>
            {title}
          </h3>
          <svg
            viewBox="0 0 16 16"
            height="12"
            width="12"
            className="ml-1.5 flex-shrink-0 text-card-foreground transition-all duration-200"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered
                ? "translate(0, 0)"
                : "translate(-4px, 4px)",
            }}
            aria-hidden="true"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 12 12 4M5 4h7v7"
            />
          </svg>
        </div>

        <p
          className="m-0 max-w-[90%] text-xs leading-tight text-muted-foreground line-clamp-2 transition-all duration-200"
          style={{
            display: hovered && funnyDesc ? "none" : "-webkit-box",
          }}
        >
          {description}
        </p>
        {funnyDesc && (
          <p
            className="m-0 max-w-[90%] text-[11px] leading-tight text-muted-foreground/85 font-medium italic line-clamp-2 transition-all duration-200"
            style={{
              display: hovered ? "-webkit-box" : "none",
            }}
          >
            &quot;{funnyDesc}&quot;
          </p>
        )}
      </div>

      {/* Tilted thumbnail - variant-specific */}
      <div
        className="absolute w-[105%] h-full rounded-lg overflow-hidden border border-border shadow-[0_-6px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out"
        style={{
          top: "55%",
          left: "12%",
          transformOrigin: "bottom right",
          transform: hovered
            ? "translate(6px, 6px) rotate(2deg)"
            : "rotate(-6deg)",
        }}
      >
        {getPreviewSvg(variant)}
      </div>

      {/* Deploy badge */}
      <div
        className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-white/95 dark:bg-black/70 border border-border text-[9px] font-mono text-muted-foreground transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        Click to Deploy
      </div>
    </div>
  );
}
