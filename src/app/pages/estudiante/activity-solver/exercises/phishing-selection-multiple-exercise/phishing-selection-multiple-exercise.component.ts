import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-phishing-selection-multiple-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule
  ],
  templateUrl: './phishing-selection-multiple-exercise.component.html',
  styleUrl: './phishing-selection-multiple-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhishingSelectionMultipleExerciseComponent),
      multi: true
    }
  ]
})
export class PhishingSelectionMultipleExerciseComponent {
  @Input() options: string[] = [];
  @Input() selectedOptions: string[] = [];
  @Input() phishingContext: string = '';
  @Input() phishingImageUrl: string = '';
  @Output() answerSubmitted = new EventEmitter<string[]>();

  selectedValues: string[] = [];

  ngOnChanges() {
    this.selectedValues = this.selectedOptions ? [...this.selectedOptions] : [];
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string[]): void {
    this.selectedValues = value ? [...value] : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // No necesitamos disabled state
  }

  onSelectionChange() {
    this.onChange(this.selectedValues);
    this.onTouch();
    this.answerSubmitted.emit([...this.selectedValues]);
  }

  isSelected(option: string): boolean {
    return this.selectedValues.includes(option);
  }

  toggleOption(option: string) {
    const index = this.selectedValues.indexOf(option);
    if (index > -1) {
      this.selectedValues.splice(index, 1);
    } else {
      this.selectedValues.push(option);
    }
    this.onSelectionChange();
  }
}
