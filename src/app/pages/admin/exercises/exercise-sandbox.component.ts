import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivityService } from '@/core/services/activity.service';
import { ExerciseService } from '@/core/services/exercise.service';
import { AuthService } from '@/core/services/auth.service';
import { ActivityWithExercises as ApiActivityWithExercises } from '@/core/models/activity.interface';
import { SingleSelectionExerciseComponent } from '../../estudiante/activity-solver/exercises/single-selection-exercise/single-selection-exercise.component';
import { MultipleSelectionExerciseComponent } from '../../estudiante/activity-solver/exercises/multiple-selection-exercise/multiple-selection-exercise.component';
import { OrderFragmentCodeExerciseComponent } from '../../estudiante/activity-solver/exercises/order-fragment-code-exercise/order-fragment-code-exercise.component';
import { OrderLineCodeExerciseComponent } from '../../estudiante/activity-solver/exercises/order-line-code-exercise/order-line-code-exercise.component';
import { WriteCodeExerciseComponent } from '../../estudiante/activity-solver/exercises/write-code-exercise/write-code-exercise.component';
import { FindErrorCodeExerciseComponent } from '../../estudiante/activity-solver/exercises/find-error-code-exercise/find-error-code-exercise.component';
import { VerticalOrderingExerciseComponent } from '../../estudiante/activity-solver/exercises/vertical-ordering-exercise/vertical-ordering-exercise.component';
import { HorizontalOrderingExerciseComponent } from '../../estudiante/activity-solver/exercises/horizontal-ordering-exercise/horizontal-ordering-exercise.component';
import { PhishingSelectionMultipleExerciseComponent } from '../../estudiante/activity-solver/exercises/phishing-selection-multiple-exercise/phishing-selection-multiple-exercise.component';
import { MatchPairsExerciseComponent } from '../../estudiante/activity-solver/exercises/match-pairs-exercise/match-pairs-exercise.component';
import { marked } from 'marked';

type ExerciseType =
  | 'selection_single'
  | 'selection_multiple'
  | 'order_fragment_code'
  | 'order_line_code'
  | 'write_code'
  | 'find_error_code'
  | 'vertical_ordering'
  | 'horizontal_ordering'
  | 'phishing_selection_multiple'
  | 'match_pairs';

