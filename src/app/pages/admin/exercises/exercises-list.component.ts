import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { ExerciseService } from '../../../core/services/exercise.service';
import { ActivityService } from '../../../core/services/activity.service';
import { ExerciseListItem, CreateExerciseRequest } from '../../../core/models/exercise.interface';
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
import { VerticalOrderingComponent } from './components/vertical-ordering.component';
import { HorizontalOrderingComponent } from './components/horizontal-ordering.component';
import { PhishingSelectionMultipleComponent } from './components/phishing-selection-multiple.component';
import { MatchPairsComponent } from './components/match-pairs.component';
import { GenerateExercisesDialogComponent } from './components/generate-exercises-dialog.component';
import { GeneratedExercise } from '../../../core/services/exercise-generation.service';

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
    VerticalOrderingComponent,
    HorizontalOrderingComponent,
    PhishingSelectionMultipleComponent,
    MatchPairsComponent,
    GenerateExercisesDialogComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './exercises-list.component.html',
  styles: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExercisesListComponent implements OnInit {
  exercises: ExerciseListItem[] = [];
  loading: boolean = true;
  displayDialog: boolean = false; // Reemplaza a displayCreateDialog y displayEditDialog
  currentExerciseId: number | null = null;
  exerciseForm: FormGroup;
  activityId: number | null = null;
  activityTitle: string = '';
  exerciseTypeData: any = {};

  // Parámetros para volver a la página de actividades
  returnCourseId: number | null = null;
  returnChapterId: number | null = null;
  returnTemaId: number | null = null;

  // Tipos de ejercicios disponibles
  // - selection_single: El usuario selecciona UNA opción correcta (múltiple choice)
  // - selection_multiple: El usuario selecciona VARIAS opciones correctas (checkboxes)
  // - vertical_ordering: El usuario ordena elementos verticalmente (drag & drop)
  // - horizontal_ordering: El usuario ordena elementos horizontalmente (drag & drop)
  // - phishing_selection_multiple: El usuario identifica emails de phishing (selección múltiple)
  // - match_pairs: El usuario empareja conceptos de dos columnas (matching)
  exerciseTypes = [
    { label: 'Selección Simple', value: 'selection_single' },
    { label: 'Selección Múltiple', value: 'selection_multiple' },
    { label: 'Ordenamiento Vertical', value: 'vertical_ordering' },
    { label: 'Ordenamiento Horizontal', value: 'horizontal_ordering' },
    { label: 'Detección de Phishing', value: 'phishing_selection_multiple' },
    { label: 'Emparejar Conceptos', value: 'match_pairs' }
  ];

  difficultyOptions = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Medio', value: 'Medio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  @ViewChild('dt') dt!: Table;
  @ViewChild(GenerateExercisesDialogComponent) generateDialog!: GenerateExercisesDialogComponent;

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
      answerFindError: [''],
      answerWriteCode: [''],
      optionsVerticalOrdering: [[]],
      answerVerticalOrdering: [[]],
      optionsHorizontalOrdering: [[]],
      answerHorizontalOrdering: [[]],
      optionsPhishingSelection: [[]],
      answerPhishingSelection: [[]],
      phishingContext: [''],
      phishingImageUrl: [''],
      optionsMatchPairsLeft: [[]],
      optionsMatchPairsRight: [[]],
      answerMatchPairs: [[]]
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
      answerFindError: '',
      answerWriteCode: '',
      optionsVerticalOrdering: [],
      answerVerticalOrdering: [],
      optionsHorizontalOrdering: [],
      answerHorizontalOrdering: [],
      optionsPhishingSelection: [],
      answerPhishingSelection: [],
      phishingContext: '',
      phishingImageUrl: '',
      optionsMatchPairsLeft: [],
      optionsMatchPairsRight: [],
      answerMatchPairs: []
    });
    this.currentExerciseId = null;
    this.displayDialog = true;
  }

  showEditDialog(exercise: ExerciseListItem) {
    this.currentExerciseId = exercise.id;
    this.loading = true;

    this.exerciseService.getExerciseById(exercise.id).subscribe({
      next: (response: any) => {
        // Normalizar datos: el backend a veces devuelve optionSelectionOptions en lugar de optionSelectOptions
        const normalizedData = {
          ...response,
          optionSelectOptions: response.optionSelectionOptions || response.optionSelectOptions || []
        };

        this.exerciseForm.patchValue({
          activityId: response.activityId,
          statement: response.statement,
          code: response.code,
          difficulty: response.difficulty,
          hind: response.hind,
          typeExercise: response.typeExercise,
          optionSelectOptions: normalizedData.optionSelectOptions,
          optionOrderFragmentCode: response.optionOrderFragmentCode,
          optionOrderLineCode: response.optionOrderLineCode,
          optionsFindErrorCode: response.optionsFindErrorCode,
          answerSelectCorrect: response.answerSelectCorrect,
          answerSelectsCorrect: response.answerSelectsCorrect,
          answerOrderFragmentCode: response.answerOrderFragmentCode,
          answerOrderLineCode: response.answerOrderLineCode,
          answerFindError: response.answerFindError,
          answerWriteCode: response.answerWriteCode,
          optionsVerticalOrdering: response.optionsVerticalOrdering,
          answerVerticalOrdering: response.answerVerticalOrdering,
          optionsHorizontalOrdering: response.optionsHorizontalOrdering,
          answerHorizontalOrdering: response.answerHorizontalOrdering,
          optionsPhishingSelection: response.optionsPhishingSelection,
          answerPhishingSelection: response.answerPhishingSelection,
          phishingContext: response.phishingContext,
          phishingImageUrl: response.phishingImageUrl,
          optionsMatchPairsLeft: response.optionsMatchPairsLeft,
          optionsMatchPairsRight: response.optionsMatchPairsRight,
          answerMatchPairs: response.answerMatchPairs
        });

        // Cargar datos para el componente específico usando los datos normalizados
        this.exerciseTypeData = normalizedData;

        this.displayDialog = true;
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

  /**
   * Se ejecuta cuando el usuario cambia el tipo de ejercicio
   * Limpia los campos específicos del tipo anterior y prepara los campos para el nuevo tipo
   */
  onExerciseTypeChange() {
    // Limpiar datos del tipo anterior
    this.exerciseTypeData = {};

    // Limpiar campos específicos según el tipo de ejercicio seleccionado
    const typeExercise = this.exerciseForm.get('typeExercise')?.value;

    switch (typeExercise) {
      // SELECCIÓN SIMPLE: Una respuesta correcta
      case 'selection_single':
        this.exerciseForm.patchValue({
          answerSelectsCorrect: []
        });
        break;

      // SELECCIÓN MÚLTIPLE: Varias respuestas correctas
      case 'selection_multiple':
        this.exerciseForm.patchValue({
          answerSelectCorrect: ''
        });
        break;

      // ORDENAMIENTO VERTICAL: Ordenar elementos verticalmente
      case 'vertical_ordering':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerFindError: '',
          answerWriteCode: '',
          answerHorizontalOrdering: [],
          answerPhishingSelection: [],
          answerMatchPairs: []
        });
        break;

      // ORDENAMIENTO HORIZONTAL: Ordenar elementos horizontalmente
      case 'horizontal_ordering':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerFindError: '',
          answerWriteCode: '',
          answerVerticalOrdering: [],
          answerPhishingSelection: [],
          answerMatchPairs: []
        });
        break;

      // DETECCIÓN DE PHISHING: Identificar emails de phishing
      case 'phishing_selection_multiple':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerFindError: '',
          answerWriteCode: '',
          answerVerticalOrdering: [],
          answerHorizontalOrdering: [],
          answerMatchPairs: []
        });
        break;

      // EMPAREJAR CONCEPTOS: Conectar elementos de dos columnas
      case 'match_pairs':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '',
          answerSelectsCorrect: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerFindError: '',
          answerWriteCode: '',
          answerVerticalOrdering: [],
          answerHorizontalOrdering: [],
          answerPhishingSelection: []
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
      answerWriteCode: data.answerWriteCode || '',
      code: data.code || this.exerciseForm.get('code')?.value || '',
      // Nuevos campos para los 4 tipos adicionales
      optionsVerticalOrdering: data.optionsVerticalOrdering || [],
      answerVerticalOrdering: data.answerVerticalOrdering || [],
      optionsHorizontalOrdering: data.optionsHorizontalOrdering || [],
      answerHorizontalOrdering: data.answerHorizontalOrdering || [],
      optionsPhishingSelection: data.optionsPhishingSelection || [],
      answerPhishingSelection: data.answerPhishingSelection || [],
      phishingContext: data.phishingContext || '',
      phishingImageUrl: data.phishingImageUrl || '',
      optionsMatchPairsLeft: data.optionsMatchPairsLeft || [],
      optionsMatchPairsRight: data.optionsMatchPairsRight || [],
      answerMatchPairs: data.answerMatchPairs || []
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
          this.displayDialog = false;
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
          this.displayDialog = false;
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
      reject: () => { }
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
    this.displayDialog = false;
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

  openSandbox() {
    if (!this.activityId) return;
    const queryParams: any = {};
    if (this.returnTemaId) queryParams['returnTemaId'] = this.returnTemaId;
    if (this.returnCourseId) queryParams['returnCourseId'] = this.returnCourseId;
    if (this.returnChapterId) queryParams['returnChapterId'] = this.returnChapterId;
    this.router.navigate(['/admin/exercises', this.activityId, 'sandbox'], { queryParams });
  }

  openGenerateDialog() {
    if (this.generateDialog) {
      this.generateDialog.open();
    }
  }

  onExercisesGenerated(exercises: GeneratedExercise[]) {
    // El diálogo ya guardó los ejercicios directamente en la BD
    // Solo necesitamos recargar la lista
    if (exercises.length === 0) {
      this.loadExercises();
    }
  }

  onDialogClosed() {
    // Opcional: hacer algo cuando se cierra el diálogo
  }
}
