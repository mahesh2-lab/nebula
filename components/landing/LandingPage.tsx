'use client';

import * as React from 'react';
import { useLandingPage, FeatureTab } from '../context/landing-page-context';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Github, 
  ArrowRight, 
  Terminal, 
  Globe, 
  Shield, 
  Zap, 
  CheckCircle2, 
  Menu, 
  X,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  Activity,
  Cpu
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InteractiveGlobe } from './InteractiveGlobe';
import { AnimatedGridPattern } from '../magicui/animated-grid-pattern';
import { AnimatedShinyText } from '../magicui/animated-shiny-text';
import { AnimatedBeam } from '../magicui/animated-beam';
import { BorderBeam } from '../magicui/border-beam';
import { NumberTicker } from '../magicui/number-ticker';
import { BlurFade } from '../magicui/blur-fade';

// Mock GitHub repositories
const MOCK_REPOS = [
  { name: 'nebula-nextjs-starter', description: 'Next.js 16 Edge runtime template with Tailwind v4', language: 'TypeScript', updated: '2 hrs ago' },
  { name: 'rust-wasm-image-service', description: 'WebAssembly compiler toolchain for on-the-fly media transformations', language: 'Rust', updated: '1 day ago' },
  { name: 'python-fastapi-telemetry', description: 'Serverless analytical endpoint mapping client-side payloads', language: 'Python', updated: '3 days ago' },
];

// Mock terminal build lines
const LOG_SEQUENCE = [
  { text: 'Nebula Container Agent initialized in region iad1 (US East)...', type: 'system' },
  { text: 'Allocating serverless micro-container instance. CPU: 1 vCPU, RAM: 512MB...', type: 'system' },
  { text: 'Pulling git commit ref a3d2f9b (main)...', type: 'info' },
  { text: 'pnpm install --frozen-lockfile', type: 'command' },
  { text: 'Lockfile verified. Resolution progress: resolved 520, downloaded 40...', type: 'stdout' },
  { text: 'pnpm run build', type: 'command' },
  { text: 'next build', type: 'stdout' },
  { text: '  ▲ Next.js 16.2.9', type: 'stdout' },
  { text: '  Creating an optimized production build...', type: 'stdout' },
  { text: '  ✓ Compiled client and server templates. [2.8s]', type: 'stdout' },
  { text: '  ✓ Route (app)             Size     First Load JS', type: 'stdout' },
  { text: '  ┌ ○ /                     1.22 kB        84.3 kB', type: 'stdout' },
  { text: '  └ λ /api/deploy           890 B          72.1 kB', type: 'stdout' },
  { text: 'Uploading compilation bundle to Edge distribution nodes...', type: 'system' },
  { text: 'CDN Edge synchronization complete. Replicated to: sfo1, cdg1, hnd1.', type: 'info' },
  { text: '✔ Deployment is live: https://starter.nebula.dev', type: 'success' },
];

