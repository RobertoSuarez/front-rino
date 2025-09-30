import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-vertical-ordering',
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
        <label class="block text-sm font-medium text-gray-700">Elementos a Ordenar Verticalmente</label>
        <p class="text-xs text-gray-500 mb-2">Los estudiantes deberán ordenar estos elementos de arriba hacia abajo</p>
        <div formArrayName="items" class="space-y-2">
          <div *ngFor="let item of itemsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="flex items-center gap-2">
            <span class="text-sm text-gray-500 w-6">{{i + 1}}.</span>
            <input 
              type="text" 
              formControlName="text"
              placeholder="Ingresa el elemento {{i + 1}}"
              class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            <p-button 
              *ngIf="itemsArray.length > 2"
              icon="pi pi-trash" 
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text"
              (onClick)="removeItem(i)"></p-button>
          </div>
        </div>
        <p-button 
          label="Agregar Elemento" 
          icon="pi pi-plus" 
          size="small"
          class="p-button-outlined"
          (onClick)="addItem()"></p-button>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Orden Correcto (Arrastra para ordenar)</label>
        <p class="text-xs text-gray-500 mb-2">Define el orden correcto arrastrando los elementos</p>
        <div 
          cdkDropList 
          (cdkDropListDropped)="drop($event)"
          class="space-y-2">
          <div 
            *ngFor="let item of correctOrder; let i = index"
            cdkDrag
            class="p-3 bg-blue-50 border border-blue-200 rounded-md cursor-move hover:bg-blue-100 transition-colors">
            <div class="flex items-center gap-2">
              <i class="pi pi-bars text-gray-400"></i>
              <span class="font-medium text-blue-700">{{i + 1}}.</span>
              <span class="flex-1">{{item}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerticalOrderingComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;
  correctOrder: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initializeItems();
    this.form.valueChanges.subscribe(() => {
      this.updateCorrectOrder();
      this.emitData();
    });
    // Emitir datos iniciales
    setTimeout(() => this.emitData(), 0);
  }

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  initializeItems() {
    if (this.initialData?.optionsVerticalOrdering?.length > 0) {
      this.initialData.optionsVerticalOrdering.forEach((item: string) => {
        this.itemsArray.push(this.createItemGroup(item));
      });
      this.correctOrder = [...(this.initialData.answerVerticalOrdering || this.initialData.optionsVerticalOrdering)];
    } else {
      this.addItem();
      this.addItem();
    }
  }

  createItemGroup(text: string = ''): FormGroup {
    return this.fb.group({
      text: [text, Validators.required]
    });
  }

  addItem() {
    this.itemsArray.push(this.createItemGroup());
  }

  removeItem(index: number) {
    if (this.itemsArray.length > 2) {
      const removedText = this.itemsArray.at(index).value.text;
      this.itemsArray.removeAt(index);
      // Remover del orden correcto también
      this.correctOrder = this.correctOrder.filter(item => item !== removedText);
      this.emitData();
    }
  }

  updateCorrectOrder() {
    const items = this.itemsArray.value.map((item: any) => item.text).filter((text: string) => text.trim());
    // Mantener el orden existente y agregar nuevos elementos al final
    const newItems = items.filter((item: string) => !this.correctOrder.includes(item));
    this.correctOrder = [...this.correctOrder.filter((item: string) => items.includes(item)), ...newItems];
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.correctOrder, event.previousIndex, event.currentIndex);
    this.emitData();
  }

  emitData() {
    const items = this.itemsArray.value.map((item: any) => item.text).filter((text: string) => text.trim());

    this.dataChange.emit({
      optionsVerticalOrdering: items,
      answerVerticalOrdering: this.correctOrder.filter((item: string) => items.includes(item))
    });
  }
}
