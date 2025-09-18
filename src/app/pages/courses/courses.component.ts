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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Button } from "primeng/button";
import { environment } from 'src/environments/environment';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AiService } from '../../core/services/ai.service';

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
    DialogModule,
    CheckboxModule,
    ReactiveFormsModule,
    Button,
    ConfirmDialogModule
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading: boolean = true;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  newCourse: any = {
    title: '',
    description: '',
    urlLogo: '',
    isPublic: true
  };
  currentCourseId: string | null = null;
  courseForm: FormGroup;

  @ViewChild('dt') dt!: Table;

  constructor(
    private courseService: CourseService,
    private fb: FormBuilder,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private aiService: AiService
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      urlLogo: ['', Validators.required],
      isPublic: [false]
    });
  }

  ngOnInit() {
    this.courseService.getCourses().subscribe({
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
      urlLogo: '',
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
    this.courseService.getCourses().subscribe({
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
