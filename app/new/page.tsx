'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { mapDbProjectToStoreProject } from '@/lib/db/mappers';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Skeleton } from 'boneyard-js/react';
import '../bones/registry';

export const dynamic = 'force-dynamic';
import {
  Github,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowLeft,
  Copy,
  Clock,
  GitBranch,
  Lock,
  Globe,
  Loader2,
  AlertTriangle,
  Settings,
  Plus,
  Mail,
  Gamepad2,
  Calculator,
  RotateCw,
  UserPlus,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { MagicCard } from '@/components/magicui/magic-card';
import { motion } from 'framer-motion';
import TemplateCard from '@/components/ui/TemplateCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type RepoInfo = {
  owner: any;
  id: number;
  nodeId: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  defaultBranch: string;
  private: boolean;
  visibility: string;
  primaryLanguage: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
};

function detectFramework(lang: string | null): string {
  return 'Vite';
}

const TEMPLATE_REPOS: Record<string, RepoInfo> = {
  'vite-react-boilerplate': {
    id: 10006,
    nodeId: 'vite-react-boilerplate-node',
    name: 'vite-react-boilerplate',
    fullName: 'RicardoValdovinos/vite-react-boilerplate',
    description: 'A React starter template powered by Vite.',
    htmlUrl: 'https://github.com/RicardoValdovinos/vite-react-boilerplate',
    cloneUrl: 'https://github.com/RicardoValdovinos/vite-react-boilerplate.git',
    sshUrl: 'git@github.com:RicardoValdovinos/vite-react-boilerplate.git',
    defaultBranch: 'main',
    private: false,
    visibility: 'public',
    owner: {
      login: 'RicardoValdovinos',
    },
    primaryLanguage: 'TypeScript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pushedAt: new Date().toISOString(),
  },
  'eve-chat': {
    id: 10002,
    nodeId: 'eve-chat-node',
    name: 'eve-chat-template',
    fullName: 'eve-platform/chat-template',
    description: 'A persisted chat application built with Next.js and Tailwind CSS.',
    htmlUrl: 'https://github.com/eve-platform/chat-template',
    cloneUrl: 'https://github.com/eve-platform/chat-template.git',
    sshUrl: 'git@github.com:eve-platform/chat-template.git',
    defaultBranch: 'main',
    private: false,
    owner: {
      login: 'eve-platform',
    },
    visibility: 'public',
    primaryLanguage: 'TypeScript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pushedAt: new Date().toISOString(),
  },
  'slack-agent': {
    id: 10003,
    nodeId: 'slack-agent-node',
    name: 'eve-slack-agent',
    fullName: 'eve-platform/slack-agent',
    description: 'An AI Slack agent template built with Node.js and Express.',
    htmlUrl: 'https://github.com/eve-platform/slack-agent',
    cloneUrl: 'https://github.com/eve-platform/slack-agent.git',
    sshUrl: 'git@github.com:eve-platform/slack-agent.git',
    defaultBranch: 'main',
    private: false,
    visibility: 'public',
    owner: {
      login: 'vercel',
    },
    primaryLanguage: 'TypeScript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pushedAt: new Date().toISOString(),
  },
  'express-vercel': {
    id: 10004,
    nodeId: 'express-vercel-node',
    name: 'express-on-vercel',
    fullName: 'vercel/express-on-vercel',
    description: 'Simple Express.js starter template for serverless environments.',
    htmlUrl: 'https://github.com/vercel/express-on-vercel',
    cloneUrl: 'https://github.com/vercel/express-on-vercel.git',
    sshUrl: 'git@github.com:vercel/express-on-vercel.git',
    defaultBranch: 'main',
    private: false,
    owner: {
      login: 'vercel',
    },
    visibility: 'public',
    primaryLanguage: 'JavaScript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pushedAt: new Date().toISOString(),
  },
  'nebula-starter': {
    id: 10005,
    nodeId: 'nebula-starter-node',
    name: 'nebula-starter-kit',
    fullName: 'nebula-cloud/starter-kit',
    description: 'Full-stack Nebula starter with Docker, CI/CD, and monitoring.',
    htmlUrl: 'https://github.com/nebula-cloud/starter-kit',
    cloneUrl: 'https://github.com/nebula-cloud/starter-kit.git',
    sshUrl: 'git@github.com:nebula-cloud/starter-kit.git',
    defaultBranch: 'main',
    private: false,
    owner: {
      login: 'vercel',
    },
    visibility: 'public',
    primaryLanguage: 'TypeScript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pushedAt: new Date().toISOString(),
  }
};

