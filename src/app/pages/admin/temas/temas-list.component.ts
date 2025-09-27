import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TemaService } from '../../../core/services/tema.service';
import { ChapterService } from '../../../core/services/chapter.service';
import { CourseService } from '../../../core/services/course.service';
import { Tema } from '../../../core/models/tema.interface';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from "primeng/button";
import { environment } from 'src/environments/environment';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AiService } from '../../../core/services/ai.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-temas-list',
  standalone: true,
  imports: [
    TableModule,
    MultiSelectModule,
    ToastModule,
    CommonModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DialogModule,
    CheckboxModule,
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './temas-list.component.html',
  styles: [`
    .description-cell {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
  `]
})
export class TemasListComponent implements OnInit {
  temas: Tema[] = [];
  loading: boolean = true;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  currentTemaId: number | null = null;
  temaForm: FormGroup;
  courses: any[] = [];
  chapters: any[] = [];
  selectedCourseId: number | null = null;
  selectedChapterId: number | null = null;
  initialChapterId: number | null = null;
  difficultyOptions = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Medio', value: 'Medio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  @ViewChild('dt') dt!: Table;

  constructor(
    private temaService: TemaService,
    private chapterService: ChapterService,
    private courseService: CourseService,
    private fb: FormBuilder,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private aiService: AiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.temaForm = this.createForm();
  }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParamMap;
    const courseIdParam = queryParams.get('courseId');
    const chapterIdParam = queryParams.get('chapterId');

    if (courseIdParam) {
      const parsedCourseId = parseInt(courseIdParam, 10);
      if (!isNaN(parsedCourseId)) {
        this.selectedCourseId = parsedCourseId;
      }
    }

    if (chapterIdParam) {
      const parsedChapterId = parseInt(chapterIdParam, 10);
      if (!isNaN(parsedChapterId)) {
        this.initialChapterId = parsedChapterId;
        this.selectedChapterId = parsedChapterId;
      }
    }

    // Cargar la lista de cursos para el filtro
    this.http.get<any>(`${environment.apiUrl}/courses`).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.courses = response.data.map((course: any) => ({
            label: course.title,
            value: course.id
          }));

          const hasSelectedCourse = this.selectedCourseId !== null &&
            this.courses.some((course) => course.value === this.selectedCourseId);

          if (!hasSelectedCourse) {
            this.selectedCourseId = this.courses[0]?.value ?? null;
          }

