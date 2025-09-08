import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminStatisticsService {
  private apiUrl = `${environment.apiUrl}/admin/statistics`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene las estadísticas generales para el dashboard
   */
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  /**
   * Obtiene estadísticas detalladas de usuarios
   */
  getUsersStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  /**
   * Obtiene el crecimiento de usuarios en un período específico
   * @param period Período de tiempo (daily, weekly, monthly)
   */
  getUsersGrowth(period: string = 'monthly'): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/growth`, { params: { period } });
  }

  /**
   * Obtiene los usuarios activos en un período específico
   * @param period Período de tiempo (daily, weekly, monthly)
   */
  getActiveUsers(period: string = 'monthly'): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/active`, { params: { period } });
  }

  /**
   * Obtiene datos demográficos de los usuarios
   */
  getUsersDemographics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/demographics`);
  }

  /**
   * Obtiene estadísticas generales de cursos
   */
  getCoursesStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses`);
  }

  /**
   * Obtiene los cursos más populares
   */
  getPopularCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/popular`);
  }

  /**
   * Obtiene estadísticas de finalización de cursos
   */
  getCoursesCompletion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/completion`);
  }

  /**
   * Obtiene las puntuaciones promedio
   */
  getAverageScores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/average-scores`);
  }

  /**
   * Obtiene el progreso de los estudiantes
   */
  getStudentProgress(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/student-progress`);
  }

  /**
   * Obtiene estadísticas de éxito en actividades
   */
  getActivitiesSuccess(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/activities-success`);
  }

  /**
   * Obtiene estadísticas de frecuencia de acceso
   */
  getAccessFrequency(): Observable<any> {
    return this.http.get(`${this.apiUrl}/engagement/access-frequency`);
  }

  /**
   * Obtiene estadísticas de uso de recursos
   */
  getResourceUsage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/engagement/resource-usage`);
  }
}
