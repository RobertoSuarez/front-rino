import { Routes } from '@angular/router';
import { TeacherDashboardComponent } from './dashboard/teacher-dashboard.component';

export default [
    { 
        path: 'dashboard', 
        component: TeacherDashboardComponent,
        title: 'Dashboard del Profesor'
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
] as Routes;
