export interface CreateVoteRequest {
  score: number;
}

export interface CreateVoteResponse {
  voteId: number;
}

export interface HasVotedResponse{
  hasVoted: boolean;
}
