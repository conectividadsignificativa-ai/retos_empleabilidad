import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS and handle preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Persistent Feedback Database Storage
const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
const WHITELIST_FILE = path.join(DATA_DIR, "whitelist.json");

interface WhitelistItem {
  email: string;
  name?: string;
  organization?: string;
  role?: string;
  addedAt: string;
}

const defaultWhitelist: WhitelistItem[] = [
  {
    email: "conectividadsignificativa@gmail.com",
    name: "Dirección General VCS",
    organization: "Ventana de Conectividad Significativa",
    role: "Super Administrador",
    addedAt: "2026-09-24T00:00:00.000Z"
  },
  {
    email: "admin@conectividadsignificativa.co",
    name: "Equipo Técnico y Monitoreo",
    organization: "IDTF Facility / VCS",
    role: "Coordinador de Métricas",
    addedAt: "2026-09-24T00:00:00.000Z"
  },
  {
    email: "directorio@oit.org",
    name: "Delegación de Empleabilidad",
    organization: "Organización Internacional del Trabajo (OIT)",
    role: "Evaluador Estratégico",
    addedAt: "2026-09-24T00:00:00.000Z"
  },
  {
    email: "cooperacion@ue.europa.eu",
    name: "Comité de Cooperación",
    organization: "Unión Europea",
    role: "Evaluador de Cooperación",
    addedAt: "2026-09-24T00:00:00.000Z"
  },
  {
    email: "alianzas@idtf-facility.org",
    name: "Gerencia de Alianzas",
    organization: "IDTF Facility",
    role: "Analista de Políticas",
    addedAt: "2026-09-24T00:00:00.000Z"
  }
];

function getWhitelist(): WhitelistItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WHITELIST_FILE)) {
      fs.writeFileSync(WHITELIST_FILE, JSON.stringify(defaultWhitelist, null, 2), "utf8");
      return defaultWhitelist;
    }
    const raw = fs.readFileSync(WHITELIST_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading whitelist file:", err);
    return defaultWhitelist;
  }
}

function saveWhitelist(list: WhitelistItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving whitelist file:", err);
  }
}

