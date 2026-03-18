import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectionSingleComponent } from '../selection-single.component';
import { SelectionMultipleComponent } from '../selection-multiple.component';
import { VerticalOrderingComponent } from '../vertical-ordering.component';
import { HorizontalOrderingComponent } from '../horizontal-ordering.component';
import { PhishingSelectionMultipleComponent } from '../phishing-selection-multiple.component';
import { MatchPairsComponent } from '../match-pairs.component';

@Component({
  selector: 'app-exercise-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectionSingleComponent,
    SelectionMultipleComponent,
    VerticalOrderingComponent,
    HorizontalOrderingComponent,
    PhishingSelectionMultipleComponent,
    MatchPairsComponent
  ],
  templateUrl: './exercise-editor-dialog.component.html'
})
export class ExerciseEditorDialogComponent {
  @Input() displayDialog: boolean = false;
  @Output() displayDialogChange = new EventEmitter<boolean>();
  
  @Output() onSave = new EventEmitter<any>();

  exerciseForm: FormGroup;
  exerciseTypeData: any = {};
  
  // To identify which exercise in the FormArray we are editing
  currentEditMeta: any = null;

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

  constructor(private fb: FormBuilder) {
    this.exerciseForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      statement: ['', Validators.required],
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

  openNew() {
    this.exerciseForm.reset({
      difficulty: 'Fácil',
      typeExercise: 'selection_single',
      optionSelectOptions: [],
      answerSelectsCorrect: [],
      optionsVerticalOrdering: [],
      answerVerticalOrdering: [],
      optionsHorizontalOrdering: [],
      answerHorizontalOrdering: [],
      optionsPhishingSelection: [],
      answerPhishingSelection: [],
      optionsMatchPairsLeft: [],
      optionsMatchPairsRight: [],
      answerMatchPairs: []
    });
    this.exerciseTypeData = {};
    this.currentEditMeta = null;
    this.displayDialog = true;
    this.displayDialogChange.emit(this.displayDialog);
  }

  openEdit(exerciseData: any, metaData?: any) {
    // metaData holds information like { chapterIndex: i, temaIndex: j, activityIndex: k, exerciseIndex: l }
    this.currentEditMeta = metaData || null;

    // Normalizar datos de la BD o local
    const normalizedData = {
      ...exerciseData,
      optionSelectOptions: exerciseData.optionSelectionOptions || exerciseData.optionSelectOptions || []
    };

    this.exerciseForm.patchValue({
      id: normalizedData.id || null,
      statement: normalizedData.statement || '',
      difficulty: normalizedData.difficulty || 'Fácil',
      hind: normalizedData.hind || '',
      typeExercise: normalizedData.typeExercise || 'selection_single',
      optionSelectOptions: normalizedData.optionSelectOptions,
      optionOrderFragmentCode: normalizedData.optionOrderFragmentCode || [],
      optionOrderLineCode: normalizedData.optionOrderLineCode || [],
      optionsFindErrorCode: normalizedData.optionsFindErrorCode || [],
      answerSelectCorrect: normalizedData.answerSelectCorrect || '',
      answerSelectsCorrect: normalizedData.answerSelectsCorrect || [],
      answerOrderFragmentCode: normalizedData.answerOrderFragmentCode || [],
      answerOrderLineCode: normalizedData.answerOrderLineCode || [],
      answerFindError: normalizedData.answerFindError || '',
      answerWriteCode: normalizedData.answerWriteCode || '',
      optionsVerticalOrdering: normalizedData.optionsVerticalOrdering || [],
      answerVerticalOrdering: normalizedData.answerVerticalOrdering || [],
      optionsHorizontalOrdering: normalizedData.optionsHorizontalOrdering || [],
      answerHorizontalOrdering: normalizedData.answerHorizontalOrdering || [],
      optionsPhishingSelection: normalizedData.optionsPhishingSelection || [],
      answerPhishingSelection: normalizedData.answerPhishingSelection || [],
      phishingContext: normalizedData.phishingContext || '',
      phishingImageUrl: normalizedData.phishingImageUrl || '',
      optionsMatchPairsLeft: normalizedData.optionsMatchPairsLeft || [],
      optionsMatchPairsRight: normalizedData.optionsMatchPairsRight || [],
      answerMatchPairs: normalizedData.answerMatchPairs || []
    });

    this.exerciseTypeData = normalizedData;
    this.displayDialog = true;
    this.displayDialogChange.emit(this.displayDialog);
  }

  hideDialog() {
    this.displayDialog = false;
    this.displayDialogChange.emit(false);
  }

  onExerciseTypeChange() {
    this.exerciseTypeData = {};
    const typeExercise = this.exerciseForm.get('typeExercise')?.value;

    switch (typeExercise) {
      case 'selection_single':
        this.exerciseForm.patchValue({ answerSelectsCorrect: [] });
        break;
      case 'selection_multiple':
        this.exerciseForm.patchValue({ answerSelectCorrect: '' });
        break;
      case 'vertical_ordering':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '', answerSelectsCorrect: [],
          answerOrderFragmentCode: [], answerOrderLineCode: [],
          answerFindError: '', answerWriteCode: '',
          answerHorizontalOrdering: [], answerPhishingSelection: [], answerMatchPairs: []
        });
        break;
      case 'horizontal_ordering':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '', answerSelectsCorrect: [],
          answerOrderFragmentCode: [], answerOrderLineCode: [],
          answerFindError: '', answerWriteCode: '',
          answerVerticalOrdering: [], answerPhishingSelection: [], answerMatchPairs: []
        });
        break;
      case 'phishing_selection_multiple':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '', answerSelectsCorrect: [],
          answerOrderFragmentCode: [], answerOrderLineCode: [],
          answerFindError: '', answerWriteCode: '',
          answerVerticalOrdering: [], answerHorizontalOrdering: [], answerMatchPairs: []
        });
        break;
      case 'match_pairs':
        this.exerciseForm.patchValue({
          answerSelectCorrect: '', answerSelectsCorrect: [],
          answerOrderFragmentCode: [], answerOrderLineCode: [],
          answerFindError: '', answerWriteCode: '',
          answerVerticalOrdering: [], answerHorizontalOrdering: [], answerPhishingSelection: []
        });
        break;
    }
  }

  onExerciseDataChange(data: any) {
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

  saveExercise() {
    if (this.exerciseForm.valid) {
      const dataToSave = {
        data: this.exerciseForm.value,
        meta: this.currentEditMeta
      };
      this.onSave.emit(dataToSave);
      this.hideDialog();
    } else {
      // Marcar todo como touched para mostrar advertencias
      this.exerciseForm.markAllAsTouched();
    }
  }
}
