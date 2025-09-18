import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, AuthData, LoginRequest, User } from '../models';

export interface RecoverPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private apiService: ApiService) {
    this.loadStoredUser();
  }

  /**
   * Carga el usuario almacenado en localStorage si existe
   */
  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userData = localStorage.getItem(this.userKey);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
      }
    }
  }

  /**
   * Obtiene la información del usuario actual desde el backend
   */
  getCurrentUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    // Intentar obtener el usuario desde el perfil
    this.apiService.get('auth/profile').subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.currentUserSubject.next(response.data);
        }
      },
      error: (error) => {
        console.error('Error al obtener perfil del usuario:', error);
        // Solo eliminar token si es un error 401 (no autorizado)
        if (error.status === 401) {
          localStorage.removeItem(this.tokenKey);
          this.currentUserSubject.next(null);
        }
      }
    });
  }

  /**
   * Inicia sesión con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta de autenticación
   */
  login(email: string, password: string): Observable<ApiResponse<AuthData>> {
    const loginData: LoginRequest = { email, password };
    return this.apiService.post<ApiResponse<AuthData>>('auth/login', loginData).pipe(
      tap(response => {
        if (response && response.data && response.data.accessToken) {
          // Guardar token
          localStorage.setItem(this.tokenKey, response.data.accessToken);
          // Guardar datos del usuario
          localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
          // Actualizar el usuario actual
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el token de autenticación
   * @returns Token de autenticación o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Actualiza los datos del usuario en localStorage y en el observable
   * @param user Datos actualizados del usuario
   */
  updateUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Solicita la recuperación de contraseña enviando un correo al usuario
   * @param email Email del usuario que olvidó su contraseña
   * @returns Observable con la respuesta del servidor
   */
  recoverPassword(email: string): Observable<ApiResponse<any>> {
    const data: RecoverPasswordRequest = { email };
    return this.apiService.post<ApiResponse<any>>('auth/recover-password', data);
  }

  /**
   * Restablece la contraseña usando el token enviado por correo
   * @param token Token de recuperación de contraseña
   * @param password Nueva contraseña
   * @returns Observable con la respuesta del servidor
   */
  resetPassword(token: string, password: string): Observable<ApiResponse<any>> {
    const data: ResetPasswordRequest = { token, newPassword: password };
    return this.apiService.post<ApiResponse<any>>('auth/set-password', data);
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Observable con la respuesta del servidor
   */
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    const data: ChangePasswordRequest = { currentPassword, newPassword };
    return this.apiService.post<ApiResponse<any>>('auth/change-password-from-inside', data);
  }
}
