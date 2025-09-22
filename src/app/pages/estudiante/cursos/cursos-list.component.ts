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
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';

// Servicios
import { CursosService } from '../../../core/services';
import { Course, CourseSubscription, CourseDetail } from '@/core/models/course.model';
import { Chapter } from '@/core/models/chapter.interface';

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
    TagModule,
    DialogModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './cursos-list.component.html',
  styleUrls: ['./cursos-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CursosListComponent implements OnInit {
  cursos: CourseSubscription[] = [];
  todosLosCursos: Course[] = [];
  loading: boolean = true;
  filtroOptions = [
    { label: 'En progreso', value: 'progreso' },
    { label: 'Todos los cursos', value: 'todos' },
  ];

  filtroSeleccionado = 'progreso';
  
  // Modal variables
  displayModal: boolean = false;
  selectedCourse: CourseDetail | null = null;
  courseChapters: Chapter[] = [];
  loadingModal: boolean = false;

  private cursosService = inject(CursosService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.cargarCursos();
    this.cursosService.getAllCursos().subscribe(response => {
      this.todosLosCursos = response.data;
    })
  }

  cargarCursos() {
    this.loading = true;
    this.cursosService.getCourseSubscription().subscribe({
      next: (response) => {
        
        this.cursos = response.data;
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

  verDetalleCurso(cursoId: number) {
    this.router.navigate([`/estudiante/cursos/${cursoId}/capitulos`]);
  }

  mostrarDetalleModal(curso: Course, event: Event) {
    event.stopPropagation();
    this.loadingModal = true;
    this.displayModal = true;
    
    // Cargar detalles del curso
    this.cursosService.getCourseById(curso.id).subscribe({
      next: (response) => {
        this.selectedCourse = response.data;
        this.cargarCapitulosCurso(curso.id);
      },
      error: (error) => {
        console.error('Error al cargar detalle del curso:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle del curso'
        });
        this.loadingModal = false;
      }
    });
  }

  cargarCapitulosCurso(cursoId: number) {
    this.cursosService.getChapters(cursoId).subscribe({
      next: (chapters) => {
        this.courseChapters = chapters;
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error al cargar capítulos:', error);
        this.courseChapters = [];
        this.loadingModal = false;
      }
    });
  }

  cerrarModal() {
    this.displayModal = false;
    this.selectedCourse = null;
    this.courseChapters = [];
  }

  getEstadoCurso(progress: number): string {
    if (progress === 100) {
      return 'Completado';
    } else if (progress > 0) {
      return 'En progreso';
    } else {
      return 'No iniciado';
    }
  }

  getColorEstado(progress: number): string {
    if (progress === 100) {
      return 'success';
    } else if (progress > 0) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  inscribirseEnCurso(curso: Course, event: Event) {
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
}
