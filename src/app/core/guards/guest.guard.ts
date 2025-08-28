import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardian para redirigir usuarios ya autenticados
 * Si el usuario ya está autenticado, lo redirige al dashboard
 */
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al dashboard si ya está autenticado
  return router.parseUrl('/dashboard');
};
