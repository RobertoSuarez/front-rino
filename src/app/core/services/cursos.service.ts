import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models';
import { Chapter, ChapterWithProgress } from '../models/chapter.interface';
import { Course, CourseDetail, CourseSubscription } from '../models/course.model';

export interface Curso {
  id: number;
  title: string;
  description?: string;
  instructor?: string;
  imageUrl?: string;
  urlLogo?: string;
  code?: string;
  chapters?: number;
  index?: number;
  progreso?: number;
  progress?: number;
  isPublic?: boolean;
  createdBy?: string;
  createAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los cursos disponibles para inscripción
   */
  getAllCursos(): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.apiUrl}/courses`);
  }

  /**
   * Inscribe al usuario en un curso específico
   */
  inscribirseEnCurso(cursoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/subscriptions`, {}, {
      params: { courseId: cursoId.toString() }
    }).pipe(
      map(response => {
        if (response && response.data) {
          return { success: true, message: response.data };
        }
        return { success: true, message: 'Suscripción exitosa' };
      }),
      catchError(error => {
        console.error(`Error al inscribirse en el curso ${cursoId}`, error);
        
        // Verificar si el error es porque ya está suscrito
        if (error.error && error.error.message === 'Ya estás suscrito a este curso.') {
          return of({ success: false, message: 'Ya estás suscrito a este curso.', alreadySubscribed: true });
        }
        
        return of({ success: false, message: 'Error al inscribirse en el curso' });
      })
    );
  }

  /**
   * Obtiene todos los cursos suscritos por el estudiante con su progreso
   */
  getCourseSubscription(): Observable<ApiResponse<CourseSubscription[]>> {
    return this.http.get<ApiResponse<CourseSubscription[]>>(`${this.apiUrl}/courses/subscriptions`);
  }

  /**
   * Obtiene los cursos completados por el estudiante
   */
  getMisCursosCompletados(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/courses/progress?completed=true`).pipe(
      map(response => {
        // Asegurar que la respuesta sea un array
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Si es un objeto con una propiedad que contiene el array
          const possibleArrayProps = Object.values(response).find(val => Array.isArray(val));
          if (possibleArrayProps) {
            return possibleArrayProps as any[];
          }
        }
        console.warn('La respuesta de getMisCursosCompletados no es un array:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener cursos completados', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene los cursos en progreso del estudiante
   */
  getMisCursosEnProgreso(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/courses/progress?completed=false`).pipe(
      map(response => {
        // Asegurar que la respuesta sea un array
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Si es un objeto con una propiedad que contiene el array
          const possibleArrayProps = Object.values(response).find(val => Array.isArray(val));
          if (possibleArrayProps) {
            return possibleArrayProps as any[];
          }
        }
        console.warn('La respuesta de getMisCursosEnProgreso no es un array:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener cursos en progreso', error);
        return of([]);
      })
    );
  }

  getCourseById(cursoId: number): Observable<ApiResponse<CourseDetail>> {
    return this.http.get<ApiResponse<CourseDetail>>(`${this.apiUrl}/courses/${cursoId}`)
  }

  getChapters(cursoId: number): Observable<Chapter[]> {
    return this.http.get<ApiResponse<Chapter[]>>(`${this.apiUrl}/chapters?courseId=${cursoId}`).pipe(
      map(response => {
        const chapters = response.data || [];
        return chapters;
      }),
      catchError(error => {
        console.error(`Error al obtener capítulos del curso ${cursoId}`, error);
        return of([]);
      })
    );
  }

  getChaptersWithProgress(cursoId: number): Observable<ChapterWithProgress[]> {
    return this.http.get<ApiResponse<ChapterWithProgress[]>>(`${this.apiUrl}/courses/${cursoId}/chapters/progress`).pipe(
      map(response => {
        const chapters = response.data || [];
        return chapters;
      }),
      catchError(error => {
        console.error(`Error al obtener capítulos del curso ${cursoId}`, error);
        return of([]);
      })
    );
  }

  inicializarCapitulo(chapterId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/chapters/${chapterId}/init`, {}).pipe(
      catchError(error => {
        console.error(`Error al inicializar capítulo ${chapterId}`, error);
        throw error;
      })
    );
  }

  /**
   * Obtiene el detalle de un curso con sus capítulos y progreso
   */
  getDetalleCurso(cursoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/courses/${cursoId}/chapters/progress`).pipe(
      map(response => {
        // Extraer los capítulos de la respuesta
        const capitulos = response.data || [];
        
        // Procesar la respuesta para agregar información adicional
        const curso = {
          id: cursoId,
          title: response.title || 'Curso sin título',
          description: response.description || 'Sin descripción',
          instructor: response.instructor || 'Instructor no especificado',
          imageUrl: response.imageUrl || '',
          progreso: this.calcularProgresoTotal(capitulos),
          capitulos: capitulos,
          capitulosCompletados: this.contarCapitulosCompletados(capitulos),
          temasCompletados: this.contarTemasCompletados(capitulos),
          totalTemas: this.contarTotalTemas(capitulos),
          actividadesCompletadas: this.contarActividadesCompletadas(capitulos),
          totalActividades: this.contarTotalActividades(capitulos),
          puntuacionPromedio: this.calcularPuntuacionPromedio(capitulos),
          recursos: response.resources || [],
          // Añadir información sobre el siguiente capítulo a iniciar
          siguienteCapitulo: capitulos.find((cap: any) => cap.nextToStart === true) || null
        };
        return curso;
      }),
      catchError(error => {
        console.error(`Error al obtener detalle del curso ${cursoId}`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene el contenido de un tema específico
   */
  getContenidoTema(temaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tema/${temaId}/theory`).pipe(
      map(response => {
        return {
          id: temaId,
          title: response.title || 'Tema sin título',
          theory: response.theory || 'Sin contenido',
          completado: response.completed || false
        };
      }),
      catchError(error => {
        console.error(`Error al obtener contenido del tema ${temaId}`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene el contenido de una actividad específica
   */
  getContenidoActividad(actividadId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activity/${actividadId}/init`).pipe(
      map(response => {
        return {
          id: actividadId,
          title: response.title || 'Actividad sin título',
          instructions: response.instructions || 'Sin instrucciones',
          exercises: response.exercises || [],
          completado: response.completed || false,
          score: response.score || 0
        };
      }),
      catchError(error => {
        console.error(`Error al obtener contenido de la actividad ${actividadId}`, error);
        return of(null);
      })
    );
  }

  /**
   * Marca un tema como completado
   */
  marcarTemaCompletado(temaId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tema/${temaId}/complete`, {}).pipe(
      catchError(error => {
        console.error(`Error al marcar tema ${temaId} como completado`, error);
        return of(null);
      })
    );
  }

  /**
   * Envía las respuestas de una actividad
   */
  enviarRespuestasActividad(actividadId: number, respuestas: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/activity/${actividadId}/finish`, respuestas).pipe(
      catchError(error => {
        console.error(`Error al enviar respuestas de actividad ${actividadId}`, error);
        return of(null);
      })
    );
  }

  /**
   * Inicia un capítulo para el usuario actual
   * @param chapterId ID del capítulo a iniciar
   * @returns Observable con la respuesta del servidor
   */
  iniciarCapitulo(chapterId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chapters/${chapterId}/init`, {}).pipe(
      map(response => {
        return { success: true };
      }),
      catchError(error => {
        console.error(`Error al iniciar el capítulo ${chapterId}`, error);
        return of({ success: false, error });
      })
    );
  }

  /**
   * Calcula el progreso total de un curso basado en sus capítulos
   */
  private calcularProgresoTotal(capitulos: any[]): number {
    if (!capitulos || capitulos.length === 0) return 0;
    
    // Si los capítulos ya tienen un valor de progreso, calculamos el promedio
    const totalProgreso = capitulos.reduce((sum, cap) => sum + (cap.progress || 0), 0);
    return Math.round(totalProgreso / capitulos.length);
  }

  /**
   * Cuenta los capítulos completados
   */
  private contarCapitulosCompletados(capitulos: any[]): number {
    if (!capitulos) return 0;
    return capitulos.filter(cap => cap.progress === 100).length;
  }

  /**
   * Cuenta el total de temas en todos los capítulos
   * Nota: Con la nueva estructura de datos, este método podría necesitar ajustes
   * cuando tengamos acceso a los temas dentro de los capítulos
   */
  private contarTotalTemas(capitulos: any[]): number {
    // Con la nueva estructura, podríamos no tener acceso directo a los temas
    // Por ahora, estimamos 3 temas por capítulo como valor predeterminado
    if (!capitulos) return 0;
    return capitulos.length * 3; // Estimación temporal
  }

  /**
   * Cuenta los temas completados
   * Nota: Con la nueva estructura de datos, este método podría necesitar ajustes
   */
  private contarTemasCompletados(capitulos: any[]): number {
    // Estimamos basado en el progreso de los capítulos
    if (!capitulos) return 0;
    let temasCompletados = 0;
    capitulos.forEach(cap => {
      // Si el capítulo tiene progreso, estimamos temas completados proporcionalmente
      if (cap.progress) {
        temasCompletados += Math.round((cap.progress / 100) * 3); // Asumiendo 3 temas por capítulo
      }
    });
    return temasCompletados;
  }

  /**
   * Cuenta el total de actividades en todos los capítulos
   * Nota: Con la nueva estructura de datos, este método podría necesitar ajustes
   */
  private contarTotalActividades(capitulos: any[]): number {
    // Estimamos 2 actividades por capítulo como valor predeterminado
    if (!capitulos) return 0;
    return capitulos.length * 2; // Estimación temporal
  }

  /**
   * Cuenta las actividades completadas
   * Nota: Con la nueva estructura de datos, este método podría necesitar ajustes
   */
  private contarActividadesCompletadas(capitulos: any[]): number {
    // Estimamos basado en el progreso de los capítulos
    if (!capitulos) return 0;
    let actividadesCompletadas = 0;
    capitulos.forEach(cap => {
      // Si el capítulo tiene progreso, estimamos actividades completadas proporcionalmente
      if (cap.progress) {
        actividadesCompletadas += Math.round((cap.progress / 100) * 2); // Asumiendo 2 actividades por capítulo
      }
    });
    return actividadesCompletadas;
  }

  /**
   * Calcula la puntuación promedio de todas las actividades completadas
   * Nota: Con la nueva estructura de datos, este método podría necesitar ajustes
   */
  private calcularPuntuacionPromedio(capitulos: any[]): number {
    // Con la nueva estructura, estimamos una puntuación basada en el progreso
    if (!capitulos || capitulos.length === 0) return 0;
    
    // Calculamos un promedio basado en el progreso de los capítulos
    // Asumimos que un capítulo con 100% de progreso tiene una puntuación de 100
    const capitulosConProgreso = capitulos.filter(cap => cap.progress > 0);
    if (capitulosConProgreso.length === 0) return 0;
    
    const totalPuntuacion = capitulosConProgreso.reduce((sum, cap) => sum + cap.progress, 0);
    return Math.round(totalPuntuacion / capitulosConProgreso.length);
  }
}
