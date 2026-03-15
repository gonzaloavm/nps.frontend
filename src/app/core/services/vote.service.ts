import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiErrorItem, ApiResponse } from '../models/api-model';
import { extractProblemErrors } from '../utils/problem-details-utils';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/vote`;

  public hasVoted = signal<boolean>(false);

  createVote(score: number): Observable<void> {
    return this.http.post<ApiResponse<number>>(
      this.baseUrl,
      { score },
      { withCredentials: true }
    ).pipe(
      tap(() => this.hasVoted.set(true)),
      map(() => void 0),
      catchError((err: HttpErrorResponse) => {
        const apiErrors: ApiErrorItem[] = extractProblemErrors(err.error);
        return throwError(() => ({ original: err, apiErrors }));
      })
    );
  }

  checkIfVoted(): Observable<void> {
    return this.http.get<{ hasVoted: boolean }>(
      `${this.baseUrl}/has-voted`,
      { withCredentials: true }
    ).pipe(
      tap(res => this.hasVoted.set(res.hasVoted)),
      map(() => void 0),
      catchError((err: HttpErrorResponse) => {
        const apiErrors: ApiErrorItem[] = extractProblemErrors(err.error);
        return throwError(() => ({ original: err, apiErrors }));
      })
    );
  }

}
