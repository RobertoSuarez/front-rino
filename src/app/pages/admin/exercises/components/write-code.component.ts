import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-write-code',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="space-y-4">
      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Instrucciones para el Ejercicio</label>
        <div class="p-3 border border-blue-200 rounded-md bg-blue-50">
          <div class="text-sm text-blue-800">
            <strong>Tipo de ejercicio:</strong> Escribir Código
          </div>
          <div class="text-sm text-blue-700 mt-1">
            En este tipo de ejercicio, el estudiante deberá escribir código completo basándose en el enunciado proporcionado.
            No se requieren opciones adicionales ya que la respuesta será código libre escrito por el estudiante.
          </div>
        </div>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Código de Ejemplo (Opcional)</label>
        <textarea 
          formControlName="exampleCode"
          rows="8"
          placeholder="Puedes proporcionar un código de ejemplo o plantilla para guiar al estudiante..."
          class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"></textarea>
        <small class="text-gray-600">
          Este código aparecerá como referencia o punto de partida para el estudiante (opcional).
        </small>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Criterios de Evaluación</label>
        <textarea 
          formControlName="evaluationCriteria"
          rows="4"
          placeholder="Describe los criterios que se usarán para evaluar la respuesta del estudiante..."
          class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
        <small class="text-gray-600">
          Especifica qué aspectos del código serán evaluados (funcionalidad, sintaxis, buenas prácticas, etc.).
        </small>
      </div>
    </div>
  `
})
export class WriteCodeComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      exampleCode: [''],
      evaluationCriteria: ['']
    });
  }

  ngOnInit() {
    this.initializeData();
    this.form.valueChanges.subscribe(() => {
      this.emitData();
    });
    
    // Emitir datos iniciales
    this.emitData();
  }

  initializeData() {
    if (this.initialData) {
      this.form.patchValue({
        exampleCode: this.initialData.code || '',
        evaluationCriteria: this.initialData.evaluationCriteria || ''
      });
    }
  }

  emitData() {
    const formValue = this.form.value;

    this.dataChange.emit({
      code: formValue.exampleCode || '',
      evaluationCriteria: formValue.evaluationCriteria || '',
      // Limpiar todos los campos de opciones ya que no se necesitan para escribir código
      optionSelectOptions: [],
      optionOrderFragmentCode: [],
      optionOrderLineCode: [],
      optionsFindErrorCode: [],
      answerSelectCorrect: '',
      answerSelectsCorrect: [],
      answerOrderFragmentCode: [],
      answerOrderLineCode: [],
      answerFindError: ''
    });
  }
}
