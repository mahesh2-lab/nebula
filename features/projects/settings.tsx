'use client';

import * as React from 'react';
import { Project, useStore } from '../../store/store';
import { Settings as SettingsIcon, AlertTriangle, ShieldAlert, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsSkeleton } from '@/components/ui/skeleton';

export function Settings({ project: initialProject }: { project?: Project }) {
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const activeProject = initialProject || projects.find(p => p.id === activeProjectId);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);

  // Show skeleton while projects haven't loaded yet (only if project context is active)
  if (activeProjectId && projects.length === 0 && !initialProject) {
    return <SettingsSkeleton />;
  }

  // Global settings state
  const [workspaceName, setWorkspaceName] = React.useState('nebula-infra');
  const [defaultRegion, setDefaultRegion] = React.useState('iad1 (US East)');
  const [defaultBranch, setDefaultBranch] = React.useState('main');

  // Scoped project settings state
  const [buildCommand, setBuildCommand] = React.useState(activeProject?.buildCommand || 'npm run build');
  const [installCommand, setInstallCommand] = React.useState(activeProject?.installCommand || 'pnpm install');
  const [rootDir, setRootDir] = React.useState(activeProject?.outputDirectory || './');
  const [deleteConfirm, setDeleteConfirm] = React.useState('');

  React.useEffect(() => {
    if (activeProject) {
      setBuildCommand(activeProject.buildCommand || 'npm run build');
      setInstallCommand(activeProject.installCommand || 'pnpm install');
      setRootDir(activeProject.outputDirectory || './');
    }
  }, [activeProject]);

  const handleGlobalSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Global workspace configurations updated successfully');
  };

  const handleProjectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildCommand,
          installCommand,
          outputDirectory: rootDir,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project settings');
      }

      useStore.setState((state) => ({
        projects: state.projects.map((p) => 
          p.id === activeProject.id 
            ? { ...p, buildCommand, installCommand, outputDirectory: rootDir }
            : p
        )
      }));
      toast.success('Build & development configurations saved');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save configurations');
    }
  };

  const handleDelete = async () => {
    if (!activeProject) return;
    if (deleteConfirm !== activeProject.name) {
      toast.error('Type the project name exactly to confirm deletion');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      useStore.setState((state) => ({
        projects: state.projects.filter((p) => p.id !== activeProject.id),
        activeProjectId: null
      }));

      toast.success(`Project ${activeProject.name} has been torn down and deleted`);
      setActiveProjectId(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete project');
    }
  };

  // Render Global Settings if no project context is active
  if (!activeProject) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
        
        {/* Header section */}
        <div className="flex items-center gap-4 pb-8 border-b border-[#1f1f1f]">
          <div className="h-14 w-14 rounded-full border border-[#1f1f1f] bg-[#09090B] flex items-center justify-center text-sm font-semibold font-mono text-white">
            W
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white tracking-tight">Workspace Settings</h3>
            <p className="text-xs text-[#71717A] font-mono">Configure global defaults, billing preferences, and access permissions.</p>
          </div>
        </div>

        {/* General config form */}
        <div className="pb-8 border-b border-[#1f1f1f] space-y-6">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-[#A1A1AA]" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">General Configurations</h3>
          </div>

          <form onSubmit={handleGlobalSave} className="space-y-4 font-mono text-xs max-w-xl">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">WORKSPACE NAMESPACE</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">DEFAULT DEPLOY REGION</label>
                <select
                  value={defaultRegion}
                  onChange={(e) => setDefaultRegion(e.target.value)}
                  className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-zinc-400 rounded-md outline-none focus:border-white cursor-pointer"
                >
                  <option>iad1 (US East)</option>
                  <option>sfo1 (US West)</option>
                  <option>cdg1 (Europe West)</option>
                  <option>sin1 (Asia Pacific)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">DEFAULT PRODUCTION BRANCH</label>
                <input
                  type="text"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold rounded-md transition-colors cursor-pointer"
            >
              Save configurations
            </button>
          </form>
        </div>

        {/* Security Policies */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-[#A1A1AA]" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">Workspace Security</h3>
          </div>

          <div className="flex items-center justify-between bg-black/40 border border-[#1f1f1f] p-4 rounded-md max-w-xl">
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-white">Require 2FA</p>
              <p className="text-[10px] text-zinc-500 font-mono">Require two-factor authentication for all workspace members.</p>
            </div>
            <button 
              onClick={() => toast.info('Two-Factor authentication enforcement enabled')}
              className="px-3 py-1.5 border border-[#1f1f1f] hover:bg-[#111113] active:bg-[#18181B] text-[10px] font-mono rounded-md transition-colors text-zinc-300 cursor-pointer"
            >
              Enable Policy
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Render Project-Specific Settings if project context is active
  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
      
      {/* Build config settings form */}
      <div className="pb-8 border-b border-[#1f1f1f] space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-[#A1A1AA]" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">{activeProject.name} / Settings</h3>
        </div>

        <form onSubmit={handleProjectSave} className="space-y-4 font-mono text-xs max-w-xl">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">BUILD COMMAND</label>
              <input
                type="text"
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">INSTALL COMMAND</label>
              <input
                type="text"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">ROOT DIRECTORY</label>
              <input
                type="text"
                value={rootDir}
                onChange={(e) => setRootDir(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold rounded-md transition-colors cursor-pointer"
          >
            Save configurations
          </button>
        </form>
      </div>

      {/* Danger teardown block */}
      <div className="pt-4 space-y-6">
        <div className="flex items-center gap-2 text-[#EF4444]">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider font-mono">DANGER ZONE</h3>
        </div>

        <div className="border border-[#EF4444]/40 bg-[#EF4444]/5 p-4 rounded-md space-y-4 max-w-xl">
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-white">Delete Project</p>
            <p className="text-[10px] text-zinc-500 font-mono">This action permanently deletes the project repository mapping, domains configuration, and all active CDN deployment cache records. This action is irreversible.</p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Type <span className="text-white font-bold">{activeProject.name}</span> to confirm deletion:</p>
            <input
              type="text"
              placeholder={activeProject.name}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full h-10 px-3.5 border border-[#EF4444]/40 bg-black text-xs text-[#EF4444] rounded-md outline-none focus:border-[#EF4444] transition-colors"
            />
          </div>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444] hover:bg-red-700 text-white font-bold rounded-md transition-colors cursor-pointer text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Tear down project</span>
          </button>
        </div>
      </div>

    </div>
  );
}
