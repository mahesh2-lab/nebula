import * as React from "react";
import { useStore } from "@/store/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useRealtimeEvents() {
  const addDeployment = useStore((s) => s.addDeployment);
  const updateDeploymentStatus = useStore((s) => s.updateDeploymentStatus);
  const router = useRouter();

  React.useEffect(() => {
    console.log("[useRealtimeEvents] Connecting to Server-Sent Events...");
    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      console.log("[useRealtimeEvents] SSE Connection established.");
    };

    eventSource.onmessage = (event) => {
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

    eventSource.onerror = (err) => {
      console.error("[useRealtimeEvents] SSE error:", err);
      // EventSource automatically retries connections
    };

    return () => {
      console.log("[useRealtimeEvents] Closing SSE Connection.");
      eventSource.close();
    };
  }, [addDeployment, updateDeploymentStatus, router]);
}
