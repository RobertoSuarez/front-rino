import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Institution, CreateInstitutionDto, UpdateInstitutionDto } from '../models/institution.interface';

export interface ApiInstitutionResponse {
  statusCode: number;
  message?: string;
  data: Institution[];
}

export interface ApiInstitutionSingleResponse {
  statusCode: number;
  message?: string;
  data: Institution;
}

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private apiUrl = `${environment.apiUrl}/institutions`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las instituciones
   */
  getAll(): Observable<ApiInstitutionResponse> {
    return this.http.get<ApiInstitutionResponse>(this.apiUrl);
  }

  /**
   * Obtiene una institución por ID
   */
  getById(id: number): Observable<ApiInstitutionSingleResponse> {
    return this.http.get<ApiInstitutionSingleResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva institución
   */
  create(data: CreateInstitutionDto): Observable<ApiInstitutionSingleResponse> {
    return this.http.post<ApiInstitutionSingleResponse>(this.apiUrl, data);
  }

  /**
   * Actualiza una institución
   */
  update(id: number, data: UpdateInstitutionDto): Observable<ApiInstitutionSingleResponse> {
    return this.http.patch<ApiInstitutionSingleResponse>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Elimina una institución
   */
  delete(id: number): Observable<{ statusCode: number; message: string }> {
    return this.http.delete<{ statusCode: number; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Sube imagen de logo para institución
   */
  uploadImage(file: File): Observable<{ statusCode: number; message: string; data: { url: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ statusCode: number; message: string; data: { url: string } }>(`${this.apiUrl}/upload-image`, formData);
  }
}
