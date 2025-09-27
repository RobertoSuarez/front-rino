import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CourseService } from '../../core/services/course.service';
import { ApiCourseResponse, Course } from '../../core/models/course.model';
import { GetCourseByIdResponse } from '../../models/course.model';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AiService } from '../../core/services/ai.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-courses',
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
    ButtonModule,
    DialogModule,
    CheckboxModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    BreadcrumbModule,
    RouterModule,
    TooltipModule
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading: boolean = true;
  displayDetailsDialog: boolean = false;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  selectedCourse: any = null;
  newCourse: any = {
    title: '',
    description: '',
    urlLogo: '',
    isPublic: true
  };
  currentCourseId: string | null = null;
  courseForm: FormGroup;

  defaultImages: string[] = [
    'https://i.ibb.co/chdPzT1f/Quiero-un-logo-para-mi-aplicaci-n-web-gamificada-para-ense-ar-cyberseguridad.jpg',
    'https://i.ibb.co/YBRnQLst/quiero-que-me-ayudes-creando-una-imagen-que-pueda-usar-de-portada-para-un-curso-de-varios-que-tengo.jpg',
    'https://i.ibb.co/hPLvgjc/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/mdBjLyJ/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/77tzGmy/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/932zmNVD/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg',
    'https://i.ibb.co/gZLQn5Jg/generame-imagenes-para-cursos-de-ciberseguridad-gamificados-para-estudiantes-de-educaci-n-general-b.jpg'
  ];

  uploadedImages: string[] = []; // Array para imágenes subidas dinámicamente

  breadcrumbItems = [
    { label: 'Cursos', routerLink: '/courses' }
  ];

  breadcrumbHome = { label: 'Panel principal', icon: 'pi pi-home', routerLink: '/dashboard' };

  @ViewChild('dt') dt!: Table;

  constructor(
    private courseService: CourseService,
    private fb: FormBuilder,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private aiService: AiService
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      urlLogo: ['', Validators.required],
      isPublic: [false]
    });
  }

  get dialogVisible(): boolean {
    return this.displayCreateDialog || this.displayEditDialog;
  }

  ngOnInit() {
    this.courseService.getCoursesForAdmin().subscribe({
      next: (response) => {
        this.courses = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar cursos', err);
        this.loading = false;
      }
    });
  }

  showCreateDialog() {
    this.courseForm.setValue({
      title: '',
      description: '',
      urlLogo: this.defaultImages[0], // Set default image
      isPublic: false
    });
    this.currentCourseId = null;
    this.displayCreateDialog = true;
  }

  showEditDialog(course: any) {
    this.currentCourseId = course.id;
    this.loading = true;
    
    this.http.get<GetCourseByIdResponse>(`${environment.apiUrl}/courses/${course.id}`)
      .subscribe({
        next: (response) => {
          this.courseForm.patchValue({
            title: response.data.title,
            description: response.data.description,
            urlLogo: response.data.urlLogo,
            isPublic: response.data.isPublic
          });
          
          // Si la imagen actual no está en las imágenes prediseñadas, agregarla como subida
          const currentImageUrl = response.data.urlLogo;
          if (currentImageUrl && !this.defaultImages.includes(currentImageUrl) && !this.uploadedImages.includes(currentImageUrl)) {
            this.uploadedImages.push(currentImageUrl);
          }
          
          this.displayEditDialog = true;
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al cargar curso'});
          console.error(err);
        },
        complete: () => this.loading = false
      });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  createCourse() {
    if (this.courseForm.valid) {
      this.loading = true;
      var data = this.courseForm.value;
      this.http.post(`${environment.apiUrl}/courses`, data)
        .subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary:'Éxito', detail:'Curso creado correctamente'});
            this.displayCreateDialog = false;
            this.loadCourses(); // Recargar lista
          },
          error: (err) => {
            this.messageService.add({severity:'error', summary:'Error', detail:'Error al crear curso'});
            console.error(err);
          },
          complete: () => this.loading = false
        });
    }
  }
  
  loadCourses() {
    this.courseService.getCoursesForAdmin().subscribe({
      next: (response) => {
        this.courses = response.data;
      },
      error: (err) => {
        console.error('Error al cargar cursos', err);
      }
    });
  }

  updateCourse() {
    if (this.courseForm.valid && this.currentCourseId) {
      var data = this.courseForm.value;
      this.loading = true;
      this.http.patch(`${environment.apiUrl}/courses/${this.currentCourseId}`, data)
        .subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary:'Éxito', detail:'Curso actualizado correctamente'});
            this.displayEditDialog = false;
            this.loadCourses();
          },
          error: (err) => {
            this.messageService.add({severity:'error', summary:'Error', detail:'Error al actualizar curso'});
            console.error(err);
          },
          complete: () => this.loading = false
        });
    }
  }

  confirmDelete(course: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el curso "${course.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.deleteCourse(course.id),
      reject: () => {}
    });
  }

  deleteCourse(courseId: string) {
    this.loading = true;
    this.http.delete(`${environment.apiUrl}/courses/${courseId}`)
      .subscribe({
        next: () => {
          this.messageService.add({severity:'success', summary:'Éxito', detail:'Curso eliminado correctamente'});
          this.loadCourses();
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al eliminar curso'});
          console.error(err);
        },
        complete: () => this.loading = false
      });
  }

  selectImage(imageUrl: string) {
    this.courseForm.patchValue({
      urlLogo: imageUrl
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;
      
      const formData = new FormData();
      formData.append('file', file);

      this.http.post(`${environment.apiUrl}/courses/upload-image`, formData)
        .subscribe({
          next: (response: any) => {
            if (response && response.data.url) {
              // Agregar la imagen subida al array de imágenes disponibles
              this.uploadedImages.push(response.data.url);
              this.defaultImages = [...this.defaultImages, response.data.url];
              
              // Seleccionar automáticamente la imagen subida
              this.courseForm.patchValue({
                urlLogo: response.data.url
              });
              
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Imagen subida correctamente'
              });
            }
          },
          error: (err) => {
            console.error('Error al subir imagen', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al subir la imagen'
            });
          },
          complete: () => this.loading = false
        });
    }
  }

  /**
   * Maneja el cierre del diálogo, tanto para creación como para edición
   */
  hideDialog() {
    if (this.currentCourseId) {
      this.displayEditDialog = false;
    } else {
      this.displayCreateDialog = false;
    }
    this.currentCourseId = null;
    this.courseForm.reset();
    // Limpiar las imágenes subidas cuando se cierra el diálogo
    this.uploadedImages = [];
  }

  onDialogHide(visible: boolean) {
    if (!visible) {
      this.hideDialog();
    }
  }

  onDetailsDialogHide(event?: any) {
    this.displayDetailsDialog = false;
    this.selectedCourse = null;
  }

  viewCourseDetails(course: any) {
    this.selectedCourse = course;
    this.displayDetailsDialog = true; // Mostrar modal inmediatamente
    this.loading = true;

    this.http.get<GetCourseByIdResponse>(`${environment.apiUrl}/courses/${course.id}`)
      .subscribe({
        next: (response) => {
          // Combinar datos existentes con datos adicionales
          this.selectedCourse = { ...this.selectedCourse, ...response.data };
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al cargar detalles del curso'});
        },
        complete: () => this.loading = false
      });
  }

  navigateToChapters(course: any) {
    // Navegar a la pantalla de capítulos del admin con el courseId como query parameter
    this.router.navigate(['/admin/chapters'], {
      queryParams: { courseId: course.id }
    });
  }

  /**
   * Genera una descripción para el curso utilizando IA
   */
  generateDescriptionWithAI() {
    const title = this.courseForm.get('title')?.value;
    
    if (!title) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, ingresa un título para el curso primero'
      });
      return;
    }

    this.loading = true;
    this.messageService.add({
      severity: 'info',
      summary: 'Generando',
      detail: 'Generando descripción con IA...'
    });

    this.aiService.generateCourseDescription(title).subscribe({
      next: (response) => {
        if (response && response.data.description) {
          this.courseForm.patchValue({
            description: response.data.description
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Descripción generada correctamente'
          });
        }
      },
      error: (err) => {
        console.error('Error al generar descripción', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar descripción con IA'
        });
      },
      complete: () => this.loading = false
    });
  }
}