const TEMPLATE_CARDS = [
  {
    key: 'vite-react-boilerplate',
    title: 'Starter App',
    desc: 'Get started with Vite and React in seconds.',
    funnyDesc: 'A lightning-fast starter template with hot module replacement.',
    bgGradient: 'from-[#0A0A0A] via-[#161618] to-[#0A0A0A]',
    logo: '⚡',
    variant: 'starter' as const,
  },
  {
    key: 'eve-chat',
    title: 'Chat App',
    desc: 'A persisted chat app built with shadcn/ui and Tailwind.',
    funnyDesc: 'Talk to an AI that is slightly more polite than StackOverflow users.',
    bgGradient: 'from-[#0A0B10] via-[#10121E] to-[#0A0B10]',
    logo: '💬',
    variant: 'chat' as const,
  },
  {
    key: 'slack-agent',
    title: 'Slack Bot',
    desc: 'An AI-powered bot for Slack webhooks and automation.',
    funnyDesc: 'Send automated passive-aggressive Slack messages using AI.',
    bgGradient: 'from-[#0B090F] via-[#140E1B] to-[#0B090F]',
    logo: '🤖',
    variant: 'slack' as const,
  },
  {
    key: 'express-vercel',
    title: 'REST API',
    desc: 'Simple Express API template for serverless platforms.',
    funnyDesc: 'For developers who believe backend servers can be serverless.',
    bgGradient: 'from-[#090B0A] via-[#0E1712] to-[#090B0A]',
    logo: '⚡',
    variant: 'api' as const,
  }
];

function getPresetDefaults(framework: string) {
  return { buildCommand: 'npm run build', outputDir: 'dist', installCommand: 'npm install' };
}

function GlobeWireframe() {
  return (
    <div className="relative w-64 h-32 mx-auto flex items-end justify-center overflow-hidden">
      {/* Glow background behind the globe */}
      <div className="absolute bottom-0 w-48 h-24 bg-blue-500/[0.03] rounded-t-full blur-xl animate-pulse" />

      <svg className="w-full h-full text-blue-500/10 overflow-visible" viewBox="0 0 200 100">
        <defs>
          <clipPath id="half-globe-clip">
            <rect x="0" y="0" width="200" height="100" />
          </clipPath>

          <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="80%" stopColor="#3b82f6" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="horizon-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Clipped rotating globe */}
        <g clipPath="url(#half-globe-clip)">
          <g className="animate-[spin_60s_linear_infinite]" style={{ transformOrigin: '100px 100px' }}>
            {/* Glow Sphere */}
            <circle cx="100" cy="100" r="90" fill="url(#globe-glow)" stroke="url(#grid-grad)" strokeWidth="0.75" />

            {/* Latitudes */}
            <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" strokeDasharray="3 3" />
            <ellipse cx="100" cy="100" rx="80" ry="50" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" />
            <ellipse cx="100" cy="100" rx="90" ry="0" fill="none" stroke="url(#grid-grad)" strokeWidth="0.75" />
            <ellipse cx="100" cy="100" rx="80" ry="50" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" transform="rotate(180 100 100)" />
            <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" strokeDasharray="3 3" transform="rotate(180 100 100)" />

            {/* Longitudes */}
            <ellipse cx="100" cy="100" rx="25" ry="90" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" strokeDasharray="3 3" />
            <ellipse cx="100" cy="100" rx="50" ry="90" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" />
            <ellipse cx="100" cy="100" rx="75" ry="90" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" />
            <ellipse cx="100" cy="100" rx="0" ry="90" fill="none" stroke="url(#grid-grad)" strokeWidth="0.75" />
          </g>
        </g>

        {/* Static Equator / Horizon Line */}
        <line x1="10" y1="100" x2="190" y2="100" stroke="url(#grid-grad)" strokeWidth="1.25" />
        <rect x="10" y="85" width="180" height="15" fill="url(#horizon-glow)" />

        {/* Pulsing POP Nodes & Connection Lines (Static overlay) */}
        {/* POP 1 (Left) */}
        <g className="animate-ping" style={{ transformOrigin: '70px 60px', animationDuration: '3s' }}>
          <circle cx="70" cy="60" r="3" fill="#60a5fa" />
        </g>
        <circle cx="70" cy="60" r="1.75" fill="#3b82f6" />

        {/* POP 2 (Right) */}
        <g className="animate-ping" style={{ transformOrigin: '140px 75px', animationDuration: '4s' }}>
          <circle cx="140" cy="75" r="3" fill="#a78bfa" />
        </g>
        <circle cx="140" cy="75" r="1.75" fill="#8b5cf6" />

        {/* POP 3 (Center-ish) */}
        <g className="animate-ping" style={{ transformOrigin: '105px 40px', animationDuration: '3.5s' }}>
          <circle cx="105" cy="40" r="3" fill="#34d399" />
        </g>
        <circle cx="105" cy="40" r="1.75" fill="#10b981" />

        {/* Connection Lines */}
        <path d="M 70 60 Q 87 45 105 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
        <path d="M 105 40 Q 122 55 140 75" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
      </svg>
    </div>
  );
}

