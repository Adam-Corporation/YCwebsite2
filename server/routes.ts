import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from public directory
  app.use("/videos", express.static(path.join(process.cwd(), "public/videos")));
  app.use("/images", express.static(path.join(process.cwd(), "public/images")));

  // API endpoint to check server status
  app.get("/api/status", async (req, res) => {
    return res.status(200).json({ 
      status: "ok",
      message: "Server is running"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
