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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Servicios
import { CursosService, Curso } from '../../../core/services';

@Component({
  selector: 'app-cursos-disponibles',
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
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cursos-disponibles.component.html',
  styleUrls: ['./cursos-disponibles.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CursosDisponiblesComponent implements OnInit {
  cursos: Curso[] = [];
  loading: boolean = true;
  filtroTexto: string = '';

  private cursosService = inject(CursosService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos() {
    this.loading = true;
    this.cursosService.getAllCursos().subscribe({
      next: (data) => {
        // Asegurar que data sea un array
        this.cursos = Array.isArray(data) ? data : [];
        console.log('Cursos disponibles cargados:', this.cursos);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los cursos disponibles'
        });
        console.error('Error al cargar cursos disponibles', error);
        this.loading = false;
      }
    });
  }

  inscribirseEnCurso(curso: Curso) {
    this.confirmationService.confirm({
      message: `¿Estás seguro que deseas inscribirte en el curso "${curso.title}"?`,
      header: 'Confirmar inscripción',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.cursosService.inscribirseEnCurso(curso.id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Inscripción exitosa',
              detail: `Te has inscrito correctamente en el curso "${curso.title}"`
            });
            this.loading = false;
            // Redirigir a la vista de mis cursos
            setTimeout(() => {
              this.router.navigate(['/estudiante/cursos']);
            }, 1500);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo completar la inscripción'
            });
            console.error('Error al inscribirse en el curso', error);
            this.loading = false;
          }
        });
      }
    });
  }

  filtrarCursos() {
    if (!this.filtroTexto) {
      return this.cursos;
    }
    
    const filtro = this.filtroTexto.toLowerCase();
    return this.cursos.filter(curso => 
      curso.title?.toLowerCase().includes(filtro) || 
      curso.description?.toLowerCase().includes(filtro) ||
      curso.createdBy?.toLowerCase().includes(filtro)
    );
  }

  verDetalleCurso(cursoId: number) {
    this.router.navigate(['/estudiante/cursos-disponibles', cursoId]);
  }
}
