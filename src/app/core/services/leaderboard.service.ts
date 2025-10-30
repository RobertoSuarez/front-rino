import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

export interface LeaderboardUser {
  id: number;
  firstName: string;
  lastName: string;
  url: string;
  ihi: number;
  yachay: number;
  subscriptionsCount: number;
  rank: number;
}

export interface AdvancedLeaderboardUser {
  id: number;
  firstName: string;
  lastName: string;
  url: string;
  institutionName: string;
  periodScore: number;
  currentYachay: number;
  currentTumis: number;
  currentMullu: number;
  rank: number;
  resourceType: string;
  period: string;
  dateRange: { startDate: Date; endDate: Date };
}

export interface AdvancedLeaderboardMeta {
  period: string;
  resourceType: string;
  institutionId?: number;
  dateRange: { startDate: Date; endDate: Date };
  totalUsers: number;
  generatedAt: Date;
}

export interface AdvancedLeaderboardResponse {
  users: AdvancedLeaderboardUser[];
  meta: AdvancedLeaderboardMeta;
}

export interface LeaderboardOptions {
  period?: string; // all, today, week, month, year
  startDate?: string;
  endDate?: string;
  resourceType?: string; // yachay, tumis, mullu
  institutionId?: number;
  limit?: number;
}

export interface Institution {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el leaderboard de usuarios ordenado por Yachay
   * @param limit Límite de usuarios a mostrar
   * @returns Observable con la lista de usuarios del leaderboard
   */
  getLeaderboard(limit: number = 50): Observable<ApiResponse<LeaderboardUser[]>> {
    return this.http.get<ApiResponse<LeaderboardUser[]>>(`${this.apiUrl}/statistics/leaderboard?limit=${limit}`);
  }

  /**
   * Obtiene el leaderboard avanzado con filtros
   * @param options Opciones de filtrado del leaderboard
   * @returns Observable con el leaderboard avanzado
   */
  getAdvancedLeaderboard(options: LeaderboardOptions = {}): Observable<ApiResponse<AdvancedLeaderboardResponse>> {
    const params = new URLSearchParams();
    
    if (options.period) params.append('period', options.period);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.resourceType) params.append('resourceType', options.resourceType);
    if (options.institutionId) params.append('institutionId', options.institutionId.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    return this.http.get<ApiResponse<AdvancedLeaderboardResponse>>(
      `${this.apiUrl}/statistics/leaderboard-advanced?${params.toString()}`
    );
  }

  /**
   * Obtiene la lista de instituciones disponibles
   * @returns Observable con la lista de instituciones
   */
  getInstitutions(): Observable<ApiResponse<Institution[]>> {
    return this.http.get<ApiResponse<Institution[]>>(`${this.apiUrl}/statistics/institutions`);
  }
}
