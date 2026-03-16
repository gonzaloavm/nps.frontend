import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { NpsStatisticsResponse, VoterDto } from '../models/nps-model';
import { environment } from '../../../environments/environment';
import { ApiErrorItem, ApiResponse } from '../models/api-model';
import { extractProblemErrors } from '../utils/problem-details-utils';
import { handleApiError } from '../utils/api-utils';

@Injectable({ providedIn: 'root' })
export class NpsService {
  private readonly http = inject(HttpClient);

  private get baseUrl() {
    return `${environment.apiUrl}/api/nps`;
  }

  getStatistics(): Observable<ApiResponse<NpsStatisticsResponse>> {
    return this.http.get<ApiResponse<NpsStatisticsResponse>>(
      `${this.baseUrl}/nps-statistics`,
      { withCredentials: true }
    ).pipe(
      map(res => res),
      catchError((err: HttpErrorResponse) => {
        const apiErrors: ApiErrorItem[] = extractProblemErrors(err.error);
        return throwError(() => ({ original: err, apiErrors }));
      })
    );
  }

  getVotersList(): Observable<ApiResponse<VoterDto[]>> {
    return this.http.get<ApiResponse<VoterDto[]>>(
      `${this.baseUrl}/voters-list`,
      { withCredentials: true }
    ).pipe(
      catchError(handleApiError)
    );
  }
}
