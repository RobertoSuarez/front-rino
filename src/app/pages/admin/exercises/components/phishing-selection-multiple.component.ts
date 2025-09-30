import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { CourseService } from '@/core/services/course.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-phishing-selection-multiple',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-toast></p-toast>
    <div class="space-y-4" [formGroup]="form">
      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Contexto del Phishing</label>
        <p class="text-xs text-gray-500 mb-2">Describe el escenario de phishing (ej: email sospechoso, mensaje, etc.)</p>
        <textarea 
          formControlName="context"
          rows="3"
          placeholder="Describe el contexto del escenario de phishing..."
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Imagen de Phishing (Opcional)</label>
        <p class="text-xs text-gray-500 mb-2">Sube una captura de pantalla del email/mensaje de phishing</p>
        
        <div class="flex gap-3 items-start">
          <div class="flex-1">
            <input 
              type="text" 
              formControlName="imageUrl"
              placeholder="URL de la imagen"
              readonly
              class="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div class="flex gap-2">
            <input 
              #fileInput
              type="file" 
              accept="image/*"
              (change)="onFileSelected($event)"
              class="hidden" />
            <p-button 
              label="Seleccionar Imagen" 
              icon="pi pi-upload"
              [loading]="uploadingImage"
              [disabled]="uploadingImage"
              size="small"
              (onClick)="fileInput.click()"></p-button>
            <p-button 
              *ngIf="form.get('imageUrl')?.value"
              icon="pi pi-times" 
              severity="danger"
              size="small"
              [disabled]="uploadingImage"
              (onClick)="clearImage()"></p-button>
          </div>
        </div>
        
        <div *ngIf="form.get('imageUrl')?.value" class="mt-3">
          <img 
            [src]="form.get('imageUrl')?.value" 
            alt="Vista previa" 
            class="max-w-full max-h-48 rounded-lg border-2 border-gray-200 shadow-sm" />
        </div>
        
        <div *ngIf="uploadingImage" class="flex items-center gap-2 mt-2">
          <p-progressSpinner 
            [style]="{ width: '20px', height: '20px' }"
            styleClass="custom-spinner"></p-progressSpinner>
          <span class="text-sm text-gray-600">Subiendo imagen...</span>
        </div>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Indicadores de Phishing</label>
        <p class="text-xs text-gray-500 mb-2">Lista los posibles indicadores, marca los que son señales reales de phishing</p>
        <div formArrayName="options" class="space-y-2">
          <div *ngFor="let option of optionsArray.controls; let i = index" 
               [formGroupName]="i" 
               class="flex items-center gap-2">
            <input 
              type="text" 
              formControlName="text"
              placeholder="Indicador {{i + 1}} (ej: Dirección de email sospechosa)"
              class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            <p-checkbox 
              [binary]="true"
              [inputId]="'correct_' + i"
              [(ngModel)]="option.value.isCorrect"
              (onChange)="onCorrectChange()"
              [ngModelOptions]="{standalone: true}"></p-checkbox>
            <label [for]="'correct_' + i" class="text-sm text-gray-600">Es phishing</label>
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
          label="Agregar Indicador" 
          icon="pi pi-plus" 
          size="small"
          class="p-button-outlined"
          (onClick)="addOption()"></p-button>
      </div>

      <div class="field space-y-2">
        <label class="block text-sm font-medium text-gray-700">Respuestas Correctas</label>
        <div class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-700 font-medium mb-2">Indicadores que son señales de phishing:</p>
          <ul class="list-disc list-inside space-y-1">
            <li *ngFor="let answer of getCorrectAnswers()" class="text-sm text-red-600">{{answer}}</li>
            <li *ngIf="getCorrectAnswers().length === 0" class="text-sm text-gray-500 italic">Ninguno seleccionado</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class PhishingSelectionMultipleComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();

  form: FormGroup;
  uploadingImage = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      context: ['', Validators.required],
      imageUrl: [''],
      options: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initializeOptions();
    this.form.valueChanges.subscribe(() => {
      this.emitData();
    });
    // Emitir datos iniciales
    setTimeout(() => this.emitData(), 0);
  }

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  initializeOptions() {
    if (this.initialData?.optionsPhishingSelection?.length > 0) {
      this.form.patchValue({
        context: this.initialData.phishingContext || '',
        imageUrl: this.initialData.phishingImageUrl || ''
      });
      
      this.initialData.optionsPhishingSelection.forEach((option: string) => {
        const isCorrect = this.initialData.answerPhishingSelection?.includes(option) || false;
        this.optionsArray.push(this.createOptionGroup(option, isCorrect));
      });
    } else {
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
    const options = this.optionsArray.value.map((option: any) => option.text).filter((text: string) => text.trim());
    const correctAnswers = this.getCorrectAnswers();

    this.dataChange.emit({
      optionsPhishingSelection: options,
      answerPhishingSelection: correctAnswers,
      phishingContext: this.form.get('context')?.value || '',
      phishingImageUrl: this.form.get('imageUrl')?.value || ''
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor selecciona un archivo de imagen válido'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La imagen no debe superar los 5MB'
        });
        return;
      }

      this.uploadingImage = true;
      this.courseService.uploadImage(file).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          // La URL puede venir en response.url o response.data.url
          const imageUrl = response.url || response.data?.url || response;
          console.log('URL de la imagen:', imageUrl);
          this.form.patchValue({ imageUrl: imageUrl });
          this.uploadingImage = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Imagen subida correctamente'
          });
          // Limpiar el input para permitir subir la misma imagen nuevamente
          input.value = '';
        },
        error: (error) => {
          console.error('Error al subir imagen:', error);
          this.uploadingImage = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al subir la imagen. Intenta nuevamente.'
          });
          input.value = '';
        }
      });
    }
  }

  clearImage() {
    this.form.patchValue({ imageUrl: '' });
    this.messageService.add({
      severity: 'info',
      summary: 'Imagen eliminada',
      detail: 'La imagen ha sido eliminada'
    });
  }
}
