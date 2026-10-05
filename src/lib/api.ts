import { CommentItem, FeedbackData, UserProfile, RealtimeReportData, SolutionReportMetric } from "../types";
import { INITIAL_FEEDBACK_DATA } from "../data/initialFeedback";
import { SOLUTIONS_DATA } from "../data/solutionsData";
import { db, ensureAuth } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";

const LOCAL_USER_ID_KEY = "vcs_user_id";
const LOCAL_PROFILE_KEY = "vcs_user_profile";
const LOCAL_FEEDBACK_KEY = "vcs_feedback_cache";
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

export function getStoredFeedback(): FeedbackData {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (raw) {
      const parsed: FeedbackData = JSON.parse(raw);
      if (parsed && parsed.likes && parsed.comments) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_FEEDBACK_DATA;
}

// Track if initial cloud seeding has run during this session
let isSeededInFirestore = false;

async function ensureCloudSeeded() {
  if (isSeededInFirestore) return;
  try {
    await ensureAuth();
    // Check if at least one solution doc exists in Firestore
    const testRef = doc(db, "solutions_feedback", "pacifico-terremoto");
    const snap = await getDoc(testRef);

    if (!snap.exists()) {
      // Seed all 9 solutions into Firestore
      for (const sol of SOLUTIONS_DATA) {
        const solId = sol.id;
        const initialLikes = INITIAL_FEEDBACK_DATA.likes[solId] || 1;
        const initialVoters = [`seed-${solId}`];
        const initialComments = INITIAL_FEEDBACK_DATA.comments[solId] || [];

        // Save solution feedback doc
        await setDoc(doc(db, "solutions_feedback", solId), {
          solutionId: solId,
          likesCount: initialLikes,
          voterIds: initialVoters,
          updatedAt: new Date().toISOString()
        });

        // Save initial comments in both all_comments and subcollection
        for (const comment of initialComments) {
          const commentPayload = {
            id: comment.id,
            solutionId: solId,
            authorName: comment.authorName,
            authorOrg: comment.authorOrg,
            authorEmail: comment.authorEmail || "",
            text: comment.text,
            createdAt: comment.createdAt
          };
          await setDoc(doc(db, "all_comments", comment.id), commentPayload);
          await setDoc(doc(db, "solutions_feedback", solId, "comments", comment.id), commentPayload);
        }
      }
    }
    isSeededInFirestore = true;
  } catch (err) {
    console.warn("Notice checking Firestore seed:", err);
  }
}

// Fetch feedback data directly from Cloud Firestore (single fast queries)
export async function fetchFeedbackData(userId: string): Promise<FeedbackData> {
  await ensureCloudSeeded();

  try {
    const likesCount: Record<string, number> = {};
    const userLikes: Record<string, boolean> = {};
    const comments: Record<string, CommentItem[]> = {};

    // Initialize all 9 solutions with defaults
    SOLUTIONS_DATA.forEach((s) => {
      likesCount[s.id] = 0;
      userLikes[s.id] = false;
      comments[s.id] = [];
    });

    // 1. Fetch solution feedback documents
    const feedbackCol = collection(db, "solutions_feedback");
    const feedbackSnap = await getDocs(feedbackCol);

    if (!feedbackSnap.empty) {
      feedbackSnap.forEach((docSnap) => {
        const solId = docSnap.id;
        const data = docSnap.data();
        const voterIds = Array.isArray(data.voterIds) ? data.voterIds : [];
        likesCount[solId] = typeof data.likesCount === "number" ? data.likesCount : voterIds.length;
        userLikes[solId] = voterIds.includes(userId);
      });
    }

    // 2. Fetch all comments from unified all_comments collection in 1 single fast query
    const allCommentsCol = collection(db, "all_comments");
    const commentsSnap = await getDocs(allCommentsCol);

    if (!commentsSnap.empty) {
      commentsSnap.forEach((cDoc) => {
        const cData = cDoc.data();
        const solId = cData.solutionId;
        if (solId) {
          if (!comments[solId]) comments[solId] = [];
          comments[solId].push({
            id: cData.id || cDoc.id,
            solutionId: solId,
            authorName: cData.authorName || "Anónimo",
            authorOrg: cData.authorOrg || "Organización Ficticia",
            authorEmail: cData.authorEmail || "",
            text: cData.text || "",
            createdAt: cData.createdAt || new Date().toISOString()
          });
        }
      });
    } else {
      // Fallback: check subcollections if all_comments was empty
      for (const sol of SOLUTIONS_DATA) {
        const subSnap = await getDocs(collection(db, "solutions_feedback", sol.id, "comments"));
        subSnap.forEach((cDoc) => {
          const cData = cDoc.data();
          comments[sol.id].push({
            id: cData.id || cDoc.id,
            solutionId: sol.id,
            authorName: cData.authorName || "Anónimo",
            authorOrg: cData.authorOrg || "Organización Ficticia",
            authorEmail: cData.authorEmail || "",
            text: cData.text || "",
            createdAt: cData.createdAt || new Date().toISOString()
          });
        });
      }
    }

    // Sort comments descending by date
    Object.keys(comments).forEach((solId) => {
      comments[solId].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    const result: FeedbackData = {
      likes: likesCount,
      userLikes,
      comments
    };

    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(result));
    return result;
  } catch (err) {
    console.warn("Cloud Firestore read error, using local cache:", err);
  }

  return getStoredFeedback();
}

// Real-time live listener for multi-user shared interactions across all browsers
export function subscribeToFeedback(
  userId: string,
  onUpdate: (data: FeedbackData) => void
): () => void {
  ensureCloudSeeded().catch(() => {});

  let isUnsubscribed = false;

  const triggerUpdate = async () => {
    if (isUnsubscribed) return;
    try {
      const updated = await fetchFeedbackData(userId);
      if (!isUnsubscribed) onUpdate(updated);
    } catch (e) {
      console.warn("Error updating from snapshot:", e);
    }
  };

  try {
    // 1. Listen to likes and solution stats changes
    const unsubFeedback = onSnapshot(collection(db, "solutions_feedback"), () => {
      triggerUpdate();
    }, (err) => console.warn("Feedback snapshot error:", err));

    // 2. Listen to all new comments in real time
    const unsubComments = onSnapshot(collection(db, "all_comments"), () => {
      triggerUpdate();
    }, (err) => console.warn("Comments snapshot error:", err));

    return () => {
      isUnsubscribed = true;
      unsubFeedback();
      unsubComments();
    };
  } catch {
    return () => { isUnsubscribed = true; };
  }
}

// Toggle like for a solution directly in Firestore
export async function toggleSolutionLike(
  solutionId: string, 
  userId: string, 
  profile?: UserProfile
): Promise<{ likesCount: number; userLiked: boolean }> {
  // 1. Optimistic local update
  const current = getStoredFeedback();
  const currentlyLiked = Boolean(current.userLikes[solutionId]);
  const currentLikes = current.likes[solutionId] || 0;

  const newUserLiked = !currentlyLiked;
  const newLikesCount = newUserLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  current.userLikes[solutionId] = newUserLiked;
  current.likes[solutionId] = newLikesCount;
  localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(current));

  // 2. Cloud Firestore persistence
  try {
    await ensureAuth();
    const solRef = doc(db, "solutions_feedback", solutionId);
    const snap = await getDoc(solRef);

    let voterIds: string[] = [];
    if (snap.exists()) {
      voterIds = Array.isArray(snap.data().voterIds) ? [...snap.data().voterIds] : [];
    }

    const index = voterIds.indexOf(userId);
    let finalLiked = false;

    if (index >= 0) {
      // Remove like
      voterIds.splice(index, 1);
      finalLiked = false;
    } else {
      // Add like
      voterIds.push(userId);
      finalLiked = true;
    }

    const finalCount = voterIds.length;
    await setDoc(solRef, {
      solutionId,
      likesCount: finalCount,
      voterIds,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    current.likes[solutionId] = finalCount;
    current.userLikes[solutionId] = finalLiked;
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(current));

    return {
      likesCount: finalCount,
      userLiked: finalLiked
    };
  } catch (err) {
    console.error("Firestore toggle like error:", err);
  }

  return {
    likesCount: newLikesCount,
    userLiked: newUserLiked
  };
}

// Post comment to a solution directly into Cloud Firestore
export async function postSolutionComment(
  solutionId: string,
  text: string,
  author: { name: string; org: string; email?: string }
): Promise<CommentItem> {
  const commentId = "c-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const newComment: CommentItem = {
    id: commentId,
    solutionId,
    authorName: author.name.trim() || "Anónimo",
    authorOrg: author.org.trim() || "Organización Ficticia",
    authorEmail: author.email?.trim() || "",
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  // 1. Immediate local persistence
  const current = getStoredFeedback();
  if (!current.comments[solutionId]) {
    current.comments[solutionId] = [];
  }
  current.comments[solutionId].unshift(newComment);
  localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(current));

  // 2. Cloud Firestore persistence (both in all_comments and in subcollection)
  try {
    await ensureAuth();

    // Write to unified all_comments collection (triggers global snapshot listener instantly)
    await setDoc(doc(db, "all_comments", commentId), newComment);

    // Also write to solution subcollection for hierarchical storage
    await setDoc(doc(db, "solutions_feedback", solutionId, "comments", commentId), newComment);

    // Update parent doc
    const solRef = doc(db, "solutions_feedback", solutionId);
    await setDoc(solRef, {
      solutionId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore post comment error:", err);
  }

  return newComment;
}

export async function registerUserApi(profile: UserProfile): Promise<void> {
  saveStoredUserProfile(profile);
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

  // Check super admin directly
  if (cleanEmail === "conectividadsignificativa@gmail.com") {
    const user = {
      email: cleanEmail,
      name: "Dirección General VCS",
      organization: "Ventana de Conectividad Significativa",
      role: "Super Administrador",
      token: "vcs_auth_" + Date.now()
    };
    saveStoredAdminUser(user);
    return { authorized: true, user };
  }

  // Check Firestore whitelist
  try {
    await ensureAuth();
    const whitelistCol = collection(db, "whitelist");
    const snap = await getDocs(whitelistCol);
    let matchedDoc: any = null;

    snap.forEach((d) => {
      const data = d.data();
      if (data.email && data.email.toLowerCase() === cleanEmail) {
        matchedDoc = data;
      }
    });

    if (matchedDoc) {
      const user = {
        email: matchedDoc.email,
        name: matchedDoc.name || "Evaluador Estratégico Aliado",
        organization: matchedDoc.organization || "Entidad Aliada Autorizada",
        role: matchedDoc.role || "Evaluador de Reportes",
        token: "vcs_auth_" + Date.now()
      };
      saveStoredAdminUser(user);
      return { authorized: true, user };
    }
  } catch (err) {
    console.warn("Firestore whitelist check notice:", err);
  }

  // Check local whitelist
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
  const allCommentsFlatList: CommentItem[] = [];

  Object.keys(allComments).forEach((solId) => {
    const commentsList = allComments[solId] || [];
    totalComments += commentsList.length;
    commentsList.forEach((c) => {
      allCommentsFlatList.push(c);
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
  const currentFeedback = await fetchFeedbackData(getOrCreateUserId());
  return computeClientReports(currentFeedback);
}

export async function fetchWhitelistApi(): Promise<any[]> {
  try {
    await ensureAuth();
    const whitelistCol = collection(db, "whitelist");
    const snap = await getDocs(whitelistCol);
    if (!snap.empty) {
      const list: any[] = [];
      snap.forEach((d) => list.push(d.data()));
      return list;
    }
  } catch {}
  return getLocalWhitelist();
}

export async function addWhitelistApi(entry: { email: string; name?: string; organization?: string; role?: string }): Promise<any[]> {
  const cleanEmail = entry.email.trim().toLowerCase();
  const newEntry = {
    email: cleanEmail,
    name: entry.name?.trim() || "Aliado Estratégico",
    organization: entry.organization?.trim() || "Organización Aliada",
    role: entry.role?.trim() || "Evaluador",
    addedAt: new Date().toISOString()
  };

  try {
    await ensureAuth();
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
    await setDoc(doc(db, "whitelist", docId), newEntry);
  } catch {}

  const current = getLocalWhitelist();
  const index = current.findIndex((item) => item.email.toLowerCase() === cleanEmail);
  if (index >= 0) {
    current[index] = { ...current[index], ...newEntry };
  } else {
    current.push(newEntry);
  }
  saveLocalWhitelist(current);

  return fetchWhitelistApi();
}

export async function removeWhitelistApi(email: string): Promise<any[]> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    await ensureAuth();
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
    await deleteDoc(doc(db, "whitelist", docId));
  } catch {}

  const current = getLocalWhitelist().filter((item) => item.email.toLowerCase() !== cleanEmail);
  saveLocalWhitelist(current);

  return fetchWhitelistApi();
}

export function clearLocalFeedbackCache() {
  try {
    localStorage.removeItem(LOCAL_FEEDBACK_KEY);
  } catch (e) {
    console.warn("Could not clear local feedback cache:", e);
  }
}

export async function resetFeedbackDataApi(): Promise<boolean> {
  clearLocalFeedbackCache();
  try {
    await ensureAuth();
    // 1. Reset all 9 solutions in Firestore
    for (const sol of SOLUTIONS_DATA) {
      const solRef = doc(db, "solutions_feedback", sol.id);
      await setDoc(solRef, {
        solutionId: sol.id,
        likesCount: 0,
        voterIds: [],
        updatedAt: new Date().toISOString()
      });

      // Clear comments in subcollection
      const commentsCol = collection(db, "solutions_feedback", sol.id, "comments");
      const cSnap = await getDocs(commentsCol);
      for (const cDoc of cSnap.docs) {
        await deleteDoc(cDoc.ref);
      }
    }

    // 2. Clear all_comments collection
    const allC = await getDocs(collection(db, "all_comments"));
    for (const cDoc of allC.docs) {
      await deleteDoc(cDoc.ref);
    }
  } catch (err) {
    console.error("Error resetting Firestore data:", err);
  }
  return true;
}
