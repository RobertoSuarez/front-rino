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
    PickListModule
  ],
  providers: [MessageService],
  template: `
    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <div class="card px-6 py-6">
          <p-toast></p-toast>
          
          <div class="mb-4">
            <h2 class="text-2xl font-bold text-900 mb-0">
              {{ isEditMode ? 'Editar Ruta de Aprendizaje' : 'Nueva Ruta de Aprendizaje' }}
            </h2>
            <p class="text-600 mt-1">
              {{ isEditMode ? 'Modifica los datos de la ruta de aprendizaje' : 'Crea una nueva ruta de aprendizaje' }}
            </p>
          </div>

          <form [formGroup]="learningPathForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-12 gap-4">
              <!-- Información básica -->
              <div class="col-span-12">
                <p-card>
                  <ng-template pTemplate="header">
                    <div class="px-4 pt-4">
                      <h3 class="text-xl font-semibold text-900 mb-0">Información Básica</h3>
                    </div>
                  </ng-template>
                  
                  <div class="grid grid-cols-12 gap-4">
                    <!-- Nombre -->
                    <div class="col-span-12 md:col-span-6">
                      <label for="name" class="block text-900 font-medium mb-2">
                        Nombre <span class="text-red-500">*</span>
                      </label>
                      <input 
                        id="name"
                        type="text" 
                        pInputText 
                        formControlName="name"
                        placeholder="Ej: Fundamentos de Ciberseguridad"
                        class="w-full"
                        [class.ng-invalid]="learningPathForm.get('name')?.invalid && learningPathForm.get('name')?.touched"
                        [class.ng-dirty]="learningPathForm.get('name')?.touched" />
                      <small 
                        class="text-red-500" 
                        *ngIf="learningPathForm.get('name')?.invalid && learningPathForm.get('name')?.touched">
                        El nombre es requerido
                      </small>
                    </div>

                    <!-- Estado -->
                    <div class="col-span-12 md:col-span-6">
                      <label class="block text-900 font-medium mb-2">Estado</label>
                      <div class="flex align-items-center">
                        <p-checkbox 
                          formControlName="isActive"
                          [binary]="true"
                          inputId="isActive">
                        </p-checkbox>
                        <label for="isActive" class="ml-2">Ruta activa</label>
                      </div>
                      <small class="text-600">
                        Las rutas activas estarán disponibles para los estudiantes
                      </small>
                    </div>

                    <!-- Descripción -->
                    <div class="col-span-12">
                      <label for="description" class="block text-900 font-medium mb-2">
                        Descripción <span class="text-red-500">*</span>
                      </label>
                      <textarea 
                        id="description"
                        formControlName="description"
                        placeholder="Describe el objetivo y contenido de esta ruta de aprendizaje..."
                        rows="4"
                        class="w-full p-3 border-1 surface-border border-round"
                        [class.border-red-500]="learningPathForm.get('description')?.invalid && learningPathForm.get('description')?.touched">
                      </textarea>
                      <small 
                        class="text-red-500" 
                        *ngIf="learningPathForm.get('description')?.invalid && learningPathForm.get('description')?.touched">
                        La descripción es requerida
                      </small>
                    </div>
                  </div>
                </p-card>
              </div>

              <!-- Selección de cursos -->
              <div class="col-span-12">
                <p-card>
                  <ng-template pTemplate="header">
                    <div class="px-4 pt-4">
                      <h3 class="text-xl font-semibold text-900 mb-0">Cursos de la Ruta</h3>
                      <p class="text-600 mt-1 text-sm">Selecciona los cursos que formarán parte de esta ruta</p>
                    </div>
                  </ng-template>
                  
                  <div *ngIf="loadingCourses" class="text-center py-4">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
                    <p class="text-600 mt-2">Cargando cursos...</p>
                  </div>

                  <p-pickList 
                    *ngIf="!loadingCourses"
                    [source]="availableCourses" 
                    [target]="selectedCourses"
                    sourceHeader="Cursos Disponibles" 
                    targetHeader="Cursos Seleccionados"
                    [dragdrop]="true"
                    [responsive]="true"
                    [sourceStyle]="{ height: '400px' }"
                    [targetStyle]="{ height: '400px' }"
                    filterBy="title"
                    sourceFilterPlaceholder="Buscar curso"
                    targetFilterPlaceholder="Buscar curso"
                    breakpoint="1400px">
                    
                    <ng-template let-course pTemplate="item">
                      <div class="flex align-items-center gap-3 p-2">
                        <img 
                          *ngIf="course.urlLogo" 
                          [src]="course.urlLogo" 
                          [alt]="course.title"
                          class="w-12 h-12 border-round"
                          style="object-fit: cover;">
                        <div class="flex-1">
                          <div class="font-semibold">{{ course.title }}</div>
                          <div class="text-sm text-600">{{ course.code }}</div>
                        </div>
                      </div>
                    </ng-template>
                  </p-pickList>

                  <small 
                    class="text-red-500 block mt-2" 
                    *ngIf="selectedCourses.length === 0 && formSubmitted">
                    Debes seleccionar al menos un curso
                  </small>
                </p-card>
              </div>

              <!-- Botones de acción -->
              <div class="col-span-12">
                <div class="flex gap-2 justify-content-end">
                  <button 
                    pButton 
                    pRipple 
                    label="Cancelar" 
                    icon="pi pi-times" 
                    class="p-button-text"
                    type="button"
                    routerLink="/admin/learning-paths">
                  </button>
                  <button 
                    pButton 
                    pRipple 
                    [label]="isEditMode ? 'Actualizar' : 'Crear'" 
                    icon="pi pi-check" 
                    class="p-button-success"
                    type="submit"
                    [disabled]="saving">
                    <i *ngIf="saving" class="pi pi-spin pi-spinner mr-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
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
