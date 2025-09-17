import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-write-code-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './write-code-exercise.component.html',
  styleUrl: './write-code-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WriteCodeExerciseComponent),
      multi: true
    }
  ]
})
export class WriteCodeExerciseComponent {
  @Input() code: string | undefined = '';
  @Output() answerSubmitted = new EventEmitter<string>();

  codeValue: string = '';
  disabled = false;

  ngOnChanges() {
    this.codeValue = this.code || '';
  }

  onSubmit() {
    if (this.codeValue && this.codeValue.trim()) {
      this.answerSubmitted.emit(this.codeValue);
    }
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string): void {
    this.codeValue = value || '';
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

  onCodeChange(event: any) {
    this.codeValue = event.target.value;
    this.onChange(this.codeValue);
    this.onTouch();
  }
}
