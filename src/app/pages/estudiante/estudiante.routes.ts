import { Routes } from '@angular/router';
import { CursosListComponent } from './cursos/cursos-list.component';
import { CursoDetalleComponent } from './cursos/curso-detalle.component';
import { ExplorarCursosComponent } from './explorar-cursos/explorar-cursos.component';

export default [
    { path: 'cursos', component: CursosListComponent },
    { path: 'cursos/:id/capitulos', component: CursoDetalleComponent },
    { path: 'explorar-cursos', component: ExplorarCursosComponent },
    { path: '', redirectTo: 'cursos', pathMatch: 'full' }
] as Routes;
