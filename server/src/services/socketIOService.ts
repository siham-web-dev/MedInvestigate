import { Server as SocketIOServer, Socket } from "socket.io";

export const initializeSocketIO = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-investigation", (investigationId: string) => {
      socket.join(`investigation-${investigationId}`);
      console.log(`Socket ${socket.id} joined investigation-${investigationId}`);
    });

    socket.on("leave-investigation", (investigationId: string) => {
      socket.leave(`investigation-${investigationId}`);
      console.log(`Socket ${socket.id} left investigation-${investigationId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const broadcastAgentActivity = (investigationId: string, activity: any) => {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    console.log(`[BROADCAST] Sending agent activity to investigation-${investigationId}:`, activity.agentName, activity.status);
    io.to(`investigation-${investigationId}`).emit("agent-activity", {
      ...activity,
      broadcastedAt: new Date().toISOString(),
    });
  }
};

export const broadcastWorkflowUpdate = (
  investigationId: string,
  update: { phase: string; status: string; incidentStatus?: string; incidentSeverity?: string }
) => {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    console.log(`[BROADCAST] Sending workflow update to investigation-${investigationId}:`, update);
    io.to(`investigation-${investigationId}`).emit("workflow-update", update);
  }
};

export const broadcastDashboardStatsUpdate = (stats: {
  totalIncidents: number;
  activeInvestigations: number;
  criticalCases: number;
  pendingReviews: number;
}) => {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    console.log(`[BROADCAST] Sending dashboard stats update:`, stats);
    io.emit("dashboard-stats-update", {
      ...stats,
      updatedAt: new Date().toISOString(),
    });
  }
};
