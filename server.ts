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
  // Prevent browser/proxy caching for real-time reporting API
  if (req.path.startsWith("/api")) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate, proxy-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
  }
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
  { id: "pacifico-4", region: "pacifico" as const, number: 5, title: "Laboratorios Juveniles de Innovación Abierta (Fábricas de Soluciones)", tags: ["Proyectos Capstone", "Fábrica de Soluciones", "Assessment Center", "Innovación Abierta"] },
  { id: "caribe-1", region: "caribe" as const, number: 1, title: "Ecosistema de Intermediación Activa con Comunidades de Talento (La Palanca)", tags: ["Intermediación Activa", "Comunidades de Talento", "Nodos Juveniles", "Inmersiones Trimestrales"] },
  { id: "caribe-2", region: "caribe" as const, number: 2, title: "Sandbox Bilingüe y Pago por Resultados", tags: ["Torneos de Código a Ciegas", "Bilingüismo", "Pago por Resultados", "Validación Práctica"] },
  { id: "caribe-3", region: "caribe" as const, number: 3, title: "Acompañamiento Integral y Retención Condicionada (Pago por Resultados)", tags: ["Contención Socioemocional", "Zonas Seguras Empresariales", "Pago por Resultados", "Padrino Técnico"] },
  { id: "caribe-4", region: "caribe" as const, number: 4, title: "Semilleros Corporativos Inmersivos (Pacto por el Empleo)", tags: ["Pacto por el Empleo", "Semilleros Inmersivos", "Formación Clusterizada", "Transición Sin Traumas"] }
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

// Initial seed data store with anonymous evaluators and fictional entities
const initialStore: FeedbackStore = {
  likes: {
    "pacifico-terremoto": ["anonimo1@ficticio.org"],
    "pacifico-1": ["anonimo2@ficticio.org"],
    "pacifico-2": ["anonimo3@ficticio.org"],
    "pacifico-3": ["anonimo4@ficticio.org"],
    "pacifico-4": ["anonimo5@ficticio.org"],
    "caribe-1": ["anonimo6@ficticio.org"],
    "caribe-2": ["anonimo7@ficticio.org"],
    "caribe-3": ["anonimo8@ficticio.org"],
    "caribe-4": ["anonimo9@ficticio.org"]
  },
  comments: {
    "pacifico-terremoto": [
      {
        id: "c-pacifico-terremoto-1",
        solutionId: "pacifico-terremoto",
        authorName: "Anónimo 1",
        authorEmail: "anonimo1@ficticio.org",
        authorOrg: "Organización Ficticia 1",
        text: "Excelente iniciativa para resiliencia territorial y respuesta post-desastre con micro-nodos y mapeadores digitales juveniles.",
        createdAt: "2026-09-28T17:36:41.862Z"
      }
    ],
    "pacifico-1": [
      {
        id: "c-pacifico-1-1",
        solutionId: "pacifico-1",
        authorName: "Anónimo 2",
        authorEmail: "anonimo2@ficticio.org",
        authorOrg: "Organización Ficticia 2",
        text: "La red de micro-conexiones formaliza el relacionamiento que hoy falta para los jóvenes de la región, facilitando el acceso a vacantes sin sesgos de reclutamiento.",
        createdAt: "2026-09-28T17:36:41.875Z"
      }
    ],
    "pacifico-2": [
      {
        id: "c-pacifico-2-1",
        solutionId: "pacifico-2",
        authorName: "Anónimo 3",
        authorEmail: "anonimo3@ficticio.org",
        authorOrg: "Organización Ficticia 3",
        text: "El modelo de formadores de vanguardia reduce la brecha de certificación y genera capacidad instalada técnica directamente en el territorio.",
        createdAt: "2026-09-28T17:36:41.894Z"
      }
    ],
    "pacifico-3": [
      {
        id: "c-pacifico-3-1",
        solutionId: "pacifico-3",
        authorName: "Anónimo 4",
        authorEmail: "anonimo4@ficticio.org",
        authorOrg: "Organización Ficticia 4",
        text: "La formación dual garantiza inserción laboral directa con sostenimiento empresarial y acompañamiento socioemocional pertinente.",
        createdAt: "2026-09-28T17:36:41.905Z"
      }
    ],
    "pacifico-4": [
      {
        id: "c-pacifico-4-1",
        solutionId: "pacifico-4",
        authorName: "Anónimo 5",
        authorEmail: "anonimo5@ficticio.org",
        authorOrg: "Organización Ficticia 5",
        text: "Los retos capstone con metodología de assessment center permiten a las empresas medir competencias blandas y técnicas en condiciones reales de trabajo.",
        createdAt: "2026-09-28T17:36:41.914Z"
      }
    ],
    "caribe-1": [
      {
        id: "c-caribe-1-1",
        solutionId: "caribe-1",
        authorName: "Anónimo 6",
        authorEmail: "anonimo6@ficticio.org",
        authorOrg: "Organización Ficticia 6",
        text: "La intermediación activa con enfoque territorial es fundamental para conectar vacantes de la industria con el talento de barrios periféricos.",
        createdAt: "2026-09-28T17:36:41.921Z"
      }
    ],
    "caribe-2": [
      {
        id: "c-caribe-2-1",
        solutionId: "caribe-2",
        authorName: "Anónimo 7",
        authorEmail: "anonimo7@ficticio.org",
        authorOrg: "Organización Ficticia 7",
        text: "Los torneos de código a ciegas y el modelo de pago por resultados aseguran validación práctica objetiva y derriban barreras de bilingüismo técnico.",
        createdAt: "2026-09-28T17:36:41.930Z"
      }
    ],
    "caribe-3": [
      {
        id: "c-caribe-3-1",
        solutionId: "caribe-3",
        authorName: "Anónimo 8",
        authorEmail: "anonimo8@ficticio.org",
        authorOrg: "Organización Ficticia 8",
        text: "La contención socioemocional durante los primeros 90 días protege la inversión de las empresas y minimiza la deserción temprana.",
        createdAt: "2026-09-28T17:36:41.941Z"
      }
    ],
    "caribe-4": [
      {
        id: "c-caribe-4-1",
        solutionId: "caribe-4",
        authorName: "Anónimo 9",
        authorEmail: "anonimo9@ficticio.org",
        authorOrg: "Organización Ficticia 9",
        text: "Los semilleros inmersivos y el pacto por el empleo rompen el síndrome del impostor y consolidan clústeres formativos de alta retención.",
        createdAt: "2026-09-28T17:36:41.951Z"
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
    const { email } = req.body || {};
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ authorized: false, error: "El correo es requerido." });
    }

    const whitelist = getWhitelist();
    const matchedEntry = whitelist.find((entry) => entry.email.toLowerCase() === normalizedEmail);

    if (matchedEntry) {
      const user = {
        email: matchedEntry.email,
        name: matchedEntry.name || "Evaluador Estratégico Aliado",
        organization: matchedEntry.organization || "Entidad Aliada Autorizada",
        role: matchedEntry.role || "Evaluador de Reportes",
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
      error: `El correo "${email}" no figura en la lista blanca de aliados autorizados para consultar este dashboard. Solicita autorización al equipo coordinador.`
    });
  } catch (err: any) {
    console.error("Error in verify-whitelist:", err);
    res.status(500).json({ authorized: false, error: "Error interno al verificar la lista blanca." });
  }
});

