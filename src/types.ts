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

export interface WhitelistEntry {
  email: string;
  name?: string;
  organization?: string;
  role?: string;
  addedAt: string;
}

export interface AdminAuthUser {
  email: string;
  name: string;
  organization: string;
  role: string;
  token?: string;
}

export interface SolutionReportMetric {
  solutionId: string;
  title: string;
  region: "pacifico" | "caribe";
  number: number;
  votesCount: number;
  commentsCount: number;
  votePercentage: number;
  tags: string[];
  organizations: string[];
  comments: CommentItem[];
  rank: number;
}

export interface RealtimeReportData {
  summary: {
    totalVotes: number;
    totalComments: number;
    uniqueVoters: number;
    uniqueOrganizations: number;
    pacificoVotes: number;
    caribeVotes: number;
    leadingSolution?: {
      title: string;
      region: string;
      votes: number;
    };
  };
  metrics: SolutionReportMetric[];
  recentComments?: Array<CommentItem & { solutionTitle: string; region: string; solutionNumber: number }>;
  lastUpdated: string;
}

