import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-vertical-ordering-exercise',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule
  ],
  templateUrl: './vertical-ordering-exercise.component.html',
  styleUrl: './vertical-ordering-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VerticalOrderingExerciseComponent),
      multi: true
    }
  ]
})
export class VerticalOrderingExerciseComponent {
  @Input() fragments: string[] = [];
  @Input() orderedFragments: string[] = [];
  @Output() answerSubmitted = new EventEmitter<string[]>();

  currentOrder: string[] = [];

  ngOnChanges() {
    if (this.orderedFragments && this.orderedFragments.length > 0) {
      this.currentOrder = [...this.orderedFragments];
    } else if (this.fragments && this.fragments.length > 0) {
      // Mezclar las opciones aleatoriamente al inicio
      this.currentOrder = this.shuffleArray([...this.fragments]);
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
