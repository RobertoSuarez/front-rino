import { Component, OnInit, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { ExerciseGenerationService, GeneratedExercise } from '../../../../core/services/exercise-generation.service';
import { ExerciseService } from '../../../../core/services/exercise.service';
import { CreateExerciseRequest } from '../../../../core/models/exercise.interface';

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  selection_single: 'Selección Simple',
  selection_multiple: 'Selección Múltiple',
  vertical_ordering: 'Orden Vertical',
  horizontal_ordering: 'Orden Horizontal',
  phishing_selection_multiple: 'Phishing',
  match_pairs: 'Emparejar',
};

const EXERCISE_TYPE_ICONS: Record<string, string> = {
  selection_single: 'pi-check-circle',
  selection_multiple: 'pi-check-square',
  vertical_ordering: 'pi-sort-amount-down',
  horizontal_ordering: 'pi-arrows-h',
  phishing_selection_multiple: 'pi-shield',
  match_pairs: 'pi-link',
};

const EXERCISE_TYPE_DESC: Record<string, string> = {
  selection_single: 'Una respuesta correcta entre varias opciones',
  selection_multiple: 'Varias respuestas correctas posibles',
  vertical_ordering: 'Ordenar elementos de arriba a abajo',
  horizontal_ordering: 'Ordenar elementos de izquierda a derecha',
  phishing_selection_multiple: 'Identificar emails y URLs maliciosas',
  match_pairs: 'Unir conceptos con sus definiciones',
};

type DialogStep = 'configure' | 'preview' | 'saving';

