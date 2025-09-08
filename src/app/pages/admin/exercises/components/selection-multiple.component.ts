import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-selection-multiple',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="space-y-4" [formGroup]="form">
      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Opciones de Selección</label>
        <div formArrayName="options" class="space-y-2">
          <div *ngFor="let option of optionsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="flex items-center gap-2">
            <input 
              type="text" 
              formControlName="text"
              placeholder="Ingresa la opción {{i + 1}}"
              class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            <p-checkbox 
              [inputId]="'correct_' + i"
              formControlName="isCorrect"
              [binary]="true"
              (onChange)="onCorrectChange()"></p-checkbox>
            <label [for]="'correct_' + i" class="text-sm text-gray-600">Correcta</label>
            <p-button 
              *ngIf="optionsArray.length > 2"
              icon="pi pi-trash" 
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text"
              (onClick)="removeOption(i)"></p-button>
          </div>
        </div>
        <p-button 
          label="Agregar Opción" 
          icon="pi pi-plus" 
          size="small"
          class="p-button-outlined"
          (onClick)="addOption()"></p-button>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Respuestas Correctas Seleccionadas</label>
        <div class="p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[40px]">
          <div *ngIf="getCorrectAnswers().length === 0" class="text-gray-500 text-sm">
            No hay respuestas correctas seleccionadas
          </div>
          <div *ngFor="let answer of getCorrectAnswers()" class="text-sm">
            • {{answer}}
          </div>
        </div>
      </div>
    </div>
  `
})
export class SelectionMultipleComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      options: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initializeOptions();
    this.form.valueChanges.subscribe(() => {
      this.emitData();
    });
  }

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  initializeOptions() {
    // Si hay datos iniciales, cargarlos
    if (this.initialData?.optionSelectOptions?.length > 0) {
      this.initialData.optionSelectOptions.forEach((option: string) => {
        const isCorrect = this.initialData.answerSelectsCorrect?.includes(option) || false;
        this.optionsArray.push(this.createOptionGroup(option, isCorrect));
      });
    } else {
      // Crear opciones por defecto
      this.addOption();
      this.addOption();
    }
  }

  createOptionGroup(text: string = '', isCorrect: boolean = false): FormGroup {
    return this.fb.group({
      text: [text, Validators.required],
      isCorrect: [isCorrect]
    });
  }

  addOption() {
    this.optionsArray.push(this.createOptionGroup());
  }

  removeOption(index: number) {
    if (this.optionsArray.length > 2) {
      this.optionsArray.removeAt(index);
      this.emitData();
    }
  }

  onCorrectChange() {
    this.emitData();
  }

  getCorrectAnswers(): string[] {
    return this.optionsArray.value
      .filter((option: any) => option.isCorrect && option.text.trim())
      .map((option: any) => option.text);
  }

  emitData() {
    const options = this.optionsArray.value
      .map((option: any) => option.text)
      .filter((text: string) => text.trim());
    
    const correctAnswers = this.getCorrectAnswers();

    this.dataChange.emit({
      optionSelectOptions: options,
      answerSelectsCorrect: correctAnswers,
      // Limpiar otros campos
      optionOrderFragmentCode: [],
      optionOrderLineCode: [],
      optionsFindErrorCode: [],
      answerSelectCorrect: '',
      answerOrderFragmentCode: [],
      answerOrderLineCode: [],
      answerFindError: ''
    });
  }
}
