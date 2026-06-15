import express, { json } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth";
import incidentsRouter from "./routes/incidents";
import investigationsRouter from "./routes/investigations";
import agentsRouter from "./routes/agents";

const app = express();

// Middleware
app.use(cors());
app.use(json());

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
