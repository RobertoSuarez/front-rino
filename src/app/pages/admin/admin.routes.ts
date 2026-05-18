import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'users',
    children: [
      {
        path: '',
        loadComponent: () => import('./users/users-list-simple.component').then(m => m.UsersListComponent),
        title: 'Gestión de usuarios'
      },
      {
        path: 'new',
        loadComponent: () => import('./users/user-form.component').then(m => m.UserFormComponent),
        title: 'Crear usuario'
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./users/user-form.component').then(m => m.UserFormComponent),
        title: 'Editar usuario'
      }
    ]
  },
  {
    path: 'courses',
    children: [
      {
        path: '',
        loadComponent: () => import('../../pages/courses/courses.component').then(m => m.CoursesComponent),
        title: 'Gestión de cursos'
      },
      {
        path: 'builder',
        loadComponent: () => import('./courses/course-builder.component').then(m => m.CourseBuilderComponent),
        title: 'Constructor de cursos IA'
      },
      {
        path: 'builder/:id',
        loadComponent: () => import('./courses/course-builder.component').then(m => m.CourseBuilderComponent),
        title: 'Editar curso IA'
      }
    ]
  },
  {
    path: 'chapters',
    loadComponent: () => import('./chapters/chapters-list.component').then(m => m.ChaptersListComponent),
    title: 'Gestión de capítulos'
  },
  {
    path: 'temas',
    loadComponent: () => import('./temas/temas-list.component').then(m => m.TemasListComponent),
    title: 'Gestión de temas'
  },
  {
    path: 'activities',
    loadComponent: () => import('./activities/activities-list.component').then(m => m.ActivitiesListComponent),
    title: 'Gestión de actividades'
  },
  {
    path: 'exercises/:activityId/sandbox',
    loadComponent: () => import('./exercises/exercise-sandbox.component').then(m => m.ExerciseSandboxComponent),
    title: 'Sandbox — Vista previa de ejercicios'
  },
  {
    path: 'exercises/:activityId',
    loadComponent: () => import('./exercises/exercises-list.component').then(m => m.ExercisesListComponent),
    title: 'Gestión de ejercicios'
  },
  {
    path: 'statistics',
    loadComponent: () => import('./statistics/statistics-dashboard.component').then(m => m.StatisticsDashboardComponent),
    title: 'Estadísticas de la plataforma'
  },
  {
    path: 'learning-paths',
    children: [
      {
        path: '',
        loadComponent: () => import('./learning-paths/learning-paths-list.component').then(m => m.LearningPathsListComponent),
        title: 'Gestión de rutas de aprendizaje'
      },
      {
        path: 'new',
        loadComponent: () => import('./learning-paths/learning-path-form.component').then(m => m.LearningPathFormComponent),
        title: 'Crear ruta de aprendizaje'
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./learning-paths/learning-path-form.component').then(m => m.LearningPathFormComponent),
        title: 'Editar ruta de aprendizaje'
      }
    ]
  },
  {
    path: 'parameters',
    loadComponent: () => import('./parameters/parameters.component').then(m => m.ParametersComponent),
    title: 'Parámetros del sistema'
  },
  {
    path: 'institutions',
    loadComponent: () => import('./institutions/institutions-list.component').then(m => m.InstitutionsListComponent),
    title: 'Gestión de instituciones'
  },
  {
    path: 'change-password',
    loadComponent: () => import('../change-password/change-password.component').then(m => m.ChangePasswordComponent),
    title: 'Cambiar contraseña'
  }
];
