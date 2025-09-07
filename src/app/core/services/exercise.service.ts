import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  CheckExerciseRequest, 
  CreateExerciseRequest, 
  Exercise, 
  ExerciseListItem, 
  FeedbackExerciseResponse, 
  UpdateExerciseRequest 
} from '../models/exercise.interface';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los ejercicios de un tema
   * @param temaId ID del tema
   * @param activity Filtro opcional por actividad
   * @returns Observable con los datos de los ejercicios
   */
  getExercisesByTemaId(temaId: number, activity?: string): Observable<ExerciseListItem[]> {
    let url = `${this.apiUrl}?temaId=${temaId}`;
    if (activity) {
      url += `&activity=${activity}`;
    }
    return this.http.get<{data: ExerciseListItem[]}>(url)
      .pipe(
        map(response => response.data || [])
      );
  }

  /**
   * Obtiene ejercicios de práctica para un capítulo
   * @param chapterId ID del capítulo
   * @returns Observable con los ejercicios de práctica
   */
  getPracticeExercises(chapterId: number): Observable<any[]> {
    return this.http.get<{data: any[]}>(`${this.apiUrl}/practice?chapterId=${chapterId}`)
      .pipe(
        map(response => response.data || [])
      );
  }

  /**
   * Obtiene un ejercicio por su ID
   * @param id ID del ejercicio
   * @returns Observable con los datos del ejercicio
   */
  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<{data: Exercise}>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Crea un nuevo ejercicio
   * @param exercise Datos del ejercicio a crear
   * @returns Observable con la respuesta de la API
   */
  createExercise(exercise: CreateExerciseRequest): Observable<{ id: number }> {
    return this.http.post<{data: { id: number }}>(this.apiUrl, exercise)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Actualiza un ejercicio existente
   * @param id ID del ejercicio a actualizar
   * @param exercise Datos del ejercicio a actualizar
   * @returns Observable con la respuesta de la API
   */
  updateExercise(id: number, exercise: UpdateExerciseRequest): Observable<Exercise> {
    return this.http.put<{data: Exercise}>(`${this.apiUrl}/${id}`, exercise)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Elimina un ejercicio
   * @param id ID del ejercicio a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteExercise(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{data: { ok: boolean }}>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Verifica la respuesta de un ejercicio
   * @param id ID del ejercicio
   * @param answer Respuesta del usuario
   * @returns Observable con el feedback y calificación
   */
  checkAnswer(id: number, answer: CheckExerciseRequest): Observable<FeedbackExerciseResponse> {
    return this.http.post<{data: FeedbackExerciseResponse}>(`${this.apiUrl}/${id}/feedback`, answer)
      .pipe(
        map(response => response.data)
      );
  }
}
