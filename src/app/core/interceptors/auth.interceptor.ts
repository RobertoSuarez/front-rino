import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Verificar si el token ha expirado antes de hacer la petición
  if (token && authService.isTokenExpired(token)) {
    authService.logout();
    router.navigate(['/auth/login']);
    return throwError(() => new Error('Token expirado'));
  }

  // Agregar token a la petición si existe
  const clonedReq = token 
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      })
    : req;

  // Manejar errores de la petición
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un error 401 (no autorizado), el token es inválido o expiró
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
