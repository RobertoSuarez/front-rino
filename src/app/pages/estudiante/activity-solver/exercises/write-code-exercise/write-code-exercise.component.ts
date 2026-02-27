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

  get lineCount(): number {
    if (!this.codeValue) {
      return 0;
    }
    return this.codeValue.split('\n').length;
  }

  ngOnChanges() {
    this.codeValue = this.code || '';
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
    // No necesitamos disabled state ya que la verificación se maneja desde el padre
  }

  onCodeChange(value: string) {
    this.codeValue = value;
    this.onChange(this.codeValue);
    this.onTouch();
    // Emitir automáticamente la respuesta cuando cambie el código
    this.answerSubmitted.emit(this.codeValue);
  }
}
