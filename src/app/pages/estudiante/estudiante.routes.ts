import { Routes } from '@angular/router';
import { CursosListComponent } from './cursos/cursos-list.component';
import { CursoDetalleComponent } from './cursos/curso-detalle.component';
import { ExplorarCursosComponent } from './explorar-cursos/explorar-cursos.component';
import { TemasActividadProgresoComponent } from './temas-actividad-progreso/temas-actividad-progreso.component';
import { ActivitySolverComponent } from './activity-solver/activity-solver.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { ClassesComponent } from './classes/classes.component';
import { EvaluationsComponent } from './evaluations/evaluations.component';
import { AchievementsComponent } from './achievements/achievements.component';

export default [
    { path: 'explorar-cursos', component: ExplorarCursosComponent },
    { path: 'cursos', component: CursosListComponent },
    { path: 'classes', component: ClassesComponent },
    { path: 'evaluations', component: EvaluationsComponent },
    { path: 'achievements', component: AchievementsComponent },
    { path: 'cursos/:id/capitulos', component: CursoDetalleComponent },
    { path: 'cursos/:cursoId/chapters/:capituloId/temas', component: TemasActividadProgresoComponent },
    { path: 'activity/:activityId', component: ActivitySolverComponent },
    { path: 'leaderboard', component: LeaderboardComponent },
    { path: '', redirectTo: 'cursos', pathMatch: 'full' }
] as Routes;
