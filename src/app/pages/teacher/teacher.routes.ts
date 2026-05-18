import { Routes } from '@angular/router';
import { TeacherDashboardComponent } from './dashboard/teacher-dashboard.component';

export default [
    {
        path: 'dashboard',
        component: TeacherDashboardComponent,
        title: 'Dashboard del profesor'
    },
    {
        path: 'change-password',
        loadComponent: () => import('../change-password/change-password.component').then(m => m.ChangePasswordComponent),
        title: 'Cambiar contraseña'
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
] as Routes;
