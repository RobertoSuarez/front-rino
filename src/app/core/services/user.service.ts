import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  /**
   * Obtiene el perfil del usuario actual
   * @returns Observable con la respuesta de la API
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.apiService.get<ApiResponse<User>>('users/profile');
  }

  /**
   * Actualiza el perfil del usuario
   * @param userData Datos del usuario a actualizar
   * @returns Observable con la respuesta de la API
   */
  updateProfile(userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.apiService.put<ApiResponse<User>>('users/profile', userData);
  }

  /**
   * Actualiza la contraseña del usuario
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Observable con la respuesta de la API
   */
  updatePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.apiService.put<ApiResponse<any>>('users/password', {
      currentPassword,
      newPassword
    });
  }
}
