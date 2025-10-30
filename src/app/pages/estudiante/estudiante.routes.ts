import { Routes } from '@angular/router';
import { CursosListComponent } from './cursos/cursos-list.component';
import { CursoDetalleComponent } from './cursos/curso-detalle.component';
import { ExplorarCursosComponent } from './explorar-cursos/explorar-cursos.component';
import { TemasActividadProgresoComponent } from './temas-actividad-progreso/temas-actividad-progreso.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { ClassesComponent } from './classes/classes.component';
import { EvaluationsComponent } from './evaluations/evaluations.component';
import { AchievementsComponent } from './achievements/achievements.component';
import { CommunityComponent } from './community/community.component';

export default [
    { path: 'explorar-cursos', component: ExplorarCursosComponent },
    { path: 'cursos', component: CursosListComponent },
    { 
        path: 'my-learning-paths', 
        loadComponent: () => import('./my-learning-paths/my-learning-paths.component').then(m => m.MyLearningPathsComponent),
        title: 'Mis Rutas de Aprendizaje'
    },
    { 
        path: 'my-learning-paths/:id/detail', 
        loadComponent: () => import('./my-learning-paths/learning-path-detail.component').then(m => m.LearningPathDetailComponent),
        title: 'Detalle de Ruta'
    },
    { path: 'classes', component: ClassesComponent },
    { path: 'evaluations', component: EvaluationsComponent },
    { path: 'achievements', component: AchievementsComponent },
    { path: 'community', component: CommunityComponent },
    { path: 'cursos/:id/capitulos', component: CursoDetalleComponent },
    { path: 'cursos/:cursoId/chapters/:capituloId/temas', component: TemasActividadProgresoComponent },
    { path: 'leaderboard', component: LeaderboardComponent },
    { 
        path: 'change-password', 
        loadComponent: () => import('../change-password/change-password.component').then(m => m.ChangePasswordComponent),
        title: 'Cambiar Contraseña'
    },
    { path: '', redirectTo: 'cursos', pathMatch: 'full' }
] as Routes;
