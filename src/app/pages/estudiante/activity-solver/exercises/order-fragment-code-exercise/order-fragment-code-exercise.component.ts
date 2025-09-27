import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-order-fragment-code-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DragDropModule
  ],
  templateUrl: './order-fragment-code-exercise.component.html',
  styleUrl: './order-fragment-code-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrderFragmentCodeExerciseComponent),
      multi: true
    }
  ]
})
export class OrderFragmentCodeExerciseComponent implements OnChanges {
  @Input() fragments: string[] = [];
  @Input() orderedFragments: string[] | undefined = [];
  @Output() answerSubmitted = new EventEmitter<string[]>();

  availableFragments: string[] = [];
  orderedFragmentsList: string[] = [];
  private initialFragments: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fragments']) {
      this.initialFragments = this.fragments ? [...this.fragments] : [];
      if (!this.orderedFragments || this.orderedFragments.length === 0) {
        this.orderedFragmentsList = [];
      }
    }

    if (changes['orderedFragments'] && this.orderedFragments) {
      this.orderedFragmentsList = [...this.orderedFragments];
    }

    this.syncAvailableFromCurrent();
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    this.propagateChanges();
  }

  resetOrder() {
    this.orderedFragmentsList = [];
    this.syncAvailableFromCurrent();
    this.propagateChanges();
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string[]): void {
    this.orderedFragmentsList = value ? [...value] : [];
    this.syncAvailableFromCurrent();
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

  private propagateChanges(emit: boolean = true): void {
    this.onChange(this.orderedFragmentsList);
    this.onTouch();

    if (emit) {
      this.answerSubmitted.emit([...this.orderedFragmentsList]);
    }
  }

  private syncAvailableFromCurrent(): void {
    const remaining = this.initialFragments ? [...this.initialFragments] : [];

    this.orderedFragmentsList.forEach(fragment => {
      const index = remaining.indexOf(fragment);
      if (index > -1) {
        remaining.splice(index, 1);
      }
    });

    this.availableFragments = remaining;
  }
}
