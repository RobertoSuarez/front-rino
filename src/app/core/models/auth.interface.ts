import { User } from './user.interface';

/**
 * Interfaz para los datos de autenticación
 */
export interface AuthData {
  user: User;
  firstLogin: boolean;
  accessToken: string;
}

/**
 * Interfaz para la solicitud de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}
