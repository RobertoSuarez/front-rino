import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { PickListModule } from 'primeng/picklist';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { LearningPathService, CreateLearningPathDto, UpdateLearningPathDto } from '../../../core/services/learning-path.service';
import { CourseService } from '../../../core/services/course.service';

interface Course {
  id: number;
  title: string;
  code: string;
  urlLogo: string;
}

@Component({
  selector: 'app-learning-path-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    CardModule,
    RippleModule,
    PickListModule,
    BreadcrumbModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './learning-path-form.component.html',
  styleUrl: './learning-path-form.component.css'
})
export class LearningPathFormComponent implements OnInit, OnDestroy {
  learningPathForm: FormGroup;
  isEditMode = false;
  learningPathId: number | null = null;
  saving = false;
  loadingCourses = false;
  formSubmitted = false;

  availableCourses: Course[] = [];
  selectedCourses: Course[] = [];
  allCourses: Course[] = [];

  breadcrumbItems: any[] = [];
  breadcrumbHome = { label: 'Panel principal', icon: 'pi pi-home', routerLink: '/dashboard' };

  constructor(
    private fb: FormBuilder,
    private learningPathService: LearningPathService,
    private courseService: CourseService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.learningPathForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Limpiar arrays al inicializar
    this.availableCourses = [];
    this.selectedCourses = [];
    this.allCourses = [];
    
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.learningPathId = parseInt(id, 10);
    }
    
    this.breadcrumbItems = [
      { label: 'Administración' },
      { label: 'Rutas de Aprendizaje', routerLink: '/admin/learning-paths' },
      { label: this.isEditMode ? 'Editar Ruta' : 'Nueva Ruta' }
    ];
    
    this.loadCourses();
  }

  ngOnDestroy(): void {
    // Limpiar arrays al destruir el componente
    this.availableCourses = [];
    this.selectedCourses = [];
    this.allCourses = [];
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCoursesForAdmin().subscribe({
      next: (response) => {
        this.allCourses = response.data.map((course: any) => ({
          id: course.id,
          title: course.title,
          code: course.code,
          urlLogo: course.urlLogo
        }));
        
        // Si estamos en modo edición, cargar la ruta después de tener los cursos
        if (this.isEditMode && this.learningPathId) {
          this.loadLearningPath(this.learningPathId);
        } else {
          // Si es modo creación, todos los cursos están disponibles
          this.availableCourses = [...this.allCourses];
        }
        
        this.loadingCourses = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los cursos'
        });
        this.loadingCourses = false;
      }
    });
  }

  loadLearningPath(id: number): void {
    this.learningPathService.getById(id).subscribe({
      next: (response) => {
        const path = response.data;
        
        // Llenar el formulario
        this.learningPathForm.patchValue({
          name: path.name,
          description: path.description,
          isActive: path.isActive
        });

        // Configurar cursos seleccionados
        this.selectedCourses = path.courses.map(course => ({
          id: course.id,
          title: course.title,
          code: course.code,
          urlLogo: course.urlLogo
        }));

        // Actualizar cursos disponibles
        const selectedIds = this.selectedCourses.map(c => c.id);
        this.availableCourses = this.allCourses.filter(c => !selectedIds.includes(c.id));
      },
      error: (error) => {
        console.error('Error al cargar ruta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la ruta de aprendizaje'
        });
        this.router.navigate(['/admin/learning-paths']);
      }
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.learningPathForm.invalid) {
      Object.keys(this.learningPathForm.controls).forEach(key => {
        this.learningPathForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    if (this.selectedCourses.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes seleccionar al menos un curso'
      });
      return;
    }

    const formValue = this.learningPathForm.value;
    const courseIds = this.selectedCourses.map(c => c.id);

    if (this.isEditMode && this.learningPathId) {
      this.updateLearningPath(formValue, courseIds);
    } else {
      this.createLearningPath(formValue, courseIds);
    }
  }

  createLearningPath(formValue: any, courseIds: number[]): void {
    this.saving = true;
    const payload: CreateLearningPathDto = {
      name: formValue.name,
      description: formValue.description,
      courseIds: courseIds,
      isActive: formValue.isActive
    };

    this.learningPathService.create(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ruta de aprendizaje creada correctamente'
        });
        this.saving = false;
        setTimeout(() => {
          this.router.navigate(['/admin/learning-paths']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error al crear ruta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo crear la ruta de aprendizaje'
        });
        this.saving = false;
      }
    });
  }

  updateLearningPath(formValue: any, courseIds: number[]): void {
    if (!this.learningPathId) return;

    this.saving = true;
    const payload: UpdateLearningPathDto = {
      name: formValue.name,
      description: formValue.description,
      courseIds: courseIds,
      isActive: formValue.isActive
    };

    this.learningPathService.update(this.learningPathId, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ruta de aprendizaje actualizada correctamente'
        });
        this.saving = false;
        setTimeout(() => {
          this.router.navigate(['/admin/learning-paths']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error al actualizar ruta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo actualizar la ruta de aprendizaje'
        });
        this.saving = false;
      }
    });
  }
}
