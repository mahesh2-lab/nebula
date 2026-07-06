import { create } from 'zustand';

export interface CommitInfo {
  message: string;
  hash: string;
  author: string;
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
  env: string[]; // e.g. ['production', 'preview', 'development']
}

export interface DomainInfo {
  name: string;
  ssl: 'active' | 'generating' | 'expired';
  dns: string;
  redirect: string;
  verified: boolean;
  health: 'healthy' | 'unhealthy';
}

export interface ServerlessFunction {
  id: string;
  name: string;
  path: string;
  region: string;
  latency: string;
  requests: number;
  errors: number;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: 'ready' | 'building' | 'failed' | 'queued';
  commit: CommitInfo;
  branch: string;
  latency: string;
  region: string;
  createdAt: string;
  updatedAt: string;
  framework: string;
}

export interface Project {
  id: string;
  name: string;
  framework: string;
  repository: string;
  branch: string;
  status: 'ready' | 'building' | 'failed' | 'queued';
  latency: string;
  region: string;
  updatedAt: string;
  lastCommit: CommitInfo;
  env: EnvVar[];
  domains: DomainInfo[];
  functions: ServerlessFunction[];
  deployments: Deployment[];
  billing: {
    bandwidthUsed: number; // GB
    bandwidthLimit: number;
    requestsUsed: number; // Million
    requestsLimit: number;
    buildMinutesUsed: number;
    buildMinutesLimit: number;
  };
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
}

export interface LogLine {
  timestamp: string;
  text: string;
  type: 'stdout' | 'stderr' | 'system';
}

export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  searchOpen: boolean;
  shortcutOverlayOpen: boolean;
  deployingProjectId: string | null;
  deployState: {
    step: 'queued' | 'installing' | 'building' | 'uploading' | 'cdn_sync' | 'ready' | 'failed';
    duration: Record<string, string>;
    logs: LogLine[];
    timestamp: string;
  };
  sidebarCollapsed: boolean;
  isAuthenticated: boolean;
  inspectedDeploymentId: string | null;
  
  // Actions
  setSearchOpen: (open: boolean) => void;
  setShortcutOverlayOpen: (open: boolean) => void;
  setActiveProjectId: (id: string | null) => void;
  toggleSidebar: () => void;
  setIsAuthenticated: (auth: boolean) => void;
  setInspectedDeploymentId: (id: string | null) => void;
  setProjects: (projects: Project[]) => void;
  
  addProject: (project: Omit<Project, 'id' | 'deployments' | 'env' | 'domains' | 'functions' | 'billing'>) => void;
  addEnvVar: (projectId: string, env: Omit<EnvVar, 'id'>) => void;
  deleteEnvVar: (projectId: string, id: string) => void;
  updateEnvVar: (projectId: string, id: string, updates: Partial<EnvVar>) => void;
  addDomain: (projectId: string, domain: DomainInfo) => void;
  deleteDomain: (projectId: string, name: string) => void;
  triggerDeployment: (projectId: string) => void;
  updateDeploymentStatus: (projectId: string, deploymentId: string, status: 'ready' | 'building' | 'failed' | 'queued') => void;
  addDeployment: (projectId: string, deployment: Deployment) => void;
  simulateBuildStep: (step: 'installing' | 'building' | 'uploading' | 'cdn_sync' | 'ready' | 'failed') => void;
  addLogLine: (line: string, type?: 'stdout' | 'stderr' | 'system') => void;
}

const initialProjects: Project[] = [];

