import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-find-error-code-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RadioButtonModule,
    ButtonModule
  ],
  templateUrl: './find-error-code-exercise.component.html',
  styleUrl: './find-error-code-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FindErrorCodeExerciseComponent),
      multi: true
    }
  ]
})
export class FindErrorCodeExerciseComponent {
  @Input() options: string[] = [];
  @Input() selectedError: string | undefined;
  @Output() answerSubmitted = new EventEmitter<string>();

  selectedValue: string | undefined;
  disabled = false;

  ngOnChanges() {
    this.selectedValue = this.selectedError;
  }

  onSubmit() {
    if (this.selectedValue) {
      this.answerSubmitted.emit(this.selectedValue);
    }
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string): void {
    this.selectedValue = value;
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

  onSelectionChange(value: string) {
    this.selectedValue = value;
    this.onChange(value);
    this.onTouch();
  }
}
