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
  disabled = false;

  ngOnChanges() {
    this.selectedValues = this.selectedOptions || [];
  }

  onSubmit() {
    if (this.selectedValues && this.selectedValues.length > 0) {
      this.answerSubmitted.emit(this.selectedValues);
    }
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
    this.disabled = isDisabled;
  }

  onSelectionChange() {
    this.onChange(this.selectedValues);
    this.onTouch();
  }
}