interface Exercise {
  id: number;
  statement: string;
  typeExercise: ExerciseType;
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
  type: ExerciseType;
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

const EXERCISE_TYPE_LABELS: Record<ExerciseType, { label: string; icon: string }> = {
  selection_single: { label: 'Selección única', icon: 'pi pi-check-circle' },
  selection_multiple: { label: 'Selección múltiple', icon: 'pi pi-list-check' },
  order_fragment_code: { label: 'Ordenar fragmentos', icon: 'pi pi-sort-alt' },
  order_line_code: { label: 'Ordenar líneas', icon: 'pi pi-bars' },
  write_code: { label: 'Escribir código', icon: 'pi pi-code' },
  find_error_code: { label: 'Detectar error', icon: 'pi pi-search' },
  vertical_ordering: { label: 'Orden vertical', icon: 'pi pi-arrow-down' },
  horizontal_ordering: { label: 'Orden horizontal', icon: 'pi pi-arrow-right' },
  phishing_selection_multiple: { label: 'Detectar phishing', icon: 'pi pi-shield' },
  match_pairs: { label: 'Emparejar conceptos', icon: 'pi pi-link' },
};

@Component({
  selector: 'app-exercise-sandbox',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
    DialogModule,
    SingleSelectionExerciseComponent,
    MultipleSelectionExerciseComponent,
    OrderFragmentCodeExerciseComponent,
    OrderLineCodeExerciseComponent,
    WriteCodeExerciseComponent,
    FindErrorCodeExerciseComponent,
    VerticalOrderingExerciseComponent,
    HorizontalOrderingExerciseComponent,
    PhishingSelectionMultipleExerciseComponent,
    MatchPairsExerciseComponent,
  ],
  providers: [MessageService],
  templateUrl: './exercise-sandbox.component.html',
  styles: [`
    :host { 
        display: block; 
        --primary-color: #58cc02;
        --duo-green: #58cc02;
        --duo-green-dark: #46a302;
        --duo-blue: #1cb0f6;
        --duo-blue-dark: #1899d6;
        --duo-purple: #ce82ff;
        --duo-purple-dark: #af6cf0;
        --duo-red: #ff4b4b;
        --duo-red-dark: #d33131;
        --duo-yellow: #ffc800;
        --duo-yellow-dark: #e5a300;
        --notebook-bg: #ffffff;
    }

    .sandbox-page {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    /* ── Topbar ── */
    .sandbox-topbar {
      background: #ffffff;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 4px solid #f1f5f9;
    }

    .sandbox-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--duo-yellow);
      color: #936300;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 12px;
      border-bottom: 3px solid var(--duo-yellow-dark);
    }

    .topbar-activity-title {
      color: #1e293b;
      font-size: 1.2rem;
      font-weight: 800;
      flex: 1;
      text-align: center;
      letter-spacing: -0.02em;
    }

    .topbar-progress {
      display: flex;
      align-items: center;
      gap: 15px;
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 800;
    }

    .progress-bar-wrap {
      width: 200px;
    }

    ::ng-deep .p-progressbar {
        height: 16px !important;
        background: #e5e5e5 !important;
        border-radius: 10px !important;
        border: none !important;
    }

    ::ng-deep .p-progressbar-value {
        background: var(--duo-green) !important;
        border-radius: 10px !important;
        border-bottom: 4px solid var(--duo-green-dark) !important;
    }

    /* ── Main layout ── */
    .sandbox-body {
      max-width: 850px;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Exercise card ── */
    .exercise-card {
      background: #ffffff;
      border-radius: 32px;
      border: 3px solid #e5e5e5;
      box-shadow: 0 10px 0 #e5e5e5;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .exercise-card-head {
      padding: 24px 32px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .exercise-type-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6366f1;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .exercise-number {
      font-size: 0.8rem;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .exercise-card-body {
      padding: 16px 32px 32px;
    }

    .exercise-statement {
      font-size: 1.5rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 20px;
      line-height: 1.4;
      letter-spacing: -0.01em;
    }

    .exercise-hint {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fefce8;
      border: 3px solid #fde68a;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 30px;
      font-size: 1rem;
      font-weight: 600;
      color: #92400e;
    }

    .exercise-hint i {
      font-size: 1.25rem;
      color: #f59e0b;
    }

    /* ── Actions ── */
    .action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 24px 32px;
      background: #ffffff;
      border-top: 3px solid #f1f5f9;
    }

    /* GAMIFIED BUTTONS - Enhanced Visibility */
    .btn-3d {
        border: none !important;
        border-radius: 14px !important;
        font-weight: 900 !important;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 14px 28px !important;
        transition: all 0.1s ease !important;
        position: relative;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 0.9rem !important;
        min-height: 48px;
        width: auto;
    }

    .btn-green {
        background: #58cc02 !important;
        color: white !important;
        border-bottom: 5px solid #46a302 !important;
        box-shadow: 0 4px 0 #46a302;
    }
    .btn-green:hover:not(:disabled) { background: #61e002 !important; }
    .btn-green:active:not(:disabled) {
        border-bottom-width: 0 !important;
        box-shadow: none !important;
        transform: translateY(5px);
    }

    .btn-blue {
        background: #1cb0f6 !important;
        color: white !important;
        border-bottom: 5px solid #1899d6 !important;
        box-shadow: 0 4px 0 #1899d6;
    }
    .btn-blue:hover:not(:disabled) { background: #2bd0ff !important; }
    .btn-blue:active:not(:disabled) {
        border-bottom-width: 0 !important;
        box-shadow: none !important;
        transform: translateY(5px);
    }

    .btn-secondary {
        background: #ffffff !important;
        color: #4b5563 !important;
        border: 2px solid #e5e7eb !important;
        border-bottom: 5px solid #e5e7eb !important;
        box-shadow: 0 2px 0 #e5e7eb;
    }
    .btn-secondary:hover:not(:disabled) { background: #f9fafb !important; }
    .btn-secondary:active:not(:disabled) {
        border-bottom-width: 2px !important;
        box-shadow: none !important;
        transform: translateY(3px);
    }

    .btn-3d:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(0.5);
    }

    /* ── Amauta Premium Modal ── */
    ::ng-deep .amauta-dialog .p-dialog-content {
      padding: 0 !important; border-radius: 28px !important; overflow: hidden !important;
    }
    ::ng-deep .amauta-dialog .p-dialog-header {
      padding: 24px 32px !important; border-bottom: 2px solid #f1f5f9 !important;
    }
    ::ng-deep .amauta-dialog .p-dialog-header-title {
      font-weight: 900 !important; color: #1e293b !important; font-size: 1.25rem !important;
    }

    .am-modal-wrap { background: white; display: flex; flex-direction: column; height: 100%; max-height: 85vh; }
    
    .am-modal-main { display: flex; gap: 32px; align-items: flex-start; padding: 40px; overflow-y: auto; flex-grow: 1; }
    
    .am-character-col { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 140px; flex-shrink: 0; }
    .am-img { width: 120px; height: auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
    
    .am-badge {
      width: 100%; padding: 10px; border-radius: 12px; font-weight: 800; font-size: 0.8rem;
      text-transform: uppercase; text-align: center; border: 2px solid;
    }
    .am-badge--error { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
    .am-badge--success { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
    .am-badge--score { background: white; color: #f59e0b; border-color: #fef3c7; }

    .am-bubble-col { flex: 1; position: relative; min-width: 0; }
    .am-bubble {
      background: #ffffff; border: 3px solid #e5e7eb; border-radius: 24px;
      padding: 24px; font-size: 1.1rem; font-weight: 600; color: #4b5563;
      line-height: 1.6; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    /* El triangulito de la burbuja */
    .am-bubble::before {
      content: ''; position: absolute; left: -14px; top: 40px;
      border-top: 12px solid transparent; border-bottom: 12px solid transparent;
      border-right: 14px solid #e5e7eb;
    }
    .am-bubble::after {
      content: ''; position: absolute; left: -10px; top: 40px;
      border-top: 12px solid transparent; border-bottom: 12px solid transparent;
      border-right: 14px solid #ffffff;
    }

    .am-explanation-content {
      margin-top: 0;
    }
    
    .am-initial-state {
      display: flex; flex-direction: column; gap: 20px; align-items: flex-start;
    }
    .am-result-title { font-size: 2rem; font-weight: 900; line-height: 1; }
    .am-result-title--success { color: var(--duo-green); }
    .am-result-title--error { color: var(--duo-red); }

    .am-footer { 
      padding: 24px 40px; border-top: 3px solid #f1f5f9; background: #ffffff; 
      flex-shrink: 0; display: flex; gap: 16px; align-items: center; 
      box-shadow: 0 -10px 20px rgba(0,0,0,0.02);
    }
    
    .am-utility-box {
      background: #fffcf0; border: 2px solid #fef3c7; border-radius: 16px; padding: 16px;
      display: flex; align-items: center; justify-content: space-between; margin-top: 24px; width: 100%;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .am-utility-title { font-weight: 800; color: #92400e; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .am-stars { display: flex; gap: 4px; color: #fbbf24; font-size: 1.1rem; }

    .loader-wrap {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid var(--duo-green); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ExerciseSandboxComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activityService = inject(ActivityService);
  private exerciseService = inject(ExerciseService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(true);
  submitting = signal(false);
  loadingAIFeedback = signal(false);
  activity = signal<ActivityWithExercises | null>(null);
  currentExerciseIndex = signal(0);
  answers = signal<ExerciseAnswer[]>([]);
  showFeedbackDrawer = signal(false);
  showAIFeedbackModal = signal(false);
  currentFeedback = signal<{ qualification: number; feedback: string } | null>(null);
  answerSubmitted = signal(false);
  userRating = signal(0);

  // return query params
  private returnTemaId: number | null = null;
  private returnCourseId: number | null = null;
  private returnChapterId: number | null = null;

  readonly EXERCISE_TYPE_LABELS = EXERCISE_TYPE_LABELS;

  ngOnInit(): void {
    const activityId = this.route.snapshot.paramMap.get('activityId');
    const qp = this.route.snapshot.queryParamMap;
    if (qp.get('returnTemaId')) this.returnTemaId = +qp.get('returnTemaId')!;
    if (qp.get('returnCourseId')) this.returnCourseId = +qp.get('returnCourseId')!;
    if (qp.get('returnChapterId')) this.returnChapterId = +qp.get('returnChapterId')!;

    if (activityId) {
      this.loadActivity(+activityId);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se especificó actividad' });
      this.goBack();
    }
  }

  loadActivity(activityId: number): void {
    this.loading.set(true);
    this.activityService.initActivity(activityId).subscribe({
      next: (data: ApiActivityWithExercises) => {
        const converted: ActivityWithExercises = {
          id: data.id,
          title: data.title,
          exercises: data.exercises.map(ex => ({
            id: ex.id,
            statement: ex.statement,
            typeExercise: ex.typeExercise as ExerciseType,
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
            optionsMatchPairsRight: (ex as any).optionsMatchPairsRight || [],
          }))
        };
        this.activity.set(converted);
        this.answers.set(converted.exercises.map(ex => ({
          exerciseId: ex.id,
          type: ex.typeExercise,
          answerSelect: '', answerSelects: [], answerOrderFragmentCode: [],
          answerOrderLineCode: [], answerWriteCode: '', answerFindError: '',
          answerVerticalOrdering: [], answerHorizontalOrdering: [],
          answerPhishingSelection: [], answerMatchPairs: []
        })));
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la actividad' });
        this.loading.set(false);
        this.goBack();
      }
    });
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get safeActivity(): ActivityWithExercises {
    return this.activity() || { id: 0, title: '', exercises: [] };
  }

  get currentExercise(): Exercise {
    const exercises = this.safeActivity.exercises;
    if (!exercises.length) return this.emptyExercise;
    return exercises[this.currentExerciseIndex()] || this.emptyExercise;
  }

  private get emptyExercise(): Exercise {
    return {
      id: 0, statement: '', typeExercise: 'selection_single', hind: '',
      optionSelectOptions: [], optionOrderFragmentCode: [], optionOrderLineCode: [],
      optionFindErrorCode: [], optionsVerticalOrdering: [], optionsHorizontalOrdering: [],
      optionsPhishingSelection: [], phishingContext: '', phishingImageUrl: '',
      optionsMatchPairsLeft: [], optionsMatchPairsRight: []
    };
  }

  get currentAnswer(): ExerciseAnswer | null {
    return this.answers()[this.currentExerciseIndex()] || null;
  }

  get progress(): number {
    const total = this.safeActivity.exercises.length;
    if (!total) return 0;
    return Math.round((this.currentExerciseIndex() / total) * 100);
  }

  get isFirstExercise(): boolean { return this.currentExerciseIndex() === 0; }
  get isLastExercise(): boolean {
    const total = this.safeActivity.exercises.length;
    return !total || this.currentExerciseIndex() === total - 1;
  }

  get typeInfo(): { label: string; icon: string } {
    return EXERCISE_TYPE_LABELS[this.currentExercise.typeExercise] || { label: 'Ejercicio', icon: 'pi pi-question' };
  }

  get safeFeedback(): { qualification: number; feedback: string } {
    const fb = this.currentFeedback();
    if (!fb) return { qualification: 0, feedback: '' };

    try {
      // Parse markdown to HTML safely synchronously
      const parsedHtml = marked.parse(fb.feedback, { async: false }) as string;
      return { qualification: fb.qualification, feedback: parsedHtml };
    } catch (e) {
      return { qualification: fb.qualification, feedback: fb.feedback };
    }
  }

  get feedbackClass(): string {
    const q = this.safeFeedback.qualification;
    if (q >= 7) return 'success';
    if (q >= 5) return 'partial';
    return 'error';
  }

  get hasAIFeedback(): boolean {
    return !!(this.currentAnswer?.feedback?.trim() || (this.currentFeedback()?.feedback?.trim()));
  }

  get feedbackTitle(): string {
    const q = this.safeFeedback.qualification;
    if (q >= 7) return '¡Correcto!';
    if (q >= 5) return '¡Buen intento!';
    return '¡Incorrecto!';
  }

  hasAnswer(): boolean {
    const a = this.currentAnswer;
    if (!a) return false;
    switch (a.type) {
      case 'selection_single': return !!(a.answerSelect?.trim());
      case 'selection_multiple': return !!(a.answerSelects?.length);
      case 'order_fragment_code': return !!(a.answerOrderFragmentCode?.length);
      case 'order_line_code': return !!(a.answerOrderLineCode?.length);
      case 'write_code': return !!(a.answerWriteCode?.trim());
      case 'find_error_code': return !!(a.answerFindError?.trim());
      case 'vertical_ordering': return !!(a.answerVerticalOrdering?.length);
      case 'horizontal_ordering': return !!(a.answerHorizontalOrdering?.length);
      case 'phishing_selection_multiple': return !!(a.answerPhishingSelection?.length);
      case 'match_pairs': return !!(a.answerMatchPairs?.length);
      default: return false;
    }
  }

  // ── Answer handling ───────────────────────────────────────────────────────

  onAnswerSubmitted(value: any): void {
    const ex = this.currentExercise;
    this.answers.update(answers => answers.map(a => {
      if (a.exerciseId !== ex.id) return a;
      const updated = { ...a };
      switch (ex.typeExercise) {
        case 'selection_single': updated.answerSelect = value; break;
        case 'selection_multiple': updated.answerSelects = value; break;
        case 'order_fragment_code': updated.answerOrderFragmentCode = value; break;
        case 'order_line_code': updated.answerOrderLineCode = value; break;
        case 'write_code': updated.answerWriteCode = value; break;
        case 'find_error_code': updated.answerFindError = value; break;
        case 'vertical_ordering': updated.answerVerticalOrdering = value; break;
        case 'horizontal_ordering': updated.answerHorizontalOrdering = value; break;
        case 'phishing_selection_multiple': updated.answerPhishingSelection = value; break;
        case 'match_pairs': updated.answerMatchPairs = value; break;
      }
      return updated;
    }));
  }

  verifyAnswer(): void {
    const a = this.currentAnswer;
    if (!a) return;
    this.submitting.set(true);

    const dto: any = {
      userId: this.getCurrentUserId(),
      answerSelect: a.answerSelect || '',
      answerSelects: a.answerSelects || [],
      answerOrderFragmentCode: a.answerOrderFragmentCode || [],
      answerOrderLineCode: a.answerOrderLineCode || [],
      answerWriteCode: a.answerWriteCode || '',
      answerFindError: a.answerFindError || '',
      answerVerticalOrdering: a.answerVerticalOrdering || [],
      answerHorizontalOrdering: a.answerHorizontalOrdering || [],
      answerPhishingSelection: a.answerPhishingSelection || [],
      answerMatchPairs: a.answerMatchPairs || [],
      isPreview: true,
    };

    this.exerciseService.validateAnswer(this.currentExercise.id, dto).subscribe({
      next: (feedback) => {
        this.currentFeedback.set({
          qualification: feedback.qualification,
          feedback: ''
        });
        this.answerSubmitted.set(true);
        this.showAIFeedbackModal.set(true); // Open the modal directly
        this.submitting.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo verificar la respuesta' });
        this.submitting.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  private getCurrentUserId(): number {
    let userId = 0;
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        userId = user.id;
      }
    }).unsubscribe();

    return userId;
  }

  openAmautaFeedback(): void {
    const a = this.currentAnswer;
    if (!a || this.loadingAIFeedback()) return;

    this.loadingAIFeedback.set(true);
    const dto: any = {
      userId: this.getCurrentUserId(),
      answerSelect: a.answerSelect || '',
      answerSelects: a.answerSelects || [],
      answerOrderFragmentCode: a.answerOrderFragmentCode || [],
      answerOrderLineCode: a.answerOrderLineCode || [],
      answerWriteCode: a.answerWriteCode || '',
      answerFindError: a.answerFindError || '',
      answerVerticalOrdering: a.answerVerticalOrdering || [],
      answerHorizontalOrdering: a.answerHorizontalOrdering || [],
      answerPhishingSelection: a.answerPhishingSelection || [],
      answerMatchPairs: a.answerMatchPairs || [],
      isPreview: true,
    };

    this.exerciseService.checkAnswer(this.currentExercise.id, dto).subscribe({
      next: (feedback) => {
        const htmlFeedback = marked.parse(feedback.feedback || '') as string;
        this.currentFeedback.update(curr => curr ? { ...curr, feedback: htmlFeedback } : null);
        
        // También actualizar en el array de respuestas para persistencia local
        this.answers.update(ans => ans.map(it => 
          it.exerciseId === this.currentExercise.id 
            ? { ...it, feedback: htmlFeedback, qualification: feedback.qualification } 
            : it
        ));

        this.loadingAIFeedback.set(false);
        this.showAIFeedbackModal.set(true); // Open the premium modal
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la explicación de Amauta' });
        this.loadingAIFeedback.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  nextExercise(): void {
    if (this.isLastExercise) return;
    this.currentExerciseIndex.update(i => i + 1);
    this.resetExerciseState();
  }

  previousExercise(): void {
    if (this.isFirstExercise) return;
    this.currentExerciseIndex.update(i => i - 1);
    this.resetExerciseState();
  }

  private resetExerciseState(): void {
    this.showFeedbackDrawer.set(false);
    this.showAIFeedbackModal.set(false);
    this.currentFeedback.set(null);
    this.answerSubmitted.set(false);
    this.userRating.set(0);
    this.cdr.detectChanges();
  }

  restartCurrentExercise(): void {
    const ex = this.currentExercise;
    this.answers.update(answers => answers.map(a =>
      a.exerciseId === ex.id
        ? {
          exerciseId: ex.id, type: ex.typeExercise,
          answerSelect: '', answerSelects: [], answerOrderFragmentCode: [],
          answerOrderLineCode: [], answerWriteCode: '', answerFindError: '',
          answerVerticalOrdering: [], answerHorizontalOrdering: [],
          answerPhishingSelection: [], answerMatchPairs: [],
          feedback: ''
        }
        : a
    ));
    this.resetExerciseState();
  }

  closeFeedbackDrawer(): void {
    this.showFeedbackDrawer.set(false);
    this.showAIFeedbackModal.set(false);
    this.cdr.detectChanges();
  }

  rateFeedback(stars: number): void {
    this.userRating.set(stars);
    this.cdr.detectChanges();
  }

  goBack(): void {
    const queryParams: any = {};
    if (this.returnTemaId) queryParams['returnTemaId'] = this.returnTemaId;
    if (this.returnCourseId) queryParams['returnCourseId'] = this.returnCourseId;
    if (this.returnChapterId) queryParams['returnChapterId'] = this.returnChapterId;
    const activityId = this.safeActivity.id || this.route.snapshot.paramMap.get('activityId');
    this.router.navigate([`/admin/exercises/${activityId}`], { queryParams });
  }
}
