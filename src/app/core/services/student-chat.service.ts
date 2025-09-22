import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentChatService {
  private apiUrl = `${environment.apiUrl}/student-chat`;

  constructor(private http: HttpClient) {}

  private extractData<T>(response: any): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data as T;
    }
    return response as T;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('StudentChatService Error:', error);
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Obtiene todos los chats del estudiante
   * @returns Observable con la lista de chats
   */
  getChats(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      map(response => this.extractData<any[]>(response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Crea un nuevo chat
   * @returns Observable con el chat creado
   */
  createChat(): Observable<any> {
    return this.http.post(this.apiUrl, {}).pipe(
      map(response => this.extractData<any>(response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Envía un mensaje al chat
   * @param chatId ID del chat
   * @param content Contenido del mensaje
   * @returns Observable con la respuesta
   */
  sendMessage(chatId: number, content: string): Observable<any> {
    if (!chatId || chatId === undefined || chatId === null) {
      console.error('Invalid chatId provided to sendMessage:', chatId);
      return throwError(() => new Error('ID de chat inválido'));
    }
    const url = `${this.apiUrl}/${chatId}/send-message`;
    return this.http.post(url, { content }).pipe(
      map(response => this.extractData<any[]>(response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los mensajes de un chat
   * @param chatId ID del chat
   * @returns Observable con la lista de mensajes
   */
  getChatMessages(chatId: number): Observable<any> {
    const url = `${this.apiUrl}/${chatId}/messages`;
    return this.http.get(url).pipe(
      map(response => this.extractData<any[]>(response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza el título de un chat
   * @param chatId ID del chat
   * @param title Nuevo título
   * @returns Observable con la respuesta
   */
  updateChatTitle(chatId: number, title: string): Observable<any> {
    const url = `${this.apiUrl}/${chatId}`;
    return this.http.patch(url, { title }).pipe(
      map(response => this.extractData<any>(response)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina un chat
   * @param chatId ID del chat
   * @returns Observable con la respuesta
   */
  deleteChat(chatId: number): Observable<any> {
    const url = `${this.apiUrl}/${chatId}`;
    return this.http.delete(url).pipe(
      map(response => this.extractData<any>(response)),
      catchError(this.handleError.bind(this))
    );
  }
}
