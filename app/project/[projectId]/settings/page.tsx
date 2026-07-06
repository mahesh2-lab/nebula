'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { Settings as SettingsIcon, ShieldAlert, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  
  const projects = useStore((s) => s.projects);
  const setProjects = useStore((s) => s.setProjects);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  
  const project = projects.find(p => p.id === projectId);

  const [framework, setFramework] = React.useState(project?.framework || 'nextjs');
  const [buildCommand, setBuildCommand] = React.useState(project?.buildCommand || '');
  const [installCommand, setInstallCommand] = React.useState(project?.installCommand || '');
  const [outputDirectory, setOutputDirectory] = React.useState(project?.outputDirectory || '');
  const [loading, setLoading] = React.useState(!project);
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  // Sync state variables if project finishes loading in the store
  React.useEffect(() => {
    if (project) {
      setFramework(project.framework || 'nextjs');
      setBuildCommand(project.buildCommand || '');
      setInstallCommand(project.installCommand || '');
      setOutputDirectory(project.outputDirectory || '');
      setLoading(false);
    }
  }, [project]);

  // Set active project context
  React.useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId);
    }
    return () => {
      setActiveProjectId(null);
    };
  }, [projectId, setActiveProjectId]);

  // Fetch project settings data directly on mount
  React.useEffect(() => {
    async function loadSettings() {
      if (!projectId) return;
      if (!project) {
        setLoading(true);
      }
      try {
        const res = await fetch(`/api/projects/${projectId}/settings`);
        if (!res.ok) {
          throw new Error('Failed to load project settings');
        }
        const data = await res.json();
        setFramework(data.framework || 'nextjs');
        setBuildCommand(data.buildCommand || '');
        setInstallCommand(data.installCommand || '');
        setOutputDirectory(data.outputDirectory || '');
      } catch (err: any) {
        console.error(err);
        if (!project) {
          toast.error(err.message || 'Failed to load configurations');
        }
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [projectId, project]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildCommand,
          installCommand,
          outputDirectory,
          framework,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save project settings');
      }

      const updatedProject = await res.json();

      // Update state in client Zustand store so UI updates everywhere
      setProjects(
        projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                buildCommand: updatedProject.buildCommand,
                installCommand: updatedProject.installCommand,
                outputDirectory: updatedProject.outputDirectory,
                framework: updatedProject.framework,
              }
            : p
        )
      );

      toast.success('Build & development configurations saved');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save configurations');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    if (deleteConfirm !== project.name) {
      toast.error('Type the project name exactly to confirm deletion');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Update Zustand store
      setProjects(projects.filter((p) => p.id !== project.id));
      setActiveProjectId(null);

      toast.success(`Project ${project.name} has been torn down and deleted`);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-6 space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded" />
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-zinc-800 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-zinc-800 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-xs font-mono text-[#71717A]">Project not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
      {/* Build config settings form */}
      <div className="pb-8 border-b border-[#1f1f1f] space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4.5 w-4.5 text-[#A1A1AA]" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">
            {project.name} / Build Settings
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs max-w-xl">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider uppercase">
                Framework Preset
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full h-10 px-3 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors cursor-pointer font-sans"
              >
                <option value="nextjs">Next.js</option>
                <option value="vite">Vite / React</option>
                <option value="go">Go / Docker</option>
                <option value="python">Python / Docker</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider uppercase">
                Build Command
              </label>
              <input
                type="text"
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
                placeholder="e.g. npm run build"
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider uppercase">
                Install Command
              </label>
              <input
                type="text"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                placeholder="e.g. npm install"
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider uppercase">
                Output Directory
              </label>
              <input
                type="text"
                value={outputDirectory}
                onChange={(e) => setOutputDirectory(e.target.value)}
                placeholder="e.g. .next or dist"
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-600 disabled:text-zinc-400 font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{saving ? 'Saving...' : 'Save configurations'}</span>
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
            <p className="text-[10px] text-zinc-500 font-mono">
              This action permanently deletes the project repository mapping, domains configuration, and all active CDN deployment cache records. This action is irreversible.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">
              Type <span className="text-white font-bold">{project.name}</span> to confirm deletion:
            </p>
            <input
              type="text"
              placeholder={project.name}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full h-10 px-3.5 border border-[#EF4444]/40 bg-black text-xs text-[#EF4444] rounded-md outline-none focus:border-[#EF4444] transition-colors"
            />
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444] hover:bg-red-700 disabled:bg-red-950 disabled:text-red-400 font-bold rounded-md transition-colors cursor-pointer text-xs"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span>{deleting ? 'Tearing down...' : 'Tear down project'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
