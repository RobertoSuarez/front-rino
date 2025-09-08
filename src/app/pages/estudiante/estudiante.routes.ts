import { Routes } from '@angular/router';
import { CursosListComponent } from './cursos/cursos-list.component';
import { CursoDetalleComponent } from './cursos/curso-detalle.component';

export default [
    { path: 'cursos', component: CursosListComponent },
    { path: 'cursos/:id', component: CursoDetalleComponent },
    { path: '', redirectTo: 'cursos', pathMatch: 'full' }
] as Routes;
