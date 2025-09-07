import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Activity, 
  ActivityProgressResponse, 
  ActivityWithExercises, 
  ApiActivityResponse, 
  CreateActivityRequest, 
  UpdateActivityRequest 
} from '../models/activity.interface';
import { FeedbackExerciseResponse } from '../models/exercise.interface';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activity`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las actividades de un tema
   * @param temaId ID del tema
   * @returns Observable con los datos de las actividades
   */
  getActivitiesByTemaId(temaId: number): Observable<Activity[]> {
    return this.http.get<ApiActivityResponse>(`${this.apiUrl}?temaId=${temaId}`)
      .pipe(
        map(response => response.data || [])
      );
  }

  /**
   * Obtiene una actividad por su ID
   * @param id ID de la actividad
   * @returns Observable con los datos de la actividad
   */
  getActivityById(id: number): Observable<Activity> {
    return this.http.get<{data: Activity}>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene una actividad con sus ejercicios para iniciarla
   * @param id ID de la actividad
   * @returns Observable con los datos de la actividad y sus ejercicios
   */
  initActivity(id: number): Observable<ActivityWithExercises> {
    return this.http.get<{data: ActivityWithExercises}>(`${this.apiUrl}/${id}/init`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Finaliza una actividad enviando las respuestas de los ejercicios
   * @param activityId ID de la actividad
   * @param feedback Array con las respuestas y calificaciones de los ejercicios
   * @returns Observable con la respuesta de la API
   */
  finishActivity(activityId: number, feedback: FeedbackExerciseResponse[]): Observable<ActivityProgressResponse> {
    return this.http.post<{data: ActivityProgressResponse}>(`${this.apiUrl}/${activityId}/finish`, feedback)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Crea una nueva actividad
   * @param activity Datos de la actividad a crear
   * @returns Observable con la respuesta de la API
   */
  createActivity(activity: CreateActivityRequest): Observable<Activity> {
    return this.http.post<{data: Activity}>(this.apiUrl, activity)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Actualiza una actividad existente
   * @param id ID de la actividad a actualizar
   * @param activity Datos de la actividad a actualizar
   * @returns Observable con la respuesta de la API
   */
  updateActivity(id: number, activity: UpdateActivityRequest): Observable<Activity> {
    return this.http.put<{data: Activity}>(`${this.apiUrl}/${id}`, activity)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Elimina una actividad
   * @param id ID de la actividad a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteActivity(id: number): Observable<Activity> {
    return this.http.delete<{data: Activity}>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }
}
