import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-horizontal-ordering-exercise',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule
  ],
  templateUrl: './horizontal-ordering-exercise.component.html',
  styleUrl: './horizontal-ordering-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HorizontalOrderingExerciseComponent),
      multi: true
    }
  ]
})
export class HorizontalOrderingExerciseComponent {
  @Input() lines: string[] = [];
  @Input() orderedLines: string[] = [];
  @Output() answerSubmitted = new EventEmitter<string[]>();

  currentOrder: string[] = [];

  ngOnChanges() {
    if (this.orderedLines && this.orderedLines.length > 0) {
      this.currentOrder = [...this.orderedLines];
    } else if (this.lines && this.lines.length > 0) {
      this.currentOrder = this.shuffleArray([...this.lines]);
    }
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string[]): void {
    if (value) {
      this.currentOrder = [...value];
    }
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.currentOrder, event.previousIndex, event.currentIndex);
    this.onChange(this.currentOrder);
    this.onTouch();
    this.answerSubmitted.emit([...this.currentOrder]);
  }

  private shuffleArray(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