const SOLUTIONS_METADATA = [
  { id: "pacifico-terremoto", region: "pacifico" as const, number: 1, title: "Piloto de Respuesta y Recuperación Post-Terremoto – Ventana de Conectividad Significativa", tags: ["Respuesta Post-Desastre", "Micro-nodos Co-working", "Mapeadores Digitales"] },
  { id: "pacifico-1", region: "pacifico" as const, number: 2, title: "La Palanca Institucionalizada (Red de Micro-conexiones)", tags: ["Red de Contactos", "Cajas de Compensación", "Mentoría Directa"] },
  { id: "pacifico-2", region: "pacifico" as const, number: 3, title: "Pasaporte de Habilidades (Modelo de Formadores de Vanguardia)", tags: ["Formadores de Vanguardia", "Sandboxes Locales", "Certificación"] },
  { id: "pacifico-3", region: "pacifico" as const, number: 4, title: "Formación Dual Digital Híbrida (El Estándar Operativo)", tags: ["Formación Dual", "Estipendio", "Acompañamiento Psicosocial"] },
  { id: "pacifico-4", region: "pacifico" as const, number: 5, title: "Sandbox Territorial de Inteligencia Artificial y Cloud", tags: ["Sandbox IA", "Gobernanza de Datos", "Pasantías"] },
  { id: "caribe-1", region: "caribe" as const, number: 1, title: "El Factor de Confianza Territorial (Sello de Empleabilidad Inclusiva)", tags: ["Sello de Confianza", "Contratación sin Sesgos", "Incentivos"] },
  { id: "caribe-2", region: "caribe" as const, number: 2, title: "Torneos de Código a Ciegas y Hackathones de Empleabilidad", tags: ["Hackathones", "Evaluación a Ciegas", "Bilingüismo"] },
  { id: "caribe-3", region: "caribe" as const, number: 3, title: "Fábricas de Software Comunitarias y Células de Desarrollo", tags: ["Células de Desarrollo", "Proyectos Reales", "Mentores Senior"] },
  { id: "caribe-4", region: "caribe" as const, number: 4, title: "Ruta de Certificación en Cloud y Ciberseguridad Caribe", tags: ["Cloud & Ciberseguridad", "Vouchers de Examen", "Alianzas"] }
];

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
    const { authorName, authorEmail, authorOrg, text } = req.body || {};

    if (!solutionId || !text || !text.trim()) {
      return res.status(400).json({ error: "Solution ID and comment text are required" });
    }

    const store = getStore();
    if (!store.comments) {
      store.comments = {};
    }
    if (!store.comments[solutionId]) {
      store.comments[solutionId] = [];
    }

    const newComment: CommentRecord = {
      id: "c-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      solutionId,
      authorName: (authorName && authorName.trim()) || "Participante",
      authorEmail: (authorEmail && authorEmail.trim()) || "",
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

// ==========================================
// WHITELIST & REAL-TIME REPORTING ENDPOINTS
// ==========================================

// 1. Verify Whitelist Authentication
app.post("/api/auth/verify-whitelist", (req, res) => {
  try {
    const { email, pin } = req.body || {};
    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPin = (pin || "").trim().toUpperCase();

    // Emergency quick-access PIN for demo/evaluation
    const isMasterPin = cleanPin === "VCS2026" || cleanPin === "OIT2026";

    const whitelist = getWhitelist();
    const matchedEntry = whitelist.find((entry) => entry.email.toLowerCase() === normalizedEmail);

    if (matchedEntry || (isMasterPin && normalizedEmail)) {
      const user = {
        email: matchedEntry ? matchedEntry.email : normalizedEmail,
        name: matchedEntry?.name || "Evaluador Estratégico Aliado",
        organization: matchedEntry?.organization || "Entidad Aliada Autorizada",
        role: matchedEntry?.role || (isMasterPin ? "Auditor Directivo (PIN)" : "Evaluador de Reportes"),
        token: "vcs_auth_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8)
      };

      return res.json({
        authorized: true,
        user,
        message: "Acceso verificado exitosamente en la lista blanca."
      });
    }

    // Not in whitelist
    return res.status(403).json({
      authorized: false,
      error: `El correo "${email}" no figura en la lista blanca de aliados autorizados para consultar este dashboard. Solicita acceso a la dirección técnica.`
    });
  } catch (err: any) {
    console.error("Error in verify-whitelist:", err);
    res.status(500).json({ authorized: false, error: "Error interno al verificar la lista blanca." });
  }
});

// 2. Real-time Aggregated Voting and Feedback Reports
app.get("/api/admin/reports", (req, res) => {
  try {
    const store = getStore();
    const allLikes = store.likes || {};
    const allComments = store.comments || {};

    let totalVotes = 0;
    const uniqueVoterSet = new Set<string>();
    const uniqueOrgsSet = new Set<string>();

    // Count votes and voters
    Object.keys(allLikes).forEach((solId) => {
      const voters = allLikes[solId] || [];
      totalVotes += voters.length;
      voters.forEach((vid) => uniqueVoterSet.add(vid));
    });

    // Count comments and gather organizations
    let totalComments = 0;
    Object.keys(allComments).forEach((solId) => {
      const commentsList = allComments[solId] || [];
      totalComments += commentsList.length;
      commentsList.forEach((c) => {
        if (c.authorOrg && c.authorOrg.trim()) {
          uniqueOrgsSet.add(c.authorOrg.trim());
        }
      });
    });

    // Also include registered users organizations
    (store.users || []).forEach((u) => {
      if (u.organization && u.organization.trim()) {
        uniqueOrgsSet.add(u.organization.trim());
      }
    });

    // Compute metrics for each solution
    const metrics = SOLUTIONS_METADATA.map((sol) => {
      const voters = allLikes[sol.id] || [];
      const comments = allComments[sol.id] || [];
      const votesCount = voters.length;
      const commentsCount = comments.length;
      const votePercentage = totalVotes > 0 ? Number(((votesCount / totalVotes) * 100).toFixed(1)) : 0;

      // Unique organizations for this solution
      const orgSet = new Set<string>();
      comments.forEach((c) => {
        if (c.authorOrg) orgSet.add(c.authorOrg);
      });

      return {
        solutionId: sol.id,
        title: sol.title,
        region: sol.region,
        number: sol.number,
        votesCount,
        commentsCount,
        votePercentage,
        tags: sol.tags,
        organizations: Array.from(orgSet),
        comments,
        rank: 0 // will be assigned below
      };
    });

    // Sort by votes (descending), then by comments (descending)
    metrics.sort((a, b) => {
      if (b.votesCount !== a.votesCount) {
        return b.votesCount - a.votesCount;
      }
      return b.commentsCount - a.commentsCount;
    });

    // Assign ranking
    metrics.forEach((item, index) => {
      item.rank = index + 1;
    });

    const pacificoVotes = metrics
      .filter((m) => m.region === "pacifico")
      .reduce((sum, m) => sum + m.votesCount, 0);

    const caribeVotes = metrics
      .filter((m) => m.region === "caribe")
      .reduce((sum, m) => sum + m.votesCount, 0);

    const leadingSolution = metrics.length > 0 ? {
      title: metrics[0].title,
      region: metrics[0].region,
      votes: metrics[0].votesCount
    } : undefined;

    res.json({
      summary: {
        totalVotes,
        totalComments,
        uniqueVoters: uniqueVoterSet.size,
        uniqueOrganizations: uniqueOrgsSet.size,
        pacificoVotes,
        caribeVotes,
        leadingSolution
      },
      metrics,
      lastUpdated: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Error generating reports:", err);
    res.status(500).json({ error: "Error al generar reportes en tiempo real." });
  }
});

// 3. Get Whitelist
app.get("/api/admin/whitelist", (req, res) => {
  try {
    const list = getWhitelist();
    res.json({ whitelist: list });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener la lista blanca." });
  }
});

// 4. Add to Whitelist
app.post("/api/admin/whitelist", (req, res) => {
  try {
    const { email, name, organization, role } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "El correo es requerido." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const list = getWhitelist();

    const existingIndex = list.findIndex((item) => item.email.toLowerCase() === cleanEmail);
    const newEntry: WhitelistItem = {
      email: cleanEmail,
      name: name?.trim() || "Aliado Estratégico",
      organization: organization?.trim() || "Organización Aliada",
      role: role?.trim() || "Evaluador",
      addedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newEntry };
    } else {
      list.push(newEntry);
    }

    saveWhitelist(list);
    res.json({ success: true, entry: newEntry, whitelist: list });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar en la lista blanca." });
  }
});

// 5. Remove from Whitelist
app.delete("/api/admin/whitelist/:email", (req, res) => {
  try {
    const emailToDelete = decodeURIComponent(req.params.email || "").trim().toLowerCase();
    
    // Protect primary root admin
    if (emailToDelete === "conectividadsignificativa@gmail.com") {
      return res.status(400).json({ error: "No se puede eliminar el administrador principal." });
    }

    let list = getWhitelist();
    list = list.filter((item) => item.email.toLowerCase() !== emailToDelete);
    saveWhitelist(list);

    res.json({ success: true, whitelist: list });
  } catch (err) {
    res.status(500).json({ error: "Error al remover de la lista blanca." });
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
