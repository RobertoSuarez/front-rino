import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ActivityService } from '@/core/services/activity.service';
import { ExerciseService } from '@/core/services/exercise.service';
import { UserService, UserIndicators } from '@/core/services/user.service';
import { AuthService } from '@/core/services/auth.service';
import { ActivityWithExercises as ApiActivityWithExercises } from '@/core/models/activity.interface';
import { SingleSelectionExerciseComponent } from './exercises/single-selection-exercise/single-selection-exercise.component';
import { MultipleSelectionExerciseComponent } from './exercises/multiple-selection-exercise/multiple-selection-exercise.component';
import { OrderFragmentCodeExerciseComponent } from './exercises/order-fragment-code-exercise/order-fragment-code-exercise.component';
import { OrderLineCodeExerciseComponent } from './exercises/order-line-code-exercise/order-line-code-exercise.component';
import { WriteCodeExerciseComponent } from './exercises/write-code-exercise/write-code-exercise.component';
import { FindErrorCodeExerciseComponent } from './exercises/find-error-code-exercise/find-error-code-exercise.component';
import { VerticalOrderingExerciseComponent } from './exercises/vertical-ordering-exercise/vertical-ordering-exercise.component';
import { HorizontalOrderingExerciseComponent } from './exercises/horizontal-ordering-exercise/horizontal-ordering-exercise.component';
import { PhishingSelectionMultipleExerciseComponent } from './exercises/phishing-selection-multiple-exercise/phishing-selection-multiple-exercise.component';
import { MatchPairsExerciseComponent } from './exercises/match-pairs-exercise/match-pairs-exercise.component';

interface Exercise {
  id: number;
  statement: string;
  code: string;
  typeExercise: 'selection_single' | 'selection_multiple' | 'order_fragment_code' | 'order_line_code' | 'write_code' | 'find_error_code' | 'vertical_ordering' | 'horizontal_ordering' | 'phishing_selection_multiple' | 'match_pairs';
  approach: string;
  hind: string;
  optionSelectOptions: string[];
  optionOrderFragmentCode: string[];
  optionOrderLineCode: string[];
  optionFindErrorCode: string[];
  optionsVerticalOrdering: string[];
  optionsHorizontalOrdering: string[];
  optionsPhishingSelection: string[];
  phishingContext: string;
  phishingImageUrl: string;
  optionsMatchPairsLeft: string[];
  optionsMatchPairsRight: string[];
}

interface ActivityWithExercises {
  id: number;
  title: string;
  exercises: Exercise[];
}

interface ExerciseAnswer {
  exerciseId: number;
  type: 'selection_single' | 'selection_multiple' | 'order_fragment_code' | 'order_line_code' | 'write_code' | 'find_error_code' | 'vertical_ordering' | 'horizontal_ordering' | 'phishing_selection_multiple' | 'match_pairs';
  answerSelect?: string;
  answerSelects?: string[];
  answerOrderFragmentCode?: string[];
  answerOrderLineCode?: string[];
  answerWriteCode?: string;
  answerFindError?: string;
  answerVerticalOrdering?: string[];
  answerHorizontalOrdering?: string[];
  answerPhishingSelection?: string[];
  answerMatchPairs?: { left: string; right: string }[];
  qualification?: number;
  feedback?: string;
}

interface ActivityResult {
  id: number;
  progress: number;
  score: number;
  accuracy: number;
  activity: string;
  gems: number;
  mulluEarned?: number;
}

