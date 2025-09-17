import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-single-selection-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RadioButtonModule,
    ButtonModule
  ],
  templateUrl: './single-selection-exercise.component.html',
  styleUrl: './single-selection-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleSelectionExerciseComponent),
      multi: true
    }
  ]
})
export class SingleSelectionExerciseComponent {
  @Input() options: string[] = [];
  @Input() selectedOption: string | undefined;
  @Output() answerSubmitted = new EventEmitter<string>();

  selectedValue: string | undefined;
  disabled = false;

  ngOnChanges() {
    this.selectedValue = this.selectedOption;
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
