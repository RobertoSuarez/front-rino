import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-selection-single',
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
            <p-radioButton 
              [inputId]="'correct_' + i"
              name="correctAnswer" 
              [value]="i"
              [(ngModel)]="selectedCorrectIndex"
              (onClick)="setCorrectAnswer(i)"
              [ngModelOptions]="{standalone: true}"></p-radioButton>
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
        <label class="block text-sm font-medium text-gray-700">Respuesta Correcta Seleccionada</label>
        <input 
          type="text" 
          [value]="getCorrectAnswerText()"
          readonly
          class="w-full p-2 border border-gray-300 rounded-md bg-gray-50" />
      </div>
    </div>
  `
})
export class SelectionSingleComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;
  selectedCorrectIndex: number = 0;

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
      this.initialData.optionSelectOptions.forEach((option: string, index: number) => {
        this.optionsArray.push(this.createOptionGroup(option));
        if (option === this.initialData.answerSelectCorrect) {
          this.selectedCorrectIndex = index;
        }
      });
    } else {
      // Crear opciones por defecto
      this.addOption();
      this.addOption();
    }
  }

  createOptionGroup(text: string = ''): FormGroup {
    return this.fb.group({
      text: [text, Validators.required]
    });
  }

  addOption() {
    this.optionsArray.push(this.createOptionGroup());
  }

  removeOption(index: number) {
    if (this.optionsArray.length > 2) {
      this.optionsArray.removeAt(index);
      // Ajustar el índice de respuesta correcta si es necesario
      if (this.selectedCorrectIndex >= index && this.selectedCorrectIndex > 0) {
        this.selectedCorrectIndex--;
      }
      this.emitData();
    }
  }

  setCorrectAnswer(index: number) {
    this.selectedCorrectIndex = index;
    this.emitData();
  }

  getCorrectAnswerText(): string {
    const options = this.optionsArray.value;
    return options[this.selectedCorrectIndex]?.text || '';
  }

  emitData() {
    const options = this.optionsArray.value.map((option: any) => option.text).filter((text: string) => text.trim());
    const correctAnswer = this.getCorrectAnswerText();

    this.dataChange.emit({
      optionSelectOptions: options,
      answerSelectCorrect: correctAnswer,
      // Limpiar otros campos
      optionOrderFragmentCode: [],
      optionOrderLineCode: [],
      optionsFindErrorCode: [],
      answerSelectsCorrect: [],
      answerOrderFragmentCode: [],
      answerOrderLineCode: [],
      answerFindError: ''
    });
  }
}
