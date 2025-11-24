import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { ChapterService } from '../../../core/services/chapter.service';
import { Chapter } from '../../../core/models/chapter.interface';
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
import { CourseService } from '../../../core/services/course.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chapters-list',
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
    BreadcrumbModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './chapters-list.component.html'
})
export class ChaptersListComponent implements OnInit {
  chapters: Chapter[] = [];
  loading: boolean = true;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  displayDetailsDialog: boolean = false;
  currentChapterId: number | null = null;
  selectedChapter: Chapter | null = null;
  chapterForm: FormGroup;
  courses: any[] = [];
  selectedCourseId: number | null = null;
  difficultyOptions = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Medio', value: 'Medio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  // Propiedades para el modal de generación con prompt
  displayGenerateDescriptionDialog: boolean = false;
  descriptionPrompt: string = '';
  generatedDescription: string = '';
  showDescriptionPreview: boolean = false;
  generatingDescription: boolean = false;

  breadcrumbItems = [
    { label: 'Cursos', routerLink: '/courses' },
    { label: 'Capítulos', routerLink: '/admin/chapters' }
  ];

  breadcrumbHome = { label: 'Panel principal', icon: 'pi pi-home', routerLink: '/dashboard' };

  @ViewChild('dt') dt!: Table;

  constructor(
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
    this.chapterForm = this.createForm();
  }

