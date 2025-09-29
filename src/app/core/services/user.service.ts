import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User } from '../models';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  whatsApp: string;
  typeUser: 'student' | 'admin' | 'teacher' | 'parent';
  status?: 'active' | 'inactive';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthday?: string;
  whatsApp?: string;
  typeUser?: 'student' | 'admin' | 'teacher' | 'parent';
  status?: 'active' | 'inactive';
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserIndicators {
  yachay: number;
  tumis: number;
  mullu: number;
}

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

  /**
   * Obtiene los indicadores del usuario (yachay, tumis, mullu)
   * @returns Observable con los indicadores del usuario
   */
  getUserIndicators(): Observable<ApiResponse<UserIndicators>> {
    return this.apiService.get<ApiResponse<UserIndicators>>('users/indicators');
  }

  /**
   * Actualiza los indicadores del usuario (yachay, tumis, mullu)
   * @param indicators Nuevos valores de los indicadores
   * @returns Observable con los indicadores actualizados
   */
  updateUserIndicators(indicators: UserIndicators): Observable<ApiResponse<UserIndicators>> {
    return this.apiService.patch<ApiResponse<UserIndicators>>('users/indicators', indicators);
  }

  // ========== GESTIÓN DE USUARIOS (ADMIN) ==========

  /**
   * Obtiene la lista de todos los usuarios (solo para administradores)
   * @param page Página actual
   * @param limit Límite de usuarios por página
   * @param search Término de búsqueda opcional
   * @returns Observable con la lista de usuarios
   */
  getAllUsers(page: number = 1, limit: number = 10, search?: string): Observable<ApiResponse<UsersListResponse>> {
    let url = `users?page=${page}&limit=${limit}`;
    if (search && search.trim() !== '') {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.apiService.get<ApiResponse<UsersListResponse>>(url);
  }

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Observable con los datos del usuario
   */
  getUserById(id: number): Observable<ApiResponse<ApiResponse<User>>> {
    return this.apiService.get<ApiResponse<ApiResponse<User>>>(`users/${id}`);
  }

  /**
   * Crea un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Observable con la respuesta de la API
   */
  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.post<ApiResponse<User>>('users', userData);
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param userData Datos a actualizar
   * @returns Observable con la respuesta de la API
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.apiService.put<ApiResponse<User>>(`users/${id}`, userData);
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<ApiResponse<any>>(`users/${id}`);
  }

  /**
   * Cambia el estado de un usuario (activar/desactivar)
   * @param id ID del usuario
   * @param status Nuevo estado del usuario
   * @returns Observable con la respuesta de la API
   */
  changeUserStatus(id: number, status: 'active' | 'inactive'): Observable<ApiResponse<User>> {
    return this.apiService.put<ApiResponse<User>>(`users/${id}/status`, { status });
  }

  /**
   * Aprueba un usuario
   * @param id ID del usuario a aprobar
   * @returns Observable con la respuesta de la API
   */
  approveUser(id: number): Observable<ApiResponse<any>> {
    return this.apiService.patch<ApiResponse<any>>(`users/${id}/approve`, {});
  }

  /**
   * Verifica el email de un usuario usando un token
   * @param token Token de verificación
   * @returns Observable con la respuesta de la API
   */
  verifyEmail(token: string): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>('users/verify-email', { token });
  }
}
