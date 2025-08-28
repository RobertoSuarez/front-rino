import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Realiza una petición GET a la API
   * @param endpoint Endpoint de la API
   * @param params Parámetros opcionales para la petición
   * @returns Observable con la respuesta
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const options = { params: this.buildParams(params) };
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options);
  }

  /**
   * Realiza una petición POST a la API
   * @param endpoint Endpoint de la API
   * @param body Cuerpo de la petición
   * @returns Observable con la respuesta
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  /**
   * Realiza una petición PUT a la API
   * @param endpoint Endpoint de la API
   * @param body Cuerpo de la petición
   * @returns Observable con la respuesta
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  /**
   * Realiza una petición DELETE a la API
   * @param endpoint Endpoint de la API
   * @returns Observable con la respuesta
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }

  /**
   * Construye los parámetros para la petición HTTP
   * @param params Objeto con los parámetros
   * @returns HttpParams
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}
