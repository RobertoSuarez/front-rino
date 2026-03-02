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
  code: string;
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
    :host { display: block; }

    .sandbox-page {
      min-height: 100vh;
      background: var(--surface-ground);
      font-family: 'Inter', sans-serif;
    }

    /* ── Topbar ── */
    .sandbox-topbar {
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .sandbox-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 20px;
      white-space: nowrap;
    }

    .topbar-activity-title {
      color: var(--text-color);
      font-size: 0.95rem;
      font-weight: 600;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .topbar-progress {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-color-secondary);
      font-size: 0.8rem;
      white-space: nowrap;
    }

    .progress-bar-wrap {
      width: 120px;
    }

    /* ── Main layout ── */
    .sandbox-body {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Exercise card ── */
    .exercise-card {
      background: var(--surface-card);
      border-radius: 20px;
      border: 1px solid var(--surface-border);
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .exercise-card-head {
      background: var(--surface-section, var(--surface-ground));
      border-bottom: 1px solid var(--surface-border);
      padding: 18px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .exercise-type-chip {
      display: flex;
      align-items: center;
      gap: 7px;
      background: var(--primary-color);
      color: var(--primary-color-text);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 5px 14px;
      border-radius: 20px;
    }

    .exercise-number {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-color-secondary);
      background: var(--surface-hover);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid var(--surface-border);
    }

    .exercise-card-body {
      padding: 28px;
    }

    .exercise-statement {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 6px;
      line-height: 1.5;
    }

    .exercise-hint {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #fefce8;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 0.85rem;
      color: #92400e;
    }

    .exercise-hint i {
      color: #f59e0b;
      margin-top: 1px;
    }

    .code-block {
      background: #0f172a;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 20px;
      overflow-x: auto;
    }

    .code-block code {
      color: #7dd3fc;
      font-family: 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
    }

    .exercise-component-wrap {
      margin-top: 12px;
    }

    /* ── Actions ── */
    .action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding: 20px 28px;
      background: var(--surface-ground);
      border-top: 1px solid var(--surface-border);
    }

    .action-nav {
      display: flex;
      gap: 10px;
    }

    /* ── Empty state ── */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-color-secondary);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 16px;
      display: block;
    }

    /* ── Feedback Dialog (fd-*) ── */
    .fd-wrap {
      display: flex;
      flex-direction: column;
      max-height: 85vh;
      border-radius: 20px;
      overflow: hidden;
    }

    /* Colored header */
    .fd-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      flex-shrink: 0;
      gap: 16px;
    }
    .fd-header--success { background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-bottom: 2px solid #86efac; }
    .fd-header--partial  { background: linear-gradient(135deg, #fef9c3, #fde68a); border-bottom: 2px solid #fcd34d; }
    .fd-header--error    { background: linear-gradient(135deg, #fee2e2, #fecaca); border-bottom: 2px solid #fca5a5; }

    .fd-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }

    .fd-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .fd-icon--success { background: #16a34a; color: #fff; }
    .fd-icon--partial  { background: #d97706; color: #fff; }
    .fd-icon--error    { background: #dc2626; color: #fff; }

    .fd-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-color);
    }
    .fd-subtitle {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
      margin-top: 2px;
    }

    /* Score bubble */
    .fd-score {
      min-width: 64px;
      height: 64px;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .fd-score--success { background: #16a34a; color: #fff; }
    .fd-score--partial  { background: #d97706; color: #fff; }
    .fd-score--error    { background: #dc2626; color: #fff; }
    .fd-score-num { font-size: 1.8rem; font-weight: 900; line-height: 1; }
    .fd-score-den { font-size: 0.7rem; opacity: 0.8; }

    /* Close button */
    .fd-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(0,0,0,0.08);
      color: var(--text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .fd-close-btn:hover { background: rgba(0,0,0,0.16); }

    /* Scrollable body */
    .fd-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .fd-label {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--text-color-secondary);
    }

    .fd-text {
      font-size: 0.93rem;
      color: var(--text-color);
      line-height: 1.8;
    }

    .fd-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding: 9px 14px;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 10px;
      margin-top: 4px;
    }
    .fd-notice-text {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }

    /* Footer */
    .fd-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 24px;
      background: var(--surface-card);
      border-top: 1px solid var(--surface-border);
      flex-shrink: 0;
    }

    /* ── Loader ── */
    .loader-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 70vh;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--surface-border);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ExerciseSandboxComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activityService = inject(ActivityService);
  private exerciseService = inject(ExerciseService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(true);
  submitting = signal(false);
  activity = signal<ActivityWithExercises | null>(null);
  currentExerciseIndex = signal(0);
  answers = signal<ExerciseAnswer[]>([]);
  showFeedbackDrawer = signal(false);
  currentFeedback = signal<{ qualification: number; feedback: string } | null>(null);
  answerSubmitted = signal(false);

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
            code: ex.code || '',
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
      id: 0, statement: '', code: '', typeExercise: 'selection_single', hind: '',
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
      userId: 0,
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
    };

    this.exerciseService.checkAnswer(this.currentExercise.id, dto).subscribe({
      next: (feedback) => {
        this.currentFeedback.set(feedback);
        this.answerSubmitted.set(true);
        this.showFeedbackDrawer.set(true);
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
    this.currentFeedback.set(null);
    this.answerSubmitted.set(false);
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
          answerPhishingSelection: [], answerMatchPairs: []
        }
        : a
    ));
    this.showFeedbackDrawer.set(false);
    this.currentFeedback.set(null);
    this.answerSubmitted.set(false);
    this.cdr.detectChanges();
  }

  closeFeedbackDrawer(): void {
    this.showFeedbackDrawer.set(false);
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
