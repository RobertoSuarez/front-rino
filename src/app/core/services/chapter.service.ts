import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiChapterResponse, CreateChapterRequest, GetChapterByIdResponse, UpdateChapterRequest } from '../models/chapter.interface';

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private apiUrl = `${environment.apiUrl}/chapters`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los capítulos de un curso
   * @param courseId ID del curso
   * @param difficulty Dificultad del capítulo (opcional)
   * @returns Observable con los datos de los capítulos
   */
  getChaptersByCourseId(courseId: number, difficulty?: string): Observable<ApiChapterResponse> {
    let url = `${this.apiUrl}?courseId=${courseId}`;
    if (difficulty) {
      url += `&difficulty=${difficulty}`;
    }
    return this.http.get<ApiChapterResponse>(url);
  }

  /**
   * Obtiene un capítulo por su ID
   * @param id ID del capítulo
   * @returns Observable con los datos del capítulo
   */
  getChapterById(id: number): Observable<GetChapterByIdResponse> {
    return this.http.get<GetChapterByIdResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo capítulo
   * @param chapter Datos del capítulo a crear
   * @returns Observable con la respuesta de la API
   */
  createChapter(chapter: CreateChapterRequest): Observable<any> {
    return this.http.post(this.apiUrl, chapter);
  }

  /**
   * Crea múltiples capítulos para un curso
   * @param courseId ID del curso
   * @param chapters Lista de capítulos a crear
   * @returns Observable con la respuesta de la API
   */
  createMultipleChapters(courseId: number, chapters: CreateChapterRequest[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/multiples?courseId=${courseId}`, chapters);
  }

  /**
   * Actualiza un capítulo existente
   * @param id ID del capítulo a actualizar
   * @param chapter Datos del capítulo a actualizar
   * @returns Observable con la respuesta de la API
   */
  updateChapter(id: number, chapter: UpdateChapterRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, chapter);
  }

  /**
   * Elimina un capítulo
   * @param id ID del capítulo a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteChapter(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
