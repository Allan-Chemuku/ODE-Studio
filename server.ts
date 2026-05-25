import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Safe lazy-initialization of Gemini Client
  let ai: GoogleGenAI | null = null;
  const initGemini = () => {
    if (!ai && process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  };

  // API router for AI-powered ODE Tutoring proxy
  app.post("/api/chat", async (req, res) => {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array" });
      return;
    }

    try {
      const gAI = initGemini();
      if (!gAI) {
        // Return simulated high-quality mathematical mentor guidance if no key is found
        // or user can hook into local Ollama on their machine directly from the client.
        res.json({
          text: "📢 **Offline Mode / No Key Configured**\n\nI am operating in browser-local mentor mode. If you have Ollama or LM Studio running, you can connect the workspace to your local LLM in the **AI Control Settings**! Alternatively, once your Gemini API key is configured in the AI Studio Secrets panel, my cloud supercomputer brain will activate.",
          simulated: true,
        });
        return;
      }

      // Convert messages list to Gemini API format.
      // We will concatenate messages into contents or use Gemini's chats system.
      const formattedContents = messages.map((m) => {
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || "" }],
        };
      });

      const response = await gAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt || "You are a patient, expert Ordinary Differential Equations tutor. Teach intuitively.",
          temperature: 0.7,
        },
      });

      res.json({
        text: response.text || "No response produced.",
        simulated: false,
      });
    } catch (err: any) {
      console.error("Gemini proxy error:", err);
      res.status(500).json({
        error: "Failed to connect to tutor network.",
        details: err.message,
        text: "⚠️ **Connection Error**\n\nI encountered an issue reaching the cloud math mentor. Please ensure your network is stable or switch to **Local Offline LLM** model in AI settings.",
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date().toISOString() });
  });

  // Serve Front-End
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ODE Study Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
