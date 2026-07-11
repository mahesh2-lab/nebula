import * as React from "react";
import { useStore } from "@/store/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function useRealtimeEvents() {
  const addDeployment = useStore((s) => s.addDeployment);
  const updateDeploymentStatus = useStore((s) => s.updateDeploymentStatus);
  const router = useRouter();
  const { status } = useSession();

  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = React.useRef(0);
  const toastIdRef = React.useRef<string | number | null>(null);

  const connect = React.useCallback(() => {
    if (status !== "authenticated") {
      return;
    }

    // Clean up existing connection if any
    if (eventSourceRef.current) {
      console.log("[useRealtimeEvents] Cleaning up existing EventSource before connecting...");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    console.log("[useRealtimeEvents] Connecting to Server-Sent Events...");
    const es = new EventSource("/api/events");
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("[useRealtimeEvents] SSE Connection established.");
      reconnectAttemptsRef.current = 0;
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
        toast.success("Realtime connection restored.");
      }
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[useRealtimeEvents] Received event:", data);

        if (data.type === "DEPLOYMENT_CREATED") {
          const { projectId, projectName, deploymentId, deployment } = data;
          
          // Inject the new deployment into Zustand store state
          addDeployment(projectId, deployment);
          
          // Display a beautiful Sonner toast with a link to see logs
          toast.info(`New deployment queued for ${projectName || projectId}!`, {
            description: `Commit: "${deployment.commit?.message || 'Manual Trigger'}"`,
            duration: 10000,
            action: {
              label: "View Logs",
              onClick: () => {
                router.push(`/project/${projectId}/deployments/${deploymentId}`);
              }
            }
          });
        } 
        
        else if (data.type === "DEPLOYMENT_STATUS_UPDATED") {
          const { projectId, deploymentId, status } = data;
          
          // Update the deployment status in Zustand
          updateDeploymentStatus(projectId, deploymentId, status);

          if (status === "ready") {
            toast.success(`Deployment ${deploymentId.substring(0, 8)} is LIVE!`, {
              duration: 5000,
              action: {
                label: "Open App",
                onClick: () => {
                  router.push(`/project/${projectId}/deployments/${deploymentId}`);
                }
              }
            });
          } else if (status === "failed") {
            toast.error(`Deployment ${deploymentId.substring(0, 8)} failed!`, {
              duration: 8000,
              action: {
                label: "Inspect Logs",
                onClick: () => {
                  router.push(`/project/${projectId}/deployments/${deploymentId}`);
                }
              }
            });
          }
        }
      } catch (err: any) {
        console.error("[useRealtimeEvents] Error parsing event data:", err);
      }
    };

    es.onerror = (err) => {
      console.error("[useRealtimeEvents] SSE error:", err);
      
      // Close standard eventSource because we want to take control of reconnection
      es.close();
      if (eventSourceRef.current === es) {
        eventSourceRef.current = null;
      }

      // Check auth status. If we are unauthenticated, don't reconnect.
      if (status !== "authenticated") {
        return;
      }

      // Exponential backoff
      const minDelay = 1000; // 1s
      const maxDelay = 30000; // 30s
      const delay = Math.min(
        minDelay * Math.pow(2, reconnectAttemptsRef.current),
        maxDelay
      ) + Math.random() * 1000; // Add some jitter

      console.log(`[useRealtimeEvents] Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${reconnectAttemptsRef.current + 1})...`);
      
      if (reconnectAttemptsRef.current >= 2 && !toastIdRef.current) {
        toastIdRef.current = toast.warning("Connection to realtime event server lost. Reconnecting...", {
          duration: Infinity,
        });
      }

      reconnectAttemptsRef.current += 1;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [status, addDeployment, updateDeploymentStatus, router]);

  // Handle visibility & focus changes to recover lost connection
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[useRealtimeEvents] Document became visible. Checking connection status...");
        // If authenticated and no connection is active, or if the connection is in a closed state, reconnect.
        if (status === "authenticated") {
          const isDead = !eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED;
          if (isDead) {
            console.log("[useRealtimeEvents] Connection is dead, reconnecting immediately.");
            reconnectAttemptsRef.current = 0;
            connect();
          }
        }
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [status, connect]);

  React.useEffect(() => {
    if (status === "authenticated") {
      connect();
    } else {
      // Disconnect if we are not authenticated
      if (eventSourceRef.current) {
        console.log("[useRealtimeEvents] Disconnecting because session status is:", status);
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      reconnectAttemptsRef.current = 0;
    }

    return () => {
      if (eventSourceRef.current) {
        console.log("[useRealtimeEvents] Unmounting, closing SSE connection.");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, [status, connect]);
}
