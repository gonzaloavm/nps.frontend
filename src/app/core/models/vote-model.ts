export interface CreateVoteRequest {
  userId: number;
  score: number;
}

export interface CreateVoteResponse {
  voteId: number;
}