export default function NewProjectPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const { data: session } = useSession();
  const setProjects = useStore((s) => s.setProjects);

  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const user = session?.user;

  const userInitials = React.useMemo(() => {
    if (!mounted) return 'MK';
    if (!user?.name) {
      if (user?.email) {
        return user.email.slice(0, 2).toUpperCase();
      }
      return 'MK';
    }
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user]);

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Mahesh Kumar');
  const userEmail = user?.email || 'mahesh@nebula-org.com';

  // Step: 'select' | 'configure'
  const [step, setStep] = React.useState<'select' | 'configure'>('select');

  // Repo list state
  const [repos, setRepos] = React.useState<RepoInfo[]>([]);
  const [reposLoading, setReposLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [repoSearch, setRepoSearch] = React.useState('');

  const githubOwner = React.useMemo(() => {
    if (repos.length > 0) {
      return repos[0].fullName.split('/')[0];
    }
    return 'none';
  }, [repos]);

  // Selected repo
  const [selectedRepo, setSelectedRepo] = React.useState<RepoInfo | null>(null);

  // Configure form
  const [projectName, setProjectName] = React.useState('');
  const [framework, setFramework] = React.useState('Vite');
  const [rootDir, setRootDir] = React.useState('./');
  const [buildCommand, setBuildCommand] = React.useState('next build');
  const [outputDir, setOutputDir] = React.useState('.next');
  const [installCommand, setInstallCommand] = React.useState('npm install');

  // Accordion toggles
  const [openBuildSettings, setOpenBuildSettings] = React.useState(false);
  const [openEnvVars, setOpenEnvVars] = React.useState(false);

  // Env vars
  const [envKey, setEnvKey] = React.useState('');
  const [envValue, setEnvValue] = React.useState('');
  const [envVars, setEnvVars] = React.useState<{ key: string; value: string }[]>([]);

  // Deploy state
  const [deploying, setDeploying] = React.useState(false);

  // Fetch repos on mount or page change
  React.useEffect(() => {
    if (!mounted) return;
    if (page > 1 && !hasMore) return;

    if (page === 1) {
      setReposLoading(true);
    } else {
      setLoadingMore(true);
    }

    fetch(`/api/github/repos?page=${page}&per_page=30`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          if (data.length < 30) {
            setHasMore(false);
          }
          setRepos((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const newRepos = data.filter((r) => !existingIds.has(r.id));
            return [...prev, ...newRepos];
          });
        } else {
          setHasMore(false);
        }
      })
      .catch(() => {
        toast.error('Failed to load GitHub repositories');
      })
      .finally(() => {
        setReposLoading(false);
        setLoadingMore(false);
      });
  }, [mounted, page]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom && !reposLoading && !loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Update build defaults when framework changes
  React.useEffect(() => {
    const defaults = getPresetDefaults(framework);
    setBuildCommand(defaults.buildCommand);
    setOutputDir(defaults.outputDir);
    setInstallCommand(defaults.installCommand);
  }, [framework]);

  const handleSelectRepo = (repo: RepoInfo) => {
    setSelectedRepo(repo);
    setProjectName(repo.name);
    const detected = detectFramework(repo.primaryLanguage);
    setFramework(detected);
    setStep('configure');
  };
  console.log(selectedRepo);
  console.log(buildCommand);
  console.log(outputDir);
  console.log(installCommand);
  const handleDeploy = async () => {
    if (!selectedRepo || !projectName.trim()) return;

    setDeploying(true);




    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoId: selectedRepo.id,
          repoName: selectedRepo.name,
          ownerName: selectedRepo.owner?.login,
          githubUrl: selectedRepo.cloneUrl,
          buildCommand,
          outputDirectory: outputDir,
          installCommand,
          branch: selectedRepo.defaultBranch,
          envVars,
          rootDir
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate deployment');
      }

      // Refresh project list
      const projectsRes = await fetch('/api/projects');
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        if (Array.isArray(projectsData)) {
          const mapped = projectsData.map(mapDbProjectToStoreProject);
          setProjects(mapped);
        }
      }

      if (data.alreadyDeployed) {
        toast.info('Project is already deployed. Redirecting to current deployment...');
      } else {
        toast.success('Deployment initiated successfully!');
      }
      router.push(`/project/${data.projectId}/deployments/${data.deployment.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const addEnvVar = () => {
    if (envKey.trim()) {
      setEnvVars((prev) => [...prev, { key: envKey.trim(), value: envValue }]);
      setEnvKey('');
      setEnvValue('');
    }
  };

  const filteredRepos = repos.filter((r) => {
    const q = repoSearch.toLowerCase();
    return (r.name || '').toLowerCase().includes(q) || (r.fullName || '').toLowerCase().includes(q);
  });

  // --- TOP BAR ---
  const TopBar = (
    <div className="w-full border-b border-[#1f1f1f] bg-[#09090B]">
      <div className="flex items-center justify-between px-6 py-3">
        <Button
          variant="ghost"
          onClick={() => {
            if (step === 'configure') setStep('select');
            else router.push('/dashboard');
          }}
          className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white font-mono transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </Button>
        <span className="text-xs font-semibold text-white font-sans tracking-tight">New Project</span>
        <div className="flex items-center gap-3 text-[#A1A1AA]">
          <Settings
            onClick={() => router.push('/dashboard/settings')}
            className="h-4 w-4 hover:text-white cursor-pointer transition-colors"
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-7 w-7 rounded-full border border-[#1f1f1f] bg-[#09090B] hover:border-white transition-colors overflow-hidden flex items-center justify-center text-[10px] font-mono font-semibold text-white cursor-pointer"
            >
              {user?.image ? (
                <img src={user.image} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border border-[#1f1f1f] bg-[#111113] p-2 text-xs font-mono text-[#FAFAFA] rounded-md shadow-2xl space-y-1">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2.5 py-2 border-b border-[#1f1f1f]/70 text-[#71717A] text-[10px] leading-tight">
                  <p className="font-semibold text-zinc-300">{userName}</p>
                  <p className="truncate">{userEmail}</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  router.push('/dashboard/profile');
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#18181B] rounded-sm text-zinc-300 hover:text-white cursor-pointer"
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push('/dashboard/billing');
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#18181B] rounded-sm text-zinc-300 hover:text-white cursor-pointer"
              >
                Billing Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="h-[1px] bg-[#1f1f1f]" />
              <DropdownMenuItem
                onClick={async () => {
                  useStore.getState().setIsAuthenticated(false);
                  toast.info('Signed out of Nebula workspace');
                  await signOut({ callbackUrl: '/login' });
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-red-500/10 hover:text-[#EF4444] rounded-sm text-[#EF4444] cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  // --- STEP 1: SELECT REPO ---
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col selection:bg-[#FAFAFA] selection:text-black">
        {TopBar}
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-8">

          {/* Header text with Pro Trial glow button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1f1f1f] pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-sans tracking-tight text-white">Let's build something new</h1>
            </div>
          </div>

          {/* Giant search input */}
          <div className="space-y-4">
            <div className="relative flex items-center">
              <Plus className="absolute left-4 h-5 w-5 text-[#71717A]" />
              <Input
                type="text"
                placeholder="Ask v0 to build or enter a Git repository URL..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                className="pl-12 pr-4 py-3.5 w-full border border-[#1f1f1f] bg-[#09090B] text-sm font-sans text-white placeholder:text-[#71717A] rounded-md outline-none focus:border-[#A1A1AA] transition-colors shadow-inner"
              />
            </div>

            {/* Quick start pills */}
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <Button
                variant="ghost"
                onClick={() => toast.info("Contact Form: Generates a form that sends user submissions directly to dev null.", { duration: 4000 })}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-xs font-mono text-[#FAFAFA] rounded-full transition-colors cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                <span>Contact Form</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => toast.info("Image Editor: A tool that takes 4GB of memory just to overlay text on a cat image.", { duration: 4000 })}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-xs font-mono text-[#FAFAFA] rounded-full transition-colors cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Image Editor</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => toast.info("Mini Game: A text adventure where you debug a dependency conflict for 3 hours.", { duration: 4000 })}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-xs font-mono text-[#FAFAFA] rounded-full transition-colors cursor-pointer"
              >
                <Gamepad2 className="h-3.5 w-3.5 text-purple-400" />
                <span>Mini Game</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => toast.info("Finance Calculator: Compiles stats to show 90% of your budget is spent on serverless cold starts.", { duration: 4000 })}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-xs font-mono text-[#FAFAFA] rounded-full transition-colors cursor-pointer"
              >
                <Calculator className="h-3.5 w-3.5 text-amber-400" />
                <span>Finance Calculator</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => toast.success("Shuffling quick start templates... They are still the same, but they feel newer now.", { duration: 3000 })}
                className="p-2 border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-xs text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            <p className="text-[11px] text-[#71717A] font-sans text-center sm:text-left">
              You can also drag and drop your project, or choose a{' '}
              <span onClick={() => toast.info("File upload coming soon in version 4.2.0! (We are currently at v1.0.0)")} className="text-blue-500 hover:underline cursor-pointer">file</span>{' '}
              or a{' '}
              <span onClick={() => toast.info("Folder upload coming soon in version 4.2.0! (We are currently at v1.0.0)")} className="text-blue-500 hover:underline cursor-pointer">folder</span>.
            </p>
          </div>

          {/* Split layout: Import vs Clone */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">

            {/* Left: Import repository */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-lg font-bold font-sans text-white tracking-tight">Import Git Repository</h2>

              {/* Dropdown + Search input */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#1f1f1f] bg-[#111113] rounded-md text-xs font-sans text-zinc-300 font-medium">
                  <Github className="h-3.5 w-3.5" />
                  <span>{githubOwner}</span>
                  <ChevronDown className="h-3 w-3 text-[#71717A]" />
                </div>
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-full border border-[#1f1f1f] bg-[#111113] text-xs font-sans text-white placeholder:text-[#71717A] rounded-md outline-none focus:border-[#A1A1AA] transition-colors"
                  />
                </div>
              </div>

              {/* Repo list container */}
              <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden">
                <Skeleton
                  name="repo-list"
                  loading={reposLoading}
                  className="min-h-[314px]"
                  fallback={
                    <div className="divide-y divide-[#1f1f1f]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3.5 animate-pulse">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-5 w-5 bg-zinc-800/40 rounded-full shrink-0" />
                            <div className="space-y-1.5 min-w-0">
                              <div className="h-4 w-48 bg-zinc-800/40 rounded" />
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-12 bg-zinc-800/40 rounded" />
                                <div className="h-3 w-10 bg-zinc-800/40 rounded" />
                                <div className="h-3 w-10 bg-zinc-800/40 rounded" />
                                <div className="h-3 w-20 bg-zinc-800/40 rounded" />
                              </div>
                            </div>
                          </div>
                          <div className="h-7 w-[72px] bg-zinc-800/40 rounded-md shrink-0" />
                        </div>
                      ))}
                    </div>
                  }
                  fixture={
                    <div className="divide-y divide-[#1f1f1f]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-5 w-5 bg-zinc-800 rounded-full shrink-0" />
                            <div className="space-y-1.5 min-w-0">
                              <div className="h-4 w-48 bg-zinc-800 rounded" />
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-12 bg-zinc-800 rounded" />
                                <div className="h-3 w-10 bg-zinc-800 rounded" />
                                <div className="h-3 w-10 bg-zinc-800 rounded" />
                                <div className="h-3 w-20 bg-zinc-800 rounded" />
                              </div>
                            </div>
                          </div>
                          <div className="h-7 w-[72px] bg-zinc-800 rounded-md shrink-0" />
                        </div>
                      ))}
                    </div>
                  }
                >
                  {filteredRepos.length === 0 ? (
                    <div className="p-12 text-center text-xs font-mono text-zinc-500 bg-[#111113] flex flex-col items-center justify-center gap-3">
                      {!(session as any)?.accessToken ? (
                        <>
                          <p>GitHub account not connected.</p>
                          <Button
                            onClick={() => signIn('github')}
                            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Github className="h-4 w-4" />
                            <span>Connect to GitHub</span>
                          </Button>
                        </>
                      ) : repos.length === 0 ? (
                        <span>No repositories found in your GitHub account.</span>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span>No matching repositories found in loaded pages.</span>
                          {hasMore && (
                            <Button
                              onClick={() => setPage((p) => p + 1)}
                              disabled={loadingMore}
                              className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-zinc-800 text-white font-semibold text-xs rounded-md transition-colors mt-2"
                            >
                              {loadingMore ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1.5 inline" />
                                  <span>Loading More...</span>
                                </>
                              ) : (
                                "Load More Repositories"
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onScroll={handleScroll}
                      className="divide-y divide-[#1f1f1f] max-h-[420px] overflow-y-auto"
                    >
                      {filteredRepos.map((repo) => (
                        <div key={repo.id || repo.fullName} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#18181B] transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <Github className="h-5 w-5 text-zinc-500 shrink-0" />
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm font-semibold text-white truncate">{repo.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                {repo.primaryLanguage && (
                                  <span className="flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    {repo.primaryLanguage}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  {repo.private ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                                  {repo.visibility}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitBranch className="h-2.5 w-2.5" />
                                  {repo.defaultBranch}
                                </span>
                                {repo.updatedAt && (
                                  <span className="hidden sm:inline">
                                    • {new Date(repo.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSelectRepo(repo)}
                            className="shrink-0 ml-4 px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 font-semibold text-xs rounded-md transition-colors"
                          >
                            Import
                          </Button>
                        </div>
                      ))}
                      {hasMore && (
                        <div className="p-3 text-center border-t border-[#1f1f1f]/50">
                          <button
                            type="button"
                            disabled={reposLoading || loadingMore}
                            onClick={() => setPage((p) => p + 1)}
                            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 w-full py-1.5"
                          >
                            {loadingMore ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                                <span>Loading more repositories...</span>
                              </>
                            ) : (
                              <span>Load more repositories</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Skeleton>
              </div>
            </div>

            {/* Right: Clone template */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-sans text-white tracking-tight">Clone Template</h2>
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-sans">
                  <span className="hover:text-zinc-300 cursor-pointer">Filter</span>
                  <span className="hover:text-zinc-300 cursor-pointer flex items-center gap-1">
                    Browse All
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>

              {/* 2x2+1 grid of animated templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATE_CARDS.slice(0, 4).map((card) => (
                  <TemplateCard
                    key={card.key}
                    title={card.title}
                    description={card.desc}
                    funnyDesc={card.funnyDesc}
                    logo={card.logo}
                    variant={card.variant}
                    onClick={() => {
                      toast.success(`Cloning ${card.title} template...`);
                      handleSelectRepo(TEMPLATE_REPOS[card.key]);
                    }}
                  />
                ))}
              </div>

              {/* Featured full-width card */}
              {TEMPLATE_CARDS[4] && (
                <div className="mt-4">
                  <TemplateCard
                    title={TEMPLATE_CARDS[4].title}
                    description={TEMPLATE_CARDS[4].desc}
                    funnyDesc={TEMPLATE_CARDS[4].funnyDesc}
                    logo={TEMPLATE_CARDS[4].logo}
                    variant={TEMPLATE_CARDS[4].variant}
                    featured
                    tags={[
                      { label: 'Docker', color: '#3b82f6' },
                      { label: 'CI/CD', color: '#a855f7' },
                      { label: 'Monitoring', color: '#10b981' },
                    ]}
                    onClick={() => {
                      toast.success(`Cloning ${TEMPLATE_CARDS[4].title} template...`);
                      handleSelectRepo(TEMPLATE_REPOS[TEMPLATE_CARDS[4].key]);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: CONFIGURE & DEPLOY ---
  if (step === 'configure') {
    return (
      <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col selection:bg-[#FAFAFA] selection:text-black">
        {TopBar}
        <div className="flex-1 flex items-start justify-center px-6 pt-12 pb-20">
          <div className="w-full max-w-2xl space-y-8">

            {/* New Project Card */}
            <div className="border border-[#1f1f1f] bg-[#111113] rounded-md p-6 space-y-6">
              <h1 className="text-xl font-bold font-sans tracking-tight">New Project</h1>

              {/* Importing banner */}
              <div className="border border-[#1f1f1f] bg-[#09090B] p-3 rounded-md flex items-center gap-3 text-xs font-mono">
                <Github className="h-4.5 w-4.5 text-[#A1A1AA] shrink-0" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#71717A]">Importing from GitHub</span>
                  <span className="font-semibold text-white">{selectedRepo?.fullName}</span>
                  <span className="text-[#71717A]">&middot;</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <GitBranch className="h-3 w-3" />
                    {selectedRepo?.defaultBranch}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#A1A1AA] font-sans">
                Choose where you want to create the project and give it a name.
              </p>

              {/* Form grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#A1A1AA] font-bold font-mono uppercase tracking-wider">Nebula Team</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-[#1f1f1f] bg-[#09090B] rounded-md text-xs text-zinc-300 font-mono">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>mahesh&apos;s projects</span>
                      <span className="ml-auto text-[10px] bg-[#1f1f1f] px-1.5 py-0.5 rounded text-zinc-400">Hobby</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#A1A1AA] font-bold font-mono uppercase tracking-wider">Project Name</label>
                    <Input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#1f1f1f] bg-[#09090B] text-sm text-white rounded-md outline-none focus:border-[#3f3f46] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#A1A1AA] font-bold font-mono uppercase tracking-wider">Framework Preset</label>
                  <Select
                    value={framework}
                    onValueChange={(val) => val && setFramework(val)}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-[#1f1f1f] bg-[#09090B] text-sm text-zinc-300 rounded-md outline-none focus:border-[#3f3f46] transition-colors font-mono cursor-pointer">
                      <SelectValue placeholder="Select Framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vite">Vite (React / Vue / Svelte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#A1A1AA] font-bold font-mono uppercase tracking-wider">Root Directory</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={rootDir}
                      onChange={(e) => setRootDir(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#1f1f1f] bg-[#09090B] text-sm text-zinc-400 rounded-md outline-none font-mono"
                      disabled
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => toast.info('Root directory editor is locked to ./')}
                      className="px-4 py-2 border border-[#1f1f1f] hover:bg-[#18181B] text-white text-xs font-semibold rounded-md transition-colors font-mono"
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Build and Output Settings Accordion */}
                <div className="border border-[#1f1f1f] rounded-md bg-[#09090B] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenBuildSettings(!openBuildSettings)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-left text-xs font-bold text-zinc-300 font-mono hover:bg-[#18181B] transition-colors"
                  >
                    {openBuildSettings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span>Build and Output Settings</span>
                  </button>
                  {openBuildSettings && (
                    <div className="p-4 border-t border-[#1f1f1f] space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#71717A] font-mono uppercase">Build Command</label>
                        <Input
                          type="text"
                          value={buildCommand}
                          onChange={(e) => setBuildCommand(e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-[#111113] text-xs text-white rounded-md outline-none focus:border-[#3f3f46] font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#71717A] font-mono uppercase">Output Directory</label>
                        <Input
                          type="text"
                          value={outputDir}
                          onChange={(e) => setOutputDir(e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-[#111113] text-xs text-white rounded-md outline-none focus:border-[#3f3f46] font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#71717A] font-mono uppercase">Install Command</label>
                        <Input
                          type="text"
                          value={installCommand}
                          onChange={(e) => setInstallCommand(e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-[#111113] text-xs text-white rounded-md outline-none focus:border-[#3f3f46] font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Environment Variables Accordion */}
                <div className="border border-[#1f1f1f] rounded-md bg-[#09090B] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenEnvVars(!openEnvVars)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-left text-xs font-bold text-zinc-300 font-mono hover:bg-[#18181B] transition-colors"
                  >
                    {openEnvVars ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span>Environment Variables</span>
                  </button>
                  {openEnvVars && (
                    <div className="p-4 border-t border-[#1f1f1f] space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="KEY"
                          value={envKey}
                          onChange={(e) => setEnvKey(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-[#1f1f1f] bg-[#111113] text-xs text-white rounded-md outline-none font-mono placeholder:text-[#52525B]"
                        />
                        <Input
                          type="text"
                          placeholder="value"
                          value={envValue}
                          onChange={(e) => setEnvValue(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-[#1f1f1f] bg-[#111113] text-xs text-white rounded-md outline-none font-mono placeholder:text-[#52525B]"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={addEnvVar}
                          className="px-3 py-1.5 border border-[#1f1f1f] hover:bg-[#18181B] text-xs text-white rounded-md transition-colors font-mono"
                        >
                          Add
                        </Button>
                      </div>
                      {envVars.length === 0 ? (
                        <p className="text-[11px] text-[#71717A] font-mono">No variables configured.</p>
                      ) : (
                        <div className="space-y-1">
                          {envVars.map((v, i) => (
                            <div key={i} className="flex items-center justify-between px-2 py-1 bg-[#111113] border border-[#1f1f1f] rounded text-[11px] font-mono">
                              <span className="text-white">{v.key}</span>
                              <span className="text-[#71717A]">&bull;&bull;&bull;&bull;&bull;&bull;</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Deploy Button */}
              <div className="pt-2">
                <Button
                  onClick={handleDeploy}
                  disabled={!projectName.trim() || deploying}
                  className="w-full py-2.5 bg-white text-[#09090B] hover:bg-neutral-200 active:bg-neutral-300 font-bold text-sm rounded-md transition-colors font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {deploying && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{deploying ? 'Deploying...' : 'Deploy'}</span>
                </Button>
              </div>
            </div>

            {/* Deployment Preview Card */}
            <div className="border border-[#1f1f1f] bg-[#111113] rounded-md p-6 space-y-4">
              <h2 className="text-lg font-bold font-sans tracking-tight">Deployment</h2>
              <p className="text-xs text-[#71717A] font-sans">Once you&apos;re ready, start deploying to see the progress here...</p>

              {/* Globe wireframe */}
              <div className="w-full flex justify-center pt-2 pointer-events-none opacity-80">
                <GlobeWireframe />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
