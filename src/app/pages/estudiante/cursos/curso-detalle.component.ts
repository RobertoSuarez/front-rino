import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { TimelineModule } from 'primeng/timeline';
import { KnobModule } from 'primeng/knob';
import { TagModule } from 'primeng/tag';
import { catchError, of } from 'rxjs';

// Servicios
import { CursosService } from '../../../core/services';
import { Chapter, ChapterWithProgress } from '@/core/models/chapter.interface';
import { CourseDetail } from '@/core/models/course.model';

// Interfaces para el timeline
interface TimelineEvent {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  progress?: number;
  completed?: boolean;
  started?: boolean;
  nextToStart?: boolean;
  chapterId?: number;
  chapterIndex?: number;
  markerColor?: string;
  markerIcon?: string;
}

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
    TreeModule,
    AccordionModule,
    DividerModule,
    BadgeModule,
    SkeletonModule,
    TimelineModule,
    KnobModule,
    TagModule,
    TooltipModule,
],
  providers: [MessageService],
  templateUrl: './curso-detalle.component.html',
  styleUrls: ['./curso-detalle.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CursoDetalleComponent implements OnInit {
  cursoId: number = 0;
  curso: CourseDetail | null = null;
  loading: boolean = true;
  loadingContenido: boolean = false;
  chapters: ChapterWithProgress[] = [];
  timelineEvents: TimelineEvent[] = [];

  private route = inject(ActivatedRoute);
  private cursosService = inject(CursosService);
  private messageService = inject(MessageService);
  private location = inject(Location);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cursoId = +params['id'];
      this.cargarCapitulos();
      this.cargarDatosCurso();
    });
  }

  cargarDatosCurso() {
    this.cursosService.getCourseById(this.cursoId).subscribe({
      next: (response) => {
        this.curso = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al obtener curso',
          detail: 'Error al obtener curso'
        })
      }
    });
  }

  cargarCapitulos() {
    this.loading = true;
    this.cursosService.getChaptersWithProgress(this.cursoId).pipe(
      catchError(error => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al obtener capítulos',
          detail: 'Error al obtener capítulos'
        })
        return of([]);
      })
    ).subscribe(chapters => {
      this.chapters = chapters;
      this.prepararTimelineEvents();
      this.loading = false;
    })
  }

  prepararTimelineEvents() {
    this.timelineEvents = this.chapters.map((chapter, index) => {
      const completed = chapter.progress === 100;
      const inProgress = chapter.started && chapter.progress > 0 && chapter.progress < 100;
      const canStart = chapter.nextToStart && !chapter.started;
      const pending = !chapter.started && !chapter.nextToStart;

      // Determinar color basado en si está iniciado o no
      const markerColor = chapter.started ? '#4CAF50' : '#9E9E9E'; // Verde si iniciado, gris si no
      const markerIcon = chapter.started ? 'pi pi-circle' : 'pi pi-lock'; // Candadito si no iniciado

      let status = 'pending';
      let color = '#9E9E9E';
      let icon = 'pi pi-circle';

      if (completed) {
        status = 'completed';
        color = '#4CAF50';
        icon = 'pi pi-check';
      } else if (inProgress) {
        status = 'in-progress';
        color = '#FF9800';
        icon = 'pi pi-clock';
      } else if (canStart) {
        status = 'ready-to-start';
        color = '#2196F3';
        icon = 'pi pi-play';
      }

      return {
        title: chapter.title,
        subtitle: chapter.shortDescription || `Capítulo ${chapter.index}`,
        description: chapter.shortDescription || 'Descripción del capítulo',
        progress: chapter.progress,
        completed: completed,
        started: chapter.started,
        nextToStart: chapter.nextToStart,
        status: status,
        color: color,
        icon: icon,
        chapterId: chapter.id,
        chapterIndex: chapter.index,
        markerColor: markerColor,
        markerIcon: markerIcon
      };
    });
  }

  getProgressColor(progress: number): string {
    if (progress === 100) return '#4CAF50'; // Verde
    if (progress >= 60) return '#FF9800'; // Naranja
    if (progress > 0) return '#2196F3'; // Azul
    return '#9E9E9E'; // Gris
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'ready-to-start': return 'info';
      default: return 'secondary';
    }
  }

  volverAtras() {
    this.location.back();
  }

  inicializarCapitulo(chapterId: any) {
    console.log('Inicializando capítulo:', chapterId);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Inicializando',
      detail: 'Inicializando capítulo...'
    });

    this.cursosService.inicializarCapitulo(chapterId).subscribe({
      next: (response) => {
        console.log('Capítulo inicializado exitosamente:', response);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Capítulo inicializado correctamente'
        });

        // Recargar los capítulos para actualizar el estado
        this.cargarCapitulos();
      },
      error: (error) => {
        console.error('Error al inicializar capítulo:', error);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo inicializar el capítulo. Inténtalo de nuevo.'
        });
      }
    });
  }

  irATemas(chapterId: string) {
    this.router.navigate(['/estudiante/cursos', this.cursoId, 'chapters', chapterId, 'temas']);
  }
}
