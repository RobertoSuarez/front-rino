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
}
