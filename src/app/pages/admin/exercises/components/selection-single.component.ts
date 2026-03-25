import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
    <div class="space-y-6" [formGroup]="form">
      <div class="field space-y-4">
        <label class="block text-sm font-black text-gray-400 uppercase tracking-widest">Opciones de Selección</label>
        <div formArrayName="options" class="space-y-4">
          <div *ngFor="let option of optionsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="flex items-center gap-4 bg-white p-2 rounded-2xl border-4"
               [ngClass]="selectedCorrectIndex === i ? 'border-green-400 bg-green-50/50' : 'border-slate-100'">
            
            <div class="flex-1 flex gap-3 items-center">
              <!-- Custom Radio Button look -->
              <div class="h-8 w-8 rounded-full border-4 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
                [ngClass]="selectedCorrectIndex === i ? 'border-green-500 bg-green-500' : 'border-slate-300 hover:border-indigo-400 bg-white'"
                (click)="setCorrectAnswer(i)">
                <i class="pi pi-check text-white text-sm" *ngIf="selectedCorrectIndex === i"></i>
              </div>

              <input 
                type="text" 
                formControlName="text"
                placeholder="Ingresa la opción {{i + 1}}"
                class="flex-1 p-3 bg-transparent border-none rounded-xl font-bold text-gray-700 text-lg focus:ring-0 outline-none w-full placeholder:text-gray-300" />
            </div>

            <div class="flex items-center gap-3 pr-2">
              <span class="text-sm font-black uppercase tracking-wider" 
                [ngClass]="selectedCorrectIndex === i ? 'text-green-600' : 'text-gray-400'">
                Correcta
              </span>
              <button 
                *ngIf="optionsArray.length > 2"
                type="button"
                class="h-10 w-10 rounded-xl bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                (click)="removeOption(i)">
                <i class="pi pi-trash font-bold"></i>
              </button>
            </div>
          </div>
        </div>
        <button 
          type="button"
          class="gamified-btn-3d btn-3d-indigo !py-3 !px-6 text-sm flex items-center gap-2 mt-4"
          (click)="addOption()">
          <i class="pi pi-plus font-bold"></i> AGREGAR OPCIÓN
        </button>
      </div>

      <div class="field space-y-3 pt-4 border-t-4 border-gray-100">
        <label class="block text-sm font-black text-gray-400 uppercase tracking-widest">Respuesta Correcta Seleccionada</label>
        <div class="w-full p-4 bg-green-50 border-4 border-green-200 rounded-2xl font-black text-green-700 text-lg">
          {{ getCorrectAnswerText() || 'Ninguna seleccionada' }}
        </div>
      </div>
    </div>
  `
})
/**
 * COMPONENTE: Selección Simple
 * Tipo de Ejercicio: selection_single
 * 
 * Descripción:
 * Este componente permite crear y editar ejercicios de selección simple (múltiple choice).
 * El usuario debe seleccionar UNA opción correcta de varias opciones disponibles.
 * 
 * Funcionalidades:
 * - Agregar/eliminar opciones de respuesta
 * - Marcar una opción como correcta (mediante radio button)
 * - Mostrar la respuesta correcta seleccionada
 * - Emitir datos al componente padre cuando hay cambios
 */
export class SelectionSingleComponent implements OnInit, OnChanges {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;
  selectedCorrectIndex: number = 0;
  private isInitialized: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      options: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initializeOptions();
    this.isInitialized = true;
    this.form.valueChanges.subscribe(() => {
      this.emitData();
    });
  }

  /**
   * Detecta cambios en los inputs (initialData)
   * Se ejecuta cuando el componente padre actualiza los datos
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && !changes['initialData'].firstChange && this.isInitialized) {
      // Si los datos iniciales cambian después de la inicialización (edición), reinicializar
      this.resetAndInitialize();
    }
  }

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  /**
   * Reinicia el formulario y carga los datos iniciales
   * Se usa cuando se edita un ejercicio existente
   */
  resetAndInitialize() {
    // Limpiar el FormArray
    while (this.optionsArray.length > 0) {
      this.optionsArray.removeAt(0);
    }
    this.selectedCorrectIndex = 0;
    
    // Reinicializar con los nuevos datos
    this.initializeOptions();
  }

  /**
   * Inicializa las opciones desde los datos iniciales o crea opciones por defecto
   */
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

  /**
   * Crea un grupo de formulario para una opción individual
   * @param text Texto de la opción (vacío por defecto)
   * @returns FormGroup con validación requerida
   */
  createOptionGroup(text: string = ''): FormGroup {
    return this.fb.group({
      text: [text, Validators.required]
    });
  }

  /**
   * Agrega una nueva opción vacía al formulario
   */
  addOption() {
    this.optionsArray.push(this.createOptionGroup());
  }

  /**
   * Elimina una opción del formulario
   * @param index Índice de la opción a eliminar
   * Nota: Mínimo 2 opciones deben existir
   */
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

  /**
   * Marca una opción como la respuesta correcta
   * @param index Índice de la opción correcta
   */
  setCorrectAnswer(index: number) {
    this.selectedCorrectIndex = index;
    this.emitData();
  }

  /**
   * Obtiene el texto de la respuesta correcta seleccionada
   * @returns Texto de la opción marcada como correcta
   */
  getCorrectAnswerText(): string {
    const options = this.optionsArray.value;
    return options[this.selectedCorrectIndex]?.text || '';
  }

  /**
   * Emite los datos del ejercicio al componente padre
   * Se ejecuta cuando hay cambios en las opciones o respuesta correcta
   */
  emitData() {
    const options = this.optionsArray.value.map((option: any) => option.text).filter((text: string) => text.trim());
    const correctAnswer = this.getCorrectAnswerText();

    this.dataChange.emit({
      optionSelectOptions: options,
      answerSelectCorrect: correctAnswer,
      // Limpiar otros campos específicos de otros tipos de ejercicio
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
