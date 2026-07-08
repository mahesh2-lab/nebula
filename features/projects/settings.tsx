'use client';

import * as React from 'react';
import { Project, useStore } from '../../store/store';
import { Settings as SettingsIcon, AlertTriangle, ShieldAlert, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsSkeleton } from '@/components/ui/skeleton';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
                <Input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">DEFAULT DEPLOY REGION</label>
                <Select
                  value={defaultRegion}
                  onValueChange={(val) => val && setDefaultRegion(val)}
                >
                  <SelectTrigger className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-zinc-400 rounded-md outline-none focus:border-white cursor-pointer">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iad1 (US East)">iad1 (US East)</SelectItem>
                    <SelectItem value="sfo1 (US West)">sfo1 (US West)</SelectItem>
                    <SelectItem value="cdg1 (Europe West)">cdg1 (Europe West)</SelectItem>
                    <SelectItem value="sin1 (Asia Pacific)">sin1 (Asia Pacific)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">DEFAULT PRODUCTION BRANCH</label>
                <Input
                  type="text"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold rounded-md transition-colors cursor-pointer"
            >
              Save configurations
            </Button>
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
            <Button 
              variant="ghost"
              onClick={() => toast.info('Two-Factor authentication enforcement enabled')}
              className="px-3 py-1.5 border border-[#1f1f1f] hover:bg-[#111113] active:bg-[#18181B] text-[10px] font-mono rounded-md transition-colors text-zinc-300 cursor-pointer"
            >
              Enable Policy
            </Button>
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
              <Input
                type="text"
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">INSTALL COMMAND</label>
              <Input
                type="text"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">ROOT DIRECTORY</label>
              <Input
                type="text"
                value={rootDir}
                onChange={(e) => setRootDir(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold rounded-md transition-colors cursor-pointer"
          >
            Save configurations
          </Button>
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
            <Input
              type="text"
              placeholder={activeProject.name}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full h-10 px-3.5 border border-[#EF4444]/40 bg-black text-xs text-[#EF4444] rounded-md outline-none focus:border-[#EF4444] transition-colors"
            />
          </div>

          <AlertDialog>
            <AlertDialogTrigger
              className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444] hover:bg-red-700 text-white font-bold rounded-md transition-colors cursor-pointer text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Tear down project</span>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark bg-[#0a0a0a] border border-[#1f1f1f] text-zinc-300 font-mono text-xs">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-sm font-semibold text-white">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400 text-xs">
                  This action permanently deletes the project repository mapping, domains configuration, and all active CDN deployment cache records. This action is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-end gap-2 mt-4">
                <AlertDialogCancel className="border border-[#1f1f1f] text-zinc-400 hover:text-white px-3 py-1.5 text-xs font-mono rounded-md bg-transparent">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteConfirm !== activeProject.name}
                  className="bg-[#EF4444] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 text-xs font-mono rounded-md"
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

    </div>
  );
}
