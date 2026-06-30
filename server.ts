import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/map", async (req, res) => {
    try {
      if (!process.env.NEXUS_API_TOKEN) {
        throw new Error("NEXUS_API_TOKEN environment variable is missing.");
      }
      
      const response = await fetch("https://s0.nexuslegacy.space/api/galaxy/map", {
        headers: {
          "Authorization": `Bearer ${process.env.NEXUS_API_TOKEN}`
        }
      });
      if (!response.ok) {
        throw new Error(`API error from Nexus API: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares as express.RequestHandler);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath) as express.RequestHandler);
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
