import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-match-pairs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="space-y-4" [formGroup]="form">
      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Pares a Emparejar</label>
        <p class="text-xs text-gray-500 mb-2">Define los pares que los estudiantes deberán emparejar correctamente</p>
        <div formArrayName="pairs" class="space-y-3">
          <div *ngFor="let pair of pairsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-gray-700">Par {{i + 1}}</span>
              <p-button 
                *ngIf="pairsArray.length > 2"
                icon="pi pi-trash" 
                severity="danger"
                size="small"
                class="p-button-rounded p-button-text ml-auto"
                (onClick)="removePair(i)"></p-button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Elemento Izquierdo</label>
                <input 
                  type="text" 
                  formControlName="left"
                  placeholder="Concepto, término, etc."
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Elemento Derecho</label>
                <input 
                  type="text" 
                  formControlName="right"
                  placeholder="Definición, descripción, etc."
                  class="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm" />
              </div>
            </div>
            <div class="flex items-center justify-center mt-2">
              <i class="pi pi-arrows-h text-gray-400 text-xs"></i>
            </div>
          </div>
        </div>
        <p-button 
          label="Agregar Par" 
          icon="pi pi-plus" 
          size="small"
          class="p-button-outlined"
          (onClick)="addPair()"></p-button>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Vista Previa de Pares</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 class="text-sm font-semibold text-blue-700 mb-2">Columna Izquierda</h4>
            <ul class="space-y-1">
              <li *ngFor="let left of getLeftItems(); let i = index" class="text-sm text-blue-600">
                {{i + 1}}. {{left}}
              </li>
              <li *ngIf="getLeftItems().length === 0" class="text-sm text-gray-500 italic">Ningún elemento</li>
            </ul>
          </div>
          <div class="p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 class="text-sm font-semibold text-green-700 mb-2">Columna Derecha</h4>
            <ul class="space-y-1">
              <li *ngFor="let right of getRightItems(); let i = index" class="text-sm text-green-600">
                {{i + 1}}. {{right}}
              </li>
              <li *ngIf="getRightItems().length === 0" class="text-sm text-gray-500 italic">Ningún elemento</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Pares Correctos</label>
        <div class="p-3 bg-purple-50 border border-purple-200 rounded-md">
          <ul class="space-y-2">
            <li *ngFor="let pair of getValidPairs(); let i = index" class="text-sm">
              <span class="text-blue-600 font-medium">{{pair.left}}</span>
              <i class="pi pi-arrow-right mx-2 text-purple-500"></i>
              <span class="text-green-600 font-medium">{{pair.right}}</span>
            </li>
            <li *ngIf="getValidPairs().length === 0" class="text-sm text-gray-500 italic">Ningún par completo</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class MatchPairsComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      pairs: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initializePairs();
    this.form.valueChanges.subscribe(() => {
      this.emitData();
    });
    // Emitir datos iniciales
    setTimeout(() => this.emitData(), 0);
  }

  get pairsArray(): FormArray {
    return this.form.get('pairs') as FormArray;
  }

  initializePairs() {
    if (this.initialData?.answerMatchPairs?.length > 0) {
      this.initialData.answerMatchPairs.forEach((pair: { left: string; right: string }) => {
        this.pairsArray.push(this.createPairGroup(pair.left, pair.right));
      });
    } else {
      this.addPair();
      this.addPair();
    }
  }

  createPairGroup(left: string = '', right: string = ''): FormGroup {
    return this.fb.group({
      left: [left, Validators.required],
      right: [right, Validators.required]
    });
  }

  addPair() {
    this.pairsArray.push(this.createPairGroup());
  }

  removePair(index: number) {
    if (this.pairsArray.length > 2) {
      this.pairsArray.removeAt(index);
      this.emitData();
    }
  }

  getValidPairs(): { left: string; right: string }[] {
    return this.pairsArray.value.filter((pair: any) => pair.left.trim() && pair.right.trim());
  }

  getLeftItems(): string[] {
    return this.pairsArray.value
      .map((pair: any) => pair.left)
      .filter((text: string) => text.trim());
  }

  getRightItems(): string[] {
    return this.pairsArray.value
      .map((pair: any) => pair.right)
      .filter((text: string) => text.trim());
  }

  emitData() {
    const validPairs = this.getValidPairs();
    const leftItems = this.getLeftItems();
    const rightItems = this.getRightItems();

    this.dataChange.emit({
      optionsMatchPairsLeft: leftItems,
      optionsMatchPairsRight: rightItems,
      answerMatchPairs: validPairs
    });
  }
}
