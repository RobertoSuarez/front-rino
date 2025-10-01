import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardian para proteger rutas que requieren autenticación
 * Redirige al login si el usuario no está autenticado o el token ha expirado
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // isAuthenticated() ya valida si el token existe y no ha expirado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login si no está autenticado o el token expiró
  return router.parseUrl('/auth/login');
};
