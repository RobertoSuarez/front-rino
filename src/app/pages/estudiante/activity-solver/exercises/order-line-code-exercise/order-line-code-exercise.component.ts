import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-order-line-code-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DragDropModule
  ],
  templateUrl: './order-line-code-exercise.component.html',
  styleUrl: './order-line-code-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrderLineCodeExerciseComponent),
      multi: true
    }
  ]
})
export class OrderLineCodeExerciseComponent {
  @Input() lines: string[] = [];
  @Input() orderedLines: string[] | undefined = [];
  @Output() answerSubmitted = new EventEmitter<string[]>();

  linesToOrder: string[] = [];

  ngOnChanges() {
    if (this.orderedLines && this.orderedLines.length > 0) {
      this.linesToOrder = [...this.orderedLines];
    } else if (this.lines && this.lines.length > 0) {
      this.linesToOrder = [...this.lines];
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.linesToOrder, event.previousIndex, event.currentIndex);
    this.onChange(this.linesToOrder);
    this.onTouch();
    // Emitir automáticamente la respuesta cuando cambie el orden
    this.answerSubmitted.emit(this.linesToOrder);
  }

  resetOrder() {
    if (this.lines && this.lines.length > 0) {
      this.linesToOrder = [...this.lines];
      this.onChange(this.linesToOrder);
      this.onTouch();
      // Emitir la respuesta después de resetear
      this.answerSubmitted.emit(this.linesToOrder);
    }
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string[]): void {
    this.linesToOrder = value || [];
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
