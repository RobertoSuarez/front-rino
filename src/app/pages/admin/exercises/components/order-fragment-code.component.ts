import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-order-fragment-code',
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
        <label class="block text-sm font-medium text-gray-700">Fragmentos de Código</label>
        <div formArrayName="fragments" class="space-y-2">
          <div *ngFor="let fragment of fragmentsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="flex items-center gap-2">
            <span class="text-sm text-gray-500 w-8">{{i + 1}}.</span>
            <textarea 
              formControlName="text"
              placeholder="Ingresa el fragmento de código {{i + 1}}"
              rows="2"
              class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"></textarea>
            <p-button 
              *ngIf="fragmentsArray.length > 2"
              icon="pi pi-trash" 
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text"
              (onClick)="removeFragment(i)"></p-button>
          </div>
        </div>
        <p-button 
          label="Agregar Fragmento" 
          icon="pi pi-plus" 
          size="small"
          class="p-button-outlined"
          (onClick)="addFragment()"></p-button>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Orden Correcto</label>
        <div class="p-3 border border-gray-300 rounded-md bg-gray-50">
          <div class="text-sm text-gray-600 mb-2">Arrastra los fragmentos para establecer el orden correcto:</div>
          <div cdkDropList 
               (cdkDropListDropped)="drop($event)"
               class="space-y-2">
            <div *ngFor="let item of correctOrder; let i = index" 
                 cdkDrag
                 class="p-2 bg-white border border-gray-200 rounded cursor-move hover:shadow-sm">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-blue-600">{{i + 1}}.</span>
                <span class="text-sm font-mono">{{item}}</span>
                <i class="pi pi-bars ml-auto text-gray-400"></i>
              </div>
            </div>
          </div>
          <div *ngIf="correctOrder.length === 0" class="text-gray-500 text-sm">
            Agrega fragmentos para poder ordenarlos
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderFragmentCodeComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;
  correctOrder: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fragments: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initializeFragments();
    this.form.valueChanges.subscribe(() => {
      this.updateCorrectOrder();
      this.emitData();
    });
  }

  get fragmentsArray(): FormArray {
    return this.form.get('fragments') as FormArray;
  }

  initializeFragments() {
    // Si hay datos iniciales, cargarlos
    if (this.initialData?.optionOrderFragmentCode?.length > 0) {
      this.initialData.optionOrderFragmentCode.forEach((fragment: string) => {
        this.fragmentsArray.push(this.createFragmentGroup(fragment));
      });
      // Establecer el orden correcto inicial
      if (this.initialData.answerOrderFragmentCode?.length > 0) {
        this.correctOrder = [...this.initialData.answerOrderFragmentCode];
      } else {
        this.correctOrder = [...this.initialData.optionOrderFragmentCode];
      }
    } else {
      // Crear fragmentos por defecto
      this.addFragment();
      this.addFragment();
    }
  }

  createFragmentGroup(text: string = ''): FormGroup {
    return this.fb.group({
      text: [text, Validators.required]
    });
  }

  addFragment() {
    this.fragmentsArray.push(this.createFragmentGroup());
  }

  removeFragment(index: number) {
    if (this.fragmentsArray.length > 2) {
      const removedFragment = this.fragmentsArray.at(index).get('text')?.value;
      this.fragmentsArray.removeAt(index);
      
      // Remover del orden correcto si existe
      const correctIndex = this.correctOrder.indexOf(removedFragment);
      if (correctIndex > -1) {
        this.correctOrder.splice(correctIndex, 1);
      }
      
      this.emitData();
    }
  }

  updateCorrectOrder() {
    const currentFragments = this.fragmentsArray.value
      .map((fragment: any) => fragment.text)
      .filter((text: string) => text.trim());

    // Actualizar el orden correcto manteniendo los elementos existentes
    this.correctOrder = this.correctOrder.filter(item => currentFragments.includes(item));
    
    // Agregar nuevos fragmentos al final
    currentFragments.forEach((fragment: string) => {
      if (!this.correctOrder.includes(fragment)) {
        this.correctOrder.push(fragment);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.correctOrder, event.previousIndex, event.currentIndex);
    this.emitData();
  }

  emitData() {
    const fragments = this.fragmentsArray.value
      .map((fragment: any) => fragment.text)
      .filter((text: string) => text.trim());

    this.dataChange.emit({
      optionOrderFragmentCode: fragments,
      answerOrderFragmentCode: [...this.correctOrder],
      // Limpiar otros campos
      optionSelectOptions: [],
      optionOrderLineCode: [],
      optionsFindErrorCode: [],
      answerSelectCorrect: '',
      answerSelectsCorrect: [],
      answerOrderLineCode: [],
      answerFindError: ''
    });
  }
}
