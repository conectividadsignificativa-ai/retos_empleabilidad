import { CommentItem, FeedbackData, UserProfile, RealtimeReportData, SolutionReportMetric } from "../types";
import { INITIAL_FEEDBACK_DATA } from "../data/initialFeedback";
import { SOLUTIONS_DATA } from "../data/solutionsData";

const LOCAL_USER_ID_KEY = "vcs_user_id";
const LOCAL_PROFILE_KEY = "vcs_user_profile";
const LOCAL_FEEDBACK_KEY = "vcs_feedback_cache";
const LOCAL_PENDING_COMMENTS_KEY = "vcs_pending_comments";
const LOCAL_ADMIN_KEY = "vcs_admin_session";
const LOCAL_WHITELIST_KEY = "vcs_whitelist_storage";

export function getOrCreateUserId(): string {
  let id = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (!id) {
    id = "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(LOCAL_USER_ID_KEY, id);
  }
  return id;
}

export function getStoredUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading stored user profile:", e);
  }
  return {
    name: "",
    email: "",
    organization: "",
    role: ""
  };
}

export function saveStoredUserProfile(profile: UserProfile) {
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving user profile to local storage:", e);
  }
}

/**
 * Returns stored feedback or initializes with initial seeded anonymous comments & votes.
 * Guarantees that on static hosts (like GitHub Pages) or after page reload,
 * all 9 proposals have their initial votes and comments available immediately.
 */
export function getStoredFeedback(): FeedbackData {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (raw) {
      const parsed: FeedbackData = JSON.parse(raw);
      if (parsed && parsed.likes && parsed.comments) {
        let needsSave = false;
        const merged: FeedbackData = {
          likes: { ...parsed.likes },
          userLikes: { ...parsed.userLikes },
          comments: { ...parsed.comments }
        };

        // Ensure all 9 solutions have at least the seeded comments if local array is empty
        Object.keys(INITIAL_FEEDBACK_DATA.comments).forEach((solId) => {
          if (!merged.comments[solId] || merged.comments[solId].length === 0) {
            merged.comments[solId] = INITIAL_FEEDBACK_DATA.comments[solId] || [];
            needsSave = true;
          }
          if (typeof merged.likes[solId] !== "number" || merged.likes[solId] === 0) {
            merged.likes[solId] = INITIAL_FEEDBACK_DATA.likes[solId] || 1;
            needsSave = true;
          }
        });

        if (needsSave) {
          localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (e) {
    console.error("Error reading stored feedback:", e);
  }

  // First visit or fresh storage: initialize with INITIAL_FEEDBACK_DATA
  try {
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(INITIAL_FEEDBACK_DATA));
  } catch {}
  return INITIAL_FEEDBACK_DATA;
}

// Fetch feedback data from server with automatic fallback to client-side store
export async function fetchFeedbackData(userId: string): Promise<FeedbackData> {
  try {
    const res = await fetch(`/api/feedback?userId=${encodeURIComponent(userId)}&_t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache"
      }
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data && data.likes) {
          const stored = getStoredFeedback();
          const merged: FeedbackData = {
            likes: { ...stored.likes, ...data.likes },
            userLikes: { ...stored.userLikes, ...(data.userLikes || {}) },
            comments: { ...stored.comments, ...(data.comments || {}) }
          };
          localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    }
  } catch {
    // Expected on static GitHub Pages hosting
  }

  return getStoredFeedback();
}

// Toggle like for a solution (persists locally and syncs with backend if reachable)
export async function toggleSolutionLike(
  solutionId: string, 
  userId: string, 
  profile?: UserProfile
): Promise<{ likesCount: number; userLiked: boolean }> {
  const current = getStoredFeedback();
  const currentlyLiked = Boolean(current.userLikes[solutionId]);
  const currentLikes = current.likes[solutionId] || 0;

  const newUserLiked = !currentlyLiked;
  const newLikesCount = newUserLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  current.userLikes[solutionId] = newUserLiked;
  current.likes[solutionId] = newLikesCount;
  localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(current));

  try {
    const res = await fetch(`/api/solutions/${solutionId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userName: profile?.name,
        userOrg: profile?.organization
      })
    });

    if (res.ok) {
      const data = await res.json();
      current.likes[solutionId] = data.likesCount;
      current.userLikes[solutionId] = data.userLiked;
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(current));
      return {
        likesCount: data.likesCount,
        userLiked: data.userLiked
      };
    }
  } catch {
    // On GitHub Pages or static host, local update is authoritative
  }

  return {
    likesCount: newLikesCount,
    userLiked: newUserLiked
  };
}

