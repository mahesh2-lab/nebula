'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useStore } from '../../store/store';
import { 
  Folder, 
  Terminal, 
  Settings, 
  BookOpen, 
  Plus, 
  Shield, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function CommandMenu({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const searchOpen = useStore((s) => s.searchOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  const triggerDeployment = useStore((s) => s.triggerDeployment);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const runCommand = (action: () => void) => {
    action();
    setSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity duration-150" 
        onClick={() => setSearchOpen(false)}
      />
      
      {/* Dialog Frame */}
      <div className="relative w-full max-w-[640px] overflow-hidden border border-[#1f1f1f] bg-[#111113] text-[#FAFAFA] shadow-2xl rounded-md">
        <Command className="flex flex-col">
          <div className="flex items-center border-b border-[#1f1f1f] px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[#71717A]" />
            <Command.Input 
              autoFocus
              placeholder="Search projects, deployments, commands..."
              className="flex h-11 w-full bg-transparent py-3 text-sm text-[#FAFAFA] outline-none placeholder:text-[#71717A] disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[#1f1f1f] bg-[#09090B] px-1.5 font-mono text-[10px] font-medium text-[#71717A]">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-xs text-[#71717A] font-mono">
              No results found. The cloud is patiently waiting.
            </Command.Empty>

            <Command.Group heading="Projects" className="px-2 py-1 text-[11px] font-medium text-[#71717A] uppercase tracking-wider font-mono">
              {projects.map((project) => (
                <Command.Item
                  key={project.id}
                  value={project.name}
                  onSelect={() => runCommand(() => {
                    setActiveProjectId(project.id);
                  })}
                  className="flex cursor-default select-none items-center justify-between px-2 py-2 text-xs outline-none hover:bg-[#18181B] hover:text-[#FAFAFA] rounded-sm data-[selected=true]:bg-[#18181B] data-[selected=true]:text-[#FAFAFA]"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-3.5 w-3.5 text-[#A1A1AA]" />
                    <span className="font-medium text-[#FAFAFA]">{project.name}</span>
                    <span className="text-[10px] text-[#71717A] font-mono">{project.framework}</span>
                  </div>
                  {project.status === 'ready' ? (
                    <CheckCircle2 className="h-3 w-3 text-[#22C55E]" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-[#F59E0B]" />
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="my-2 h-[1px] bg-[#1f1f1f]" />

            <Command.Group heading="Operations" className="px-2 py-1 text-[11px] font-medium text-[#71717A] uppercase tracking-wider font-mono">
              {activeProjectId && (
                <Command.Item
                  onSelect={() => runCommand(() => {
                    triggerDeployment(activeProjectId);
                    if (onTabChange) onTabChange('deployments');
                  })}
                  className="flex cursor-default select-none items-center gap-2 px-2 py-2 text-xs outline-none hover:bg-[#18181B] hover:text-[#FAFAFA] rounded-sm data-[selected=true]:bg-[#18181B] data-[selected=true]:text-[#FAFAFA]"
                >
                  <Plus className="h-3.5 w-3.5 text-[#A1A1AA]" />
                  <span>Trigger Production Deployment ({activeProjectId})</span>
                </Command.Item>
              )}
              <Command.Item
                onSelect={() => runCommand(() => {
                  if (onTabChange) onTabChange('logs');
                })}
                className="flex cursor-default select-none items-center gap-2 px-2 py-2 text-xs outline-none hover:bg-[#18181B] hover:text-[#FAFAFA] rounded-sm data-[selected=true]:bg-[#18181B] data-[selected=true]:text-[#FAFAFA]"
              >
                <Terminal className="h-3.5 w-3.5 text-[#A1A1AA]" />
                <span>View Stream Build Logs</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => {
                  if (onTabChange) onTabChange('settings');
                })}
                className="flex cursor-default select-none items-center gap-2 px-2 py-2 text-xs outline-none hover:bg-[#18181B] hover:text-[#FAFAFA] rounded-sm data-[selected=true]:bg-[#18181B] data-[selected=true]:text-[#FAFAFA]"
              >
                <Settings className="h-3.5 w-3.5 text-[#A1A1AA]" />
                <span>Configure Project Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-2 h-[1px] bg-[#1f1f1f]" />

            <Command.Group heading="Documentation" className="px-2 py-1 text-[11px] font-medium text-[#71717A] uppercase tracking-wider font-mono">
              <Command.Item
                onSelect={() => runCommand(() => {
                  window.open('https://nebula.dev/docs', '_blank');
                })}
                className="flex cursor-default select-none items-center gap-2 px-2 py-2 text-xs outline-none hover:bg-[#18181B] hover:text-[#FAFAFA] rounded-sm data-[selected=true]:bg-[#18181B] data-[selected=true]:text-[#FAFAFA]"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#A1A1AA]" />
                <span>CLI Documentation & Guide</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => {
                  if (onTabChange) onTabChange('tokens');
                })}
                className="flex cursor-default select-none items-center gap-2 px-2 py-2 text-xs outline-none hover:bg-[#18181B] hover:text-[#FAFAFA] rounded-sm data-[selected=true]:bg-[#18181B] data-[selected=true]:text-[#FAFAFA]"
              >
                <Shield className="h-3.5 w-3.5 text-[#A1A1AA]" />
                <span>Manage API Access Tokens</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
