import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LearningPath {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  coursesCount: number;
  courses: {
    id: number;
    title: string;
    code: string;
    urlLogo: string;
  }[];
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningPathDto {
  name: string;
  description: string;
  courseIds: number[];
  isActive?: boolean;
}

export interface UpdateLearningPathDto {
  name?: string;
  description?: string;
  courseIds?: number[];
  isActive?: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {
  private apiUrl = `${environment.apiUrl}/learning-paths`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las rutas de aprendizaje
   */
  getAll(): Observable<ApiResponse<LearningPath[]>> {
    return this.http.get<ApiResponse<LearningPath[]>>(this.apiUrl);
  }

  /**
   * Obtiene una ruta de aprendizaje por ID
   */
  getById(id: number): Observable<ApiResponse<LearningPath>> {
    return this.http.get<ApiResponse<LearningPath>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva ruta de aprendizaje
   */
  create(payload: CreateLearningPathDto): Observable<ApiResponse<LearningPath>> {
    return this.http.post<ApiResponse<LearningPath>>(this.apiUrl, payload);
  }

  /**
   * Actualiza una ruta de aprendizaje
   */
  update(id: number, payload: UpdateLearningPathDto): Observable<ApiResponse<LearningPath>> {
    return this.http.patch<ApiResponse<LearningPath>>(`${this.apiUrl}/${id}`, payload);
  }

  /**
   * Elimina una ruta de aprendizaje
   */
  delete(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }

  // ==================== MÉTODOS PARA ESTUDIANTES ====================

  /**
   * Suscribe al estudiante a una ruta usando el código
   */
  subscribeToPath(code: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/subscribe`, { code });
  }

  /**
   * Obtiene las rutas suscritas del estudiante
   */
  getMySubscriptions(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/subscriptions`);
  }

  /**
   * Obtiene el detalle completo de una ruta suscrita
   */
  getPathDetail(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/subscriptions/${id}/detail`);
  }

  /**
   * Cancela la suscripción a una ruta
   */
  unsubscribeFromPath(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/subscriptions/${id}`);
  }
}