@Component({
  selector: 'app-generate-exercises-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ToastModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [`
    /* ── Form layout ── */
    .gen-form { display:flex; flex-direction:column; gap:22px; }
    .field { display:flex; flex-direction:column; gap:6px; }
    .field-label {
      font-size:0.8rem; font-weight:700;
      text-transform:uppercase; letter-spacing:0.06em;
      color:var(--text-color-secondary);
      display:flex; align-items:center; justify-content:space-between;
    }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

    /* ── Type chips grid ── */
    .type-chips-grid {
      display:grid;
      grid-template-columns: repeat(3, 1fr);
      gap:10px;
    }
    .type-chip {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:7px;
      padding:14px 10px 12px;
      border-radius:14px;
      border:2px solid var(--surface-border);
      background:var(--surface-card);
      cursor:pointer;
      transition:all 0.18s ease;
      text-align:center;
      user-select:none;
    }
    .type-chip:hover {
      border-color:var(--primary-color);
      background:var(--surface-hover);
      transform:translateY(-1px);
    }
    .type-chip.selected {
      border-color:var(--primary-color);
      background:color-mix(in srgb, var(--primary-color) 12%, transparent);
    }
    .type-chip .chip-icon {
      font-size:1.4rem;
      color:var(--text-color-secondary);
      transition:color 0.18s;
    }
    .type-chip.selected .chip-icon { color:var(--primary-color); }
    .type-chip .chip-label {
      font-size:0.78rem; font-weight:600;
      color:var(--text-color);
      line-height:1.2;
    }
    .type-chip .chip-check {
      width:18px; height:18px; border-radius:50%;
      border:2px solid var(--surface-border);
      background:transparent;
      display:flex; align-items:center; justify-content:center;
      font-size:0.65rem; color:transparent;
      transition:all 0.18s;
      margin-top:2px;
    }
    .type-chip.selected .chip-check {
      background:var(--primary-color);
      border-color:var(--primary-color);
      color:#fff;
    }
    .types-hint {
      font-size:0.78rem; color:var(--text-color-secondary);
      text-align:center; padding-top:4px;
    }
    .types-hint.all-selected { color:var(--primary-color); font-weight:600; }

    /* ── Qty stepper ── */
    .qty-wrap {
      display:flex; align-items:center; gap:0;
      border:1px solid var(--surface-border);
      border-radius:10px; overflow:hidden;
    }
    .qty-btn {
      width:38px; height:38px; border:none; background:var(--surface-ground);
      color:var(--text-color); cursor:pointer; font-size:1rem;
      display:flex; align-items:center; justify-content:center;
      transition:background 0.15s;
    }
    .qty-btn:hover { background:var(--surface-hover); }
    .qty-btn:disabled { opacity:.35; cursor:not-allowed; }
    .qty-display {
      flex:1; text-align:center; font-size:1.1rem; font-weight:700;
      color:var(--text-color); padding:0 8px;
      border:none; background:var(--surface-card);
    }

    /* ── Dialog actions ── */
    .dialog-actions {
      display:flex; align-items:center; gap:10px;
      padding-top:18px; border-top:1px solid var(--surface-border); margin-top:4px;
    }

    /* ── Preview ── */
    .preview-list { display:flex; flex-direction:column; gap:10px; }
    .preview-card {
      border:1px solid var(--surface-border); border-radius:12px;
      background:var(--surface-card);
      overflow:hidden;
      transition: border-color 0.2s;
    }
    .preview-card.editing { border-color:var(--primary-color); }
    .card-view {
      padding:14px 16px;
      display:flex; align-items:flex-start; gap:12px;
    }
    .card-edit {
      padding:16px;
      border-top:2px solid var(--primary-color);
      background:var(--surface-ground);
      display:flex; flex-direction:column; gap:14px;
    }
    .edit-field { display:flex; flex-direction:column; gap:5px; }
    .edit-field label {
      font-size:0.75rem; font-weight:700; text-transform:uppercase;
      letter-spacing:0.05em; color:var(--text-color-secondary);
    }
    .options-list { display:flex; flex-direction:column; gap:6px; }
    .option-row {
      display:flex; align-items:center; gap:8px;
    }
    .option-row input[type=checkbox] { width:16px; height:16px; cursor:pointer; flex-shrink:0; }
    .option-input { flex:1; }
    .edit-actions {
      display:flex; justify-content:flex-end; gap:8px;
      padding-top:10px; border-top:1px solid var(--surface-border);
    }
    .preview-num {
      min-width:26px; height:26px; border-radius:8px;
      background:var(--primary-color); color:var(--primary-color-text);
      font-size:0.75rem; font-weight:700;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
    }
    .preview-card-body { flex:1; min-width:0; }
    .preview-statement { font-size:0.88rem; color:var(--text-color); line-height:1.55; }
    .preview-meta { margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; }
    .preview-empty {
      text-align:center; padding:40px; color:var(--text-color-secondary); font-size:0.9rem;
    }

    /* ── Loading ── */
    .loading-overlay {
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; padding:52px 24px; gap:18px;
    }
    .loading-overlay span { color:var(--text-color-secondary); font-size:0.9rem; }
  `],
  template: `
    <p-toast></p-toast>

    <p-dialog
      [(visible)]="visible"
      (onHide)="onClose()"
      [header]="dialogHeader"
      [modal]="true"
      [style]="{ width: '780px', 'max-width': '96vw' }"
      [closable]="step !== 'saving'"
      [draggable]="false"
      [resizable]="false">

      <!-- ═══ STEP: configure ════════════════════════════════════ -->
      <ng-container *ngIf="step === 'configure'">
        <form [formGroup]="generationForm" (ngSubmit)="onGenerate()" class="gen-form">

          <!-- Prompt -->
          <div class="field">
            <span class="field-label">
              Describe qué ejercicios necesitas
              <span style="font-weight:400; text-transform:none; font-size:0.75rem;">
                {{ generationForm.get('prompt')?.value?.length || 0 }} caracteres
              </span>
            </span>
            <textarea pTextarea formControlName="prompt" [rows]="3" style="width:100%; resize:vertical;"
              placeholder="Ej: Genera ejercicios sobre phishing, cómo identificar emails sospechosos y URLs maliciosas...">
            </textarea>
            <small *ngIf="generationForm.get('prompt')?.invalid && generationForm.get('prompt')?.touched"
              style="color:var(--red-500)">Mínimo 10 caracteres.</small>
          </div>

          <!-- Dificultad + Cantidad -->
          <div class="field-row">
            <div class="field">
              <span class="field-label">Dificultad</span>
              <p-select formControlName="difficulty" [options]="difficultyOptions"
                optionLabel="label" optionValue="value" styleClass="w-full">
              </p-select>
            </div>
            <div class="field">
              <span class="field-label">Cantidad de ejercicios</span>
              <div class="qty-wrap">
                <button type="button" class="qty-btn" (click)="changeQty(-1)"
                  [disabled]="generationForm.get('quantity')?.value <= 1">
                  <i class="pi pi-minus" style="font-size:0.8rem;"></i>
                </button>
                <span class="qty-display">{{ generationForm.get('quantity')?.value }}</span>
                <button type="button" class="qty-btn" (click)="changeQty(1)"
                  [disabled]="generationForm.get('quantity')?.value >= 10">
                  <i class="pi pi-plus" style="font-size:0.8rem;"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Tipos de ejercicios: chips toggle -->
          <div class="field">
            <span class="field-label">
              Tipos de ejercicios
              <button type="button"
                (click)="toggleAllTypes()"
                style="background:none;border:none;cursor:pointer;font-size:0.75rem;font-weight:600;color:var(--primary-color);padding:0;">
                {{ selectedTypes.size === 0 ? '✓ todos seleccionados' : 'limpar selección' }}
              </button>
            </span>

            <div class="type-chips-grid">
              <div *ngFor="let t of exerciseTypeOptions"
                class="type-chip"
                [class.selected]="isTypeSelected(t.value)"
                (click)="toggleType(t.value)"
                [pTooltip]="getTypeDesc(t.value)"
                tooltipPosition="top">
                <i class="pi {{ getTypeIcon(t.value) }} chip-icon"></i>
                <span class="chip-label">{{ t.label }}</span>
                <span class="chip-check"><i class="pi pi-check" style="font-size:0.6rem;"></i></span>
              </div>
            </div>

            <p class="types-hint" [class.all-selected]="selectedTypes.size === 0">
              <ng-container *ngIf="selectedTypes.size === 0">
                <i class="pi pi-check-circle"></i> Se usarán todos los tipos de ejercicios
              </ng-container>
              <ng-container *ngIf="selectedTypes.size > 0">
                {{ selectedTypes.size }} tipo{{ selectedTypes.size !== 1 ? 's' : '' }} seleccionado{{ selectedTypes.size !== 1 ? 's' : '' }}
              </ng-container>
            </p>
          </div>

          <!-- Contexto -->
          <div class="field">
            <span class="field-label">
              Contexto adicional
              <span style="font-weight:400; text-transform:none; font-size:0.75rem;">opcional</span>
            </span>
            <input pInputText formControlName="context" style="width:100%"
              placeholder="Ej: Capítulo 2 - Seguridad en Email, nivel principiante..." />
          </div>

          <div class="dialog-actions">
            <p-button type="button" label="Cancelar" severity="secondary" [outlined]="true"
              (onClick)="onClose()">
            </p-button>
            <div style="flex:1"></div>
            <p-button type="submit" icon="pi pi-sparkles" iconPos="right"
              label="Generar con IA"
              severity="success"
              [disabled]="generationForm.invalid">
            </p-button>
          </div>
        </form>
      </ng-container>

      <!-- ═══ STEP: saving / loading ════════════════════════════ -->
      <ng-container *ngIf="step === 'saving'">
        <div class="loading-overlay">
          <p-progressSpinner [style]="{ width: '52px', height: '52px' }" strokeWidth="4"></p-progressSpinner>
          <span>{{ loadingMessage }}</span>
        </div>
      </ng-container>

      <!-- ═══ STEP: preview ══════════════════════════════════════ -->
      <ng-container *ngIf="step === 'preview'">

        <p style="color:var(--text-color-secondary); font-size:0.84rem; margin:0 0 14px;">
          <i class="pi pi-info-circle"></i>&nbsp;
          Revisa y edita los ejercicios. Elimina los que no te gusten antes de guardar.
        </p>

        <div *ngIf="previewExercises.length === 0" class="preview-empty">
          <i class="pi pi-inbox" style="font-size:2rem; display:block; margin-bottom:10px;"></i>
          No quedan ejercicios. Vuelve atrás para regenerar.
        </div>

        <div class="preview-list" *ngIf="previewExercises.length > 0">
          <div class="preview-card" [class.editing]="editingIndex === i"
               *ngFor="let ex of previewExercises; let i = index">

            <!-- ── Card view (read mode) ────────────────────────── -->
            <div class="card-view" *ngIf="editingIndex !== i">
              <span class="preview-num">{{ i + 1 }}</span>
              <div class="preview-card-body">
                <div class="preview-statement">{{ ex.statement }}</div>
                <div class="preview-meta">
                  <p-tag [value]="getTypeLabel(ex.typeExercise)" severity="info" [rounded]="true"></p-tag>
                  <p-tag [value]="ex.difficulty" [severity]="getDifficultySeverity(ex.difficulty)" [rounded]="true"></p-tag>
                </div>
              </div>
              <p-button icon="pi pi-pencil" severity="secondary" [outlined]="true" [rounded]="true"
                size="small" (onClick)="startEdit(i)" pTooltip="Editar">
              </p-button>
              <p-button icon="pi pi-trash" severity="danger" [outlined]="true" [rounded]="true"
                size="small" (onClick)="removeExercise(i)" pTooltip="Eliminar">
              </p-button>
            </div>

            <!-- ── Card edit (edit mode) ────────────────────────── -->
            <div class="card-edit" *ngIf="editingIndex === i && editForm">

              <!-- Statement -->
              <div class="edit-field">
                <label>Enunciado</label>
                <textarea pTextarea [(ngModel)]="editForm!.statement" [rows]="3"
                  style="width:100%; resize:vertical;"></textarea>
              </div>

              <!-- Difficulty -->
              <div class="edit-field" style="max-width:220px">
                <label>Dificultad</label>
                <p-select [(ngModel)]="editForm!.difficulty"
                  [options]="difficultyOptions" optionLabel="label" optionValue="value"
                  styleClass="w-full">
                </p-select>
              </div>

              <!-- OPTIONS: selection_single -->
              <ng-container *ngIf="ex.typeExercise === 'selection_single'">
                <div class="edit-field">
                  <label>Opciones <small style="font-weight:400;text-transform:none">(marca la correcta)</small></label>
                  <div class="options-list">
                    <div class="option-row" *ngFor="let opt of editForm!.optionSelectOptions; let j = index">
                      <input type="radio" name="correct_{{i}}"
                        [checked]="editForm!.answerSelectCorrect === opt"
                        (change)="editForm!.answerSelectCorrect = opt" />
                      <input pInputText class="option-input"
                        [(ngModel)]="editForm!.optionSelectOptions![j]"
                        (ngModelChange)="syncSingleAnswer(editForm!, j, $event)" />
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- OPTIONS: selection_multiple -->
              <ng-container *ngIf="ex.typeExercise === 'selection_multiple'">
                <div class="edit-field">
                  <label>Opciones <small style="font-weight:400;text-transform:none">(marca las correctas)</small></label>
                  <div class="options-list">
                    <div class="option-row" *ngFor="let opt of editForm!.optionSelectOptions; let j = index">
                      <input type="checkbox"
                        [checked]="isMultipleCorrect(editForm!, opt)"
                        (change)="toggleMultipleCorrect(editForm!, opt, $event)" />
                      <input pInputText class="option-input"
                        [(ngModel)]="editForm!.optionSelectOptions![j]" />
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- OPTIONS: vertical_ordering -->
              <ng-container *ngIf="ex.typeExercise === 'vertical_ordering'">
                <div class="edit-field">
                  <label>Orden correcto (de arriba a abajo)</label>
                  <div class="options-list">
                    <div class="option-row" *ngFor="let opt of editForm!.answerVerticalOrdering; let j = index">
                      <span style="min-width:20px;text-align:center;color:var(--text-color-secondary);font-size:0.8rem;">{{ j+1 }}</span>
                      <input pInputText class="option-input" [(ngModel)]="editForm!.answerVerticalOrdering![j]" />
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- OPTIONS: horizontal_ordering -->
              <ng-container *ngIf="ex.typeExercise === 'horizontal_ordering'">
                <div class="edit-field">
                  <label>Orden correcto (de izquierda a derecha)</label>
                  <div class="options-list">
                    <div class="option-row" *ngFor="let opt of editForm!.answerHorizontalOrdering; let j = index">
                      <span style="min-width:20px;text-align:center;color:var(--text-color-secondary);font-size:0.8rem;">{{ j+1 }}</span>
                      <input pInputText class="option-input" [(ngModel)]="editForm!.answerHorizontalOrdering![j]" />
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- OPTIONS: phishing -->
              <ng-container *ngIf="ex.typeExercise === 'phishing_selection_multiple'">
                <div class="edit-field">
                  <label>Opciones <small style="font-weight:400;text-transform:none">(marca los que son phishing)</small></label>
                  <div class="options-list">
                    <div class="option-row" *ngFor="let opt of editForm!.optionsPhishingSelection; let j = index">
                      <input type="checkbox"
                        [checked]="isPhishingCorrect(editForm!, opt)"
                        (change)="togglePhishingCorrect(editForm!, opt, $event)" />
                      <input pInputText class="option-input"
                        [(ngModel)]="editForm!.optionsPhishingSelection![j]" />
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- OPTIONS: match_pairs -->
              <ng-container *ngIf="ex.typeExercise === 'match_pairs'">
                <div class="edit-field">
                  <label>Pares (izquierda → derecha)</label>
                  <div class="options-list">
                    <div class="option-row" *ngFor="let pair of editForm!.pairs; let j = index">
                      <input pInputText class="option-input" [(ngModel)]="editForm!.pairs![j].left"
                        placeholder="Concepto" />
                      <span style="color:var(--text-color-secondary)"><i class="pi pi-arrow-right"></i></span>
                      <input pInputText class="option-input" [(ngModel)]="editForm!.pairs![j].right"
                        placeholder="Definición" />
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- Edit actions -->
              <div class="edit-actions">
                <p-button label="Cancelar" severity="secondary" [outlined]="true" size="small"
                  (onClick)="cancelEdit()">
                </p-button>
                <p-button label="Guardar cambios" icon="pi pi-check" size="small"
                  severity="success" (onClick)="saveEdit(i)">
                </p-button>
              </div>
            </div>

          </div>
        </div>

        <div class="dialog-actions">
          <p-button type="button" icon="pi pi-arrow-left" label="Volver"
            severity="secondary" [outlined]="true" (onClick)="backToConfigure()">
          </p-button>
          <div style="flex:1"></div>
          <p-button
            icon="pi pi-save" iconPos="right"
            [label]="'Guardar ' + previewExercises.length + (previewExercises.length === 1 ? ' ejercicio' : ' ejercicios')"
            severity="success"
            [disabled]="previewExercises.length === 0"
            (onClick)="saveAll()">
          </p-button>
        </div>
      </ng-container>

    </p-dialog>
  `,
})
export class GenerateExercisesDialogComponent implements OnInit {
  @Input() activityId: number | null = null;
  @Output() exercisesGenerated = new EventEmitter<GeneratedExercise[]>();
  @Output() dialogClosed = new EventEmitter<void>();

  visible = false;
  step: DialogStep = 'configure';
  loadingMessage = 'Generando ejercicios con IA...';
  generationForm: FormGroup;
  previewExercises: GeneratedExercise[] = [];

  // Inline editing
  editingIndex: number | null = null;
  editForm: GeneratedExercise | null = null;

  // Track selected types as a Set (empty = all types)
  selectedTypes = new Set<string>();

  difficultyOptions = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Medio', value: 'Medio' },
    { label: 'Difícil', value: 'Difícil' },
  ];

  exerciseTypeOptions = [
    { label: 'Selección Simple', value: 'selection_single' },
    { label: 'Selección Múltiple', value: 'selection_multiple' },
    { label: 'Orden Vertical', value: 'vertical_ordering' },
    { label: 'Orden Horizontal', value: 'horizontal_ordering' },
    { label: 'Phishing', value: 'phishing_selection_multiple' },
    { label: 'Emparejar', value: 'match_pairs' },
  ];

  get dialogHeader(): string {
    if (this.step === 'configure') return 'Generar Ejercicios con IA';
    if (this.step === 'saving') return 'Procesando...';
    return `Vista previa — ${this.previewExercises.length} ejercicio${this.previewExercises.length !== 1 ? 's' : ''} generados`;
  }

  constructor(
    private fb: FormBuilder,
    private generationService: ExerciseGenerationService,
    private exerciseService: ExerciseService,
    private messageService: MessageService,
  ) {
    this.generationForm = this.createForm();
  }

  ngOnInit() { }

  createForm(): FormGroup {
    return this.fb.group({
      prompt: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['Medio', Validators.required],
      quantity: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      context: [''],
    });
  }

  open() {
    this.visible = true;
    this.step = 'configure';
    this.previewExercises = [];
    this.selectedTypes.clear();
  }

  onClose() {
    this.visible = false;
    this.step = 'configure';
    this.previewExercises = [];
    this.selectedTypes.clear();
    this.generationForm.reset({ difficulty: 'Medio', quantity: 3 });
    this.dialogClosed.emit();
  }

  backToConfigure() { this.step = 'configure'; }
  removeExercise(i: number) { this.previewExercises = this.previewExercises.filter((_, idx) => idx !== i); }

  // ── Type chip helpers ────────────────────────────────────────
  isTypeSelected(value: string): boolean { return this.selectedTypes.has(value); }

  toggleType(value: string) {
    if (this.selectedTypes.has(value)) {
      this.selectedTypes.delete(value);
    } else {
      this.selectedTypes.add(value);
    }
    // re-assign to trigger CD
    this.selectedTypes = new Set(this.selectedTypes);
  }

  toggleAllTypes() {
    if (this.selectedTypes.size === 0) {
      // select all
      this.selectedTypes = new Set(this.exerciseTypeOptions.map(t => t.value));
    } else {
      // clear all → means "all"
      this.selectedTypes.clear();
      this.selectedTypes = new Set(this.selectedTypes);
    }
  }

  getTypeIcon(type: string): string { return EXERCISE_TYPE_ICONS[type] ?? 'pi-circle'; }
  getTypeDesc(type: string): string { return EXERCISE_TYPE_DESC[type] ?? ''; }
  getTypeLabel(type: string): string { return EXERCISE_TYPE_LABELS[type] ?? type; }

  // ── Quantity stepper ─────────────────────────────────────────
  changeQty(delta: number) {
    const ctrl = this.generationForm.get('quantity')!;
    const next = (ctrl.value ?? 3) + delta;
    if (next >= 1 && next <= 10) ctrl.setValue(next);
  }

  // ── Difficulty tag severity ──────────────────────────────────
  getDifficultySeverity(d: string): 'success' | 'warn' | 'danger' {
    if (d === 'Fácil') return 'success';
    if (d === 'Difícil') return 'danger';
    return 'warn';
  }

  // ── Inline edit ──────────────────────────────────────────────
  startEdit(i: number) {
    // Deep clone to avoid mutating the original until the user confirms
    this.editForm = JSON.parse(JSON.stringify(this.previewExercises[i]));
    this.editingIndex = i;
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editForm = null;
  }

  saveEdit(i: number) {
    if (this.editForm) {
      this.previewExercises[i] = { ...this.editForm };
      this.previewExercises = [...this.previewExercises]; // trigger CD
    }
    this.cancelEdit();
  }

  // selection_single: keep answerSelectCorrect in sync when option text changes
  syncSingleAnswer(form: GeneratedExercise, idx: number, newVal: string) {
    const opts = form.optionSelectOptions ?? [];
    // if the previously-correct answer was THIS option, update it
    if (form.answerSelectCorrect === opts[idx]) {
      form.answerSelectCorrect = newVal;
    }
  }

  // selection_multiple helpers
  isMultipleCorrect(form: GeneratedExercise, opt: string): boolean {
    return (form.answerSelectsCorrect ?? []).includes(opt);
  }

  toggleMultipleCorrect(form: GeneratedExercise, opt: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    let answers = [...(form.answerSelectsCorrect ?? [])];
    if (checked) { if (!answers.includes(opt)) answers.push(opt); }
    else { answers = answers.filter(a => a !== opt); }
    form.answerSelectsCorrect = answers;
  }

  // phishing helpers
  isPhishingCorrect(form: GeneratedExercise, opt: string): boolean {
    return (form.answerPhishingSelection ?? []).includes(opt);
  }

  togglePhishingCorrect(form: GeneratedExercise, opt: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    let answers = [...(form.answerPhishingSelection ?? [])];
    if (checked) { if (!answers.includes(opt)) answers.push(opt); }
    else { answers = answers.filter(a => a !== opt); }
    form.answerPhishingSelection = answers;
  }

  // ── Generate ─────────────────────────────────────────────────
  onGenerate() {
    if (!this.generationForm.valid) return;
    if (!this.activityId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontró la actividad', life: 3000 });
      return;
    }

    const fv = this.generationForm.value;
    const typesArr = this.selectedTypes.size > 0 ? Array.from(this.selectedTypes) : undefined;
    this.loadingMessage = `Generando ${fv.quantity} ejercicio${fv.quantity !== 1 ? 's' : ''} con IA…`;
    this.step = 'saving';

    this.generationService.generateExercisesWithPrompt({
      prompt: fv.prompt,
      difficulty: fv.difficulty,
      quantity: fv.quantity,
      exerciseTypes: typesArr,
      context: fv.context || undefined,
      balanceTypes: true,
    }).subscribe({
      next: (response) => {
        this.previewExercises = response.data.exercises;
        this.step = 'preview';
      },
      error: (err) => {
        console.error('Error generating', err);
        this.messageService.add({
          severity: 'error', summary: 'Error al generar',
          detail: err.error?.message || 'No se pudo conectar con el servicio de IA.',
          life: 5000,
        });
        this.step = 'configure';
      },
    });
  }

  // ── Save ─────────────────────────────────────────────────────
  saveAll() {
    if (!this.activityId || this.previewExercises.length === 0) return;
    this.loadingMessage = `Guardando ${this.previewExercises.length} ejercicio${this.previewExercises.length !== 1 ? 's' : ''}…`;
    this.step = 'saving';

    const reqs = this.previewExercises.map(ex => {
      const data: CreateExerciseRequest = {
        activityId: this.activityId!,
        statement: ex.statement,
        difficulty: ex.difficulty,
        code: ex.code || '',
        hind: ex.hint || '',
        typeExercise: ex.typeExercise as any,
        optionSelectOptions: ex.optionSelectOptions || [],
        optionOrderFragmentCode: ex.optionOrderFragmentCode || [],
        optionOrderLineCode: ex.optionOrderLineCode || [],
        optionsFindErrorCode: ex.optionsFindErrorCode || [],
        answerSelectCorrect: ex.answerSelectCorrect || '',
        answerSelectsCorrect: ex.answerSelectsCorrect || [],
        answerOrderFragmentCode: ex.answerOrderFragmentCode || [],
        answerOrderLineCode: ex.answerOrderLineCode || [],
        answerFindError: ex.answerFindError || '',
        answerWriteCode: '',
        optionsVerticalOrdering: ex.optionsVerticalOrdering || [],
        answerVerticalOrdering: ex.answerVerticalOrdering || [],
        optionsHorizontalOrdering: ex.optionsHorizontalOrdering || [],
        answerHorizontalOrdering: ex.answerHorizontalOrdering || [],
        optionsPhishingSelection: ex.optionsPhishingSelection || [],
        answerPhishingSelection: ex.answerPhishingSelection || [],
        phishingContext: ex.phishingContext || '',
        phishingImageUrl: ex.phishingImageUrl || '',
        optionsMatchPairsLeft: ex.leftItems || [],
        optionsMatchPairsRight: ex.rightItems || [],
        answerMatchPairs: ex.pairs || [],
      };
      return this.exerciseService.createExercise(data);
    });

    forkJoin(reqs).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: '¡Guardado!',
          detail: `${this.previewExercises.length} ejercicio${this.previewExercises.length !== 1 ? 's guardados' : ' guardado'} correctamente.`,
          life: 3000,
        });
        this.exercisesGenerated.emit([]);
        this.onClose();
      },
      error: () => {
        this.messageService.add({
          severity: 'error', summary: 'Error al guardar',
          detail: 'Ocurrió un error al guardar los ejercicios. Intenta de nuevo.',
          life: 4000,
        });
        this.step = 'preview';
      },
    });
  }
}
