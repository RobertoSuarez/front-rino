import { CursosService } from '@/core/services';
import { ChapterService } from '@/core/services/chapter.service';
import { TemaService } from '@/core/services/tema.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { KnobModule } from 'primeng/knob';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TemaConProgreso, ActividadConProgreso } from '@/core/models/tema.interface';

@Component({
  selector: 'app-temas-actividad-progreso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ProgressBarModule,
    KnobModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './temas-actividad-progreso.component.html',
  styleUrl: './temas-actividad-progreso.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemasActividadProgresoComponent implements OnInit { 

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private temaService = inject(TemaService);
  private courseService = inject(CursosService);
  private chapterService = inject(ChapterService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  // Signals para el estado del componente
  loading = signal(true);
  temas = signal<TemaConProgreso[]>([]);
  cursoTitulo = signal<string>('');
  capituloTitulo = signal<string>('');
  cursoId = signal<string>('');
  capituloId = signal<string>('');

  ngOnInit(): void {
    const capituloId = this.activatedRoute.snapshot.paramMap.get('capituloId');
    const cursoId = this.activatedRoute.snapshot.paramMap.get('cursoId');

    if (capituloId && cursoId) {
      this.capituloId.set(capituloId);
      this.cursoId.set(cursoId);
      
      this.cargarDatosIniciales(cursoId, capituloId);
    }
  }

  private cargarDatosIniciales(cursoId: string, capituloId: string): void {
    this.loading.set(true);
    
    // Cargar información del curso
    this.courseService.getCourseById(+cursoId).subscribe({
      next: (response) => {
        if (response?.data) {
          this.cursoTitulo.set(response.data.title);
        }
      },
      error: (error) => {
        console.error('Error al cargar curso:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar información del curso'
        });
      }
    });

    // Cargar información del capítulo
    this.chapterService.getChapterById(+capituloId).subscribe({
      next: (response) => {
        if (response?.data) {
          this.capituloTitulo.set(response.data.title);
        }
      },
      error: (error) => {
        console.error('Error al cargar capítulo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar información del capítulo'
        });
      }
    });

    // Cargar temas con progreso
    this.cargarTemaConProgreso(capituloId);
  }

  cargarTemaConProgreso(capituloId: string): void {
    this.temaService.getTemaConProgreso(capituloId).subscribe({
      next: (response) => {
        if (response?.data) {
          this.temas.set(response.data);
        }
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar temas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los temas'
        });
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // Métodos para manejar las acciones de los temas
  iniciarTema(tema: TemaConProgreso): void {
    // Si el tema tiene actividades, iniciar la primera actividad
    if (tema.activities && tema.activities.length > 0) {
      const primeraActividad = tema.activities.find(act => !act.completed) || tema.activities[0];
      this.iniciarActividad(primeraActividad);
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Tema iniciado',
        detail: `Has iniciado el tema: ${tema.title}`
      });
    }
  }

  continuarTema(tema: TemaConProgreso): void {
    // Buscar la primera actividad no completada
    if (tema.activities && tema.activities.length > 0) {
      const actividadPendiente = tema.activities.find(act => act.started && !act.completed);
      if (actividadPendiente) {
        this.iniciarActividad(actividadPendiente);
      } else {
        const primeraNoCompletada = tema.activities.find(act => !act.completed);
        if (primeraNoCompletada) {
          this.iniciarActividad(primeraNoCompletada);
        } else {
          // Si todas están completadas, iniciar la primera
          this.iniciarActividad(tema.activities[0]);
        }
      }
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Continuando tema',
        detail: `Continuando con: ${tema.title}`
      });
    }
  }
  
  iniciarActividad(actividad: ActividadConProgreso): void {
    // Navegar al componente ActivitySolver con el ID de la actividad
    this.router.navigate(['/estudiante/activity', actividad.id], {
      queryParams: {
        cursoId: this.cursoId(),
        capituloId: this.capituloId()
      }
    });
  }

  // Métodos auxiliares
  calcularProgreso(tema: TemaConProgreso): number {
    if (tema.activitiesToComplete === 0) return 0;
    return Math.round((tema.completedActivities / tema.activitiesToComplete) * 100);
  }

  obtenerEstadoTema(tema: TemaConProgreso): 'completed' | 'in-progress' | 'ready-to-start' | 'locked' {
    if (tema.completedActivities === tema.activitiesToComplete && tema.activitiesToComplete > 0) {
      return 'completed';
    }
    if (tema.completedActivities > 0) {
      return 'in-progress';
    }
    if (tema.nextToStart) {
      return 'ready-to-start';
    }
    return 'locked';
  }

  obtenerSeveridadEstado(estado: string): 'success' | 'info' | 'warning' | 'secondary' {
    switch (estado) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'ready-to-start': return 'warning';
      default: return 'secondary';
    }
  }

  obtenerTextoEstado(estado: string): string {
    switch (estado) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En progreso';
      case 'ready-to-start': return 'Listo para iniciar';
      default: return 'Bloqueado';
    }
  }

  volverAtras(): void {
    this.router.navigate(['/estudiante/cursos', this.cursoId(), 'capitulos']);
  }
}
