import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
// import { DropdownModule } from 'primeng/dropdown';

// Servicios
import { CursosService, Curso } from '../../../core/services';

@Component({
  selector: 'app-explorar-cursos',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ToastModule,
    SkeletonModule,
    TagModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './explorar-cursos.component.html',
  styleUrls: ['./explorar-cursos.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ExplorarCursosComponent implements OnInit {
  cursos: Curso[] = [];
  cursosFiltrados: Curso[] = [];
  loading: boolean = true;
  busqueda: string = '';
  
  ordenOptions = [
    { label: 'Más recientes', value: 'recientes' },
    { label: 'Más antiguos', value: 'antiguos' },
    { label: 'Alfabético A-Z', value: 'az' },
    { label: 'Alfabético Z-A', value: 'za' }
  ];
  ordenSeleccionado = 'recientes';

  private cursosService = inject(CursosService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.cargarTodosLosCursos();
  }

  cargarTodosLosCursos() {
    this.loading = true;
    this.cursosService.getAllCursos().subscribe({
      next: (data) => {
        this.cursos = Array.isArray(data) ? data : [];
        this.cursosFiltrados = [...this.cursos];
        this.aplicarOrden();
        console.log('Todos los cursos cargados:', this.cursos);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los cursos disponibles'
        });
        console.error('Error al cargar todos los cursos', error);
        this.loading = false;
      }
    });
  }

  buscarCursos() {
    if (!this.busqueda.trim()) {
      this.cursosFiltrados = [...this.cursos];
    } else {
      const busquedaLower = this.busqueda.toLowerCase();
      this.cursosFiltrados = this.cursos.filter(curso =>
        curso.title.toLowerCase().includes(busquedaLower) ||
        (curso.createdBy && curso.createdBy.toLowerCase().includes(busquedaLower))
      );
    }
    this.aplicarOrden();
  }

  cambiarOrden(event: any) {
    this.ordenSeleccionado = event.value;
    this.aplicarOrden();
  }

  aplicarOrden() {
    switch (this.ordenSeleccionado) {
      case 'recientes':
        this.cursosFiltrados.sort((a, b) => {
          const fechaA = new Date(a.createAt || '').getTime();
          const fechaB = new Date(b.createAt || '').getTime();
          return fechaB - fechaA;
        });
        break;
      case 'antiguos':
        this.cursosFiltrados.sort((a, b) => {
          const fechaA = new Date(a.createAt || '').getTime();
          const fechaB = new Date(b.createAt || '').getTime();
          return fechaA - fechaB;
        });
        break;
      case 'az':
        this.cursosFiltrados.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        this.cursosFiltrados.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
  }

  verDetalleCurso(curso: Curso) {
    // Navegar al detalle del curso o mostrar modal de inscripción
    this.router.navigate(['/estudiante/cursos', curso.id]);
  }

  inscribirseEnCurso(curso: Curso, event: Event) {
    event.stopPropagation(); // Evitar que se active el click del card
    
    this.cursosService.inscribirseEnCurso(curso.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Suscripción exitosa
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Te has inscrito exitosamente en el curso "${curso.title}"`
          });
          
          // Redirigir a la página de mis cursos después de un breve delay
          setTimeout(() => {
            this.router.navigate(['/estudiante/cursos']);
          }, 2000);
        } else if (response.alreadySubscribed) {
          // Ya está suscrito
          this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: `Ya estás suscrito al curso "${curso.title}"`
          });
          
          // Opcional: redirigir a la página de mis cursos
          setTimeout(() => {
            this.router.navigate(['/estudiante/cursos']);
          }, 2000);
        } else {
          // Otro tipo de error
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'No se pudo completar la inscripción. Inténtalo de nuevo.'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo completar la inscripción. Inténtalo de nuevo.'
        });
        console.error('Error al inscribirse en el curso', error);
      }
    });
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'Fecha no disponible';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.buscarCursos();
  }
}
