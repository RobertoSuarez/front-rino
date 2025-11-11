import { Component, OnInit, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ExerciseGenerationService, GeneratedExercise } from '../../../../core/services/exercise-generation.service';
import { ExerciseService } from '../../../../core/services/exercise.service';
import { CreateExerciseRequest } from '../../../../core/models/exercise.interface';

@Component({
  selector: 'app-generate-exercises-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    CheckboxModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-toast></p-toast>
    
    <p-dialog 
      [visible]="visible" 
      (onHide)="onClose()"
      header="Generar Ejercicios con IA"
      [modal]="true"
      [style]="{ width: '60vw' }"
      [closable]="!loading"
      [maximizable]="true">
      
      <form [formGroup]="generationForm" (ngSubmit)="onGenerate()" class="space-y-4">
        
        <!-- Prompt -->
        <div class="field">
          <label for="prompt" class="block text-sm font-medium mb-2">
            Describe qué ejercicios necesitas *
          </label>
          <textarea 
            id="prompt"
            formControlName="prompt"
            rows="4"
            class="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: Genera ejercicios sobre phishing, cómo identificar emails sospechosos..."
            [disabled]="loading">
          </textarea>
          <small *ngIf="generationForm.get('prompt')?.invalid && generationForm.get('prompt')?.touched" 
                 class="text-red-500">
            El prompt es requerido (mínimo 10 caracteres)
          </small>
        </div>

        <!-- Dificultad -->
        <div class="field">
          <label for="difficulty" class="block text-sm font-medium mb-2">Dificultad *</label>
          <select 
            id="difficulty"
            formControlName="difficulty"
            [disabled]="loading"
            class="w-full p-2 border border-gray-300 rounded">
            <option value="Fácil">Fácil</option>
            <option value="Medio">Medio</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>

        <!-- Cantidad -->
        <div class="field">
          <label for="quantity" class="block text-sm font-medium mb-2">
            Cantidad de ejercicios (1-10) *
          </label>
          <input 
            id="quantity"
            pInputText
            type="number"
            formControlName="quantity"
            min="1"
            max="10"
            class="w-full"
            [disabled]="loading" />
          <small *ngIf="generationForm.get('quantity')?.invalid && generationForm.get('quantity')?.touched" 
                 class="text-red-500">
            Ingresa un número entre 1 y 10
          </small>
        </div>

        <!-- Tipos de Ejercicios -->
        <div class="field">
          <label for="exerciseTypes" class="block text-sm font-medium mb-2">
            Tipos de ejercicios (dejar vacío para todos)
          </label>
          <p-multiSelect 
            id="exerciseTypes"
            formControlName="exerciseTypes"
            [options]="exerciseTypeOptions"
            optionLabel="label"
            optionValue="value"
            [disabled]="loading"
            placeholder="Selecciona tipos..."
            class="w-full">
          </p-multiSelect>
        </div>

        <!-- Contexto -->
        <div class="field">
          <label for="context" class="block text-sm font-medium mb-2">Contexto (opcional)</label>
          <input 
            id="context"
            pInputText
            formControlName="context"
            placeholder="Ej: Capítulo sobre Phishing, Nivel principiante..."
            class="w-full"
            [disabled]="loading" />
        </div>

        <!-- Balance de Tipos -->
        <div class="field flex items-center gap-2">
          <p-checkbox 
            formControlName="balanceTypes"
            [binary]="true"
            [disabled]="loading">
          </p-checkbox>
          <label for="balanceTypes" class="text-sm">
            Distribuir equitativamente entre tipos de ejercicios
          </label>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex justify-center items-center py-6 gap-3">
          <p-progressSpinner 
            [style]="{ width: '40px', height: '40px' }"
            strokeWidth="4">
          </p-progressSpinner>
          <span class="text-sm">Generando ejercicios...</span>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-2 pt-4 border-t">
          <p-button 
            type="button"
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            (onClick)="onClose()"
            [disabled]="loading">
          </p-button>
          <p-button 
            type="submit"
            label="Generar"
            severity="success"
            [loading]="loading"
            [disabled]="generationForm.invalid || loading">
          </p-button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep {
      .p-dialog {
        .p-dialog-content {
          padding: 1.5rem;
        }
      }
    }
  `]
})
export class GenerateExercisesDialogComponent implements OnInit {
  @Input() activityId: number | null = null;
  @Output() exercisesGenerated = new EventEmitter<GeneratedExercise[]>();
  @Output() dialogClosed = new EventEmitter<void>();

  visible = false;
  loading = false;
  generationForm: FormGroup;

  difficultyOptions = [
    { label: 'Fácil', value: 'Fácil' },
    { label: 'Medio', value: 'Medio' },
    { label: 'Difícil', value: 'Difícil' }
  ];

  exerciseTypeOptions = [
    { label: 'Selección Simple', value: 'selection_single' },
    { label: 'Selección Múltiple', value: 'selection_multiple' },
    { label: 'Ordenamiento Vertical', value: 'vertical_ordering' },
    { label: 'Ordenamiento Horizontal', value: 'horizontal_ordering' },
    { label: 'Detección de Phishing', value: 'phishing_selection_multiple' },
    { label: 'Emparejar Conceptos', value: 'match_pairs' }
  ];

  constructor(
    private fb: FormBuilder,
    private generationService: ExerciseGenerationService,
    private exerciseService: ExerciseService,
    private messageService: MessageService
  ) {
    this.generationForm = this.createForm();
  }

  ngOnInit() {}

  createForm(): FormGroup {
    return this.fb.group({
      prompt: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: ['Medio', Validators.required],
      quantity: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      exerciseTypes: [[]],
      context: [''],
      balanceTypes: [true]
    });
  }

  open() {
    this.visible = true;
  }

  onClose() {
    this.visible = false;
    this.generationForm.reset({ difficulty: 'Medio', quantity: 3, balanceTypes: true });
    this.dialogClosed.emit();
  }

  onGenerate() {
    if (!this.generationForm.valid) return;
    if (!this.activityId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró la actividad',
        life: 3000
      });
      return;
    }

    this.loading = true;
    const formValue = this.generationForm.value;

    this.generationService.generateExercisesWithPrompt({
      prompt: formValue.prompt,
      difficulty: formValue.difficulty,
      quantity: formValue.quantity,
      exerciseTypes: formValue.exerciseTypes?.length > 0 ? formValue.exerciseTypes : undefined,
      context: formValue.context || undefined,
      balanceTypes: formValue.balanceTypes
    }).subscribe({
      next: (response) => {
        // Guardar los ejercicios generados en la BD
        debugger;
        this.saveGeneratedExercises(response.data.exercises);
      },
      error: (err) => {
        console.error('Error al generar ejercicios', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error al generar los ejercicios. Intenta de nuevo.',
          life: 4000
        });
        this.loading = false;
      }
    });
  }

  private saveGeneratedExercises(exercises: GeneratedExercise[]) {
    let savedCount = 0;
    let errorCount = 0;
    debugger;

    for (const exercise of exercises) {
      const exerciseData: CreateExerciseRequest = {
        activityId: this.activityId!,
        statement: exercise.statement,
        difficulty: exercise.difficulty,
        code: exercise.code || '',
        hind: exercise.hint || '',
        typeExercise: exercise.typeExercise as any,
        optionSelectOptions: exercise.optionSelectOptions || [],
        optionOrderFragmentCode: exercise.optionOrderFragmentCode || [],
        optionOrderLineCode: exercise.optionOrderLineCode || [],
        optionsFindErrorCode: exercise.optionsFindErrorCode || [],
        answerSelectCorrect: exercise.answerSelectCorrect || '',
        answerSelectsCorrect: exercise.answerSelectsCorrect || [],
        answerOrderFragmentCode: exercise.answerOrderFragmentCode || [],
        answerOrderLineCode: exercise.answerOrderLineCode || [],
        answerFindError: exercise.answerFindError || '',
        answerWriteCode: '',
        optionsVerticalOrdering: exercise.optionSelectOptions || [],
        answerVerticalOrdering: exercise.answerSelectsCorrect || [],
        optionsHorizontalOrdering: exercise.optionSelectOptions || [],
        answerHorizontalOrdering: exercise.answerSelectsCorrect || [],
        optionsPhishingSelection: exercise.optionSelectOptions || [],
        answerPhishingSelection: exercise.answerSelectsCorrect || [],
        phishingContext: '',
        phishingImageUrl: '',
        optionsMatchPairsLeft: exercise.leftItems || [],
        optionsMatchPairsRight: exercise.rightItems || [],
        answerMatchPairs: exercise.pairs || []
      };

      this.exerciseService.createExercise(exerciseData).subscribe({
        next: () => {
          savedCount++;
          if (savedCount + errorCount === exercises.length) {
            this.onSaveComplete(savedCount, errorCount, exercises.length);
          }
        },
        error: (err) => {
          errorCount++;
          console.error('Error al guardar ejercicio:', err);
          if (savedCount + errorCount === exercises.length) {
            this.onSaveComplete(savedCount, errorCount, exercises.length);
          }
        }
      });
    }
  }

  private onSaveComplete(savedCount: number, errorCount: number, total: number) {
    this.loading = false;

    if (errorCount === 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Se guardaron ${savedCount} ejercicios correctamente.`,
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Guardado Parcial',
        detail: `Se guardaron ${savedCount} de ${total} ejercicios. ${errorCount} tuvieron error.`,
        life: 4000
      });
    }

    this.exercisesGenerated.emit([]);
    this.onClose();
  }
}
