import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-find-error-code',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    RadioButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="space-y-4" [formGroup]="form">
      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Código con Error</label>
        <textarea 
          formControlName="codeWithError"
          rows="8"
          placeholder="Ingresa el código que contiene el error..."
          class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"></textarea>
        <small class="text-gray-600">
          Este código se mostrará al estudiante para que identifique el error.
        </small>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Opciones de Corrección</label>
        <div formArrayName="errorOptions" class="space-y-2">
          <div *ngFor="let option of errorOptionsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="flex items-center gap-2">
            <input 
              type="text" 
              formControlName="text"
              placeholder="Opción de corrección {{i + 1}}"
              class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" />
            <p-radioButton 
              [inputId]="'correct_error_' + i"
              name="correctErrorAnswer" 
              [value]="i"
              [(ngModel)]="selectedCorrectIndex"
              (onClick)="setCorrectError(i)"
              [ngModelOptions]="{standalone: true}"></p-radioButton>
            <label [for]="'correct_error_' + i" class="text-sm text-gray-600">Correcta</label>
            <p-button 
              *ngIf="errorOptionsArray.length > 2"
              icon="pi pi-trash" 
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text"
              (onClick)="removeErrorOption(i)"></p-button>
          </div>
        </div>
        <p-button 
          label="Agregar Opción" 
          icon="pi pi-plus" 
          size="small"
          class="p-button-outlined"
          (onClick)="addErrorOption()"></p-button>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Corrección Seleccionada</label>
        <input 
          type="text" 
          [value]="getCorrectErrorText()"
          readonly
          class="w-full p-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm" />
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Explicación del Error (Opcional)</label>
        <textarea 
          formControlName="errorExplanation"
          rows="3"
          placeholder="Explica por qué esta es la corrección correcta..."
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
        <small class="text-gray-600">
          Esta explicación puede ayudar al estudiante a entender el error.
        </small>
      </div>
    </div>
  `
})
export class FindErrorCodeComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;
  selectedCorrectIndex: number = 0;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      codeWithError: ['', Validators.required],
      errorOptions: this.fb.array([]),
      errorExplanation: ['']
    });
  }

  ngOnInit() {
    this.initializeErrorOptions();
    this.form.valueChanges.subscribe(() => {
      this.emitData();
    });
  }

  get errorOptionsArray(): FormArray {
    return this.form.get('errorOptions') as FormArray;
  }

  initializeErrorOptions() {
    // Si hay datos iniciales, cargarlos
    if (this.initialData?.optionsFindErrorCode?.length > 0) {
      this.initialData.optionsFindErrorCode.forEach((option: string, index: number) => {
        this.errorOptionsArray.push(this.createErrorOptionGroup(option));
        if (option === this.initialData.answerFindError) {
          this.selectedCorrectIndex = index;
        }
      });
      
      // Cargar código y explicación si existen
      this.form.patchValue({
        codeWithError: this.initialData.code || '',
        errorExplanation: this.initialData.errorExplanation || ''
      });
    } else {
      // Crear opciones por defecto
      this.addErrorOption();
      this.addErrorOption();
    }
  }

  createErrorOptionGroup(text: string = ''): FormGroup {
    return this.fb.group({
      text: [text, Validators.required]
    });
  }

  addErrorOption() {
    this.errorOptionsArray.push(this.createErrorOptionGroup());
  }

  removeErrorOption(index: number) {
    if (this.errorOptionsArray.length > 2) {
      this.errorOptionsArray.removeAt(index);
      // Ajustar el índice de respuesta correcta si es necesario
      if (this.selectedCorrectIndex >= index && this.selectedCorrectIndex > 0) {
        this.selectedCorrectIndex--;
      }
      this.emitData();
    }
  }

  setCorrectError(index: number) {
    this.selectedCorrectIndex = index;
    this.emitData();
  }

  getCorrectErrorText(): string {
    const options = this.errorOptionsArray.value;
    return options[this.selectedCorrectIndex]?.text || '';
  }

  emitData() {
    const options = this.errorOptionsArray.value.map((option: any) => option.text).filter((text: string) => text.trim());
    const correctError = this.getCorrectErrorText();
    const formValue = this.form.value;

    this.dataChange.emit({
      code: formValue.codeWithError || '',
      optionsFindErrorCode: options,
      answerFindError: correctError,
      errorExplanation: formValue.errorExplanation || '',
      // Limpiar otros campos
      optionSelectOptions: [],
      optionOrderFragmentCode: [],
      optionOrderLineCode: [],
      answerSelectCorrect: '',
      answerSelectsCorrect: [],
      answerOrderFragmentCode: [],
      answerOrderLineCode: []
    });
  }
}
