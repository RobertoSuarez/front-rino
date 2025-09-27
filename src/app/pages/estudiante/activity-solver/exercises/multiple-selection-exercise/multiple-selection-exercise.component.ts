import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-multiple-selection-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    ButtonModule
  ],
  templateUrl: './multiple-selection-exercise.component.html',
  styleUrl: './multiple-selection-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultipleSelectionExerciseComponent),
      multi: true
    }
  ]
})
export class MultipleSelectionExerciseComponent {
  @Input() options: string[] = [];
  @Input() selectedOptions: string[] | undefined = [];
  @Output() answerSubmitted = new EventEmitter<string[]>();

  selectedValues: string[] = [];

  ngOnChanges() {
    this.selectedValues = this.selectedOptions || [];
  }

  isSelected(option: string): boolean {
    return this.selectedValues.includes(option);
  }

  toggleSelection(option: string): void {
    const index = this.selectedValues.indexOf(option);
    if (index > -1) {
      // Si ya está seleccionado, lo quitamos
      this.selectedValues.splice(index, 1);
    } else {
      // Si no está seleccionado, lo agregamos
      this.selectedValues.push(option);
    }

    this.onChange(this.selectedValues);
    this.onTouch();
    // Emitir automáticamente la respuesta cuando cambie la selección
    this.answerSubmitted.emit(this.selectedValues);
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string[]): void {
    this.selectedValues = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // No necesitamos disabled state ya que la verificación se maneja desde el padre
  }
}
