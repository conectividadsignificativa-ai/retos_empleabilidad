import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Feedback Database Storage
const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

interface CommentRecord {
  id: string;
  solutionId: string;
  authorName: string;
  authorEmail?: string;
  authorOrg: string;
  text: string;
  createdAt: string;
}

interface FeedbackStore {
  likes: Record<string, string[]>; // solutionId -> array of userIds
  comments: Record<string, CommentRecord[]>;
  users: Array<{
    name: string;
    email: string;
    organization: string;
    role?: string;
    registeredAt: string;
  }>;
}

// Initial seed data to demonstrate activity if database is empty
const initialStore: FeedbackStore = {
  likes: {
    "pacifico-terremoto": ["user-init-10", "user-init-11", "user-init-12", "user-init-13", "user-init-14"],
    "pacifico-1": ["user-init-1", "user-init-2", "user-init-3", "user-init-4"],
    "pacifico-2": ["user-init-1", "user-init-5", "user-init-6"],
    "pacifico-3": ["user-init-2", "user-init-7"],
    "pacifico-4": ["user-init-3", "user-init-4", "user-init-8"],
    "caribe-1": ["user-init-2", "user-init-9", "user-init-10"],
    "caribe-2": ["user-init-1", "user-init-11", "user-init-12", "user-init-13"],
    "caribe-3": ["user-init-6", "user-init-7"],
    "caribe-4": ["user-init-8", "user-init-14", "user-init-15"]
  },
  comments: {
    "pacifico-terremoto": [
      {
        id: "c-pac-terr-1",
        solutionId: "pacifico-terremoto",
        authorName: "Patricia Caicedo",
        authorOrg: "Organización Territorial Aliada",
        text: "La combinación de micro-nodos con incentivos condicionados y brigadas de mapeadores digitales juveniles atiende de manera urgente la reactivación tras una emergencia.",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ],
    "pacifico-1": [
      {
        id: "c-pac-1-1",
        solutionId: "pacifico-1",
        authorName: "Carlos Rivas",
        authorOrg: "Caja de Compensación Familiar Aliada",
        text: "Es fundamental articular la red de mentores empresariales con las cajas locales y organizaciones aliadas para garantizar pasantías efectivas en el Nodo Pacífico.",
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      }
    ],
    "pacifico-2": [
      {
        id: "c-pac-2-1",
        solutionId: "pacifico-2",
        authorName: "María Fernanda Caicedo",
        authorOrg: "Ecosistema Tecnológico Aliado",
        text: "El modelo de formadores de vanguardia permite reducir la dependencia de licencias costosas y genera capacidades instaladas permanentes.",
        createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
      }
    ],
    "caribe-1": [
      {
        id: "c-car-1-1",
        solutionId: "caribe-1",
        authorName: "Andrés Mendoza",
        authorOrg: "Entidad Empresarial Aliada",
        text: "Eliminar el sesgo de selección y facilitar palancas institucionales abrirá oportunidades reales a los jóvenes en los clústeres TIC del Nodo Caribe.",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      }
    ],
    "caribe-2": [
      {
        id: "c-car-2-1",
        solutionId: "caribe-2",
        authorName: "Lucía Gómez",
        authorOrg: "Gremio TIC Aliado",
        text: "Los torneos de código a ciegas combinados con bilingüismo abordan dos dolores simultáneos de las empresas de desarrollo en el territorio.",
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ]
  },
  users: []
};

// Ensure data directory and file exist
function getStore(): FeedbackStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FEEDBACK_FILE)) {
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(initialStore, null, 2), "utf8");
      return initialStore;
    }
    const data = fs.readFileSync(FEEDBACK_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading feedback file:", err);
    return initialStore;
  }
}

function saveStore(store: FeedbackStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing feedback file:", err);
  }
}

// API: Get feedback (likes counts, user likes, and comments for all solutions)
app.get("/api/feedback", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "";
    const store = getStore();

    const likesCount: Record<string, number> = {};
    const userLikes: Record<string, boolean> = {};

    Object.keys(store.likes).forEach((solutionId) => {
      const userList = store.likes[solutionId] || [];
      likesCount[solutionId] = userList.length;
      userLikes[solutionId] = userId ? userList.includes(userId) : false;
    });

    res.json({
      likes: likesCount,
      userLikes: userLikes,
      comments: store.comments || {}
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch feedback data" });
  }
});

// API: Toggle Like for a solution
app.post("/api/solutions/:solutionId/like", (req, res) => {
  try {
    const { solutionId } = req.params;
    const { userId, userName, userOrg } = req.body;

    if (!solutionId) {
      return res.status(400).json({ error: "Solution ID is required" });
    }

    const currentUserId = userId || "anonymous-guest";
    const store = getStore();

    if (!store.likes[solutionId]) {
      store.likes[solutionId] = [];
    }

    const index = store.likes[solutionId].indexOf(currentUserId);
    let userLiked = false;

    if (index >= 0) {
      // Unlike
      store.likes[solutionId].splice(index, 1);
      userLiked = false;
    } else {
      // Like
      store.likes[solutionId].push(currentUserId);
      userLiked = true;
    }

    saveStore(store);

    res.json({
      success: true,
      solutionId,
      likesCount: store.likes[solutionId].length,
      userLiked
    });
  } catch (err: any) {
    console.error("Error toggling like:", err);
    res.status(500).json({ error: "Failed to register like" });
  }
});

// API: Add comment to a solution
app.post("/api/solutions/:solutionId/comment", (req, res) => {
  try {
    const { solutionId } = req.params;
    const { authorName, authorEmail, authorOrg, text } = req.body;

    if (!solutionId || !text || !text.trim()) {
      return res.status(400).json({ error: "Solution ID and comment text are required" });
    }

    const store = getStore();
    if (!store.comments[solutionId]) {
      store.comments[solutionId] = [];
    }

    const newComment: CommentRecord = {
      id: "c-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      solutionId,
      authorName: (authorName && authorName.trim()) || "Participante",
      authorEmail: authorEmail?.trim() || "",
      authorOrg: (authorOrg && authorOrg.trim()) || "Organización Aliada",
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    store.comments[solutionId].unshift(newComment);
    saveStore(store);

    res.json({
      success: true,
      comment: newComment,
      comments: store.comments[solutionId]
    });
  } catch (err: any) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Failed to save comment" });
  }
});

// API: Register/save user profile
app.post("/api/register-user", (req, res) => {
  try {
    const { name, email, organization, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const store = getStore();
    const existingIndex = store.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

    const userRecord = {
      name: name.trim(),
      email: email.trim(),
      organization: (organization && organization.trim()) || "General",
      role: role?.trim() || "",
      registeredAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      store.users[existingIndex] = userRecord;
    } else {
      store.users.push(userRecord);
    }

    saveStore(store);
    res.json({ success: true, user: userRecord });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
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
