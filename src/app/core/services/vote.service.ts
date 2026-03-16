import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiErrorItem, ApiResponse } from '../models/api-model';
import { extractProblemErrors } from '../utils/problem-details-utils';
import { handleApiError } from '../utils/api-utils';
import { CreateVoteRequest, CreateVoteResponse, HasVotedResponse } from '../models/vote-model';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private readonly http = inject(HttpClient);

  private get baseUrl() {
    return `${environment.apiUrl}/api/vote`;
  }

  public hasVoted = signal<boolean>(false);

  createVote(voteRequest: CreateVoteRequest): Observable<void> {
    return this.http.post<ApiResponse<CreateVoteResponse>>(
      this.baseUrl,
      voteRequest,
      { withCredentials: true }
    ).pipe(
      tap(() => this.hasVoted.set(true)),
      map(() => void 0),
      catchError(handleApiError)
    );
  }

  checkIfVoted(): Observable<void> {
    return this.http.get<ApiResponse<HasVotedResponse>>(
      `${this.baseUrl}/has-voted`,
      { withCredentials: true }
    ).pipe(
      tap(res => this.hasVoted.set(res.data!.hasVoted)),
      map(() => void 0),
      catchError(handleApiError)
    );
  }

}
