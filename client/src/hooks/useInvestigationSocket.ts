import { useEffect, useCallback, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import type { RootState } from "../store/store";
import { API_BASE_URL, API_ENDPOINTS } from "../api/config";

interface AgentActivity {
  agentName: string;
  agentType: string;
  timestamp: string;
  status: string;
  message: string;
}

interface WorkflowUpdate {
  phase: string;
  status: string;
  incidentStatus?: string;
  incidentSeverity?: string;
}

interface Investigation {
  id: string;
  phase: string;
  status?: string;
}

export const useInvestigationSocket = (
  investigationId: string,
  onActivityUpdate?: (activity: AgentActivity) => void,
  onWorkflowUpdate?: (update: WorkflowUpdate) => void,
) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const socketRef = useRef<Socket | null>(null);
  const [investigationStatus, setInvestigationStatus] =
    useState<string>("unknown");

  // Fetch investigation status to determine if socket should connect
  // Poll every 3 seconds to detect phase changes
  useEffect(() => {
    if (!investigationId || !token) return;

    const fetchInvestigationStatus = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.investigation(investigationId),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const investigation: Investigation = await response.json();
          console.log("[SOCKET] Investigation status:", investigation.phase);
          setInvestigationStatus(investigation.phase);
        }
      } catch (error) {
        console.error("[SOCKET] Failed to fetch investigation status:", error);
      }
    };

    // Fetch immediately
    fetchInvestigationStatus();

    // Poll every 3 seconds to detect phase changes (for re-run workflow scenarios)
    const pollInterval = setInterval(fetchInvestigationStatus, 3000);

    return () => clearInterval(pollInterval);
  }, [investigationId, token]);

  useEffect(() => {
    if (!investigationId) return;

    // Only connect socket if investigation is in progress (Intake or Analysis phase)
    const shouldConnect =
      investigationStatus === "Analysis" || investigationStatus === "Intake";

    console.log(
      `[SOCKET] Status check - investigationStatus: ${investigationStatus}, shouldConnect: ${shouldConnect}`,
    );

    if (!shouldConnect) {
      console.log(
        "[SOCKET] Skipping socket connection - investigation not in progress",
      );
      return;
    }

    // Connect to Socket.IO server
    const socket = io(API_BASE_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SOCKET] Connected:", socket.id);
      // Join the investigation room
      socket.emit("join-investigation", investigationId);
    });

    socket.on("agent-activity", (activity: AgentActivity) => {
      console.log("[SOCKET] Agent activity received:", activity.agentName);
      onActivityUpdate?.(activity);
    });

    socket.on("workflow-update", (update: WorkflowUpdate) => {
      console.log(
        "[SOCKET] Workflow update received:",
        update.phase,
        update.status,
      );

      // If investigation is complete or in review, disconnect
      if (
        update.phase === "Complete" ||
        update.phase === "Review" ||
        update.status === "done"
      ) {
        console.log("[SOCKET] Investigation completed - disconnecting");
        setInvestigationStatus("Review");
        socket.emit("leave-investigation", investigationId);
        socket.disconnect();
      }

      onWorkflowUpdate?.(update);
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected");
    });

    return () => {
      if (socket) {
        socket.emit("leave-investigation", investigationId);
        socket.disconnect();
      }
    };
  }, [investigationId, investigationStatus]);

  return socketRef.current;
};