          if (this.selectedCourseId !== null) {
            this.loadChapters(this.initialChapterId);
          } else {
            this.loading = false;
          }
        } else {
          this.courses = [];
          this.chapters = [];
          this.temas = [];
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar cursos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la lista de cursos'
        });
        this.loading = false;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      chapterId: ['', Validators.required],
      title: ['', Validators.required],
      shortDescription: ['', Validators.required],
      theory: ['', Validators.required],
      urlBackground: [''],
      difficulty: ['Fácil', Validators.required]
    });
  }

  onCourseChange(event: any) {
    const value = parseInt(event.target.value, 10);
    this.selectedCourseId = isNaN(value) ? null : value;
    this.selectedChapterId = null;
    this.initialChapterId = null;
    this.temas = [];
    this.loadChapters();
  }

  onChapterChange(event: any) {
    const value = parseInt(event.target.value, 10);
    this.selectedChapterId = isNaN(value) ? null : value;
    this.loadTemas();
  }

  loadChapters(chapterIdToSelect?: number | null) {
    if (!this.selectedCourseId) {
      this.chapters = [];
      this.temas = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.chapterService.getChaptersByCourseId(this.selectedCourseId).subscribe({
      next: (response) => {
        const chaptersData = response?.data ?? [];
        if (chaptersData.length > 0) {
          this.chapters = chaptersData.map((chapter: any) => ({
            label: chapter.title,
            value: chapter.id
          }));

          const desiredChapterId = chapterIdToSelect ?? this.initialChapterId ?? this.selectedChapterId;
          const matchingChapter = desiredChapterId ? chaptersData.find((chapter: any) => chapter.id === desiredChapterId) : null;

          if (matchingChapter) {
            this.selectedChapterId = matchingChapter.id;
          } else {
            this.selectedChapterId = chaptersData[0]?.id ?? null;
          }

          this.initialChapterId = null;

          if (this.selectedChapterId) {
            this.loadTemas();
            return;
          }
        } else {
          this.chapters = [];
          this.temas = [];
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar capítulos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los capítulos'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Convierte una fecha en formato string 'dd/MM/yyyy HH:mm:ss' a un objeto Date
   * @param dateString Fecha en formato string
   * @returns Fecha convertida a ISO string o la fecha original si no se pudo convertir
   */
  private convertStringToDate(dateString: string): string {
    if (!dateString || typeof dateString !== 'string') {
      return dateString;
    }
    
    const parts = dateString.split(' ');
    if (parts.length === 2) {
      const dateParts = parts[0].split('/');
      const timeParts = parts[1].split(':');
      
      if (dateParts.length === 3 && timeParts.length >= 2) {
        try {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Los meses en JavaScript van de 0 a 11
          const year = parseInt(dateParts[2], 10);
          const hour = parseInt(timeParts[0], 10);
          const minute = parseInt(timeParts[1], 10);
          const second = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
          
          return new Date(year, month, day, hour, minute, second).toISOString();
        } catch (error) {
          console.error('Error al convertir fecha:', error);
          return dateString;
        }
      }
    }
    
    return dateString;
  }

  loadTemas() {
    if (!this.selectedChapterId) {
      this.temas = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.temaService.getTemasByChapterId(this.selectedChapterId).subscribe({
      next: (response) => {
        // Convertir las fechas string a objetos Date
        this.temas = response.data.map(tema => {
          if (tema.createdAt) {
            tema.createdAt = this.convertStringToDate(tema.createdAt);
          }
          return tema;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar temas', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los temas'
        });
        this.loading = false;
      }
    });
  }

  showCreateDialog() {
    this.temaForm.reset({
      chapterId: this.selectedChapterId,
      title: '',
      shortDescription: '',
      theory: '',
      urlBackground: '',
      difficulty: 'Fácil'
    });
    this.currentTemaId = null;
    this.displayCreateDialog = true;
  }

  showEditDialog(tema: Tema) {
    this.currentTemaId = tema.id;
    this.loading = true;
    
    this.temaService.getTemaById(tema.id).subscribe({
      next: (response) => {
        if (response && response.data) {
          // Convertir fechas si es necesario
          if (response.data.createdAt) {
            response.data.createdAt = this.convertStringToDate(response.data.createdAt);
          }
          
          this.temaForm.patchValue({
            chapterId: response.data.chapterId || this.selectedChapterId,
            title: response.data.title,
            shortDescription: response.data.shortDescription,
            theory: response.data.theory,
            urlBackground: response.data.urlBackground || '',
            difficulty: response.data.difficulty
          });
          this.displayEditDialog = true;
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar tema'
        });
        console.error(err);
      },
      complete: () => this.loading = false
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  createTema() {
    if (this.temaForm.valid) {
      this.loading = true;
      const data = this.temaForm.value;
      
      this.temaService.createTema(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tema creado correctamente'
          });
          this.displayCreateDialog = false;
          this.loadTemas();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear tema'
          });
          console.error(err);
        },
        complete: () => this.loading = false
      });
    }
  }

  updateTema() {
    if (this.temaForm.valid && this.currentTemaId) {
      const data = this.temaForm.value;
      this.loading = true;
      
      this.temaService.updateTema(this.currentTemaId, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tema actualizado correctamente'
          });
          this.displayEditDialog = false;
          this.loadTemas();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar tema'
          });
          console.error(err);
        },
        complete: () => this.loading = false
      });
    }
  }

  confirmDelete(tema: Tema) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el tema "${tema.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.deleteTema(tema.id),
      reject: () => {}
    });
  }

  deleteTema(temaId: number) {
    this.loading = true;
    this.temaService.deleteTema(temaId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tema eliminado correctamente'
        });
        this.loadTemas();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar tema'
        });
        console.error(err);
      },
      complete: () => this.loading = false
    });
  }

  /**
   * Maneja el cierre del diálogo, tanto para creación como para edición
   */
  hideDialog() {
    if (this.currentTemaId) {
      this.displayEditDialog = false;
    } else {
      this.displayCreateDialog = false;
    }
    this.currentTemaId = null;
    this.temaForm.reset();
  }
  
  /**
   * Navega a la página de actividades para el tema seleccionado
   * @param temaId ID del tema
   */
  navigateToActivities(temaId: number) {
    // Redirigir a la página de actividades con el ID del tema como parámetro
    this.router.navigate(['/admin/activities'], { queryParams: { temaId: temaId } });
  }

  /**
   * Genera contenido para el tema utilizando IA
   */
  generateContentWithAI() {
    const title = this.temaForm.get('title')?.value;
    const chapterId = this.selectedChapterId;
    
    if (!title) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, ingresa un título para el tema primero'
      });
      return;
    }

    if (!chapterId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, selecciona un capítulo primero'
      });
      return;
    }

    this.loading = true;
    this.messageService.add({
      severity: 'info',
      summary: 'Generando',
      detail: 'Generando contenido con IA...'
    });

    // Primero obtenemos la información del capítulo
    this.chapterService.getChapterById(chapterId).subscribe({
      next: (chapterResponse: any) => {
        if (chapterResponse && chapterResponse.data) {
          const chapterTitle = chapterResponse.data.title;
          
          // Ahora obtenemos la información del curso
          this.courseService.getCourseById(chapterResponse.data.courseId).subscribe({
            next: (courseResponse: any) => {
              if (courseResponse && courseResponse.data) {
                const courseTitle = courseResponse.data.title;

                // Ahora generamos el contenido del tema
                this.aiService.generateTemaContent(title, chapterTitle, courseTitle).subscribe({
                  next: (response) => {
                    if (response) {
                      this.temaForm.patchValue({
                        shortDescription: response.data.shortDescription,
                        theory: response.data.theory
                      });
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Contenido generado correctamente'
                      });
                    }
                  },
                  error: (err: any) => {
                    console.error('Error al generar contenido', err);
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: 'Error al generar contenido con IA'
                    });
                  },
                  complete: () => this.loading = false
                });
              }
            },
            error: (err: any) => {
              console.error('Error al obtener información del curso', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al obtener información del curso'
              });
              this.loading = false;
            }
          });
        }
      },
      error: (err: any) => {
        console.error('Error al obtener información del capítulo', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener información del capítulo'
        });
        this.loading = false;
      }
    });
  }
}