// Helper to compute reports data for JSON and CSV exports
function computeReports(store: FeedbackStore) {
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
      voters,
      rank: 0
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

  const leadingSolution = metrics.length > 0 && metrics[0].votesCount > 0 ? {
    title: metrics[0].title,
    region: metrics[0].region,
    votes: metrics[0].votesCount
  } : undefined;

  // Flatten all recent comments and sort chronologically (most recent first)
  const recentComments: Array<CommentRecord & { solutionTitle: string; region: string; solutionNumber: number }> = [];
  Object.keys(allComments).forEach((solId) => {
    const solMeta = SOLUTIONS_METADATA.find((s) => s.id === solId);
    const commentsList = allComments[solId] || [];
    commentsList.forEach((c) => {
      recentComments.push({
        ...c,
        solutionTitle: solMeta ? solMeta.title : solId,
        region: solMeta ? solMeta.region : "pacifico",
        solutionNumber: solMeta ? solMeta.number : 1
      });
    });
  });

  recentComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
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
    recentComments,
    lastUpdated: new Date().toISOString()
  };
}

// Helper to generate full CSV string with UTF-8 BOM
function generateReportsCSV(store: FeedbackStore): string {
  const data = computeReports(store);
  const now = new Date();

  let csv = "\uFEFF"; // UTF-8 BOM for Microsoft Excel
  csv += "REPORTE OFICIAL DE VOTACIONES Y RETROALIMENTACIÓN TERRITORIAL\n";
  csv += "VENTANA DE CONECTIVIDAD SIGNIFICATIVA (VCS) · IDTF / OIT / UNIÓN EUROPEA\n";
  csv += `Fecha y Hora de Emisión;${now.toLocaleString("es-CO")}\n\n`;

  // 1. Resumen
  csv += "1. CONSOLIDADO GENERAL DE PARTICIPACIÓN\n";
  csv += "Indicador Clave;Valor\n";
  csv += `Votos Totales Acumulados (Likes);${data.summary.totalVotes}\n`;
  csv += `Votos Registrados en Nodo Pacífico;${data.summary.pacificoVotes}\n`;
  csv += `Votos Registrados en Nodo Caribe;${data.summary.caribeVotes}\n`;
  csv += `Total Comentarios y Aportes Cualitativos;${data.summary.totalComments}\n`;
  csv += `Aliados y Votantes Únicos;${data.summary.uniqueVoters}\n`;
  csv += `Organizaciones / Entidades Participantes;${data.summary.uniqueOrganizations}\n\n`;

  // 2. Ranking de propuestas
  csv += "2. RANKING Y RESULTADOS POR PROPUESTA TERRITORIAL\n";
  csv += "Puesto;ID Propuesta;Nodo Territorial;Número;Título de la Propuesta;Votos (Likes);% de Votación;Total Comentarios;Focos Temáticos\n";
  data.metrics.forEach((m) => {
    const escapedTitle = `"${(m.title || "").replace(/"/g, '""')}"`;
    const escapedTags = `"${(m.tags || []).join(", ").replace(/"/g, '""')}"`;
    csv += `${m.rank};${m.solutionId};${m.region.toUpperCase()};${m.number};${escapedTitle};${m.votesCount};${m.votePercentage}%;${m.commentsCount};${escapedTags}\n`;
  });

  // 3. Detalle completo de comentarios
  csv += "\n3. REGISTRO DETALLADO DE COMENTARIOS Y APORTES CUALITATIVOS\n";
  csv += "ID Propuesta;Nodo Territorial;Número;Título de la Propuesta;Autor del Comentario;Organización / Entidad;Fecha y Hora Registro;Comentario o Aporte\n";

  let hasComments = false;
  data.metrics.forEach((m) => {
    (m.comments || []).forEach((c) => {
      hasComments = true;
      const textEscaped = `"${(c.text || "").replace(/"/g, '""')}"`;
      const authorEscaped = `"${(c.authorName || "Anónimo").replace(/"/g, '""')}"`;
      const orgEscaped = `"${(c.authorOrg || "Organización Ficticia").replace(/"/g, '""')}"`;
      const titleEscaped = `"${(m.title || "").replace(/"/g, '""')}"`;
      csv += `${m.solutionId};${m.region.toUpperCase()};${m.number};${titleEscaped};${authorEscaped};${orgEscaped};${c.createdAt || ""};${textEscaped}\n`;
    });
  });

  if (!hasComments) {
    csv += "Sin comentarios registrados aún en la plataforma;;;;;;;\n";
  }

  return csv;
}

