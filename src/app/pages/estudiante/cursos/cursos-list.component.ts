import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

// Servicios
import { CursosService } from '../../../core/services';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
    SkeletonModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './cursos-list.component.html',
  styleUrls: ['./cursos-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CursosListComponent implements OnInit {
  cursos: any[] = [];
  loading: boolean = true;
  filtroOptions = [
    { label: 'Todos los cursos suscritos', value: 'todos' },
    { label: 'En progreso', value: 'progreso' },
    { label: 'Completados', value: 'completados' },
    { label: 'Todos los cursos disponibles', value: 'disponibles' }
  ];
  filtroSeleccionado = 'todos';

  private cursosService = inject(CursosService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos() {
    this.loading = true;
    this.cursosService.getMisCursos().subscribe({
      next: (data) => {
        // Asegurar que data sea un array
        this.cursos = Array.isArray(data) ? data : [];
        console.log('Cursos cargados:', this.cursos);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los cursos'
        });
        console.error('Error al cargar cursos', error);
        this.loading = false;
      }
    });
  }

  filtrarCursos(event: any) {
    this.filtroSeleccionado = event.value;
    this.cargarCursosFiltrados();
  }

  cargarCursosFiltrados() {
    this.loading = true;
    
    if (this.filtroSeleccionado === 'completados') {
      this.cursosService.getMisCursosCompletados().subscribe({
        next: (data) => {
          // Asegurar que data sea un array
          this.cursos = Array.isArray(data) ? data : [];
          console.log('Cursos completados cargados:', this.cursos);
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los cursos'
          });
          console.error('Error al cargar cursos completados', error);
          this.loading = false;
        }
      });
    } else if (this.filtroSeleccionado === 'progreso') {
      this.cursosService.getMisCursosEnProgreso().subscribe({
        next: (data) => {
          // Asegurar que data sea un array
          this.cursos = Array.isArray(data) ? data : [];
          console.log('Cursos en progreso cargados:', this.cursos);
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los cursos'
          });
          console.error('Error al cargar cursos en progreso', error);
          this.loading = false;
        }
      });
    } else if (this.filtroSeleccionado === 'disponibles') {
      this.cursosService.getAllCursos().subscribe({
        next: (data) => {
          // Asegurar que data sea un array
          this.cursos = Array.isArray(data) ? data : [];
          console.log('Todos los cursos disponibles cargados:', this.cursos);
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los cursos disponibles'
          });
          console.error('Error al cargar todos los cursos disponibles', error);
          this.loading = false;
        }
      });
    } else {
      this.cargarCursos();
    }
  }

  verDetalleCurso(cursoId: number) {
    this.router.navigate(['/estudiante/cursos', cursoId]);
  }

  getEstadoCurso(progreso: number): string {
    if (progreso === 100) {
      return 'Completado';
    } else if (progreso > 0) {
      return 'En progreso';
    } else {
      return 'No iniciado';
    }
  }

  getColorEstado(progreso: number): string {
    if (progreso === 100) {
      return 'success';
    } else if (progreso > 0) {
      return 'warning';
    } else {
      return 'info';
    }
  }
}
