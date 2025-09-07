import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/core/guards';
import { ProfileComponent } from './app/pages/profile/profile.component';

export const appRoutes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    {
        path: '',
        component: AppLayout,
        canActivate: [() => authGuard()],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'profile', component: ProfileComponent },
            { path: 'courses', loadComponent: () => import('./app/pages/courses/courses.component').then(m => m.CoursesComponent) },
            { path: 'admin', loadChildren: () => import('./app/pages/admin/admin.routes').then(m => m.adminRoutes) }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
