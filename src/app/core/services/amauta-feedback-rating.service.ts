import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CreateAmaautaFeedbackRatingDto {
  rating: number; // 1-5
  feedback?: string;
  userAnswer?: string;
  comment?: string;
  exerciseType?: string;
  exerciseId?: number;
  activityName?: string;
  exerciseQualification?: number;
}

export interface AmaautaFeedbackRatingDto {
  id: number;
  userId: number;
  rating: number;
  feedback?: string;
  userAnswer?: string;
  comment?: string;
  exerciseType?: string;
  exerciseId?: number;
  activityName?: string;
  exerciseQualification?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AmaautaFeedbackRatingStatsDto {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  recentRatings: AmaautaFeedbackRatingDto[];
}

@Injectable({
  providedIn: 'root'
})
export class AmaautaFeedbackRatingService {
  private apiUrl = `${environment.apiUrl}/amauta-feedback-rating`;

  constructor(private http: HttpClient) {}

  /**
   * Crear una nueva calificación de retroalimentación de Amauta
   */
  createRating(createDto: CreateAmaautaFeedbackRatingDto): Observable<AmaautaFeedbackRatingDto> {
    return this.http.post<any>(`${this.apiUrl}`, createDto).pipe(
      map(response => response.data || response)
    );
  }

  /**
   * Obtener todas las calificaciones del usuario autenticado
   */
  getMyRatings(): Observable<AmaautaFeedbackRatingDto[]> {
    return this.http.get<any>(`${this.apiUrl}/my-ratings`).pipe(
      map(response => response.data || response)
    );
  }

  /**
   * Obtener estadísticas de calificaciones del usuario autenticado
   */
  getMyStats(): Observable<AmaautaFeedbackRatingStatsDto> {
    return this.http.get<any>(`${this.apiUrl}/my-stats`).pipe(
      map(response => response.data || response)
    );
  }

  /**
   * Obtener estadísticas globales de calificaciones
   */
  getGlobalStats(): Observable<AmaautaFeedbackRatingStatsDto> {
    return this.http.get<any>(`${this.apiUrl}/global-stats`).pipe(
      map(response => response.data || response)
    );
  }

  /**
   * Obtener calificaciones por tipo de ejercicio
   */
  getRatingsByExerciseType(exerciseType: string): Observable<AmaautaFeedbackRatingStatsDto> {
    return this.http.get<any>(`${this.apiUrl}/by-exercise-type/${exerciseType}`).pipe(
      map(response => response.data || response)
    );
  }
}