@Component({
  selector: 'app-activity-solver',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
    DialogModule,
    DrawerModule,
    ConfirmDialogModule,
    SingleSelectionExerciseComponent,
    MultipleSelectionExerciseComponent,
    OrderFragmentCodeExerciseComponent,
    OrderLineCodeExerciseComponent,
    WriteCodeExerciseComponent,
    FindErrorCodeExerciseComponent,
    VerticalOrderingExerciseComponent,
    HorizontalOrderingExerciseComponent,
    PhishingSelectionMultipleExerciseComponent,
    MatchPairsExerciseComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './activity-solver.component.html',
  styleUrl: './activity-solver.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ActivitySolverComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activityService = inject(ActivityService);
  private exerciseService = inject(ExerciseService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Signals para el estado del componente
  loading = signal(true);
  submitting = signal(false);
  activity = signal<ActivityWithExercises | null>(null);
  currentExerciseIndex = signal(0);
  answers = signal<ExerciseAnswer[]>([]);
  showFeedback = signal(false);
  currentFeedback = signal<{ qualification: number, feedback: string } | null>(null);
  activityCompleted = signal(false);
  activityResult = signal<ActivityResult | null>(null);
  answerVerified = signal(false);
  showResultsModal = signal(false); // Modal de resultados
  showFeedbackDrawer = signal(false); // Drawer de feedback
  showAIFeedbackModal = signal(false); // Modal de feedback de IA
  userIndicators = signal<UserIndicators | null>(null); // Indicadores del usuario
  
  // Getters seguros para evitar errores de nulos
  get safeActivity(): ActivityWithExercises {
    return this.activity() || { id: 0, title: '', exercises: [] };
  }
  
  get safeFeedback(): { qualification: number, feedback: string } {
    return this.currentFeedback() || { qualification: 0, feedback: '' };
  }
  
  get safeActivityResult(): ActivityResult {
    return this.activityResult() || { id: 0, progress: 0, score: 0, accuracy: 0, activity: '', gems: 0, mulluEarned: 0 };
  }

  get safeUserIndicators(): UserIndicators {
    return this.userIndicators() || { yachay: 0, tumis: 0, mullu: 0 };
  }

  ngOnInit(): void {
    const activityId = this.route.snapshot.paramMap.get('activityId');
    
    if (activityId) {
      this.loadActivity(+activityId);
      this.loadUserIndicators();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha especificado una actividad'
      });
      this.navigateBack();
    }
  }

  loadActivity(activityId: number): void {
    this.loading.set(true);
    
    this.activityService.initActivity(activityId).subscribe({
      next: (data: ApiActivityWithExercises) => {
        console.log('📚 Datos de actividad recibidos del backend:', data);
        // Convertir los datos de la API al formato interno
        const convertedData: ActivityWithExercises = {
          id: data.id,
          title: data.title,
          exercises: data.exercises.map(ex => ({
            id: ex.id,
            statement: ex.statement,
            code: ex.code || '',
            typeExercise: ex.typeExercise as any,
            approach: ex.approach || '',
            hind: ex.hind || '',
            optionSelectOptions: ex.optionSelectOptions || [],
            optionOrderFragmentCode: ex.optionOrderFragmentCode || [],
            optionOrderLineCode: ex.optionOrderLineCode || [],
            optionFindErrorCode: ex.optionFindErrorCode || [],
            optionsVerticalOrdering: (ex as any).optionsVerticalOrdering || [],
            optionsHorizontalOrdering: (ex as any).optionsHorizontalOrdering || [],
            optionsPhishingSelection: (ex as any).optionsPhishingSelection || [],
            phishingContext: (ex as any).phishingContext || '',
            phishingImageUrl: (ex as any).phishingImageUrl || '',
            optionsMatchPairsLeft: (ex as any).optionsMatchPairsLeft || [],
            optionsMatchPairsRight: (ex as any).optionsMatchPairsRight || []
          }))
        };
        
        console.log('✅ Datos convertidos para la aplicación:', convertedData);
        this.activity.set(convertedData);
        
        // Inicializar las respuestas vacías para cada ejercicio
        const initialAnswers = convertedData.exercises.map(exercise => ({
          exerciseId: exercise.id,
          type: exercise.typeExercise,
          qualification: 0,
          feedback: '',
          // Inicializar todos los campos con valores por defecto según su tipo
          answerSelect: '',
          answerSelects: [],
          answerOrderFragmentCode: [],
          answerOrderLineCode: [],
          answerWriteCode: '',
          answerFindError: '',
          answerVerticalOrdering: [],
          answerHorizontalOrdering: [],
          answerPhishingSelection: [],
          answerMatchPairs: []
        }));
        
        this.answers.set(initialAnswers);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar la actividad:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la actividad'
        });
        this.loading.set(false);
        this.navigateBack();
      }
    });
  }

  loadUserIndicators(): void {
    this.userService.getUserIndicators().subscribe({
      next: (response) => {
        this.userIndicators.set(response.data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los indicadores del usuario:', error);
        // No mostrar mensaje de error al usuario, usar valores por defecto
      }
    });
  }

  decreaseTumis(): void {
    const currentIndicators = this.safeUserIndicators;
    const newTumis = Math.max(0, currentIndicators.tumis - 1); // No permitir valores negativos

    this.userService.updateUserIndicators({
      yachay: currentIndicators.yachay,
      tumis: newTumis,
      mullu: currentIndicators.mullu
    }).subscribe({
      next: (response) => {
        this.userIndicators.set(response.data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al actualizar los indicadores del usuario:', error);
        // Si hay error, actualizar localmente de todas formas para mantener consistencia en UI
        this.userIndicators.set({
          ...currentIndicators,
          tumis: newTumis
        });
        this.cdr.detectChanges();
      }
    });
  }

  get currentExercise(): Exercise {
    const exercise = this.getCurrentExerciseInternal();
    console.log('🎯 Ejercicio actual (índice ' + this.currentExerciseIndex() + '):', exercise);
    return exercise;
  }

  private getCurrentExerciseInternal(): Exercise {
    if (!this.activity() || !this.activity()?.exercises.length) {
      return {
        id: 0,
        statement: '',
        code: '',
        typeExercise: 'selection_single',
        approach: '',
        hind: '',
        optionSelectOptions: [],
        optionOrderFragmentCode: [],
        optionOrderLineCode: [],
        optionFindErrorCode: [],
        optionsVerticalOrdering: [],
        optionsHorizontalOrdering: [],
        optionsPhishingSelection: [],
        phishingContext: '',
        phishingImageUrl: '',
        optionsMatchPairsLeft: [],
        optionsMatchPairsRight: []
      };
    }
    
    return this.activity()!.exercises[this.currentExerciseIndex()] || {
      id: 0,
      statement: '',
      code: '',
      typeExercise: 'selection_single',
      approach: '',
      hind: '',
      optionSelectOptions: [],
      optionOrderFragmentCode: [],
      optionOrderLineCode: [],
      optionFindErrorCode: [],
      optionsVerticalOrdering: [],
      optionsHorizontalOrdering: [],
      optionsPhishingSelection: [],
      phishingContext: '',
      phishingImageUrl: '',
      optionsMatchPairsLeft: [],
      optionsMatchPairsRight: []
    };
  }

  get progress(): number {
    if (this.safeActivity.exercises.length === 0) {
      return 0;
    }
    
    return (Math.round((this.currentExerciseIndex() / this.safeActivity.exercises.length) * 100));
  }

  get isFirstExercise(): boolean {
    return this.currentExerciseIndex() === 0;
  }

  get isLastExercise(): boolean {
    if (this.safeActivity.exercises.length === 0) {
      return true;
    }
    
    return this.currentExerciseIndex() === this.safeActivity.exercises.length - 1;
  }

  getCurrentAnswer(): any {
    const currentAnswer = this.answers()[this.currentExerciseIndex()];
    if (!currentAnswer) return null;

    switch (currentAnswer.type) {
      case 'selection_single':
        return currentAnswer.answerSelect;
      case 'selection_multiple':
        return currentAnswer.answerSelects;
      case 'order_fragment_code':
        return currentAnswer.answerOrderFragmentCode;
      case 'order_line_code':
        return currentAnswer.answerOrderLineCode;
      case 'write_code':
        return currentAnswer.answerWriteCode;
      case 'find_error_code':
        return currentAnswer.answerFindError;
      case 'vertical_ordering':
        return currentAnswer.answerVerticalOrdering;
      case 'horizontal_ordering':
        return currentAnswer.answerHorizontalOrdering;
      case 'phishing_selection_multiple':
        return currentAnswer.answerPhishingSelection;
      case 'match_pairs':
        return currentAnswer.answerMatchPairs;
      default:
        return null;
    }
  }

  hasAnswer(): boolean {
    const currentAnswer = this.answers()[this.currentExerciseIndex()];
    if (!currentAnswer) return false;

    switch (currentAnswer.type) {
      case 'selection_single':
        return !!(currentAnswer.answerSelect && currentAnswer.answerSelect.trim());
      case 'selection_multiple':
        return !!(currentAnswer.answerSelects && currentAnswer.answerSelects.length > 0);
      case 'order_fragment_code':
        return !!(currentAnswer.answerOrderFragmentCode && currentAnswer.answerOrderFragmentCode.length > 0);
      case 'order_line_code':
        return !!(currentAnswer.answerOrderLineCode && currentAnswer.answerOrderLineCode.length > 0);
      case 'write_code':
        return !!(currentAnswer.answerWriteCode && currentAnswer.answerWriteCode.trim());
      case 'find_error_code':
        return !!(currentAnswer.answerFindError && currentAnswer.answerFindError.trim());
      case 'vertical_ordering':
        return !!(currentAnswer.answerVerticalOrdering && currentAnswer.answerVerticalOrdering.length > 0);
      case 'horizontal_ordering':
        return !!(currentAnswer.answerHorizontalOrdering && currentAnswer.answerHorizontalOrdering.length > 0);
      case 'phishing_selection_multiple':
        return !!(currentAnswer.answerPhishingSelection && currentAnswer.answerPhishingSelection.length > 0);
      case 'match_pairs':
        return !!(currentAnswer.answerMatchPairs && currentAnswer.answerMatchPairs.length > 0);
      default:
        return false;
    }
  }

  verifyAnswer(): void {
    if (!this.currentExercise) {
      return;
    }

    const exerciseId = this.currentExercise.id;
    const exerciseType = this.currentExercise.typeExercise;

    // Obtener la respuesta almacenada del ejercicio actual
    const currentAnswer = this.answers()[this.currentExerciseIndex()];
    if (!currentAnswer) {
      return;
    }

    // Obtener el userId del usuario actual
    let userId = 0;
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        userId = user.id;
      }
    }).unsubscribe();

    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el ID del usuario'
      });
      return;
    }

    // Construir el objeto de respuesta con todos los campos requeridos
    const checkExerciseDto: any = {
      userId: userId, // Agregar userId
      // Inicializar todos los campos con valores por defecto
      answerSelect: '',
      answerSelects: [],
      answerOrderFragmentCode: [],
      answerOrderLineCode: [],
      answerWriteCode: '',
      answerFindError: ''
    };

    // Llenar con la respuesta almacenada
    checkExerciseDto.answerSelect = currentAnswer.answerSelect || '';
    checkExerciseDto.answerSelects = currentAnswer.answerSelects || [];
    checkExerciseDto.answerOrderFragmentCode = currentAnswer.answerOrderFragmentCode || [];
    checkExerciseDto.answerOrderLineCode = currentAnswer.answerOrderLineCode || [];
    checkExerciseDto.answerWriteCode = currentAnswer.answerWriteCode || '';
    checkExerciseDto.answerFindError = currentAnswer.answerFindError || '';

    // Enviar la respuesta al backend para validación
    this.submitting.set(true);

    this.exerciseService.checkAnswer(exerciseId, checkExerciseDto).subscribe({
      next: (feedback) => {
        // Actualizar la retroalimentación en el estado local
        this.updateFeedback(exerciseId, feedback);

        // Si la respuesta es incorrecta (calificación < 7), disminuir una vida (tumís)
        if (feedback.qualification < 7) {
          this.decreaseTumis();
        }

        // Si ganó Yachay, mostrar alerta especial
        if (feedback.yachayEarned && feedback.yachayEarned > 0) {
          this.showYachayReward(feedback.yachayEarned, feedback.difficulty || 'Fácil');
          // Recargar indicadores del usuario para actualizar el balance
          this.loadUserIndicators();
        }

        // Mostrar la retroalimentación en el drawer
        this.currentFeedback.set(feedback);
        this.showFeedback.set(true);
        this.showFeedbackDrawer.set(true); // Abrir drawer
        this.answerVerified.set(true); // Marcar respuesta como verificada
        this.submitting.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al validar la respuesta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al validar la respuesta'
        });
        this.submitting.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  nextExercise(): void {
    if (this.isLastExercise) {
      this.confirmFinishActivity();
      return;
    }
    
    this.currentExerciseIndex.update(index => index + 1);
    this.showFeedback.set(false);
    this.currentFeedback.set(null);
    this.answerVerified.set(false); // Resetear estado de verificación
    this.showFeedbackDrawer.set(false); // Cerrar drawer
  }

  previousExercise(): void {
    if (this.isFirstExercise) {
      return;
    }
    
    this.currentExerciseIndex.update(index => index - 1);
    this.showFeedback.set(false);
    this.currentFeedback.set(null);
    this.answerVerified.set(false); // Resetear estado de verificación
    this.showFeedbackDrawer.set(false); // Cerrar drawer
  }

  confirmFinishActivity(): void {
    // Verificar si todos los ejercicios tienen respuesta
    const unansweredExercises = this.answers().filter(answer => {
      switch (answer.type) {
        case 'selection_single':
          return !answer.answerSelect;
        case 'selection_multiple':
          return !answer.answerSelects || answer.answerSelects.length === 0;
        case 'order_fragment_code':
          return !answer.answerOrderFragmentCode || answer.answerOrderFragmentCode.length === 0;
        case 'order_line_code':
          return !answer.answerOrderLineCode || answer.answerOrderLineCode.length === 0;
        case 'write_code':
          return !answer.answerWriteCode;
        case 'find_error_code':
          return !answer.answerFindError;
        default:
          return true;
      }
    });

    if (unansweredExercises.length > 0) {
      this.confirmationService.confirm({
        header: 'Ejercicios sin responder',
        message: `Hay ${unansweredExercises.length} ejercicios sin responder. ¿Deseas finalizar la actividad de todos modos?`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.finishActivity();
        }
      });
    } else {
      this.confirmationService.confirm({
        header: 'Finalizar actividad',
        message: '¿Estás seguro de que deseas finalizar la actividad?',
        icon: 'pi pi-check-circle',
        accept: () => {
          this.finishActivity();
        }
      });
    }
  }

  finishActivity(): void {
    if (!this.activity()) {
      return;
    }
    
    this.submitting.set(true);
    
    // Preparar las respuestas para enviar al backend
    const feedbackResponses = this.answers().map(answer => ({
      qualification: Math.round(answer.qualification || 0),
      feedback: answer.feedback || ''
    }));
    
    this.activityService.finishActivity(this.activity()!.id, feedbackResponses).subscribe({
      next: (result) => {
        this.activityResult.set(result);
        this.activityCompleted.set(true);
        this.showResultsModal.set(true); // Abrir modal automáticamente
        
        // Si ganó Mullu, mostrar toast especial
        if (result.mulluEarned && result.mulluEarned > 0) {
          this.showMulluReward(result.mulluEarned, result.accuracy);
        }
        
        // Recargar indicadores del usuario para actualizar el balance
        this.loadUserIndicators();
        
        this.submitting.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al finalizar la actividad:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al finalizar la actividad'
        });
        this.submitting.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  onAnswerSubmitted(answer: any): void {
    if (!this.currentExercise) {
      return;
    }

    const exerciseId = this.currentExercise.id;
    const exerciseType = this.currentExercise.typeExercise;

    // Solo actualizar la respuesta en el estado local, sin enviar al backend
    this.updateAnswer(exerciseId, exerciseType, answer);

    // No enviar automáticamente al backend - esperar al clic en "Verificar Respuesta"
  }

  updateAnswer(exerciseId: number, type: string, value: any): void {
    this.answers.update(answers => {
      return answers.map(answer => {
        if (answer.exerciseId === exerciseId) {
          // Asegurarse de que todos los campos requeridos existan
          const updatedAnswer = {
            ...answer,
            answerSelect: answer.answerSelect || '',
            answerSelects: answer.answerSelects || [],
            answerOrderFragmentCode: answer.answerOrderFragmentCode || [],
            answerOrderLineCode: answer.answerOrderLineCode || [],
            answerWriteCode: answer.answerWriteCode || '',
            answerFindError: answer.answerFindError || '',
            answerVerticalOrdering: answer.answerVerticalOrdering || [],
            answerHorizontalOrdering: answer.answerHorizontalOrdering || [],
            answerPhishingSelection: answer.answerPhishingSelection || [],
            answerMatchPairs: answer.answerMatchPairs || []
          };
          
          // Actualizar el campo específico según el tipo de ejercicio
          switch (type) {
            case 'selection_single':
              updatedAnswer.answerSelect = value;
              break;
            case 'selection_multiple':
              updatedAnswer.answerSelects = value;
              break;
            case 'order_fragment_code':
              updatedAnswer.answerOrderFragmentCode = value;
              break;
            case 'order_line_code':
              updatedAnswer.answerOrderLineCode = value;
              break;
            case 'write_code':
              updatedAnswer.answerWriteCode = value;
              break;
            case 'find_error_code':
              updatedAnswer.answerFindError = value;
              break;
            case 'vertical_ordering':
              updatedAnswer.answerVerticalOrdering = value;
              break;
            case 'horizontal_ordering':
              updatedAnswer.answerHorizontalOrdering = value;
              break;
            case 'phishing_selection_multiple':
              updatedAnswer.answerPhishingSelection = value;
              break;
            case 'match_pairs':
              updatedAnswer.answerMatchPairs = value;
              break;
          }
          
          return updatedAnswer;
        }
        return answer;
      });
    });
  }

  updateFeedback(exerciseId: number, feedback: { qualification: number, feedback: string }): void {
    this.answers.update(answers => {
      return answers.map(answer => {
        if (answer.exerciseId === exerciseId) {
          return { 
            ...answer, 
            qualification: feedback.qualification,
            feedback: feedback.feedback,
            // Asegurarse de que todos los campos requeridos existan
            answerSelect: answer.answerSelect || '',
            answerSelects: answer.answerSelects || [],
            answerOrderFragmentCode: answer.answerOrderFragmentCode || [],
            answerOrderLineCode: answer.answerOrderLineCode || [],
            answerWriteCode: answer.answerWriteCode || '',
            answerFindError: answer.answerFindError || ''
          };
        }
        return answer;
      });
    });
  }

  navigateBack(): void {
    // Si la actividad está completada, volver a la lista de temas
    if (this.activityCompleted()) {
      const capituloId = this.route.snapshot.queryParamMap.get('capituloId');
      const cursoId = this.route.snapshot.queryParamMap.get('cursoId');
      
      if (capituloId && cursoId) {
        this.router.navigate(['/estudiante/cursos', cursoId, 'chapters', capituloId, 'temas']);
      } else {
        this.router.navigate(['/estudiante/cursos']);
      }
    } else {
      // Si no está completada, confirmar si desea abandonar
      this.confirmationService.confirm({
        header: 'Abandonar actividad',
        message: '¿Estás seguro de que deseas abandonar la actividad? Tu progreso no se guardará.',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
    }
  }

  restartActivity(): void {
    if (!this.activity()) {
      return;
    }
    
    this.loadActivity(this.activity()!.id);
    this.currentExerciseIndex.set(0);
    this.activityCompleted.set(false);
    this.activityResult.set(null);
    this.answerVerified.set(false); // Resetear estado de verificación
    this.showResultsModal.set(false); // Cerrar modal
    this.showFeedbackDrawer.set(false); // Cerrar drawer
  }

  closeFeedbackDrawer(): void {
    this.showFeedbackDrawer.set(false);
  }

  continueFromFeedback(): void {
    this.closeFeedbackDrawer();
    this.nextExercise();
  }

  /**
   * Muestra una alerta especial cuando el usuario gana Yachay
   */
  showYachayReward(yachay: number, difficulty: string): void {
    this.messageService.add({
      severity: 'success',
      summary: '¡Felicitaciones! 🎉',
      detail: `Has ganado ${yachay} Yachay por completar un ejercicio ${difficulty}`,
      life: 5000,
      styleClass: 'yachay-reward-toast'
    });
  }

  /**
   * Muestra una alerta especial cuando el usuario gana Mullu por completar actividad
   */
  showMulluReward(mullu: number, accuracy: number): void {
    this.messageService.add({
      severity: 'success',
      summary: '¡Actividad Completada! 🏆',
      detail: `Has ganado ${mullu} Mullu por tu precisión del ${accuracy}%`,
      life: 6000,
      styleClass: 'mullu-reward-toast'
    });
  }
}