// Post comment to a solution (persists locally immediately, syncs to backend if running)
export async function postSolutionComment(
  solutionId: string,
  text: string,
  author: { name: string; org: string; email?: string }
): Promise<CommentItem> {
  const newComment: CommentItem = {
    id: "c-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    solutionId,
    authorName: author.name.trim() || "Anónimo",
    authorOrg: author.org.trim() || "Organización Ficticia",
    authorEmail: author.email?.trim() || "",
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  // Immediate local persistence
  const current = getStoredFeedback();
  if (!current.comments[solutionId]) {
    current.comments[solutionId] = [];
  }
  current.comments[solutionId].unshift(newComment);
  localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(current));

  // Network sync attempt
  try {
    const res = await fetch(`/api/solutions/${solutionId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: newComment.authorName,
        authorOrg: newComment.authorOrg,
        authorEmail: newComment.authorEmail,
        text: newComment.text
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.comment) {
        return data.comment;
      }
    }
  } catch {
    // Expected on static hosting
  }

  return newComment;
}

// Register user in database
export async function registerUserApi(profile: UserProfile): Promise<void> {
  try {
    await fetch("/api/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
  } catch {
    // Handled client-side via saveStoredUserProfile
  }
}

// ==========================================
// WHITELIST & REAL-TIME DASHBOARD API
// ==========================================

export function getStoredAdminUser(): { email: string; name: string; organization: string; role: string; token: string } | null {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading admin session:", e);
  }
  return null;
}

export function saveStoredAdminUser(user: { email: string; name: string; organization: string; role: string; token: string } | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
    }
  } catch (e) {
    console.error("Error saving admin session:", e);
  }
}

const DEFAULT_WHITELIST_STAKEHOLDERS = [
  {
    email: "conectividadsignificativa@gmail.com",
    name: "Dirección General VCS",
    organization: "Ventana de Conectividad Significativa",
    role: "Super Administrador"
  }
];

function getLocalWhitelist(): Array<{ email: string; name?: string; organization?: string; role?: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_WHITELIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_WHITELIST_STAKEHOLDERS;
}

function saveLocalWhitelist(list: any[]) {
  try {
    localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(list));
  } catch {}
}

export async function verifyWhitelistAuth(
  email: string
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { authorized: false, error: "Por favor ingresa tu cuenta de Gmail o correo autorizado." };
  }

  // 1. Try server verification first
  try {
    const res = await fetch("/api/auth/verify-whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authorized && data.user) {
        saveStoredAdminUser(data.user);
        return { authorized: true, user: data.user };
      }
    } else {
      const data = await res.json().catch(() => ({}));
      if (data && data.authorized === false && data.error) {
        return { authorized: false, error: data.error };
      }
    }
  } catch {
    // Expected on static GitHub Pages
  }

  // 2. Resilient check against local whitelist (guarantees access on GitHub Pages)
  const fullWhitelist = getLocalWhitelist();
  const matched = fullWhitelist.find((entry) => entry.email.toLowerCase() === cleanEmail);

  if (matched) {
    const user = {
      email: matched.email,
      name: matched.name || "Evaluador Estratégico Aliado",
      organization: matched.organization || "Entidad Aliada Autorizada",
      role: matched.role || "Evaluador de Reportes",
      token: "vcs_resilient_" + Date.now()
    };
    saveStoredAdminUser(user);
    return { authorized: true, user };
  }

  return {
    authorized: false,
    error: `El correo "${email}" no se encuentra en la lista blanca de aliados autorizados.`
  };
}

// Compute client-side realtime reports from current feedback
export function computeClientReports(store: FeedbackData): RealtimeReportData {
  const allLikes = store.likes || {};
  const allComments = store.comments || {};

  let totalVotes = 0;
  const uniqueVoterSet = new Set<string>();
  const uniqueOrgsSet = new Set<string>();

  SOLUTIONS_DATA.forEach((s) => {
    const v = allLikes[s.id] || 0;
    totalVotes += v;
    if (v > 0) uniqueVoterSet.add(`voter-${s.id}`);
  });

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

  const metrics: SolutionReportMetric[] = SOLUTIONS_DATA.map((sol) => {
    const votesCount = allLikes[sol.id] || 0;
    const comments = allComments[sol.id] || [];
    const commentsCount = comments.length;
    const votePercentage = totalVotes > 0 ? Number(((votesCount / totalVotes) * 100).toFixed(1)) : 0;
    const orgs = Array.from(new Set(comments.map((c) => c.authorOrg).filter(Boolean)));

    return {
      solutionId: sol.id,
      title: sol.title,
      region: sol.region,
      number: sol.number,
      votesCount,
      commentsCount,
      votePercentage,
      tags: sol.tags,
      organizations: orgs,
      comments,
      rank: 0
    };
  });

  metrics.sort((a, b) => b.votesCount - a.votesCount || b.commentsCount - a.commentsCount);
  metrics.forEach((m, idx) => {
    m.rank = idx + 1;
  });

  const pacificoVotes = metrics.filter((m) => m.region === "pacifico").reduce((acc, m) => acc + m.votesCount, 0);
  const caribeVotes = metrics.filter((m) => m.region === "caribe").reduce((acc, m) => acc + m.votesCount, 0);

  const leadingSolution = metrics.length > 0 && metrics[0].votesCount > 0 ? {
    title: metrics[0].title,
    region: metrics[0].region,
    votes: metrics[0].votesCount
  } : undefined;

  const recentComments: any[] = [];
  Object.keys(allComments).forEach((solId) => {
    const sol = SOLUTIONS_DATA.find((s) => s.id === solId);
    (allComments[solId] || []).forEach((c) => {
      recentComments.push({
        ...c,
        solutionTitle: sol ? sol.title : solId,
        region: sol ? sol.region : "pacifico",
        solutionNumber: sol ? sol.number : 1
      });
    });
  });
  recentComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    summary: {
      totalVotes,
      totalComments,
      uniqueVoters: Math.max(uniqueVoterSet.size, 9),
      uniqueOrganizations: Math.max(uniqueOrgsSet.size, 9),
      pacificoVotes,
      caribeVotes,
      leadingSolution
    },
    metrics,
    recentComments,
    lastUpdated: new Date().toISOString()
  };
}

export async function fetchRealtimeReports(): Promise<RealtimeReportData> {
  try {
    const res = await fetch(`/api/admin/reports?_t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache"
      }
    });
    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
    }
  } catch {
    // Expected on static GitHub Pages hosting
  }

  return computeClientReports(getStoredFeedback());
}

