import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { ExerciseService } from '../../../core/services/exercise.service';
import { ActivityService } from '../../../core/services/activity.service';
import { ExerciseListItem } from '../../../core/models/exercise.interface';
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
import { ButtonModule } from "primeng/button";
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SelectionSingleComponent } from './components/selection-single.component';
import { SelectionMultipleComponent } from './components/selection-multiple.component';
import { OrderFragmentCodeComponent } from './components/order-fragment-code.component';
import { OrderLineCodeComponent } from './components/order-line-code.component';
import { WriteCodeComponent } from './components/write-code.component';
import { FindErrorCodeComponent } from './components/find-error-code.component';

@Component({
  selector: 'app-exercises-list',
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
    SelectionSingleComponent,
    SelectionMultipleComponent,
    OrderFragmentCodeComponent,
    OrderLineCodeComponent,
    WriteCodeComponent,
    FindErrorCodeComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './exercises-list.component.html',
  styles: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExercisesListComponent implements OnInit {
  exercises: ExerciseListItem[] = [];
  loading: boolean = true;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  currentExerciseId: number | null = null;
  exerciseForm: FormGroup;
  activityId: number | null = null;
  activityTitle: string = '';
  exerciseTypeData: any = {};
  
  // Parámetros para volver a la página de actividades
  returnCourseId: number | null = null;
  returnChapterId: number | null = null;
  returnTemaId: number | null = null;
  
  exerciseTypes = [
    { label: 'Selección Simple', value: 'selection_single' },
    { label: 'Selección Múltiple', value: 'selection_multiple' },
    { label: 'Ordenar Fragmentos de Código', value: 'order_fragment_code' },
    { label: 'Ordenar Líneas de Código', value: 'order_line_code' },
    { label: 'Escribir Código', value: 'write_code' },
    { label: 'Encontrar Error en Código', value: 'find_error_code' }
  ];

  difficultyOptions = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Medio', value: 'Medio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  @ViewChild('dt') dt!: Table;

  constructor(
    private exerciseService: ExerciseService,
    private activityService: ActivityService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.exerciseForm = this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['activityId']) {
        this.activityId = +params['activityId'];
        this.loadActivityDetails();
        this.loadExercises();
      }
    });
    
    // Obtener los parámetros de retorno de la URL si existen
    this.route.queryParams.subscribe(params => {
      if (params['returnCourseId']) {
        this.returnCourseId = +params['returnCourseId'];
      }
      
      if (params['returnChapterId']) {
        this.returnChapterId = +params['returnChapterId'];
      }
      
      if (params['returnTemaId']) {
        this.returnTemaId = +params['returnTemaId'];
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      activityId: ['', Validators.required],
      statement: ['', Validators.required],
      code: [''],
      difficulty: ['Fácil', Validators.required],
      hind: ['', Validators.required],
      typeExercise: ['selection_single', Validators.required],
      optionSelectOptions: [[]],
      optionOrderFragmentCode: [[]],
      optionOrderLineCode: [[]],
      optionsFindErrorCode: [[]],
      answerSelectCorrect: [''],
      answerSelectsCorrect: [[]],
      answerOrderFragmentCode: [[]],
      answerOrderLineCode: [[]],
      answerFindError: ['']
    });
  }

  loadActivityDetails() {
    if (!this.activityId) return;

    this.loading = true;
    this.activityService.getActivityById(this.activityId).subscribe({
      next: (activity) => {
        this.activityTitle = activity.title;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles de la actividad', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar detalles de la actividad'
        });
        this.loading = false;
      }
    });
  }

  loadExercises() {
    if (!this.activityId) return;

    this.loading = true;
    // Pasamos 0 como temaId para no filtrar por tema y solo por actividad
    // El formato 'actividadX' ahora es interpretado correctamente por el backend
    this.exerciseService.getExercisesByTemaId(this.activityId).subscribe({
      next: (response) => {
        this.exercises = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar ejercicios', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los ejercicios'
        });
        this.loading = false;
      }
    });
  }

  showCreateDialog() {
    this.exerciseForm.reset({
      activityId: this.activityId,
      statement: '',
      code: '',
      difficulty: 'Fácil',
      hind: '',
      typeExercise: 'selection_single',
      optionSelectOptions: [],
      optionOrderFragmentCode: [],
      optionOrderLineCode: [],
      optionsFindErrorCode: [],
      answerSelectCorrect: '',
      answerSelectsCorrect: [],
      answerOrderFragmentCode: [],
      answerOrderLineCode: [],
      answerFindError: ''
    });
    this.currentExerciseId = null;
    this.displayCreateDialog = true;
  }

  showEditDialog(exercise: ExerciseListItem) {
    this.currentExerciseId = exercise.id;
    this.loading = true;
    
    this.exerciseService.getExerciseById(exercise.id).subscribe({
      next: (response) => {
        this.exerciseForm.patchValue({
          activityId: response.activityId,
          statement: response.statement,
          code: response.code,
          difficulty: response.difficulty,
          hind: response.hind,
          typeExercise: response.typeExercise,
          optionSelectOptions: response.optionSelectOptions,
          optionOrderFragmentCode: response.optionOrderFragmentCode,
          optionOrderLineCode: response.optionOrderLineCode,
          optionsFindErrorCode: response.optionsFindErrorCode,
          answerSelectCorrect: response.answerSelectCorrect,
          answerSelectsCorrect: response.answerSelectsCorrect,
          answerOrderFragmentCode: response.answerOrderFragmentCode,
          answerOrderLineCode: response.answerOrderLineCode,
          answerFindError: response.answerFindError
        });
        
        // Cargar datos para el componente específico
        this.exerciseTypeData = response;
        
        this.displayEditDialog = true;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar ejercicio'
        });
        console.error(err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onExerciseTypeChange() {
    // Limpiar datos del tipo anterior
    this.exerciseTypeData = {};
    
    // Limpiar campos específicos según el tipo de ejercicio seleccionado
    const typeExercise = this.exerciseForm.get('typeExercise')?.value;
    
    switch (typeExercise) {
      case 'selection_single':
        this.exerciseForm.patchValue({
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerFindError: ''
        });
        break;
      case 'selection_multiple':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerFindError: ''
        });
        break;
      case 'order_fragment_code':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderLineCode: [],
          answerFindError: ''
        });
        break;
      case 'order_line_code':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerFindError: ''
        });
        break;
      case 'write_code':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerFindError: ''
        });
        break;
      case 'find_error_code':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: []
        });
        break;
    }
  }

  onExerciseDataChange(data: any) {
    // Actualizar el formulario con los datos del componente específico
    this.exerciseForm.patchValue({
      optionSelectOptions: data.optionSelectOptions || [],
      optionOrderFragmentCode: data.optionOrderFragmentCode || [],
      optionOrderLineCode: data.optionOrderLineCode || [],
      optionsFindErrorCode: data.optionsFindErrorCode || [],
      answerSelectCorrect: data.answerSelectCorrect || '',
      answerSelectsCorrect: data.answerSelectsCorrect || [],
      answerOrderFragmentCode: data.answerOrderFragmentCode || [],
      answerOrderLineCode: data.answerOrderLineCode || [],
      answerFindError: data.answerFindError || '',
      code: data.code || this.exerciseForm.get('code')?.value || ''
    });
  }

  createExercise() {
    if (this.exerciseForm.valid) {
      this.loading = true;
      const data = this.exerciseForm.value;
      
      this.exerciseService.createExercise(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ejercicio creado correctamente'
          });
          this.displayCreateDialog = false;
          this.loadExercises();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear ejercicio'
          });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  updateExercise() {
    if (this.exerciseForm.valid && this.currentExerciseId) {
      const data = this.exerciseForm.value;
      this.loading = true;
      
      this.exerciseService.updateExercise(this.currentExerciseId, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ejercicio actualizado correctamente'
          });
          this.displayEditDialog = false;
          this.loadExercises();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar ejercicio'
          });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  confirmDelete(exercise: ExerciseListItem) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el ejercicio "${exercise.statement}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.deleteExercise(exercise.id),
      reject: () => {}
    });
  }

  deleteExercise(exerciseId: number) {
    this.loading = true;
    this.exerciseService.deleteExercise(exerciseId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ejercicio eliminado correctamente'
        });
        this.loadExercises();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar ejercicio'
        });
        console.error(err);
        this.loading = false;
      }
    });
  }

  hideDialog() {
    if (this.currentExerciseId) {
      this.displayEditDialog = false;
    } else {
      this.displayCreateDialog = false;
    }
    this.currentExerciseId = null;
    this.exerciseForm.reset();
  }
  
  /**
   * Navega de vuelta a la página de actividades preservando el estado
   */
  navigateBackToActivities() {
    const queryParams: any = {};
    
    if (this.returnCourseId) {
      queryParams.courseId = this.returnCourseId;
    }
    
    if (this.returnChapterId) {
      queryParams.chapterId = this.returnChapterId;
    }
    
    if (this.returnTemaId) {
      queryParams.temaId = this.returnTemaId;
    }
    
    this.router.navigate(['/admin/activities'], {
      queryParams
    });
  }
}
