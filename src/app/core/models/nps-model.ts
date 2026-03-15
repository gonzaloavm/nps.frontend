export interface NpsStatisticsResponse {
  totalVotes: number;
  promoters: number;
  detractors: number;
  neutrals: number;
  npsScore: number;
  classification: string;
}