  ngOnInit() {
    // Leer el query parameter courseId si viene desde el modal de cursos
    const courseIdParam = this.route.snapshot.queryParams['courseId'];
    const courseIdFromUrl = courseIdParam ? parseInt(courseIdParam, 10) : null;

    // Cargar la lista de cursos para el filtro
    this.http.get<any>(`${environment.apiUrl}/courses/admin`).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.courses = response.data.map((course: any) => ({
            label: course.title,
            value: course.id
          }));

          // Si viene courseId desde URL, seleccionar ese curso
          if (courseIdFromUrl) {
            this.selectedCourseId = courseIdFromUrl;
          } else {
            // Seleccionar automáticamente el primer curso
            const firstCourse = response.data[0];
            if (firstCourse && firstCourse.id) {
              this.selectedCourseId = firstCourse.id;
            }
          }

          // Cargar los capítulos del curso seleccionado
          this.loadChapters();
        }
      },
      error: (err) => {
        console.error('Error al cargar cursos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la lista de cursos'
        });
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      courseId: ['', Validators.required],
      title: ['', Validators.required],
      shortDescription: ['', Validators.required],
      difficulty: ['Fácil', Validators.required]
    });
  }

  onCourseChange(event: any) {
    this.selectedCourseId = parseInt(event.target.value, 10);
    this.loadChapters();
  }

  loadChapters() {
    if (!this.selectedCourseId) {
      this.chapters = [];
      return;
    }

    this.loading = true;
    this.chapterService.getChaptersByCourseId(this.selectedCourseId).subscribe({
      next: (response) => {
        this.chapters = response.data;
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

  showCreateDialog() {
    this.chapterForm.reset({
      courseId: this.selectedCourseId,
      title: '',
      shortDescription: '',
      difficulty: 'Fácil'
    });
    this.currentChapterId = null;
    this.displayCreateDialog = true;
  }

  showEditDialog(chapter: Chapter) {
    this.currentChapterId = chapter.id;
    this.loading = true;
    
    this.chapterService.getChapterById(chapter.id).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.chapterForm.patchValue({
            courseId: response.data.courseId || this.selectedCourseId,
            title: response.data.title,
            shortDescription: response.data.shortDescription,
            difficulty: response.data.difficulty
          });
          this.displayEditDialog = true;
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar capítulo'
        });
        console.error(err);
      },
      complete: () => this.loading = false
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  createChapter() {
    if (this.chapterForm.valid) {
      this.loading = true;
      const data = this.chapterForm.value;
      
      this.chapterService.createChapter(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Capítulo creado correctamente'
          });
          this.displayCreateDialog = false;
          this.loadChapters();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear capítulo'
          });
          console.error(err);
        },
        complete: () => this.loading = false
      });
    }
  }

  updateChapter() {
    if (this.chapterForm.valid && this.currentChapterId) {
      const data = this.chapterForm.value;
      this.loading = true;
      
      this.chapterService.updateChapter(this.currentChapterId, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Capítulo actualizado correctamente'
          });
          this.displayEditDialog = false;
          this.loadChapters();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar capítulo'
          });
          console.error(err);
        },
        complete: () => this.loading = false
      });
    }
  }

  confirmDelete(chapter: Chapter) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el capítulo "${chapter.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.deleteChapter(chapter.id),
      reject: () => {}
    });
  }

  deleteChapter(chapterId: number) {
    this.loading = true;
    this.chapterService.deleteChapter(chapterId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Capítulo eliminado correctamente'
        });
        this.loadChapters();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar capítulo'
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
    if (this.currentChapterId) {
      this.displayEditDialog = false;
    } else {
      this.displayCreateDialog = false;
    }
    this.displayDetailsDialog = false;
    this.currentChapterId = null;
    this.selectedChapter = null;
    this.chapterForm.reset();
  }

  viewChapterDetails(chapter: Chapter) {
    this.selectedChapter = chapter;
    this.displayDetailsDialog = true;
  }

  onDetailsDialogHide() {
    this.displayDetailsDialog = false;
    this.selectedChapter = null;
  }

  navigateToThemes(chapter: Chapter) {
    // Navegar a la pantalla de temas/contenido del capítulo
    const courseId = chapter.courseId ?? this.selectedCourseId;
    const queryParams: any = { chapterId: chapter.id };

    if (courseId) {
      queryParams.courseId = courseId;
    }

    this.router.navigate(['/admin/temas'], { queryParams });
  }

  /**
   * Abre el modal para generar descripción con prompt personalizado
   */
  generateDescriptionWithAI() {
    const title = this.chapterForm.get('title')?.value;
    const courseId = this.chapterForm.get('courseId')?.value;
    
    if (!title) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, ingresa un título para el capítulo primero'
      });
      return;
    }

    if (!courseId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, selecciona un curso primero'
      });
      return;
    }

    // Resetear el modal
    this.descriptionPrompt = '';
    this.generatedDescription = '';
    this.showDescriptionPreview = false;
    this.displayGenerateDescriptionDialog = true;
  }

  /**
   * Genera la descripción basada en el prompt ingresado
   */
  generateDescriptionFromPrompt() {
    const title = this.chapterForm.get('title')?.value;
    const courseId = this.chapterForm.get('courseId')?.value;
    
    if (!this.descriptionPrompt.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, ingresa un prompt para generar la descripción'
      });
      return;
    }

    this.generatingDescription = true;

    // Obtener información del curso
    this.courseService.getCourseById(courseId).subscribe({
      next: (courseResponse: any) => {
        if (courseResponse && courseResponse.data) {
          const courseTitle = courseResponse.data.title;
          const courseDescription = courseResponse.data.description;

          // Generar descripción con prompt personalizado
          this.aiService.generateChapterDescriptionWithPrompt(
            title,
            courseTitle,
            courseDescription,
            this.descriptionPrompt
          ).subscribe({
            next: (response: any) => {
              if (response && response.data && response.data.description) {
                this.generatedDescription = response.data.description;
                this.showDescriptionPreview = true;
              }
              this.generatingDescription = false;
            },
            error: (err: any) => {
              console.error('Error al generar descripción', err);
              
              // Extraer mensaje de error del backend
              let errorMessage = 'Error al generar descripción con IA';
              let errorSummary = 'Error';
              let severity = 'error';
              
              // Verificar si es un error de contenido inapropiado
              if (err.error?.message) {
                errorMessage = err.error.message;
                
                // Si contiene "No es posible" es contenido inapropiado
                if (errorMessage.includes('No es posible')) {
                  errorSummary = '⚠️ Contenido No Permitido';
                  severity = 'warn';
                }
              } else if (err.message) {
                errorMessage = err.message;
              }
              
              this.messageService.add({
                severity: severity,
                summary: errorSummary,
                detail: errorMessage,
                life: 5000
              });
              
              this.generatingDescription = false;
            }
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
        this.generatingDescription = false;
      }
    });
  }

  /**
   * Aprueba la descripción generada y la coloca en el formulario
   */
  approveGeneratedDescription() {
    this.chapterForm.patchValue({
      shortDescription: this.generatedDescription
    });
    this.displayGenerateDescriptionDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Descripción aprobada y agregada'
    });
  }

  /**
   * Rechaza la descripción generada y limpia la previsualización
   */
  rejectGeneratedDescription() {
    this.generatedDescription = '';
    this.showDescriptionPreview = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Rechazado',
      detail: 'Descripción rechazada. Puedes modificar el prompt e intentar de nuevo'
    });
  }

  /**
   * Cierra el modal de generación
   */
  closeGenerateDescriptionDialog() {
    this.displayGenerateDescriptionDialog = false;
    this.descriptionPrompt = '';
    this.generatedDescription = '';
    this.showDescriptionPreview = false;
  }
}
