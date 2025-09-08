import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  getAllCursos(): Observable<Curso[]> {
    return this.http.get<any>(`${this.apiUrl}/courses`).pipe(
      map(response => {
        // Procesar la respuesta con formato { statusCode, message, data }
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Si es un objeto con una propiedad que contiene el array
          const possibleArrayProps = Object.values(response).find(val => Array.isArray(val));
          if (possibleArrayProps) {
            return possibleArrayProps as Curso[];
          }
        }
        console.warn('La respuesta de getAllCursos no es un array:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener todos los cursos', error);
        return of([]);
      })
    );
  }

  /**
   * Inscribe al usuario en un curso específico
   */
  inscribirseEnCurso(cursoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/courses/${cursoId}/subscribe`, {}).pipe(
      catchError(error => {
        console.error(`Error al inscribirse en el curso ${cursoId}`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene todos los cursos suscritos por el estudiante con su progreso
   */
  getMisCursos(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/courses/subscriptions`).pipe(
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
        console.warn('La respuesta de getMisCursos no es un array:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener cursos', error);
        return of([]);
      })
    );
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

  /**
   * Obtiene el detalle de un curso con sus capítulos y progreso
   */
  getDetalleCurso(cursoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/courses/${cursoId}/chapters/progress`).pipe(
      map(response => {
        // Procesar la respuesta para agregar información adicional
        const curso = {
          id: cursoId,
          title: response.title || 'Curso sin título',
          description: response.description || 'Sin descripción',
          instructor: response.instructor || 'Instructor no especificado',
          imageUrl: response.imageUrl || '',
          progreso: this.calcularProgresoTotal(response.chapters || []),
          capitulos: response.chapters || [],
          capitulosCompletados: this.contarCapitulosCompletados(response.chapters || []),
          temasCompletados: this.contarTemasCompletados(response.chapters || []),
          totalTemas: this.contarTotalTemas(response.chapters || []),
          actividadesCompletadas: this.contarActividadesCompletadas(response.chapters || []),
          totalActividades: this.contarTotalActividades(response.chapters || []),
          puntuacionPromedio: this.calcularPuntuacionPromedio(response.chapters || []),
          recursos: response.resources || []
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
   * Calcula el progreso total de un curso basado en sus capítulos
   */
  private calcularProgresoTotal(capitulos: any[]): number {
    if (!capitulos || capitulos.length === 0) return 0;
    
    const totalElementos = this.contarTotalTemas(capitulos) + this.contarTotalActividades(capitulos);
    if (totalElementos === 0) return 0;
    
    const elementosCompletados = this.contarTemasCompletados(capitulos) + this.contarActividadesCompletadas(capitulos);
    return Math.round((elementosCompletados / totalElementos) * 100);
  }

  /**
   * Cuenta los capítulos completados
   */
  private contarCapitulosCompletados(capitulos: any[]): number {
    if (!capitulos) return 0;
    return capitulos.filter(cap => cap.completed).length;
  }

  /**
   * Cuenta el total de temas en todos los capítulos
   */
  private contarTotalTemas(capitulos: any[]): number {
    if (!capitulos) return 0;
    return capitulos.reduce((total, cap) => total + (cap.temas?.length || 0), 0);
  }

  /**
   * Cuenta los temas completados en todos los capítulos
   */
  private contarTemasCompletados(capitulos: any[]): number {
    if (!capitulos) return 0;
    return capitulos.reduce((total, cap) => {
      if (!cap.temas) return total;
      return total + cap.temas.filter((tema: any) => tema.completed).length;
    }, 0);
  }

  /**
   * Cuenta el total de actividades en todos los capítulos
   */
  private contarTotalActividades(capitulos: any[]): number {
    if (!capitulos) return 0;
    return capitulos.reduce((total, cap) => {
      if (!cap.temas) return total;
      return total + cap.temas.reduce((subTotal: number, tema: any) => {
        return subTotal + (tema.actividades?.length || 0);
      }, 0);
    }, 0);
  }

  /**
   * Cuenta las actividades completadas en todos los capítulos
   */
  private contarActividadesCompletadas(capitulos: any[]): number {
    if (!capitulos) return 0;
    return capitulos.reduce((total, cap) => {
      if (!cap.temas) return total;
      return total + cap.temas.reduce((subTotal: number, tema: any) => {
        if (!tema.actividades) return subTotal;
        return subTotal + tema.actividades.filter((act: any) => act.completed).length;
      }, 0);
    }, 0);
  }

  /**
   * Calcula la puntuación promedio de todas las actividades completadas
   */
  private calcularPuntuacionPromedio(capitulos: any[]): number {
    if (!capitulos) return 0;
    
    let totalPuntuacion = 0;
    let actividadesConPuntuacion = 0;
    
    capitulos.forEach(cap => {
      if (!cap.temas) return;
      cap.temas.forEach((tema: any) => {
        if (!tema.actividades) return;
        tema.actividades.forEach((act: any) => {
          if (act.completed && act.score !== undefined) {
            totalPuntuacion += act.score;
            actividadesConPuntuacion++;
          }
        });
      });
    });
    
    if (actividadesConPuntuacion === 0) return 0;
    return Math.round(totalPuntuacion / actividadesConPuntuacion);
  }
}
