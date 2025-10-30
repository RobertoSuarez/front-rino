import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFILE_ROUTES: Routes = [
    {
        path: '',
        component: ProfileComponent,
        canActivate: [authGuard],
        title: 'Perfil de Usuario'
    },
    {
        path: 'update',
        component: ProfileComponent, // Podría ser un componente específico para actualización en el futuro
        canActivate: [authGuard],
        title: 'Actualizar Perfil'
    },
    {
        path: 'change-password',
        loadComponent: () => import('../change-password/change-password.component').then(m => m.ChangePasswordComponent),
        canActivate: [authGuard],
        title: 'Cambiar Contraseña'
    }
];
