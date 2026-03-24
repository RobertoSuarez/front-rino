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
    /* ── Gamified Global ── */
    :host {
      --ds-primary: #58cc02;
      --ds-primary-shadow: #58a700;
      --ds-blue: #1cb0f6;
      --ds-blue-shadow: #1899d6;
      --ds-amber: #ffc800;
      --ds-amber-shadow: #e5b400;
      --ds-surface: #ffffff;
      --ds-surface-hover: #f7f7f7;
      --ds-border: #e5e5e5;
      --ds-text: #4b4b4b;
      --ds-text-sec: #777777;
    }

    /* ── Form layout ── */
    .gen-form { display:flex; flex-direction:column; gap:24px; }
    .field { display:flex; flex-direction:column; gap:8px; }
    .field-label {
      font-size:0.9rem; font-weight:800; color:var(--ds-text);
      display:flex; align-items:center; justify-content:space-between;
    }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; }

    /* ── Textarea & Inputs ── */
    :host ::ng-deep .p-inputtext, :host ::ng-deep .p-component {
       border-radius: 12px; border: 2px solid var(--ds-border); font-family: inherit;
    }
    :host ::ng-deep .p-inputtext:enabled:focus { border-color: var(--ds-blue); box-shadow: none; }

    /* ── Type chips grid ── */
    .type-chips-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; }
    .type-chip {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:8px; padding:16px 10px; border-radius:16px;
      border:2px solid var(--ds-border); background:var(--ds-surface);
      cursor:pointer; transition:all 0.15s ease; text-align:center; user-select:none;
      box-shadow: 0 4px 0 var(--ds-border);
    }
    .type-chip:hover { transform:translateY(-2px); box-shadow: 0 6px 0 var(--ds-border); }
    .type-chip:active { transform:translateY(2px); box-shadow: 0 0 0 var(--ds-border); }
    .type-chip.selected {
      border-color:var(--ds-blue); background:rgba(28, 176, 246, 0.08); /* light blue */
      box-shadow: 0 4px 0 var(--ds-blue-shadow);
    }
    .type-chip .chip-icon { font-size:1.8rem; color:var(--ds-text-sec); }
    .type-chip.selected .chip-icon { color:var(--ds-blue); }
    .type-chip .chip-label { font-size:0.9rem; font-weight:800; color:var(--ds-text); line-height:1.2; }
    .type-chip .chip-check {
      width:24px; height:24px; border-radius:50%; border:2px solid var(--ds-border);
      display:flex; align-items:center; justify-content:center;
      font-size:0.8rem; color:transparent; margin-top:4px; font-weight:bold;
    }
    .type-chip.selected .chip-check { background:var(--ds-blue); border-color:var(--ds-blue); color:#fff; }
    .types-hint { font-size:0.85rem; color:var(--ds-text-sec); text-align:center; padding-top:4px; font-weight:700; }
    .types-hint.all-selected { color:var(--ds-blue); }

    /* ── Qty stepper ── */
    .qty-wrap {
      display:flex; align-items:center; gap:0;
      border:2px solid var(--ds-border); border-radius:16px; overflow:hidden;
      box-shadow: 0 4px 0 var(--ds-border); height: 48px;
    }
    .qty-btn {
      width:48px; height:100%; border:none; background:var(--ds-surface-hover);
      color:var(--ds-text); cursor:pointer; font-size:1.2rem; font-weight: 800;
    }
    .qty-btn:hover { background:#ececec; }
    .qty-display {
      flex:1; text-align:center; font-size:1.2rem; font-weight:800;
      color:var(--ds-text); background:var(--ds-surface); height: 100%; display: flex; align-items: center; justify-content: center;
    }

    /* ── Gamified Buttons ── */
    .btn-gamified {
      border-radius: 16px; font-weight: 800; font-size: 1rem;
      padding: 12px 24px; text-align: center; cursor: pointer;
      border: none; transition: transform 0.1s, box-shadow 0.1s; letter-spacing: 0.5px;
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      text-transform: uppercase;
    }
    .btn-gamified:active { transform: translateY(4px); box-shadow: none !important; }
    .btn-gamified:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none !important; }

    .btn-primary { background: var(--ds-primary); color: white; box-shadow: 0 4px 0 var(--ds-primary-shadow); text-shadow: 0 1px 1px rgba(0,0,0,0.2); }
    .btn-secondary { background: var(--ds-surface); color: var(--ds-text-sec); border: 2px solid var(--ds-border); box-shadow: 0 4px 0 var(--ds-border); }
    .btn-danger { background: #ff4b4b; color: white; box-shadow: 0 4px 0 #ea2b2b; }
    .btn-blue { background: var(--ds-blue); color: white; box-shadow: 0 4px 0 var(--ds-blue-shadow); }

    .dialog-actions { display:flex; align-items:center; gap:16px; padding-top:24px; border-top:2px solid var(--ds-border); margin-top:10px; }

    /* ── Preview Controls ── */
    .preview-header-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .view-toggles { display: flex; background: var(--ds-surface-hover); border-radius: 12px; padding: 4px; border: 2px solid var(--ds-border); }
    .view-toggle-btn {
      padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.9rem;
      color: var(--ds-text-sec); border: none; background: transparent; transition: all 0.2s;
      display: flex; align-items: center; gap: 8px;
    }
    .view-toggle-btn.active { background: var(--ds-surface); color: var(--ds-blue); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

    /* ── Preview List/Sandbox ── */
    .preview-list { display:flex; flex-direction:column; gap:16px; }
    .preview-sandbox { display: grid; grid-template-columns: 1fr; gap: 32px; padding: 20px 0; }

    .preview-card {
      border: 2px solid var(--ds-border); border-radius: 20px;
      background: var(--ds-surface); overflow: hidden;
      box-shadow: 0 6px 0 var(--ds-border); transition: border-color 0.2s, box-shadow 0.2s;
    }
    .preview-card.editing { border-color: var(--ds-blue); box-shadow: 0 6px 0 var(--ds-blue-shadow); }
    
    .card-view { padding:20px; display:flex; align-items:flex-start; gap:14px; }
    .sandbox-view .card-view { padding: 32px; flex-direction: column; gap: 16px; }
    .card-edit { padding:24px; border-top:2px solid var(--ds-border); background:var(--ds-surface-hover); display:flex; flex-direction:column; gap:16px; }
    
    .preview-num {
      min-width:36px; height:36px; border-radius:12px;
      background:var(--ds-blue); color:white;
      font-size:1.1rem; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .sandbox-view .preview-num { display: none; } /* Hidden in sandbox to use custom header */

    /* Generic List View Typography */
    .preview-card-body { flex:1; min-width:0; width: 100%; }
    .preview-statement { font-size:1.05rem; font-weight: 700; color:var(--ds-text); line-height:1.5; }
    .preview-meta { margin-top:16px; display:flex; gap:10px; flex-wrap:wrap; }
    
    .sandbox-view .card-actions { display: flex; justify-content: flex-end; width: 100%; gap: 10px; margin-top: 24px; border-top: 2px solid var(--ds-border); padding-top: 20px; }
    .list-view .card-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .preview-empty { text-align:center; padding:60px; color:var(--ds-text-sec); font-size:1.1rem; font-weight: 700; }

    /* Sandbox Player Styles */
    .sb-header { display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 2px solid var(--ds-border); padding-bottom: 12px; margin-bottom: 8px; }
    .sb-type-label { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; color: var(--ds-blue); text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
    .sb-exercise-num { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; color: var(--ds-text-sec); text-transform: uppercase; }
    .sb-statement { font-size: 1.4rem; font-weight: 800; color: var(--ds-text); line-height: 1.35; margin: 8px 0 16px; }
    .sb-hint-box { border: 2px solid var(--ds-amber); background: #fffbe6; border-radius: 12px; padding: 12px 16px; font-weight: 700; color: #a38100; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: 0.95rem; }
    .sb-instruction-box { color: var(--ds-blue); font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; }
    
    /* Sandbox UI Elements */
    .sb-option { border: 2px solid var(--ds-border); border-radius: 12px; padding: 12px 16px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; font-weight: 700; color: var(--ds-text-sec); font-size: 0.95rem; background: var(--ds-surface); }
    .sb-option-num { background: var(--ds-surface-hover); border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; margin-right: 12px; color: var(--ds-text-sec); font-weight: 800; flex-shrink: 0; }
    .sb-option-text { flex: 1; }
    .sb-radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--ds-border); flex-shrink: 0; }
    .sb-checkbox-square { width: 20px; height: 20px; border-radius: 6px; border: 2px solid var(--ds-border); flex-shrink: 0; }
    .sb-answer-match { background: #f0f9ff; border-color: var(--ds-blue); color: var(--ds-blue); }
    .sb-answer-match .sb-radio-circle { border-color: var(--ds-blue); border-width: 6px; background: white; }
    
    /* ── Loading ── */
    .loading-overlay { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 24px; gap:20px; }
    .loading-overlay span { color:var(--ds-text); font-size:1.2rem; font-weight: 800; }
    
    /* ── Edit Form specific ── */
    .edit-field { display:flex; flex-direction:column; gap:8px; }
    .edit-field label { font-size:0.8rem; font-weight:800; text-transform:uppercase; color:var(--ds-text-sec); }
    .options-list { display:flex; flex-direction:column; gap:10px; }
    .option-row { display:flex; align-items:center; gap:10px; }
    .option-input { flex:1; }
    .edit-actions { display:flex; justify-content:flex-end; gap:12px; padding-top:16px; border-top:2px solid var(--ds-border); }
  `],
  template: `
    <p-toast></p-toast>

    <p-dialog
      [(visible)]="visible"
      (onHide)="onClose()"
      [header]="dialogHeader"
      [modal]="true"
      styleClass="gamified-dialog"
      [style]="{ width: '850px', 'max-width': '95vw' }"
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
              <span style="font-weight:600; text-transform:none; font-size:0.8rem; color:var(--ds-blue)">
                {{ generationForm.get('prompt')?.value?.length || 0 }} caracteres
              </span>
            </span>
            <textarea pTextarea formControlName="prompt" [rows]="3" style="width:100%; resize:vertical;"
              placeholder="Ej: Genera ejercicios sobre phishing, cómo identificar emails sospechosos y URLs maliciosas...">
            </textarea>
            <small *ngIf="generationForm.get('prompt')?.invalid && generationForm.get('prompt')?.touched"
              style="color:#ff4b4b; font-weight: 700">Mínimo 10 caracteres.</small>
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
              <span class="field-label">Cantidad (1 a 10)</span>
              <div class="qty-wrap">
                <button type="button" class="qty-btn" (click)="changeQty(-1)"
                  [disabled]="generationForm.get('quantity')?.value <= 1">
                  <i class="pi pi-minus" style="font-size:0.9rem;"></i>
                </button>
                <span class="qty-display">{{ generationForm.get('quantity')?.value }}</span>
                <button type="button" class="qty-btn" (click)="changeQty(1)"
                  [disabled]="generationForm.get('quantity')?.value >= 10">
                  <i class="pi pi-plus" style="font-size:0.9rem;"></i>
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
                style="background:none;border:none;cursor:pointer;font-size:0.8rem;font-weight:800;color:var(--ds-blue);padding:0;text-transform:uppercase;">
                {{ selectedTypes.size === 0 ? '✓ TODOS' : 'LIMPIAR' }}
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
                <span class="chip-check"><i class="pi pi-check" style="font-size:0.7rem;"></i></span>
              </div>
            </div>

            <p class="types-hint" [class.all-selected]="selectedTypes.size === 0">
              <ng-container *ngIf="selectedTypes.size === 0">
                <i class="pi pi-check-circle" style="vertical-align: middle"></i> Se usarán todos los tipos (IA decidirá la mezcla)
              </ng-container>
              <ng-container *ngIf="selectedTypes.size > 0">
                Seleccionados: {{ selectedTypes.size }}
              </ng-container>
            </p>
          </div>

          <!-- Contexto -->
          <div class="field">
            <span class="field-label">
              Contexto adicional <span style="font-weight:600; text-transform:none; font-size:0.8rem; color:var(--ds-text-sec)">OPCIONAL</span>
            </span>
            <input pInputText formControlName="context" style="width:100%"
              placeholder="Ej: Capítulo 2 - Seguridad en Email, nivel principiante..." />
          </div>

          <div class="dialog-actions">
            <button type="button" class="btn-gamified btn-secondary" (click)="onClose()">
              CANCELAR
            </button>
            <div style="flex:1"></div>
            <button type="submit" class="btn-gamified btn-blue" [disabled]="generationForm.invalid">
              <i class="pi pi-sparkles"></i> GENERAR AHORA
            </button>
          </div>
        </form>
      </ng-container>

      <!-- ═══ STEP: saving / loading ════════════════════════════ -->
      <ng-container *ngIf="step === 'saving'">
        <div class="loading-overlay">
          <p-progressSpinner [style]="{ width: '64px', height: '64px' }" strokeWidth="5" animationDuration="1s"></p-progressSpinner>
          <span>{{ loadingMessage }}</span>
        </div>
      </ng-container>

      <!-- ═══ STEP: preview ══════════════════════════════════════ -->
      <ng-container *ngIf="step === 'preview'">

        <div class="preview-header-controls">
          <p style="color:var(--ds-text-sec); font-size:0.95rem; font-weight: 700; margin: 0;">
            <i class="pi pi-sparkles" style="color:var(--ds-primary)"></i>&nbsp;
            Revisa, edita o elimina los que no te gusten.
          </p>
          <div class="view-toggles">
            <button class="view-toggle-btn" [class.active]="previewViewMode === 'list'" (click)="previewViewMode = 'list'">
              <i class="pi pi-bars"></i>
            </button>
            <button class="view-toggle-btn" [class.active]="previewViewMode === 'sandbox'" (click)="previewViewMode = 'sandbox'">
              <i class="pi pi-th-large"></i>
            </button>
          </div>
        </div>

        <div *ngIf="previewExercises.length === 0" class="preview-empty">
          <i class="pi pi-box" style="font-size:3.5rem; display:block; margin-bottom:16px; color:var(--ds-border)"></i>
          Ya no quedan ejercicios. <br>¡Vuelve atrás para regenerar magia!
        </div>

        <div [ngClass]="{'preview-list list-view': previewViewMode === 'list', 'preview-sandbox sandbox-view': previewViewMode === 'sandbox'}" *ngIf="previewExercises.length > 0">
          <div class="preview-card" [class.editing]="editingIndex === i"
               *ngFor="let ex of previewExercises; let i = index">

            <!-- ── Card view (read mode) ────────────────────────── -->
            <div class="card-view" *ngIf="editingIndex !== i">
              
              <!-- LIST VIEW MODE -->
              <ng-container *ngIf="previewViewMode === 'list'">
                <span class="preview-num">{{ i + 1 }}</span>
                <div class="preview-card-body">
                  <div class="preview-statement">{{ ex.statement }}</div>
                  <div class="preview-meta">
                    <p-tag [value]="getTypeLabel(ex.typeExercise)" styleClass="font-bold text-xs" severity="info" [rounded]="true"></p-tag>
                    <p-tag [value]="ex.difficulty" [severity]="getDifficultySeverity(ex.difficulty)" styleClass="font-bold text-xs" [rounded]="true"></p-tag>
                  </div>
                </div>
              </ng-container>

              <!-- SANDBOX VIEW MODE -->
              <ng-container *ngIf="previewViewMode === 'sandbox'">
                <div class="sb-header">
                  <span class="sb-type-label"><i class="pi {{ getTypeIcon(ex.typeExercise) }}"></i> {{ getTypeLabel(ex.typeExercise) }}</span>
                  <span class="sb-exercise-num">EJERCICIO {{ i + 1 }}</span>
                </div>
                
                <h3 class="sb-statement">{{ ex.statement }}</h3>
                
                <div class="sb-hint-box" *ngIf="ex.hint">
                  <i class="pi pi-lightbulb" style="font-size: 1.2rem"></i> {{ ex.hint }}
                </div>
                
                <div class="sb-instruction-box">
                  <i class="pi pi-check-circle" style="font-size: 1.1rem"></i>
                  <span>{{ getSandboxInstruction(ex.typeExercise) }}</span>
                </div>

                <!-- Sandbox Rendered Options based on Type -->
                <div style="width: 100%">
                  <!-- Single / Multiple Choice Render -->
                  <ng-container *ngIf="ex.typeExercise === 'selection_single' || ex.typeExercise === 'selection_multiple' || ex.typeExercise === 'phishing_selection_multiple'">
                    <div class="sb-option" *ngFor="let opt of (ex.typeExercise === 'phishing_selection_multiple' ? ex.optionsPhishingSelection : ex.optionSelectOptions); let j = index"
                         [class.sb-answer-match]="(ex.typeExercise === 'selection_single' && opt === ex.answerSelectCorrect) || 
                                                  (ex.typeExercise === 'selection_multiple' && ex.answerSelectsCorrect && ex.answerSelectsCorrect.includes(opt)) || 
                                                  (ex.typeExercise === 'phishing_selection_multiple' && ex.answerPhishingSelection && ex.answerPhishingSelection.includes(opt))">
                      <div style="display: flex; align-items: center; flex: 1">
                        <span class="sb-option-num">{{ j + 1 }}</span>
                        <span class="sb-option-text">{{ opt }}</span>
                      </div>
                      <div [class]="ex.typeExercise === 'selection_single' ? 'sb-radio-circle' : 'sb-checkbox-square'"></div>
                    </div>
                  </ng-container>

                  <!-- Ordering Render -->
                  <ng-container *ngIf="ex.typeExercise === 'vertical_ordering' || ex.typeExercise === 'horizontal_ordering'">
                    <div class="sb-option sb-answer-match" *ngFor="let opt of (ex.typeExercise === 'vertical_ordering' ? ex.answerVerticalOrdering : ex.answerHorizontalOrdering); let j = index">
                      <div style="display: flex; align-items: center; flex: 1">
                        <span class="sb-option-num" style="background:#fff; color:var(--ds-blue)">{{ j + 1 }}</span>
                        <span class="sb-option-text">{{ opt }}</span>
                      </div>
                      <i class="pi pi-bars" style="color:var(--ds-blue)"></i>
                    </div>
                  </ng-container>

                  <!-- Pairs Render -->
                  <ng-container *ngIf="ex.typeExercise === 'match_pairs'">
                     <div class="sb-option sb-answer-match" *ngFor="let pair of ex.pairs">
                       <span class="sb-option-text" style="color:var(--ds-blue)">{{ pair.left }}</span>
                       <i class="pi pi-arrow-right" style="color:var(--ds-blue); margin: 0 10px;"></i>
                       <span class="sb-option-text" style="color:var(--ds-blue)">{{ pair.right }}</span>
                     </div>
                  </ng-container>
                </div>
              </ng-container>

              <div class="card-actions">
                <button class="btn-gamified btn-secondary" style="padding: 10px; border-radius: 12px"
                  (click)="startEdit(i)" pTooltip="Editar">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="btn-gamified btn-danger" style="padding: 10px; border-radius: 12px"
                  (click)="removeExercise(i)" pTooltip="Eliminar">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
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
                <button type="button" class="btn-gamified btn-secondary" style="padding: 10px 16px; font-size: 0.85rem;"
                  (click)="cancelEdit()">
                  CANCELAR
                </button>
                <button type="button" class="btn-gamified btn-blue" style="padding: 10px 16px; font-size: 0.85rem;"
                  (click)="saveEdit(i)">
                  <i class="pi pi-check"></i> HECHO
                </button>
              </div>
            </div>

          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn-gamified btn-secondary" (click)="backToConfigure()">
            <i class="pi pi-arrow-left"></i> VOLVER
          </button>
          <div style="flex:1"></div>
          <button type="button" class="btn-gamified btn-primary"
            [disabled]="previewExercises.length === 0"
            (click)="saveAll()">
            <ng-container *ngIf="previewExercises.length > 0">
              <i class="pi pi-save"></i> GUARDAR {{ previewExercises.length }} EJERCICIO{{ previewExercises.length !== 1 ? 'S' : '' }}
            </ng-container>
            <ng-container *ngIf="previewExercises.length === 0">
              NADA QUE GUARDAR
            </ng-container>
          </button>
        </div>
      </ng-container>

    </p-dialog>
  `,
})
export class GenerateExercisesDialogComponent implements OnInit {
  @Input() activityId: number | null = null;
  @Input() saveToDatabase: boolean = true;
  @Output() exercisesGenerated = new EventEmitter<GeneratedExercise[]>();
  @Output() dialogClosed = new EventEmitter<void>();

  visible = false;
  step: DialogStep = 'configure';
  loadingMessage = 'Generando ejercicios con IA...';
  generationForm: FormGroup;
  previewExercises: GeneratedExercise[] = [];

  previewViewMode: 'list' | 'sandbox' = 'list';

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

  getSandboxInstruction(type: string): string {
    switch (type) {
      case 'selection_single': return 'Elige una sola respuesta correcta.';
      case 'selection_multiple': return 'Elige todas las respuestas correctas.';
      case 'phishing_selection_multiple': return 'Selecciona cuáles opciones son phishing.';
      case 'vertical_ordering': return 'Ordena de arriba hacia abajo (mostrando orden final).';
      case 'horizontal_ordering': return 'Ordena de izquierda a derecha (mostrando orden final).';
      case 'match_pairs': return 'Une cada concepto con su par correcto.';
      default: return 'Completa este ejercicio.';
    }
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
    if (this.saveToDatabase && !this.activityId) {
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
    if (this.previewExercises.length === 0) return;
    if (this.saveToDatabase && !this.activityId) return;
    this.loadingMessage = `Guardando ${this.previewExercises.length} ejercicio${this.previewExercises.length !== 1 ? 's' : ''}…`;
    this.step = 'saving';

    if (!this.saveToDatabase) {
      this.messageService.add({
        severity: 'success', summary: '¡Generado!',
        detail: `${this.previewExercises.length} ejercicio${this.previewExercises.length !== 1 ? 's generados' : ' generado'} temporalmente.`,
        life: 3000,
      });
      this.exercisesGenerated.emit(this.previewExercises);
      this.onClose();
      return;
    }

    const reqs = this.previewExercises.map(ex => {
      const data: CreateExerciseRequest = {
        activityId: this.activityId!,
        statement: ex.statement,
        difficulty: ex.difficulty,
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
        this.exercisesGenerated.emit(this.previewExercises);
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
