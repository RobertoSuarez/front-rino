import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CursosListComponent } from './cursos/cursos-list.component';
import { CursoDetalleComponent } from './cursos/curso-detalle.component';
import { CursosDisponiblesComponent } from './cursos/cursos-disponibles.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'cursos',
    pathMatch: 'full'
  },
  {
    path: 'cursos',
    component: CursosListComponent
  },
  {
    path: 'cursos/:id',
    component: CursoDetalleComponent
  },
  {
    path: 'cursos-disponibles',
    component: CursosDisponiblesComponent
  },
  {
    path: 'cursos-disponibles/:id',
    component: CursoDetalleComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstudianteRoutingModule { }
