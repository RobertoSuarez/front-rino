import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-order-line-code',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DragDropModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="space-y-4" [formGroup]="form">
      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Elementos de la Línea de Código</label>
        <div formArrayName="elements" class="space-y-2">
          <div *ngFor="let element of elementsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="flex items-center gap-2">
            <span class="text-sm text-gray-500 w-8">{{i + 1}}.</span>
            <input 
              type="text" 
              formControlName="text"
              placeholder="Elemento {{i + 1}} (ej: variable, operador, etc.)"
              class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" />
            <p-button 
              *ngIf="elementsArray.length > 2"
              icon="pi pi-trash" 
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text"
              (onClick)="removeElement(i)"></p-button>
          </div>
        </div>
        <p-button 
          label="Agregar Elemento" 
          icon="pi pi-plus" 
          size="small"
          class="p-button-outlined"
          (onClick)="addElement()"></p-button>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Orden Correcto de la Línea</label>
        <div class="p-3 border border-gray-300 rounded-md bg-gray-50">
          <div class="text-sm text-gray-600 mb-2">Arrastra los elementos para formar la línea de código correcta:</div>
          <div cdkDropList 
               (cdkDropListDropped)="drop($event)"
               class="flex flex-wrap gap-2 min-h-[50px] p-2 border-2 border-dashed border-gray-300 rounded">
            <div *ngFor="let item of correctOrder; let i = index" 
                 cdkDrag
                 class="px-3 py-1 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 font-mono text-sm">
              {{item}}
            </div>
          </div>
          <div *ngIf="correctOrder.length === 0" class="text-gray-500 text-sm mt-2">
            Agrega elementos para poder ordenarlos
          </div>
          <div *ngIf="correctOrder.length > 0" class="mt-3">
            <div class="text-sm font-medium text-gray-700 mb-1">Vista previa de la línea:</div>
            <div class="p-2 bg-white border rounded font-mono text-sm">
              {{getPreviewLine()}}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderLineCodeComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;
  correctOrder: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      elements: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initializeElements();
    this.form.valueChanges.subscribe(() => {
      this.updateCorrectOrder();
      this.emitData();
    });
  }

  get elementsArray(): FormArray {
    return this.form.get('elements') as FormArray;
  }

  initializeElements() {
    // Si hay datos iniciales, cargarlos
    if (this.initialData?.optionOrderLineCode?.length > 0) {
      this.initialData.optionOrderLineCode.forEach((element: string) => {
        this.elementsArray.push(this.createElementGroup(element));
      });
      // Establecer el orden correcto inicial
      if (this.initialData.answerOrderLineCode?.length > 0) {
        this.correctOrder = [...this.initialData.answerOrderLineCode];
      } else {
        this.correctOrder = [...this.initialData.optionOrderLineCode];
      }
    } else {
      // Crear elementos por defecto
      this.addElement();
      this.addElement();
    }
  }

  createElementGroup(text: string = ''): FormGroup {
    return this.fb.group({
      text: [text, Validators.required]
    });
  }

  addElement() {
    this.elementsArray.push(this.createElementGroup());
  }

  removeElement(index: number) {
    if (this.elementsArray.length > 2) {
      const removedElement = this.elementsArray.at(index).get('text')?.value;
      this.elementsArray.removeAt(index);
      
      // Remover del orden correcto si existe
      const correctIndex = this.correctOrder.indexOf(removedElement);
      if (correctIndex > -1) {
        this.correctOrder.splice(correctIndex, 1);
      }
      
      this.emitData();
    }
  }

  updateCorrectOrder() {
    const currentElements = this.elementsArray.value
      .map((element: any) => element.text)
      .filter((text: string) => text.trim());

    // Actualizar el orden correcto manteniendo los elementos existentes
    this.correctOrder = this.correctOrder.filter(item => currentElements.includes(item));
    
    // Agregar nuevos elementos al final
    currentElements.forEach((element: string) => {
      if (!this.correctOrder.includes(element)) {
        this.correctOrder.push(element);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.correctOrder, event.previousIndex, event.currentIndex);
    this.emitData();
  }

  getPreviewLine(): string {
    return this.correctOrder.join(' ');
  }

  emitData() {
    const elements = this.elementsArray.value
      .map((element: any) => element.text)
      .filter((text: string) => text.trim());

    this.dataChange.emit({
      optionOrderLineCode: elements,
      answerOrderLineCode: [...this.correctOrder],
      // Limpiar otros campos
      optionSelectOptions: [],
      optionOrderFragmentCode: [],
      optionsFindErrorCode: [],
      answerSelectCorrect: '',
      answerSelectsCorrect: [],
      answerOrderFragmentCode: [],
      answerFindError: ''
    });
  }
}
