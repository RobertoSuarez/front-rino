import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'users',
    children: [
      {
        path: '',
        loadComponent: () => import('./users/users-list-simple.component').then(m => m.UsersListComponent),
        title: 'Gestión de Usuarios'
      },
      {
        path: 'new',
        loadComponent: () => import('./users/user-form.component').then(m => m.UserFormComponent),
        title: 'Crear Usuario'
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./users/user-form.component').then(m => m.UserFormComponent),
        title: 'Editar Usuario'
      }
    ]
  },
  {
    path: 'courses',
    loadComponent: () => import('../../pages/courses/courses.component').then(m => m.CoursesComponent),
    title: 'Gestión de Cursos'
  },
  {
    path: 'chapters',
    loadComponent: () => import('./chapters/chapters-list.component').then(m => m.ChaptersListComponent),
    title: 'Gestión de Capítulos'
  },
  {
    path: 'temas',
    loadComponent: () => import('./temas/temas-list.component').then(m => m.TemasListComponent),
    title: 'Gestión de Temas'
  },
  {
    path: 'activities',
    loadComponent: () => import('./activities/activities-list.component').then(m => m.ActivitiesListComponent),
    title: 'Gestión de Actividades'
  },
  {
    path: 'exercises/:activityId',
    loadComponent: () => import('./exercises/exercises-list.component').then(m => m.ExercisesListComponent),
    title: 'Gestión de Ejercicios'
  },
  {
    path: 'statistics',
    loadComponent: () => import('./statistics/statistics-dashboard.component').then(m => m.StatisticsDashboardComponent),
    title: 'Estadísticas de la Plataforma'
  }
];
