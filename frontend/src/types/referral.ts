export interface ReferralSummary {
  referralCode: string;
  referralUrl: string;
  referredCount: number;
  pointsEarned: number;
  leaderboardOptIn: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  /** First name + last initial only — never email or full name. */
  displayName: string;
  referredCount: number;
  isMe: boolean;
}
