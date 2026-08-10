import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Server-side API endpoint to generate ideas using Gemini 3.5 Flash
app.post("/api/generate-ideas", async (req, res) => {
  try {
    const { challengeTitle, challengeDescription, category, numIdeas = 3 } = req.body;

    if (!challengeTitle || !challengeDescription) {
      return res.status(400).json({ error: "Challenge title and description are required." });
    }

    const systemInstruction = `You are an expert Innovation Consultant and Brightidea specialist.
Your task is to generate highly innovative, practical, and structured business ideas for a company's innovation challenge.
Generate exactly ${numIdeas} distinct ideas. Ensure each idea has a title, description, estimated impact (Low, Medium, High), feasibility (Low, Medium, High), and a core tagline.`;

    const prompt = `Challenge Title: ${challengeTitle}
Challenge Description: ${challengeDescription}
Category/Department: ${category || "General"}

Provide the ${numIdeas} ideas in a clean JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              description: "The list of generated ideas for the innovation challenge.",
              items: {
                type: Type.OBJECT,
                required: ["title", "tagline", "description", "impact", "feasibility"],
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "A short, catchy, professional title for the idea.",
                  },
                  tagline: {
                    type: Type.STRING,
                    description: "A one-sentence value proposition tagline.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "A detailed 2-3 sentence description of how the idea works and its implementation.",
                  },
                  impact: {
                    type: Type.STRING,
                    enum: ["Low", "Medium", "High"],
                    description: "The potential positive impact on the organization.",
                  },
                  feasibility: {
                    type: Type.STRING,
                    enum: ["Low", "Medium", "High"],
                    description: "The ease of execution or implementability.",
                  },
                },
              },
            },
          },
          required: ["ideas"],
        },
      },
    });

    const jsonText = response.text?.trim() || '{"ideas": []}';
    const parsedData = JSON.parse(jsonText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating ideas via Gemini:", error);
    res.status(500).json({
      error: "Failed to generate ideas. Please check your Gemini API configuration.",
      details: error.message || error,
    });
  }
});

// Configure Vite middleware for development, and static file server for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
