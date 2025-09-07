import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Table } from 'primeng/table';
import { ActivityService } from '../../../core/services/activity.service';
import { TemaService } from '../../../core/services/tema.service';
import { ChapterService } from '../../../core/services/chapter.service';
import { CourseService } from '../../../core/services/course.service';
import { Activity } from '../../../core/models/activity.interface';
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
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activities-list',
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
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './activities-list.component.html',
  styles: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivitiesListComponent implements OnInit {
  activities: Activity[] = [];
  loading: boolean = true;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  currentActivityId: number | null = null;
  activityForm: FormGroup;
  courses: any[] = [];
  chapters: any[] = [];
  temas: any[] = [];
  selectedCourseId: number | null = null;
  selectedChapterId: number | null = null;
  selectedTemaId: number | null = null;

  @ViewChild('dt') dt!: Table;

  constructor(
    private activityService: ActivityService,
    private temaService: TemaService,
    private chapterService: ChapterService,
    private courseService: CourseService,
    private fb: FormBuilder,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.activityForm = this.createForm();
  }

  ngOnInit() {
    // Verificar si hay un parámetro temaId en la URL
    this.route.queryParams.subscribe(params => {
      const temaId = params['temaId'];
      if (temaId) {
        // Si hay un temaId en la URL, buscar el tema y su jerarquía
        this.findTemaHierarchy(parseInt(temaId, 10));
      } else {
        // Si no hay temaId, cargar la lista de cursos normalmente
        this.loadCourses();
      }
    });
  }

  /**
   * Busca la jerarquía completa de un tema (curso y capítulo) y selecciona los valores correspondientes
   * @param temaId ID del tema
   */
  findTemaHierarchy(temaId: number) {
    this.loading = true;
    this.temaService.getTemaById(temaId).subscribe({
      next: (response) => {
        if (response && response.data) {
          const tema = response.data;
          this.selectedTemaId = temaId;
          
          // Obtener el capítulo al que pertenece el tema
          if (tema.chapterId) {
            this.selectedChapterId = tema.chapterId;
          }
          
          // Cargar los cursos
          this.http.get<any>(`${environment.apiUrl}/courses`).subscribe({
            next: (coursesResponse) => {
              if (coursesResponse && coursesResponse.data && coursesResponse.data.length > 0) {
                this.courses = coursesResponse.data.map((course: any) => ({
                  label: course.title,
                  value: course.id
                }));
                
                // Obtener el curso al que pertenece el capítulo
                if (tema.chapterId) {
                  this.chapterService.getChapterById(tema.chapterId).subscribe({
                    next: (chapterResponse: any) => {
                      if (chapterResponse && chapterResponse.data) {
                        this.selectedCourseId = chapterResponse.data.courseId;
                        
                        // Cargar los capítulos del curso
                        this.loadChapters(true);
                      }
                    },
                    error: (err: any) => {
                      console.error('Error al obtener información del capítulo', err);
                      this.loadCourses();
                    }
                  });
                }
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
        } else {
          this.loadCourses();
        }
      },
      error: (err) => {
        console.error('Error al obtener información del tema', err);
        this.loadCourses();
      }
    });
  }

  /**
   * Carga la lista de cursos
   */
  loadCourses() {
    // Cargar la lista de cursos para el filtro
    this.http.get<any>(`${environment.apiUrl}/courses`).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.courses = response.data.map((course: any) => ({
            label: course.title,
            value: course.id
          }));
          
          // Seleccionar automáticamente el primer curso
          const firstCourse = response.data[0];
          if (firstCourse && firstCourse.id) {
            this.selectedCourseId = firstCourse.id;
            // Cargar los capítulos del curso seleccionado
            this.loadChapters();
          }
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
      temaId: ['', Validators.required],
      title: ['', Validators.required]
    });
  }

  onCourseChange(event: any) {
    this.selectedCourseId = parseInt(event.target.value, 10);
    this.selectedChapterId = null;
    this.selectedTemaId = null;
    this.activities = [];
    this.loadChapters();
  }

  onChapterChange(event: any) {
    this.selectedChapterId = parseInt(event.target.value, 10);
    this.selectedTemaId = null;
    this.activities = [];
    this.loadTemas();
  }

  onTemaChange(event: any) {
    this.selectedTemaId = parseInt(event.target.value, 10);
    this.loadActivities();
  }

  loadChapters(fromTemaHierarchy: boolean = false) {
    if (!this.selectedCourseId) {
      this.chapters = [];
      return;
    }

    this.loading = true;
    this.chapterService.getChaptersByCourseId(this.selectedCourseId).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.chapters = response.data.map((chapter: any) => ({
            label: chapter.title,
            value: chapter.id
          }));
          
          // Seleccionar automáticamente el primer capítulo
          const firstChapter = response.data[0];
          if (firstChapter && firstChapter.id) {
            this.selectedChapterId = firstChapter.id;
            // Cargar los temas del capítulo seleccionado
            this.loadTemas(fromTemaHierarchy);
          }
        } else {
          this.chapters = [];
          this.temas = [];
          this.activities = [];
          this.loading = false;
        }
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

  loadTemas(fromTemaHierarchy: boolean = false) {
    if (!this.selectedChapterId) {
      this.temas = [];
      return;
    }

    this.loading = true;
    this.temaService.getTemasByChapterId(this.selectedChapterId).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.temas = response.data.map((tema: any) => ({
            label: tema.title,
            value: tema.id
          }));
          
          if (fromTemaHierarchy && this.selectedTemaId) {
            // Si estamos cargando desde la jerarquía de un tema, ya tenemos el tema seleccionado
            // Verificamos que el tema exista en la lista
            const temaExists = response.data.some(tema => tema.id === this.selectedTemaId);
            if (temaExists) {
              // Cargar las actividades del tema seleccionado
              this.loadActivities();
            } else {
              // Si el tema no existe en la lista, seleccionamos el primero
              const firstTema = response.data[0];
              if (firstTema && firstTema.id) {
                this.selectedTemaId = firstTema.id;
                this.loadActivities();
              }
            }
          } else {
            // Seleccionar automáticamente el primer tema
            const firstTema = response.data[0];
            if (firstTema && firstTema.id) {
              this.selectedTemaId = firstTema.id;
              // Cargar las actividades del tema seleccionado
              this.loadActivities();
            }
          }
        } else {
          this.temas = [];
          this.activities = [];
          this.loading = false;
        }
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

  loadActivities() {
    if (!this.selectedTemaId) {
      this.activities = [];
      return;
    }

    this.loading = true;
    this.activityService.getActivitiesByTemaId(this.selectedTemaId).subscribe({
      next: (response) => {
        this.activities = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar actividades', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las actividades'
        });
        this.loading = false;
      }
    });
  }

  showCreateDialog() {
    this.activityForm.reset({
      temaId: this.selectedTemaId,
      title: ''
    });
    this.currentActivityId = null;
    this.displayCreateDialog = true;
  }

  showEditDialog(activity: Activity) {
    this.currentActivityId = activity.id;
    this.loading = true;
    
    this.activityService.getActivityById(activity.id).subscribe({
      next: (response) => {
        this.activityForm.patchValue({
          temaId: this.selectedTemaId,
          title: response.title
        });
        this.displayEditDialog = true;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar actividad'
        });
        console.error(err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  createActivity() {
    if (this.activityForm.valid) {
      this.loading = true;
      const data = this.activityForm.value;
      
      this.activityService.createActivity(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Actividad creada correctamente'
          });
          this.displayCreateDialog = false;
          this.loadActivities();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear actividad'
          });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  updateActivity() {
    if (this.activityForm.valid && this.currentActivityId) {
      const data = this.activityForm.value;
      this.loading = true;
      
      this.activityService.updateActivity(this.currentActivityId, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Actividad actualizada correctamente'
          });
          this.displayEditDialog = false;
          this.loadActivities();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar actividad'
          });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  confirmDelete(activity: Activity) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la actividad "${activity.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.deleteActivity(activity.id),
      reject: () => {}
    });
  }

  deleteActivity(activityId: number) {
    this.loading = true;
    this.activityService.deleteActivity(activityId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Actividad eliminada correctamente'
        });
        this.loadActivities();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar actividad'
        });
        console.error(err);
        this.loading = false;
      }
    });
  }

  hideDialog() {
    if (this.currentActivityId) {
      this.displayEditDialog = false;
    } else {
      this.displayCreateDialog = false;
    }
    this.currentActivityId = null;
    this.activityForm.reset();
  }

  navigateToExercises(activityId: number) {
    this.router.navigate(['/admin/exercises', activityId]);
  }
}
