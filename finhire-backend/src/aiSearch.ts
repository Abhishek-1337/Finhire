import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { env } from "./config/env";

export function startAiServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.post("/api/ai-search", async (req, res) => {
    const { query } = req.body || {};
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query string" });
    }

    // For now, just acknowledge receipt. The user will implement AI structuring here.
    // Log the incoming query for inspection.
    // eslint-disable-next-line no-console
    console.log("AI search received:", query);

    // Respond with a placeholder — the user can replace this with AI-generated JSON schema.
    return res.json({
      query,
      structured: null,
      message: "Received. Replace this endpoint with AI structuring logic.",
    });
  });

  const port = env.AI_PORT;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`AI search endpoint listening on http://localhost:${port}/api/ai-search`);
  });
}
