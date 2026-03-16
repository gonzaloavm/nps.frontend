export interface NpsStatisticsResponse {
  totalVotes: number;
  promoters: number;
  detractors: number;
  neutrals: number;
  npsScore: number;
  classification: string;
}

export interface VoterDto {
  id: number;
  username: string;
  role: string;
  createdAt: Date;
  hasVoted: boolean;
}
