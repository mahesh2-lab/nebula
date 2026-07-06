'use client';

import * as React from 'react';
import { useLandingPage, FeatureType } from './LandingPageContext';
import { Github, Terminal, Shield, Lock, Eye, EyeOff, Plus, Trash2, Check, RefreshCw, AlertCircle } from 'lucide-react';

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

export function FeaturesWorkspace() {
  const { activeFeature, setActiveFeature } = useLandingPage();

  // Tab State 1: Git Integration States
  const [importedRepos, setImportedRepos] = React.useState<Record<string, 'importing' | 'imported' | 'idle'>>({});
  
  // Tab State 2: Telemetry Build log streamer
  const [logLines, setLogLines] = React.useState<typeof LOG_SEQUENCE>([]);
  const [logIndex, setLogIndex] = React.useState(0);
  const logEndRef = React.useRef<HTMLDivElement>(null);

  // Tab State 3: Environment Secrets States
  const [secrets, setSecrets] = React.useState([
    { id: '1', key: 'DATABASE_URL', value: 'postgresql://nebula_admin:••••••••••••@ep-cool-waterfall-8389.us-east-1.neon.tech/main', env: 'Production', show: false },
    { id: '2', key: 'NEXT_PUBLIC_STRIPE_KEY', value: 'pk_live_51Msz83921021bc', env: 'Production & Preview', show: false },
    { id: '3', key: 'JWT_SECRET_KEY', value: 'sk_live_51Msz83921021bc_secret_value_nebula_demo', env: 'All Environments', show: false },
  ]);
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [newEnv, setNewEnv] = React.useState('Production');

  // Trigger import simulator
  const handleImport = (repoName: string) => {
    setImportedRepos(prev => ({ ...prev, [repoName]: 'importing' }));
    setTimeout(() => {
      setImportedRepos(prev => ({ ...prev, [repoName]: 'imported' }));
    }, 2000);
  };

  // Streaming build logs simulation loop
  React.useEffect(() => {
    if (activeFeature !== 'telemetry') {
      // Reset if we leave the tab
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
      // Loop logs after 5s idle
      const restart = setTimeout(() => {
        setLogLines([]);
        setLogIndex(0);
      }, 5000);
      return () => clearTimeout(restart);
    }
  }, [activeFeature, logIndex]);

  // Scroll to bottom of terminal
  React.useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logLines]);

  // secrets modifier helpers
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
  };

  const handleDeleteSecret = (id: string) => {
    setSecrets(prev => prev.filter(s => s.id !== id));
  };

  const toggleShowSecret = (id: string) => {
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, show: !s.show } : s));
  };

  return (
    <section className="w-full bg-[#f5f5f7] py-24 px-6 md:px-12 lg:px-24 flex flex-col items-center border-b border-[#e8e8ed]">
      {/* Title block */}
      <div className="max-w-3xl text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-bold text-[#1d1d1f] tracking-[-0.035em] mb-4">
          Integrated deployment workbench.
        </h2>
        <p className="text-base sm:text-lg text-[#86868b] leading-relaxed tracking-tight max-w-xl mx-auto font-medium">
          Zero configuration files required. Manage repositories, track build sequences, and configure keys from one unified visual workspace.
        </p>
      </div>

      {/* Tabs Control Container */}
      <div className="flex p-1 bg-[#e8e8ed] rounded-full gap-1 mb-10 w-full max-w-md shadow-inner select-none">
        <button
          onClick={() => setActiveFeature('git')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeFeature === 'git'
              ? 'bg-white text-[#1d1d1f] shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f]'
          }`}
        >
          <Github className="w-4 h-4" />
          Git Import
        </button>
        <button
          onClick={() => setActiveFeature('telemetry')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeFeature === 'telemetry'
              ? 'bg-white text-[#1d1d1f] shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Telemetry Logs
        </button>
        <button
          onClick={() => setActiveFeature('secrets')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeFeature === 'secrets'
              ? 'bg-white text-[#1d1d1f] shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Secrets Vault
        </button>
      </div>

      {/* Active Panel Viewport */}
      <div className="w-full max-w-4xl min-h-[460px] bg-white border border-[#d2d2d7] rounded-[22px] shadow-lg overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Panel 1: Git Integration */}
        {activeFeature === 'git' && (
          <div className="p-6 md:p-8 flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-4 mb-6">
              <div>
                <h3 className="font-bold text-lg text-[#1d1d1f] tracking-tight">GitHub Repository Import</h3>
                <p className="text-xs text-[#86868b] mt-0.5">Select a repository to allocate edge container routing.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#86868b]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Connected to GitHub
              </div>
            </div>

            <div className="space-y-3.5 flex-1">
              {MOCK_REPOS.map((repo) => (
                <div
                  key={repo.name}
                  className="flex items-center justify-between p-4 border border-[#e8e8ed] hover:border-[#d2d2d7] bg-[#fbfbfd] rounded-xl transition-all"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1d1d1f] font-mono">{repo.name}</span>
                      <span className="text-[9px] bg-[#e8e8ed] text-[#86868b] font-bold uppercase px-1.5 py-0.5 rounded-full">{repo.language}</span>
                    </div>
                    <p className="text-xs text-[#86868b] truncate leading-normal">{repo.description}</p>
                  </div>

                  <div>
                    {importedRepos[repo.name] === 'importing' ? (
                      <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f5f5f7] border border-[#d2d2d7] text-[#86868b] text-xs font-semibold rounded-full select-none">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Allocating...
                      </button>
                    ) : importedRepos[repo.name] === 'imported' ? (
                      <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-xs font-semibold rounded-full select-none">
                        <Check className="w-3.5 h-3.5" />
                        Active Node
                      </button>
                    ) : (
                      <button
                        onClick={() => handleImport(repo.name)}
                        className="px-4 py-2 bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white text-xs font-semibold rounded-full transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                      >
                        Import Code
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e8e8ed] pt-4 mt-6 text-center">
              <p className="text-[10px] text-[#86868b] font-mono">
                By importing, Nebula dynamically creates a webhook linking git push hooks directly to our edge network.
              </p>
            </div>
          </div>
        )}

        {/* Panel 2: Telemetry Build Logs (Dark Panel) */}
        {activeFeature === 'telemetry' && (
          <div className="bg-[#1d1d1f] flex flex-col flex-1 text-zinc-300 font-mono text-xs select-text overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Terminal Tab Header */}
            <div className="h-10 bg-[#161618] border-b border-[#27272a]/60 px-4 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wide">Live Stream Builder logs</span>
              </div>
              <span className="text-[9px] bg-white/5 border border-white/10 text-white font-mono px-2 py-0.5 rounded-full">
                active-build-a83f
              </span>
            </div>

            {/* Scrollable logs body */}
            <div className="flex-1 p-5 space-y-2 overflow-y-auto max-h-[360px] bg-[#09090b] min-h-[360px]">
              {logLines.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#71717a] italic select-none">
                  Initializing Edge compiler pipeline...
                </div>
              ) : (
                logLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed border-l-2 pl-3 animate-in fade-in duration-300 ${
                      line.type === 'system'
                        ? 'border-zinc-700 text-zinc-500 font-semibold'
                        : line.type === 'command'
                        ? 'border-indigo-500 text-indigo-400 font-bold'
                        : line.type === 'info'
                        ? 'border-zinc-500 text-zinc-400'
                        : line.type === 'success'
                        ? 'border-[#22c55e] text-[#22c55e] font-semibold font-sans'
                        : 'border-zinc-800 text-zinc-300'
                    }`}
                  >
                    {line.type === 'command' && <span className="text-zinc-600 mr-1.5">$</span>}
                    {line.text}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
            
            {/* Terminal Status Footer */}
            <div className="h-8 bg-[#161618] border-t border-[#27272a]/60 px-4 flex items-center justify-between select-none shrink-0 text-[10px] text-[#71717a]">
              <span>Lines: {logLines.length} / 16</span>
              {logIndex < LOG_SEQUENCE.length ? (
                <span className="text-[#5e5ce6] animate-pulse">Running compilation...</span>
              ) : (
                <span className="text-[#22c55e]">Build compilation success</span>
              )}
            </div>
          </div>
        )}

        {/* Panel 3: Environment Secrets */}
        {activeFeature === 'secrets' && (
          <div className="p-6 md:p-8 flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-4 mb-6">
              <div>
                <h3 className="font-bold text-lg text-[#1d1d1f] tracking-tight">Decentralized Secrets Vault</h3>
                <p className="text-xs text-[#86868b] mt-0.5">Encrypt environment keys at rest across edge network distribution nodes.</p>
              </div>
              <div className="flex items-center gap-1 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                <Lock className="w-3 h-3 fill-current" /> AES-256 GCM
              </div>
            </div>

            {/* List block */}
            <div className="space-y-2 flex-1 max-h-[220px] overflow-y-auto pr-1 mb-6">
              {secrets.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#d2d2d7] rounded-xl text-[#86868b] flex flex-col items-center justify-center gap-1.5">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs font-semibold">No active secrets. Add variables below.</span>
                </div>
              ) : (
                secrets.map((sec) => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-3 border border-[#e8e8ed] bg-[#fbfbfd] rounded-xl hover:border-[#d2d2d7] transition-all"
                  >
                    <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                      <div className="col-span-5 font-mono text-xs font-bold text-[#1d1d1f] tracking-tight truncate">
                        {sec.key}
                      </div>
                      <div className="col-span-4 font-mono text-xs text-[#86868b] truncate pr-2">
                        {sec.show ? sec.value : '••••••••••••••••••••••••••••••••'}
                      </div>
                      <div className="col-span-3 text-[10px] text-[#71717a] font-semibold font-sans italic truncate">
                        {sec.env}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2.5">
                      <button
                        onClick={() => toggleShowSecret(sec.id)}
                        className="p-1.5 hover:bg-[#e8e8ed] border border-transparent hover:border-[#d2d2d7] text-[#86868b] hover:text-[#1d1d1f] rounded-lg transition-colors cursor-pointer"
                        title={sec.show ? 'Mask value' : 'Unmask value'}
                      >
                        {sec.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteSecret(sec.id)}
                        className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-[#86868b] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Inputs Form block */}
            <form onSubmit={handleAddSecret} className="border-t border-[#e8e8ed] pt-6 flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="VARIABLE_KEY"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-4 py-2 border border-[#d2d2d7] rounded-xl bg-white text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#5e5ce6] text-xs font-mono"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="value_string"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-4 py-2 border border-[#d2d2d7] rounded-xl bg-white text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#5e5ce6] text-xs font-mono"
                  required
                />
              </div>
              <div className="w-full md:w-[150px]">
                <select
                  value={newEnv}
                  onChange={(e) => setNewEnv(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d2d2d7] rounded-xl bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#5e5ce6] text-xs font-semibold cursor-pointer"
                >
                  <option>Production</option>
                  <option>Production & Preview</option>
                  <option>All Environments</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Key
              </button>
            </form>
          </div>
        )}
        
      </div>
    </section>
  );
}