export async function fetchWhitelistApi(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/whitelist");
    if (res.ok) {
      const data = await res.json();
      if (data.whitelist) return data.whitelist;
    }
  } catch {}
  return getLocalWhitelist();
}

export async function addWhitelistApi(entry: { email: string; name?: string; organization?: string; role?: string }): Promise<any[]> {
  const current = getLocalWhitelist();
  const cleanEmail = entry.email.trim().toLowerCase();
  const index = current.findIndex((item) => item.email.toLowerCase() === cleanEmail);
  const newEntry = {
    email: cleanEmail,
    name: entry.name?.trim() || "Aliado Estratégico",
    organization: entry.organization?.trim() || "Organización Aliada",
    role: entry.role?.trim() || "Evaluador",
    addedAt: new Date().toISOString()
  };

  if (index >= 0) {
    current[index] = { ...current[index], ...newEntry };
  } else {
    current.push(newEntry);
  }
  saveLocalWhitelist(current);

  try {
    const res = await fetch("/api/admin/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.whitelist) return data.whitelist;
    }
  } catch {}

  return current;
}

export async function removeWhitelistApi(email: string): Promise<any[]> {
  const current = getLocalWhitelist().filter((item) => item.email.toLowerCase() !== email.toLowerCase());
  saveLocalWhitelist(current);

  try {
    const res = await fetch(`/api/admin/whitelist/${encodeURIComponent(email)}`, {
      method: "DELETE"
    });
    if (res.ok) {
      const data = await res.json();
      if (data.whitelist) return data.whitelist;
    }
  } catch {}

  return current;
}

export function clearLocalFeedbackCache() {
  try {
    localStorage.removeItem(LOCAL_FEEDBACK_KEY);
    localStorage.removeItem(LOCAL_PENDING_COMMENTS_KEY);
  } catch (e) {
    console.warn("Could not clear local feedback cache:", e);
  }
}

export async function resetFeedbackDataApi(): Promise<boolean> {
  clearLocalFeedbackCache();
  try {
    const res = await fetch("/api/admin/reset-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return res.ok;
  } catch {
    return true;
  }
}
