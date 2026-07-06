import { useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import { toast } from 'sonner';

export function useShortcuts(setActiveTab?: (tab: string) => void) {
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const searchOpen = useStore((s) => s.searchOpen);
  const setShortcutOverlayOpen = useStore((s) => s.setShortcutOverlayOpen);
  const shortcutOverlayOpen = useStore((s) => s.shortcutOverlayOpen);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  const triggerDeployment = useStore((s) => s.triggerDeployment);

  const lastKeyRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering shortcuts inside input/textarea fields
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );

      // Ctrl + K (Search)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
        return;
      }

      if (isInput) return;

      // / (Focus Search / cmdk)
      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // ? (Toggle Shortcut Overlay)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutOverlayOpen(!shortcutOverlayOpen);
        return;
      }

      // Shift + D (New deployment)
      if (e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (activeProjectId) {
          triggerDeployment(activeProjectId);
          toast.success('Simulating deployment trigger...');
          if (setActiveTab) setActiveTab('deployments');
        } else {
          toast.error('Select a project first to trigger a deployment.');
        }
        return;
      }

      // Sequential key sequences: "g p", "g d", "g l"
      const now = Date.now();
      const last = lastKeyRef.current;
      
      if (last.key === 'g' && now - last.time < 1000) {
        if (e.key === 'p') {
          e.preventDefault();
          setActiveProjectId(null); // Go to projects dashboard
          toast.info('Navigated to Projects Dashboard');
          lastKeyRef.current = { key: '', time: 0 };
          return;
        }
        if (e.key === 'd') {
          e.preventDefault();
          if (setActiveTab) {
            setActiveTab('deployments');
            toast.info('Navigated to Deployments Tab');
          }
          lastKeyRef.current = { key: '', time: 0 };
          return;
        }
        if (e.key === 'l') {
          e.preventDefault();
          if (setActiveTab) {
            setActiveTab('logs');
            toast.info('Navigated to Logs Tab');
          }
          lastKeyRef.current = { key: '', time: 0 };
          return;
        }
      }

      if (e.key === 'g') {
        lastKeyRef.current = { key: 'g', time: now };
      } else {
        lastKeyRef.current = { key: '', time: 0 };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, shortcutOverlayOpen, activeProjectId, setSearchOpen, setShortcutOverlayOpen, setActiveProjectId, triggerDeployment, setActiveTab]);
}
