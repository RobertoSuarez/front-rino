import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiTemaResponse, CreateTemaRequest, GetTemaByIdResponse, TemaConProgreso, UpdateTemaRequest } from '../models/tema.interface';
import { ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private apiUrl = `${environment.apiUrl}/tema`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los temas de un capítulo
   * @param chapterId ID del capítulo
   * @returns Observable con los datos de los temas
   */
  getTemasByChapterId(chapterId: number): Observable<ApiTemaResponse> {
    return this.http.get<ApiTemaResponse>(`${this.apiUrl}?chapterId=${chapterId}`);
  }

  /**
   * Obtiene un tema por su ID
   * @param id ID del tema
   * @returns Observable con los datos del tema
   */
  getTemaById(id: number): Observable<GetTemaByIdResponse> {
    return this.http.get<GetTemaByIdResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene la teoría de un tema
   * @param id ID del tema
   * @returns Observable con la teoría del tema
   */
  getTheoryByTemaId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/theory`);
  }

  /**
   * Crea un nuevo tema
   * @param tema Datos del tema a crear
   * @returns Observable con la respuesta de la API
   */
  createTema(tema: CreateTemaRequest): Observable<any> {
    return this.http.post(this.apiUrl, tema);
  }

  /**
   * Crea múltiples temas para un capítulo
   * @param chapterId ID del capítulo
   * @param temas Lista de temas a crear
   * @returns Observable con la respuesta de la API
   */
  createMultipleTemas(chapterId: number, temas: CreateTemaRequest[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/multiple?chapterId=${chapterId}`, temas);
  }

  /**
   * Actualiza un tema existente
   * @param id ID del tema a actualizar
   * @param tema Datos del tema a actualizar
   * @returns Observable con la respuesta de la API
   */
  updateTema(id: number, tema: UpdateTemaRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, tema);
  }

  /**
   * Elimina un tema
   * @param id ID del tema a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteTema(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  getTemaConProgreso(chapterId: string): Observable<ApiResponse<TemaConProgreso[]>> {
    return this.http.get<ApiResponse<TemaConProgreso[]>>(`${environment.apiUrl}/chapters/${chapterId}/temas/progress`);
  }

  /**
   * Sube una imagen de fondo para un tema
   * @param file Archivo de imagen a subir
   * @returns Observable con la URL de la imagen subida
   */
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload-image`, formData);
  }
}