export const useStore = create<AppState>((set, get) => ({
  projects: initialProjects,
  activeProjectId: null,
  searchOpen: false,
  shortcutOverlayOpen: false,
  deployingProjectId: null,
  deployState: {
    step: 'ready',
    duration: {
      queued: '0.2s',
      installing: '12.4s',
      building: '34.1s',
      uploading: '4.8s',
      cdn_sync: '1.2s'
    },
    logs: [],
    timestamp: ''
  },
  sidebarCollapsed: false,
  isAuthenticated: false,
  inspectedDeploymentId: null,

  setSearchOpen: (open) => set({ searchOpen: open }),
  setShortcutOverlayOpen: (open) => set({ shortcutOverlayOpen: open }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setInspectedDeploymentId: (id) => set({ inspectedDeploymentId: id }),
  setProjects: (projects) => set({ projects }),

  addProject: (projectData) => set((state) => {
    const newId = projectData.name.toLowerCase().replace(/\s+/g, '-');
    const newProj: Project = {
      ...projectData,
      id: newId,
      env: [],
      domains: [
        { name: `${newId}.${process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'}`, ssl: 'active', dns: `CNAME: cname.${process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'}`, redirect: 'none', verified: true, health: 'healthy' }
      ],
      functions: [],
      deployments: [
        {
          id: `dep-${Math.random().toString(36).substring(2, 9)}`,
          projectId: newId,
          status: 'ready',
          commit: projectData.lastCommit,
          branch: projectData.branch,
          latency: '15ms',
          region: projectData.region,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          framework: projectData.framework
        }
      ],
      billing: {
        bandwidthUsed: 0,
        bandwidthLimit: 100.0,
        requestsUsed: 0,
        requestsLimit: 50.0,
        buildMinutesUsed: 0,
        buildMinutesLimit: 1000
      }
    };
    return {
      projects: [newProj, ...state.projects],
      activeProjectId: newId
    };
  }),

  addEnvVar: (projectId, envVar) => set((state) => ({
    projects: state.projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          env: [...p.env, { ...envVar, id: Math.random().toString(36).substring(7) }]
        };
      }
      return p;
    })
  })),

  deleteEnvVar: (projectId, id) => set((state) => ({
    projects: state.projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          env: p.env.filter((e) => e.id !== id)
        };
      }
      return p;
    })
  })),

  updateEnvVar: (projectId, id, updates) => set((state) => ({
    projects: state.projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          env: p.env.map((e) => (e.id === id ? { ...e, ...updates } : e))
        };
      }
      return p;
    })
  })),

  addDomain: (projectId, domain) => set((state) => ({
    projects: state.projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          domains: [...p.domains, domain]
        };
      }
      return p;
    })
  })),

  deleteDomain: (projectId, name) => set((state) => ({
    projects: state.projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          domains: p.domains.filter((d) => d.name !== name)
        };
      }
      return p;
    })
  })),

  addLogLine: (line, type = 'stdout') => set((state) => ({
    deployState: {
      ...state.deployState,
      logs: [...state.deployState.logs, {
        timestamp: new Date().toISOString(),
        text: line,
        type
      }]
    }
  })),

  triggerDeployment: (projectId) => {
    const timestamp = new Date().toISOString();
    set({
      deployingProjectId: projectId,
      deployState: {
        step: 'queued',
        duration: { queued: '', installing: '', building: '', uploading: '', cdn_sync: '' },
        logs: [
          { timestamp, text: 'Deployment queued in region iad1...', type: 'system' },
          { timestamp, text: 'Agent ready. Allocation successful.', type: 'system' }
        ],
        timestamp
      }
    });

    // Update project status to queued
    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? { ...p, status: 'queued' } : p))
    }));
  },

  updateDeploymentStatus: (projectId, deploymentId, status) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const isLatest = p.deployments[0]?.id === deploymentId;
          return {
            ...p,
            status: isLatest ? status : p.status,
            deployments: p.deployments.map((d) =>
              d.id === deploymentId ? { ...d, status, updatedAt: new Date().toISOString() } : d
            )
          };
        }
        return p;
      })
    }));
  },

  addDeployment: (projectId, deployment) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const exists = p.deployments.some((d) => d.id === deployment.id);
          if (exists) return p;
          return {
            ...p,
            status: deployment.status,
            deployments: [deployment, ...p.deployments]
          };
        }
        return p;
      })
    }));
  },

  simulateBuildStep: (step) => set((state) => {
    const nextLogs: LogLine[] = [...state.deployState.logs];
    const ts = new Date().toISOString();

    if (step === 'installing') {
      nextLogs.push({ timestamp: ts, text: 'Installing package dependencies...', type: 'system' });
      nextLogs.push({ timestamp: ts, text: 'pnpm i --frozen-lockfile', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: 'Lockfile matches lockfile policy. Fetching metadata...', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: 'Progress: resolved 520, reused 380, downloaded 40, added 480', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: '✔ All dependencies installed successfully. [12.4s]', type: 'success' as any });
    } else if (step === 'building') {
      nextLogs.push({ timestamp: ts, text: 'Executing build task...', type: 'system' });
      nextLogs.push({ timestamp: ts, text: 'npm run build', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: 'compiling typescript components...', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: 'vite v6.0.2 compiling for production...', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: '✓ 48 chunks compiled. Total build size 1.2MB', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: 'Build optimized and compiled. Cache saved to local node.', type: 'success' as any });
    } else if (step === 'uploading') {
      nextLogs.push({ timestamp: ts, text: 'Uploading compilation bundle...', type: 'system' });
      nextLogs.push({ timestamp: ts, text: 'Compressed 1.2MB target bundle to 310KB.', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: 'Uploading chunks: index-b38fae.js, styles-4f8101.css, favicon.ico', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: '✔ Bundle upload complete.', type: 'system' });
    } else if (step === 'cdn_sync') {
      nextLogs.push({ timestamp: ts, text: 'Syncing edge CDN locations...', type: 'system' });
      nextLogs.push({ timestamp: ts, text: 'CDN Edge replicated to: iad1, sfo1, cdg1, hnd1, sin1.', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: 'Purging edge proxy cache...', type: 'stdout' });
      nextLogs.push({ timestamp: ts, text: '✔ CDN fully synchronized.', type: 'system' });
    } else if (step === 'ready') {
      nextLogs.push({ timestamp: ts, text: 'Deployment is LIVE.', type: 'success' as any });
      nextLogs.push({ timestamp: ts, text: 'Routing requests to active container...', type: 'system' });
    } else if (step === 'failed') {
      nextLogs.push({ timestamp: ts, text: 'Failed during compilation phase.', type: 'stderr' });
      nextLogs.push({ timestamp: ts, text: 'Error: TypeScript compilation failed in src/components/terminal.tsx(14,24): Property "lazylog" does not exist.', type: 'stderr' });
      nextLogs.push({ timestamp: ts, text: 'Process exited with error code 1.', type: 'stderr' });
    }

    // Set duration
    const currentDur = { ...state.deployState.duration };
    if (step === 'installing') currentDur.queued = '0.2s';
    if (step === 'building') currentDur.installing = '12.4s';
    if (step === 'uploading') currentDur.building = '34.1s';
    if (step === 'cdn_sync') currentDur.uploading = '4.8s';
    if (step === 'ready') {
      currentDur.cdn_sync = '1.2s';
    }

    // Update project state if complete or failed
    let updatedProjects = state.projects;
    if (step === 'ready' && state.deployingProjectId) {
      updatedProjects = state.projects.map((p) => {
        if (p.id === state.deployingProjectId) {
          const newDep: Deployment = {
            id: `dep-${Math.random().toString(36).substring(2, 9)}`,
            projectId: p.id,
            status: 'ready',
            commit: p.lastCommit,
            branch: p.branch,
            latency: '12ms',
            region: p.region,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            framework: p.framework
          };
          return {
            ...p,
            status: 'ready',
            updatedAt: new Date().toISOString(),
            deployments: [newDep, ...p.deployments]
          };
        }
        return p;
      });
    } else if (step === 'failed' && state.deployingProjectId) {
      updatedProjects = state.projects.map((p) => {
        if (p.id === state.deployingProjectId) {
          const newDep: Deployment = {
            id: `dep-${Math.random().toString(36).substring(2, 9)}`,
            projectId: p.id,
            status: 'failed',
            commit: p.lastCommit,
            branch: p.branch,
            latency: '0ms',
            region: p.region,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            framework: p.framework
          };
          return {
            ...p,
            status: 'failed',
            deployments: [newDep, ...p.deployments]
          };
        }
        return p;
      });
    }

    return {
      projects: updatedProjects,
      deployState: {
        ...state.deployState,
        step,
        duration: currentDur,
        logs: nextLogs
      }
    };
  })
}));