export function LandingPage() {
  const router = useRouter();
  const {
    activeFeature,
    setActiveFeature,
    pricingTier,
    setPricingTier,
    emailInput,
    setEmailInput,
    isSubmitting,
    submitWaitlist
  } = useLandingPage();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Tab State 1: Git Integration States
  const [importedRepos, setImportedRepos] = React.useState<Record<string, 'importing' | 'imported' | 'idle'>>({});
  
  // Tab State 2: Telemetry Build log streamer
  const [logLines, setLogLines] = React.useState<typeof LOG_SEQUENCE>([]);
  const [logIndex, setLogIndex] = React.useState(0);
  const logEndRef = React.useRef<HTMLDivElement>(null);
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  // Tab State 3: Environment Secrets States
  const [secrets, setSecrets] = React.useState([
    { id: '1', key: 'DATABASE_URL', value: 'postgresql://nebula_admin:••••••••••••@ep-cool-waterfall-8389.us-east-1.neon.tech/main', env: 'Production', show: false },
    { id: '2', key: 'NEXT_PUBLIC_STRIPE_KEY', value: 'pk_live_51Msz83921021bc', env: 'Production & Preview', show: false },
    { id: '3', key: 'JWT_SECRET_KEY', value: 'sk_live_51Msz83921021bc_secret_value_nebula_demo', env: 'All Environments', show: false },
  ]);
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [newEnv, setNewEnv] = React.useState('Production');

  // Bento Card Logs
  const [bentoLogs, setBentoLogs] = React.useState<string[]>([
    'Initializing deployment agent...',
    'Cloning git repository: starter-template...',
    'Running compiler pipeline optimization...'
  ]);

  // Framer Motion Scroll Progression for Hero perspective tilt
  const targetRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [0, 15]);
  const opacityVal = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  // Magic UI Animated Beam Refs
  const beamContainerRef = React.useRef<HTMLDivElement>(null);
  const beamFromRef = React.useRef<HTMLDivElement>(null);
  const beamToRef = React.useRef<HTMLDivElement>(null);
  const beamToRef2a = React.useRef<HTMLDivElement>(null);
  const beamToRef2b = React.useRef<HTMLDivElement>(null);
  const beamToRef2c = React.useRef<HTMLDivElement>(null);

  // Smooth scroll
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Trigger import simulator
  const handleImport = (repoName: string) => {
    setImportedRepos(prev => ({ ...prev, [repoName]: 'importing' }));
    setTimeout(() => {
      setImportedRepos(prev => ({ ...prev, [repoName]: 'imported' }));
      toast.success(`Connected ${repoName} successfully! Launching compiler pipeline...`);
      
      // Auto-transition to Telemetry logs tab and reset stream
      setTimeout(() => {
        setActiveFeature('analytics');
        setLogLines([]);
        setLogIndex(0);
      }, 600);
    }, 1500);
  };

  const handleRestartBuild = () => {
    setLogLines([]);
    setLogIndex(0);
    toast.info('Re-running compiler build pipeline...');
  };

  // Streaming build logs simulation loop
  React.useEffect(() => {
    if (activeFeature !== 'analytics') {
      setLogLines([]);
      setLogIndex(0);
      return;
    }

    if (logIndex < LOG_SEQUENCE.length) {
      const interval = setTimeout(() => {
        setLogLines(prev => [...prev, LOG_SEQUENCE[logIndex]]);
        setLogIndex(prev => prev + 1);
      }, logIndex === 0 ? 300 : logIndex === 7 || logIndex === 13 ? 1200 : 400);
      return () => clearTimeout(interval);
    } else {
      const restart = setTimeout(() => {
        setLogLines([]);
        setLogIndex(0);
      }, 5000);
      return () => clearTimeout(restart);
    }
  }, [activeFeature, logIndex]);

  // Scroll to bottom of terminal container only (avoiding page viewport scrolling)
  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logLines]);

  // Bento Card Logs simulation
  React.useEffect(() => {
    const timer = setInterval(() => {
      setBentoLogs((prev) => {
        const nextLogs = [...prev];
        if (nextLogs.length > 4) nextLogs.shift();
        const messages = [
          'Resolving package manifests...',
          'Tree-shaking dead code trees...',
          'Syncing edge proxy routes...',
          'AES secret keys hydrated',
          'Deploying to ap-northeast-1...'
        ];
        const nextMsg = messages[Math.floor(Math.random() * messages.length)];
        nextLogs.push(`[${new Date().toLocaleTimeString()}] ${nextMsg}`);
        return nextLogs;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setSecrets(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        key: newKey.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
        value: newValue,
        env: newEnv,
        show: false
      }
    ]);
    setNewKey('');
    setNewValue('');
    toast.success('Secret key added to AES-256 GCM vault.');
  };

  const handleDeleteSecret = (id: string) => {
    setSecrets(prev => prev.filter(s => s.id !== id));
    toast.success('Secret key deleted from vault.');
  };

  const toggleShowSecret = (id: string) => {
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, show: !s.show } : s));
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FAFAFA] font-sans antialiased selection:bg-white selection:text-black overflow-x-hidden relative">
      
      {/* Vercel-style scroll-triggered background grid lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Horizontal grid lines */}
        <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute top-[320px] left-0 right-0 h-[1px] bg-zinc-900/40" />
        <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }} className="absolute top-[900px] left-0 right-0 h-[1px] bg-zinc-900/30" />
        <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute top-[1700px] left-0 right-0 h-[1px] bg-zinc-900/30" />
        <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute top-[2600px] left-0 right-0 h-[1px] bg-zinc-900/30" />
        
        {/* Vertical grid lines */}
        <div className="max-w-6xl mx-auto h-full w-full relative flex justify-between">
          <motion.div initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeInOut" }} className="w-[1px] bg-zinc-900/40 h-full" />
          <motion.div initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }} className="w-[1px] bg-zinc-900/20 h-full hidden md:block" />
          <motion.div initial={{ height: 0 }} whileInView={{ height: '100%' }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeInOut", delay: 0.1 }} className="w-[1px] bg-zinc-900/40 h-full" />
        </div>
      </div>

      {/* Floating Apple-style Pill Navigation Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl bg-[#0b0b0c]/85 backdrop-blur-xl border border-[#1f1f1f] px-6 py-3 rounded-full flex items-center justify-between z-50 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="text-white text-base font-bold tracking-tight select-none">▲</span>
          <span className="text-xs font-bold tracking-widest font-mono text-[#ffffff] select-none">NEBULA</span>
        </div>

        {/* Menu links */}
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-mono tracking-widest text-[#a1a1aa] uppercase select-none">
          <button onClick={() => scrollToSection('features-bento')} className="hover:text-white transition-colors cursor-pointer">Specs</button>
          <button onClick={() => scrollToSection('features-tab')} className="hover:text-white transition-colors cursor-pointer">Sandbox</button>
          <button onClick={() => scrollToSection('edge')} className="hover:text-white transition-colors cursor-pointer">Network</button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-1.5 border border-[#1f1f1f] bg-transparent text-[#ffffff] hover:bg-[#1f1f1f] text-[10px] font-bold tracking-wider rounded-full transition-all uppercase cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-1.5 bg-white text-black text-[10px] font-bold tracking-wider rounded-full hover:bg-zinc-200 transition-all uppercase cursor-pointer shadow-sm"
          >
            Console
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/98 z-40 flex flex-col items-center justify-center gap-8 text-xs font-mono tracking-widest"
          >
            <button onClick={() => scrollToSection('features-bento')} className="text-zinc-400 hover:text-white">SPECS</button>
            <button onClick={() => scrollToSection('features-tab')} className="text-zinc-400 hover:text-white">SANDBOX</button>
            <button onClick={() => scrollToSection('edge')} className="text-zinc-400 hover:text-white">NETWORK</button>
            <button onClick={() => scrollToSection('pricing')} className="text-zinc-400 hover:text-white">PRICING</button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                router.push('/dashboard');
              }}
              className="px-6 py-2.5 bg-white text-black font-bold rounded-full font-mono"
            >
              ENTER WORKSPACE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full">
        {/* Section 1: Hero Area with Scroll Perspective animation */}
        <section ref={targetRef} className="relative pt-44 pb-20 px-6 flex flex-col items-center text-center space-y-8 overflow-hidden select-none">
          {/* Background slow pulse gradient */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-[#22c55e]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

          {/* Animated background grid pattern from Magic UI */}
          <AnimatedGridPattern
            numSquares={24}
            maxOpacity={0.065}
            duration={4}
            repeatDelay={0.5}
            className="[mask-image:radial-gradient(350px_circle_at_center,white,transparent)] inset-y-[-20%] h-[140%] select-none pointer-events-none opacity-40"
          />

          {/* Headline and Announcement Badge */}
          <BlurFade delay={0.1} className="space-y-4 max-w-4xl flex flex-col items-center">
            <div className="inline-flex items-center justify-center mb-2">
              <div className="group rounded-full border border-white/5 bg-neutral-900 hover:bg-neutral-800 transition-all hover:cursor-pointer">
                <AnimatedShinyText className="inline-flex items-center justify-center px-4.5 py-1 text-white">
                  <span className="text-[9px] font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                    ✨ Introducing Nebula 1.0 <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                  </span>
                </AnimatedShinyText>
              </div>
            </div>

            <BlurFade delay={0.25} direction="up" offset={8}>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-[-0.045em] leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 font-sans text-center">
                Deploy code.<br />
                <span className="bg-gradient-to-r from-white via-zinc-400 to-[#22c55e] bg-clip-text text-transparent">Instant edge.</span> Zero overhead.
              </h1>
            </BlurFade>
          </BlurFade>

          {/* Subtitle */}
          <BlurFade delay={0.4} direction="up" offset={8}>
            <p className="text-xs sm:text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed tracking-tight text-center">
              Nebula connects git repository code directly to global micro-containers. Sub-second cold starts, automated SSL mappings, and live deployment simulation.
            </p>
          </BlurFade>

          {/* Waitlist Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="w-full max-w-md pt-4"
          >
            <form onSubmit={submitWaitlist} className="flex flex-col sm:flex-row gap-2 p-1.5 bg-[#0c0c0e] border border-[#1f1f1f] rounded-full focus-within:ring-2 focus-within:ring-white/20 transition-all">
              <input
                type="email"
                placeholder="name@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-transparent text-xs text-white rounded-full outline-none focus:ring-0 font-mono tracking-wide"
                required
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 font-bold text-[10px] tracking-wider rounded-full transition-all font-mono uppercase cursor-pointer"
              >
                {isSubmitting ? 'JOINING...' : 'JOIN WAITLIST'}
              </button>
            </form>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-4 flex items-center justify-center gap-1.5 select-none">
              <span>Join</span>
              <NumberTicker value={18290} />
              <span>developers deploying on Nebula today</span>
            </p>
          </motion.div>

          {/* 3D Perspective Visual - Tilts and rotates on scroll like iPhone landing page */}
          <motion.div
            style={{ 
              scale, 
              rotateX, 
              opacity: opacityVal,
              perspective: 1200,
              transformStyle: "preserve-3d"
            }}
            className="w-full max-w-4xl pt-16 px-4"
          >
            <div className="border border-[#1f1f1f] bg-[#0c0c0e] rounded-md overflow-hidden shadow-[0_0_120px_rgba(255,255,255,0.03)] relative">
              {/* Window bar */}
              <div className="flex justify-between items-center px-4 py-2 border-b border-[#1f1f1f] bg-black/40">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 bg-[#1f1f1f] rounded-full" />
                  <span className="h-2.5 w-2.5 bg-[#1f1f1f] rounded-full" />
                  <span className="h-2.5 w-2.5 bg-[#1f1f1f] rounded-full" />
                </div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Active Edge Network Simulation</span>
                <div className="w-10" />
              </div>

              {/* Globe Visual */}
              <div className="h-[300px] sm:h-[450px] w-full relative bg-[#000000] overflow-hidden">
                <InteractiveGlobe />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Features Bento Grid (Specs) */}
        <section id="features-bento" className="py-24 px-6 max-w-5xl mx-auto w-full space-y-12 border-t border-[#1f1f1f]/40 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-3"
          >
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Engineered for absolute performance.
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nebula core infrastructure specifications</p>
          </motion.div>

          {/* Bento grid cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Global Edge Delivery */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-2 border border-[#1f1f1f] bg-[#0c0c0e] p-7 rounded-md flex flex-col md:flex-row justify-between items-center gap-6 min-h-[260px] overflow-hidden group hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2 max-w-sm select-none">
                <div className="h-8 w-8 rounded-full bg-[#111113] border border-[#1f1f1f] flex items-center justify-center text-white mb-2">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Global Anycast Routing</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Replicate containerized endpoints across 18 edge routing zones instantly. Deliver users static assets and serverless caches in under 12ms average latency.
                </p>
              </div>

              {/* Animated Beam Integrations Diagram */}
              <div ref={beamContainerRef} className="relative flex w-full max-w-[360px] h-[160px] items-center justify-between p-4 bg-black/40 border border-[#1f1f1f] rounded-md overflow-hidden select-none shrink-0">
                {/* Animated beams */}
                <AnimatedBeam containerRef={beamContainerRef} fromRef={beamFromRef} toRef={beamToRef} duration={3} gradientStartColor="#22c55e" gradientStopColor="#a1a1aa" />
                <AnimatedBeam containerRef={beamContainerRef} fromRef={beamToRef} toRef={beamToRef2a} duration={3.5} delay={0.5} gradientStartColor="#a1a1aa" gradientStopColor="#22c55e" />
                <AnimatedBeam containerRef={beamContainerRef} fromRef={beamToRef} toRef={beamToRef2b} duration={3.2} delay={0.2} gradientStartColor="#a1a1aa" gradientStopColor="#22c55e" />
                <AnimatedBeam containerRef={beamContainerRef} fromRef={beamToRef} toRef={beamToRef2c} duration={3.8} delay={0.8} gradientStartColor="#a1a1aa" gradientStopColor="#22c55e" />

                {/* Nodes */}
                <div className="flex flex-col justify-center">
                  <div ref={beamFromRef} className="z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#1f1f1f] bg-[#0c0c0e] text-white shadow-md">
                    <Github className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div ref={beamToRef} className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#22c55e]/30 bg-black text-white shadow-md ring-2 ring-[#22c55e]/15">
                    <span className="text-[#22c55e] text-sm font-bold">▲</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <div ref={beamToRef2a} className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#1f1f1f] bg-[#0c0c0e] text-[8px] font-mono text-zinc-400">
                    IAD
                  </div>
                  <div ref={beamToRef2b} className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#1f1f1f] bg-[#0c0c0e] text-[8px] font-mono text-zinc-400">
                    SFO
                  </div>
                  <div ref={beamToRef2c} className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#1f1f1f] bg-[#0c0c0e] text-[8px] font-mono text-zinc-400">
                    HND
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Sub-second Cold Starts */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="border border-[#1f1f1f] bg-[#0c0c0e] p-7 rounded-md flex flex-col justify-between min-h-[260px] hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2 select-none">
                <div className="h-8 w-8 rounded-full bg-[#111113] border border-[#1f1f1f] flex items-center justify-center text-white mb-2">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Sub-Second Starts</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Avoid standard OS boot overhead. Nebula container caches are mounted directly to high-speed memory arrays at the edge POP point.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Cold boot: ~<NumberTicker value={14} />ms avg
              </span>
            </motion.div>

            {/* Card 3: Live Terminal logs */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border border-[#1f1f1f] bg-[#0c0c0e] p-7 rounded-md flex flex-col justify-between min-h-[260px] hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-3 font-mono">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] border-b border-[#1f1f1f] pb-2 select-none uppercase tracking-widest">
                  <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Edge Webhook logs</span>
                </div>
                <div className="space-y-1.5 text-[9px] text-zinc-500 leading-tight">
                  {bentoLogs.map((log, idx) => (
                    <p key={idx} className="truncate">{log}</p>
                  ))}
                </div>
              </div>
              <span className="text-[9px] font-mono text-[#22c55e] flex items-center gap-1.5 select-none font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block animate-pulse" />
                Socket streaming...
              </span>
            </motion.div>

            {/* Card 4: Secrets Vault */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="md:col-span-2 border border-[#1f1f1f] bg-[#0c0c0e] p-7 rounded-md flex flex-col justify-between min-h-[260px] hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2 select-none">
                <div className="h-8 w-8 rounded-full bg-[#111113] border border-[#1f1f1f] flex items-center justify-center text-white mb-2">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Decentralized Secret Vault</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Encrypt env parameters securely with AES-256 GCM. Keys remain isolated within our distributed hardware tokens and are hydrated into memory context only at runtime.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 select-none uppercase tracking-widest">
                <span className="px-2 py-0.5 border border-[#1f1f1f] bg-black/40 rounded-sm">AES-GCM</span>
                <span className="px-2 py-0.5 border border-[#1f1f1f] bg-black/40 rounded-sm">SHA-256</span>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Section 3: Features Interactive Workspace (Sandbox) */}
        <section id="features-tab" className="py-24 px-6 max-w-5xl mx-auto w-full space-y-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-3"
          >
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Test-drive the deployment flow.
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Interactive console sandbox</p>
          </motion.div>

          {/* Interactive Feature Tabs Controls */}
          <div className="flex justify-center select-none">
            <div className="flex p-1 bg-[#0c0c0e] border border-[#1f1f1f] rounded-full gap-1 w-full max-w-md shadow-inner">
              <button
                onClick={() => setActiveFeature('deployment')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-[10px] font-mono tracking-wide uppercase rounded-full transition-all cursor-pointer ${
                  activeFeature === 'deployment'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                Git Import
              </button>
              <button
                onClick={() => setActiveFeature('analytics')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-[10px] font-mono tracking-wide uppercase rounded-full transition-all cursor-pointer ${
                  activeFeature === 'analytics'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Telemetry Logs
              </button>
              <button
                onClick={() => setActiveFeature('secrets')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-[10px] font-mono tracking-wide uppercase rounded-full transition-all cursor-pointer ${
                  activeFeature === 'secrets'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Secrets Vault
              </button>
            </div>
          </div>

          {/* Interactive Workspace Panel */}
          <div className="w-full border border-[#1f1f1f] bg-[#0c0c0e] rounded-md min-h-[440px] shadow-2xl overflow-hidden flex flex-col relative">
            <BorderBeam size={180} duration={8} borderWidth={1.5} colorFrom="#22c55e" colorTo="#888888" />
            
            {/* Panel 1: Git Integration */}
            {activeFeature === 'deployment' && (
              <div className="p-6 md:p-8 flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4 mb-6 select-none">
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight">GitHub Repository Import</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Select a repository to allocate edge container routing.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Connected to GitHub
                  </div>
                </div>

                <div className="space-y-3.5 flex-1">
                  {MOCK_REPOS.map((repo) => (
                    <div
                      key={repo.name}
                      className="flex items-center justify-between p-4 border border-[#1f1f1f] hover:border-zinc-800 bg-black/40 rounded-md transition-all"
                    >
                      <div className="space-y-1.5 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white font-mono">{repo.name}</span>
                          <span className="text-[9px] bg-[#111113] border border-[#1f1f1f] text-zinc-400 font-bold uppercase px-1.5 py-0.5 rounded-full">{repo.language}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate leading-normal">{repo.description}</p>
                      </div>

                      <div>
                        {importedRepos[repo.name] === 'importing' ? (
                          <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-[#1f1f1f] text-zinc-500 text-[10px] font-mono rounded-full select-none">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Allocating...
                          </button>
                        ) : importedRepos[repo.name] === 'imported' ? (
                          <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[10px] font-mono rounded-full select-none">
                            <Check className="w-3.5 h-3.5" />
                            Active Node
                          </button>
                        ) : (
                          <button
                            onClick={() => handleImport(repo.name)}
                            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold rounded-full transition-all cursor-pointer font-mono shadow-sm"
                          >
                            Import Code
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#1f1f1f] pt-4 mt-6 text-center select-none">
                  <p className="text-[10px] text-zinc-500 font-mono">
                    By importing, Nebula dynamically creates a webhook linking git push hooks directly to our edge network.
                  </p>
                </div>
              </div>
            )}

            {/* Panel 2: Telemetry Build Logs */}
            {activeFeature === 'analytics' && (
              <div className="bg-[#050505] flex flex-col flex-1 text-zinc-300 font-mono text-xs select-text overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="h-10 bg-[#0c0c0e] border-b border-[#1f1f1f] px-4 flex items-center justify-between select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Live Stream Builder logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRestartBuild}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-[#1f1f1f] bg-[#111113] hover:border-zinc-700 hover:text-white rounded-md text-[8px] font-mono uppercase text-zinc-400 cursor-pointer transition-all"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Rerun Build
                    </button>
                    <span className="text-[8px] bg-white/5 border border-white/10 text-white px-2 py-0.5 rounded-full font-mono uppercase tracking-wide">
                      active-build-a83f
                    </span>
                  </div>
                </div>

                <div ref={logContainerRef} className="flex-1 p-5 space-y-2 overflow-y-auto max-h-[340px] bg-[#000000] min-h-[340px]">
                  {logLines.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-600 italic select-none">
                      Initializing Edge compiler pipeline...
                    </div>
                  ) : (
                    logLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`leading-relaxed border-l pl-3 animate-in fade-in duration-300 text-[11px] ${
                          line.type === 'system'
                            ? 'border-zinc-800 text-zinc-600 font-semibold'
                            : line.type === 'command'
                            ? 'border-[#5e5ce6] text-indigo-400 font-bold'
                            : line.type === 'info'
                            ? 'border-zinc-700 text-zinc-500'
                            : line.type === 'success'
                            ? 'border-[#22c55e] text-[#22c55e] font-semibold font-sans'
                            : 'border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {line.type === 'command' && <span className="text-zinc-700 mr-1.5">$</span>}
                        {line.text}
                      </div>
                    ))
                  )}
                  <div ref={logEndRef} />
                </div>
                
                <div className="h-8 bg-[#0c0c0e] border-t border-[#1f1f1f] px-4 flex items-center justify-between select-none shrink-0 text-[9px] text-zinc-500 tracking-wider">
                  <span>Lines: {logLines.length} / 16</span>
                  {logIndex < LOG_SEQUENCE.length ? (
                    <span className="text-indigo-400 animate-pulse">Running compilation...</span>
                  ) : (
                    <span className="text-[#22c55e]">Build compilation success</span>
                  )}
                </div>
              </div>
            )}

            {/* Panel 3: Environment Secrets */}
            {activeFeature === 'secrets' && (
              <div className="p-6 md:p-8 flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4 mb-6 select-none">
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight">Decentralized Secrets Vault</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Encrypt environment keys at rest across edge network distribution nodes.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono">
                    <Lock className="w-3 h-3 fill-current" /> AES-256 GCM
                  </div>
                </div>

                <div className="space-y-2 flex-1 max-h-[220px] overflow-y-auto pr-1 mb-6">
                  {secrets.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-[#1f1f1f] rounded-md text-zinc-500 flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs font-semibold">No active secrets. Add variables below.</span>
                    </div>
                  ) : (
                    secrets.map((sec) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between p-3 border border-[#1f1f1f] bg-black/40 rounded-md hover:border-zinc-800 transition-all animate-in fade-in duration-200"
                      >
                        <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                          <div className="col-span-5 font-mono text-xs font-bold text-white tracking-tight truncate">
                            {sec.key}
                          </div>
                          <div className="col-span-4 font-mono text-xs text-zinc-500 truncate pr-2">
                            {sec.show ? sec.value : '••••••••••••••••••••••••••••••••'}
                          </div>
                          <div className="col-span-3 text-[10px] text-zinc-500 font-mono italic truncate">
                            {sec.env}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-2.5">
                          <button
                            onClick={() => toggleShowSecret(sec.id)}
                            className="p-1.5 hover:bg-[#111113] border border-transparent hover:border-[#1f1f1f] text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
                            title={sec.show ? 'Mask value' : 'Unmask value'}
                          >
                            {sec.show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteSecret(sec.id)}
                            className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-zinc-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                            title="Delete key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddSecret} className="border-t border-[#1f1f1f] pt-6 flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="VARIABLE_KEY"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="w-full px-4 py-2 border border-[#1f1f1f] bg-black/60 rounded-md text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="value_string"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full px-4 py-2 border border-[#1f1f1f] bg-black/60 rounded-md text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="w-full md:w-[150px]">
                    <select
                      value={newEnv}
                      onChange={(e) => setNewEnv(e.target.value)}
                      className="w-full px-3 py-2 border border-[#1f1f1f] bg-black/60 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 text-xs font-mono cursor-pointer"
                    >
                      <option>Production</option>
                      <option>Production & Preview</option>
                      <option>All Environments</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold font-mono rounded-md flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Key
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Interactive Infrastructure Globe Detail */}
        <section id="edge" className="py-24 bg-gradient-to-b from-transparent via-[#0b0b0c]/30 to-transparent border-y border-[#1f1f1f] px-6">
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                Designed for the global developer.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md font-medium">
                We operate low-latency proxy routes closest to target database clusters. Link your projects to automate tree-shaking, package bundle optimization, and edge caches.
              </p>
              <div className="space-y-3.5 text-xs font-mono text-zinc-300 select-none">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  <span>Anycast DNS resolution under 15ms</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  <span>Let&apos;s Encrypt automated renewal cycles</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                  <span>Zero configuration Next.js preset routers</span>
                </div>
              </div>
            </motion.div>

            {/* Right Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border border-[#1f1f1f] bg-[#0c0c0e] p-8 rounded-md flex flex-col justify-between relative overflow-hidden min-h-[320px] select-none"
            >
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Edge Topology</span>
              
              {/* Big Curved Grid Sphere SVG */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none mt-6">
                <svg viewBox="0 0 400 400" className="w-80 h-80 text-zinc-600 animate-[spin_80s_linear_infinite] motion-reduce:animate-none">
                  <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1" />
                  <ellipse cx="200" cy="200" rx="180" ry="50" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <ellipse cx="200" cy="200" rx="50" ry="180" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <ellipse cx="200" cy="200" rx="180" ry="110" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <ellipse cx="200" cy="200" rx="110" ry="180" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="1" />
                  <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              
              <div className="z-10 mt-auto space-y-1.5 font-mono text-[10px]">
                <p className="text-white flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block animate-pulse" />
                  <span>Active locations: 18 Global POPs</span>
                </p>
                <p className="text-zinc-500">Target routing: Sub-second micro-containers</p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Section 5: Interactive Pricing Calculator */}
        <section id="pricing" className="py-24 px-6 max-w-5xl mx-auto w-full space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-3"
          >
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Choose your Nebula tier.
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Simple, monochrome plans</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                id: 'hobby', 
                label: 'Hobby', 
                price: '$0', 
                desc: 'Perfect for side projects and individual developers.', 
                specs: ['100 GB Bandwidth', '1,000 build minutes', '1 concurrent pipeline'] 
              },
              { 
                id: 'pro', 
                label: 'Pro', 
                price: '$20', 
                desc: 'For growing startup teams requiring high availability.', 
                specs: ['1 TB Bandwidth', 'Unlimited minutes', '3 concurrent pipelines'] 
              },
              { 
                id: 'enterprise', 
                label: 'Enterprise', 
                price: 'Custom', 
                desc: 'For enterprise scale with compliance guarantees.', 
                specs: ['Custom SLA agreements', 'Dedicated edge hardware', 'SAML SSO integration'] 
              }
            ].map((tier, idx) => {
              const isSelected = pricingTier === tier.id;
              return (
                <motion.div 
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.15 }}
                  onClick={() => setPricingTier(tier.id as any)}
                  className={`border p-8 rounded-md cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[340px] select-none ${
                    isSelected 
                      ? 'border-white bg-white text-black shadow-[0_0_80px_rgba(255,255,255,0.06)] scale-[1.03]' 
                      : 'border-[#1f1f1f] hover:border-zinc-700 bg-[#0c0c0e]/80 text-[#FAFAFA]'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-xs font-bold font-mono uppercase ${isSelected ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {tier.label}
                      </h3>
                      {isSelected && (
                        <span className="h-4.5 w-4.5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className={`text-3xl sm:text-4xl font-extrabold font-sans ${isSelected ? 'text-black' : 'text-white'}`}>
                        {tier.price}
                      </p>
                      <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {tier.desc}
                      </p>
                    </div>
                  </div>

                  <div className={`space-y-5 pt-6 border-t mt-6 ${isSelected ? 'border-zinc-200' : 'border-[#1f1f1f]'}`}>
                    <ul className="space-y-2 text-[10px] font-mono">
                      {tier.specs.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isSelected ? 'bg-black' : 'bg-[#22c55e]'}`} />
                          <span className={isSelected ? 'text-zinc-700' : 'text-zinc-400'}>{s}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPricingTier(tier.id as any);
                        toast.success(`Selected pricing tier: ${tier.label}`);
                      }}
                      className={`w-full py-2.5 rounded-full text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-black text-white hover:bg-zinc-800' 
                          : 'border border-[#1f1f1f] text-zinc-300 hover:border-zinc-500 hover:bg-[#111113]'
                      }`}
                    >
                      SELECT TIER
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 6: Waitlist Call-to-action */}
        <section id="waitlist" className="py-24 px-6 max-w-xl mx-auto w-full text-center space-y-8 relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              Deploy the future.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Nebula is currently in early access. Enter your email to secure your priority rank on our waitlist.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form onSubmit={submitWaitlist} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto p-1.5 bg-[#0b0b0c] border border-[#1f1f1f] rounded-full focus-within:ring-2 focus-within:ring-white/20 transition-all">
              <input
                type="email"
                placeholder="name@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-transparent text-xs text-white rounded-full outline-none focus:ring-0 font-mono tracking-wide"
                required
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 font-bold text-[10px] tracking-wider rounded-full transition-all font-mono uppercase cursor-pointer"
              >
                {isSubmitting ? 'JOINING...' : 'JOIN WAITLIST'}
              </button>
            </form>
          </motion.div>
        </section>
      </main>

      {/* Apple-style minimalist footer */}
      <footer className="border-t border-[#1f1f1f] py-12 px-6 text-center text-[10px] font-mono text-zinc-500 space-y-4 relative z-10 bg-black">
        <div className="flex justify-center gap-6 text-zinc-400 text-[9px] select-none">
          <button onClick={() => scrollToSection('features-bento')} className="hover:text-white cursor-pointer uppercase">SPECS</button>
          <span>•</span>
          <button onClick={() => scrollToSection('features-tab')} className="hover:text-white cursor-pointer uppercase">SANDBOX</button>
          <span>•</span>
          <button onClick={() => scrollToSection('edge')} className="hover:text-white cursor-pointer uppercase">INFRASTRUCTURE</button>
          <span>•</span>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-white cursor-pointer uppercase">PRICING</button>
        </div>
        <p className="max-w-md mx-auto leading-relaxed">
          Nebula platform is a mockup simulated console for local testing. All billing, logs, and deployment timelines are simulated.
        </p>
        <p>© 2026 Nebula Cloud Platform. All rights reserved.</p>
      </footer>

    </div>
  );
}