// 2. Real-time Aggregated Voting and Feedback Reports (JSON)
app.get("/api/admin/reports", (req, res) => {
  try {
    const store = getStore();
    const reports = computeReports(store);
    res.json(reports);
  } catch (err: any) {
    console.error("Error generating reports:", err);
    res.status(500).json({ error: "Error al generar reportes en tiempo real." });
  }
});

// 2.1 Download CSV of Reports directly from Server
app.get("/api/admin/reports/csv", (req, res) => {
  try {
    const store = getStore();
    const csvContent = generateReportsCSV(store);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Reporte_Votaciones_VCS_${dateStr}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.send(csvContent);
  } catch (err: any) {
    console.error("Error generating CSV report:", err);
    res.status(500).json({ error: "Error al generar el archivo CSV." });
  }
});

// 2.2 Download JSON of Reports directly from Server
app.get("/api/admin/reports/json", (req, res) => {
  try {
    const store = getStore();
    const reports = computeReports(store);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Reporte_VCS_Data_${dateStr}.json`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.send(JSON.stringify(reports, null, 2));
  } catch (err: any) {
    console.error("Error exporting JSON report:", err);
    res.status(500).json({ error: "Error al generar el archivo JSON." });
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

// 6. Reset / Purge Feedback Data to 0 for Production Launch
app.post("/api/admin/reset-data", (req, res) => {
  try {
    const cleanStore: FeedbackStore = {
      likes: {
        "pacifico-terremoto": [],
        "pacifico-1": [],
        "pacifico-2": [],
        "pacifico-3": [],
        "pacifico-4": [],
        "caribe-1": [],
        "caribe-2": [],
        "caribe-3": [],
        "caribe-4": []
      },
      comments: {
        "pacifico-terremoto": [],
        "pacifico-1": [],
        "pacifico-2": [],
        "pacifico-3": [],
        "pacifico-4": [],
        "caribe-1": [],
        "caribe-2": [],
        "caribe-3": [],
        "caribe-4": []
      },
      users: []
    };
    saveStore(cleanStore);
    console.log("Database successfully purged to 0 for production by administrator request.");
    res.json({ success: true, message: "Base de datos de votaciones y comentarios restablecida a 0 exitosamente." });
  } catch (err) {
    console.error("Error resetting data:", err);
    res.status(500).json({ error: "Error al restablecer los datos a cero." });
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
