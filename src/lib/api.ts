import { CommentItem, FeedbackData, UserProfile } from "../types";

const LOCAL_USER_ID_KEY = "vcs_user_id";
const LOCAL_PROFILE_KEY = "vcs_user_profile";
const LOCAL_FEEDBACK_KEY = "vcs_feedback_cache";
const LOCAL_PENDING_COMMENTS_KEY = "vcs_pending_comments";

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

// Pending offline comments queue
function getPendingComments(): CommentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_PENDING_COMMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function savePendingComments(queue: CommentItem[]) {
  try {
    localStorage.setItem(LOCAL_PENDING_COMMENTS_KEY, JSON.stringify(queue));
  } catch {}
}

function updateLocalCacheWithComment(solutionId: string, comment: CommentItem) {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    const data: FeedbackData = raw ? JSON.parse(raw) : { likes: {}, userLikes: {}, comments: {} };
    if (!data.comments) data.comments = {};
    if (!data.comments[solutionId]) data.comments[solutionId] = [];
    
    // Avoid duplicates
    if (!data.comments[solutionId].some((c) => c.id === comment.id)) {
      data.comments[solutionId].unshift(comment);
    }
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not update local feedback cache:", e);
  }
}

export async function syncPendingComments(): Promise<void> {
  const pending = getPendingComments();
  if (pending.length === 0) return;

  const remaining: CommentItem[] = [];
  for (const item of pending) {
    try {
      const res = await fetch(`/api/solutions/${item.solutionId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: item.authorName,
          authorOrg: item.authorOrg,
          authorEmail: item.authorEmail,
          text: item.text
        })
      });
      if (!res.ok) {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  savePendingComments(remaining);
}

// Fetch feedback data from server
export async function fetchFeedbackData(userId: string): Promise<FeedbackData> {
  // Sync pending comments in background
  syncPendingComments().catch(() => {});

  try {
    const res = await fetch(`/api/feedback?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();

      // Merge local pending comments if any exist
      const pending = getPendingComments();
      const mergedComments = { ...(data.comments || {}) };
      pending.forEach((p) => {
        if (!mergedComments[p.solutionId]) mergedComments[p.solutionId] = [];
        if (!mergedComments[p.solutionId].some((c: CommentItem) => c.id === p.id || (c.text === p.text && c.authorName === p.authorName))) {
          mergedComments[p.solutionId].unshift(p);
        }
      });

      const fullData: FeedbackData = {
        likes: data.likes || {},
        userLikes: data.userLikes || {},
        comments: mergedComments
      };

      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(fullData));
      return fullData;
    }
  } catch (err) {
    console.warn("Could not reach backend API, reading from cache:", err);
  }

  // Fallback to cache or empty
  try {
    const cached = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  return {
    likes: {},
    userLikes: {},
    comments: {}
  };
}

// Toggle like for a solution
export async function toggleSolutionLike(
  solutionId: string, 
  userId: string, 
  profile?: UserProfile
): Promise<{ likesCount: number; userLiked: boolean }> {
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
      return {
        likesCount: data.likesCount,
        userLiked: data.userLiked
      };
    }
  } catch (err) {
    console.error("Error sending like to backend:", err);
  }

  // Fallback local toggle
  return {
    likesCount: 1,
    userLiked: true
  };
}

// Post comment to a solution with auto-retry and offline fallback
export async function postSolutionComment(
  solutionId: string,
  text: string,
  author: { name: string; org: string; email?: string }
): Promise<CommentItem> {
  const payload = {
    authorName: author.name.trim() || "Participante",
    authorOrg: author.org.trim() || "Organización Aliada",
    authorEmail: author.email?.trim() || "",
    text: text.trim()
  };

  // Attempt network POST with retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`/api/solutions/${solutionId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          updateLocalCacheWithComment(solutionId, data.comment);
          return data.comment;
        }
      }
    } catch (netErr) {
      console.warn(`Attempt ${attempt + 1} to post comment failed:`, netErr);
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
    }
  }

  // Resilient fallback: Ensure comment is saved and displayed immediately
  console.log("Saving comment to local storage fallback queue");
  const fallbackComment: CommentItem = {
    id: "c-local-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    solutionId,
    authorName: payload.authorName,
    authorOrg: payload.authorOrg,
    authorEmail: payload.authorEmail,
    text: payload.text,
    createdAt: new Date().toISOString()
  };

  updateLocalCacheWithComment(solutionId, fallbackComment);

  const pending = getPendingComments();
  pending.push(fallbackComment);
  savePendingComments(pending);

  return fallbackComment;
}

// Register user in database
export async function registerUserApi(profile: UserProfile): Promise<void> {
  try {
    await fetch("/api/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
  } catch (err) {
    console.warn("Error registering user in API:", err);
  }
}

// ==========================================
// WHITELIST & REAL-TIME DASHBOARD API
// ==========================================

const LOCAL_ADMIN_KEY = "vcs_admin_session";

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

export async function verifyWhitelistAuth(
  email: string, 
  pin?: string
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch("/api/auth/verify-whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), pin: pin?.trim() })
    });

    const data = await res.json();
    if (res.ok && data.authorized) {
      saveStoredAdminUser(data.user);
      return { authorized: true, user: data.user };
    }

    return { 
      authorized: false, 
      error: data.error || "Acceso denegado. Tu correo no está en la lista blanca de aliados autorizados." 
    };
  } catch (err: any) {
    console.error("Error verifying whitelist:", err);
    return { authorized: false, error: "Error de conexión al verificar la lista blanca." };
  }
}

export async function fetchRealtimeReports(): Promise<any> {
  try {
    const res = await fetch("/api/admin/reports");
    if (res.ok) {
      return await res.json();
    }
    throw new Error("No se pudo obtener el reporte del servidor");
  } catch (err) {
    console.error("Error fetching reports:", err);
    throw err;
  }
}

export async function fetchWhitelistApi(): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/whitelist");
    if (res.ok) {
      const data = await res.json();
      return data.whitelist || [];
    }
  } catch (err) {
    console.error("Error fetching whitelist:", err);
  }
  return [];
}

export async function addWhitelistApi(entry: { email: string; name?: string; organization?: string; role?: string }): Promise<any[]> {
  try {
    const res = await fetch("/api/admin/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    if (res.ok) {
      const data = await res.json();
      return data.whitelist || [];
    }
  } catch (err) {
    console.error("Error adding to whitelist:", err);
  }
  return [];
}

export async function removeWhitelistApi(email: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/admin/whitelist/${encodeURIComponent(email)}`, {
      method: "DELETE"
    });
    if (res.ok) {
      const data = await res.json();
      return data.whitelist || [];
    }
  } catch (err) {
    console.error("Error removing from whitelist:", err);
  }
  return [];
}

