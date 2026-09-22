import { CommentItem, FeedbackData, UserProfile } from "../types";

const LOCAL_USER_ID_KEY = "vcs_user_id";
const LOCAL_PROFILE_KEY = "vcs_user_profile";
const LOCAL_FEEDBACK_KEY = "vcs_feedback_cache";

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

// Fetch feedback data from server
export async function fetchFeedbackData(userId: string): Promise<FeedbackData> {
  try {
    const res = await fetch(`/api/feedback?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(data));
      return data;
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

// Post comment to a solution
export async function postSolutionComment(
  solutionId: string,
  text: string,
  author: { name: string; org: string; email?: string }
): Promise<CommentItem> {
  const res = await fetch(`/api/solutions/${solutionId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorName: author.name,
      authorOrg: author.org,
      authorEmail: author.email,
      text
    })
  });

  if (!res.ok) {
    throw new Error("Error en servidor al guardar comentario");
  }

  const data = await res.json();
  return data.comment;
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
