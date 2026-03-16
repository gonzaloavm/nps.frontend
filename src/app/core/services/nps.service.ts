import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { NpsStatisticsResponse, VoterDto } from '../models/nps-model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-model';
import { handleApiError } from '../utils/api-utils';

@Injectable({ providedIn: 'root' })
export class NpsService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/api/nps`;

  // ==================================================
  // Consultas de Datos
  // ==================================================

  getStatistics(): Observable<ApiResponse<NpsStatisticsResponse>> {
    return this.http.get<ApiResponse<NpsStatisticsResponse>>(
      `${this.baseUrl}/nps-statistics`,
      { withCredentials: true }
    ).pipe(
      map(res => res),
      catchError(handleApiError)
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
