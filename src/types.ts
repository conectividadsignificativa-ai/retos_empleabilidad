export interface UserProfile {
  name: string;
  email: string;
  organization: string;
  role?: string;
}

export interface CommentItem {
  id: string;
  solutionId: string;
  authorName: string;
  authorEmail?: string;
  authorOrg: string;
  text: string;
  createdAt: string;
}

export interface FeedbackData {
  likes: Record<string, number>;
  userLikes: Record<string, boolean>; // current user's liked status
  comments: Record<string, CommentItem[]>;
}
