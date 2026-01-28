import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { GoogleGenAI } from "@google/genai";

const getAIClient = (apiKey?: string, provider?: string) => {
  if (provider === "google" && apiKey) {
    return new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  
  return new GoogleGenAI({
    apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
    httpOptions: {
      apiVersion: "",
      baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
    },
  });
};

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const PINESCRIPT_SYSTEM_PROMPT = `You are PineScript AI, an expert assistant for TradingView's Pine Script programming language. You help traders write, debug, and optimize Pine Script code.

Your capabilities:
- Generate Pine Script code from natural language descriptions
- Explain Pine Script syntax and functions
- Debug and fix errors in Pine Script code
- Optimize existing strategies and indicators
- Convert trading ideas into working Pine Script

Guidelines:
- Always use Pine Script version 5 (//@version=5)
- Include proper annotations and indicator/strategy declarations
- Write clean, well-commented code
- Follow Pine Script best practices
- Explain your code when generating new scripts

When generating code, always wrap it in code blocks with \`\`\`pinescript markers.`;

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // AI PineScript Assistant - Generate code
  app.post("/api/ai/generate", async (req: Request, res: Response) => {
    try {
      const { prompt, context, apiKey, provider } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const client = getAIClient(apiKey, provider);
      const messages = [
        { role: "user" as const, parts: [{ text: PINESCRIPT_SYSTEM_PROMPT }] },
        { role: "model" as const, parts: [{ text: "I understand. I'm PineScript AI, ready to help you write TradingView Pine Script code. How can I assist you?" }] },
      ];

      if (context) {
        messages.push({
          role: "user" as const,
          parts: [{ text: `Current code context:\n\`\`\`pinescript\n${context}\n\`\`\`` }],
        });
        messages.push({
          role: "model" as const,
          parts: [{ text: "I see your current code. What would you like me to help you with?" }],
        });
      }

      messages.push({
        role: "user" as const,
        parts: [{ text: prompt }],
      });

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages,
      });

      const text = response.text || "";
      res.json({ response: text });
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // AI PineScript Assistant - Format code
  app.post("/api/ai/format", async (req: Request, res: Response) => {
    try {
      const { code, apiKey, provider } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      const client = getAIClient(apiKey, provider);
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `You are a Pine Script formatter. Format the following Pine Script code with proper indentation, spacing, and whitespace. Fix any obvious syntax issues. Return ONLY the formatted code without any explanation or markdown code blocks.

Code to format:
${code}`,
            }],
          },
        ],
      });

      const formattedCode = response.text || code;
      res.json({ code: formattedCode.trim() });
    } catch (error) {
      console.error("AI format error:", error);
      res.status(500).json({ error: "Failed to format code" });
    }
  });

  // AI PineScript Assistant - Explain code
  app.post("/api/ai/explain", async (req: Request, res: Response) => {
    try {
      const { code, apiKey, provider } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }

      const client = getAIClient(apiKey, provider);
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `${PINESCRIPT_SYSTEM_PROMPT}

Please explain the following Pine Script code in simple terms. Break down what each section does and explain any trading logic:

\`\`\`pinescript
${code}
\`\`\``,
            }],
          },
        ],
      });

      const explanation = response.text || "";
      res.json({ explanation });
    } catch (error) {
      console.error("AI explain error:", error);
      res.status(500).json({ error: "Failed to explain code" });
    }
  });

  // AI PineScript Assistant - Streaming chat
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { messages: chatHistory, prompt, apiKey, provider } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const client = getAIClient(apiKey, provider);
      const contents = [
        { role: "user" as const, parts: [{ text: PINESCRIPT_SYSTEM_PROMPT }] },
        { role: "model" as const, parts: [{ text: "I understand. I'm PineScript AI, ready to help you write TradingView Pine Script code." }] },
      ];

      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          contents.push({
            role: msg.role === "user" ? "user" as const : "model" as const,
            parts: [{ text: msg.content }],
          });
        }
      }

      contents.push({
        role: "user" as const,
        parts: [{ text: prompt }],
      });

      const stream = await client.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
      });

      for await (const chunk of stream) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate response" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
