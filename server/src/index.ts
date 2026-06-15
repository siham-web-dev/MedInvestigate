import express, { json } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth";
import incidentsRouter from "./routes/incidents";
import investigationsRouter from "./routes/investigations";
import agentsRouter from "./routes/agents";
import { initializeSocketIO } from "./services/socketIOService";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store io instance globally for use in other services
(global as any).io = io;

// Middleware
app.use(cors());
app.use(json());

// Initialize Socket.IO
initializeSocketIO(io);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/investigations", investigationsRouter);
app.use("/api/agents", agentsRouter);

// Global error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
