import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiKey {
  id: number;
  keyName: string;
  maskedValue: string;
  description: string;
  isActive: boolean;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyHistory {
  id: number;
  action: string;
  previousValue: string;
  newValue: string;
  description: string;
  performedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  ipAddress: string;
  createdAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {
  private apiUrl = `${environment.apiUrl}/api-keys`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ApiKey[]>> {
    return this.http.get<ApiResponse<ApiKey[]>>(this.apiUrl);
  }

  create(keyName: string, keyValue: string, description?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, { keyName, keyValue, description });
  }

  update(id: number, keyValue: string, description?: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}`, { keyValue, description });
  }

  toggleActive(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/toggle`, {});
  }

  getHistory(id: number): Observable<ApiResponse<ApiKeyHistory[]>> {
    return this.http.get<ApiResponse<ApiKeyHistory[]>>(`${this.apiUrl}/${id}/history`);
  }

  delete(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`);
  }
}
