import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
export class OrderFragmentCodeExerciseComponent {
  @Input() fragments: string[] = [];
  @Input() orderedFragments: string[] | undefined = [];
  @Output() answerSubmitted = new EventEmitter<string[]>();

  fragmentsToOrder: string[] = [];
  disabled = false;

  ngOnChanges() {
    if (this.orderedFragments && this.orderedFragments.length > 0) {
      this.fragmentsToOrder = [...this.orderedFragments];
    } else if (this.fragments && this.fragments.length > 0) {
      this.fragmentsToOrder = [...this.fragments];
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fragmentsToOrder, event.previousIndex, event.currentIndex);
    this.onChange(this.fragmentsToOrder);
  }

  onSubmit() {
    if (this.fragmentsToOrder && this.fragmentsToOrder.length > 0) {
      this.answerSubmitted.emit(this.fragmentsToOrder);
    }
  }

  resetOrder() {
    if (this.fragments && this.fragments.length > 0) {
      this.fragmentsToOrder = [...this.fragments];
      this.onChange(this.fragmentsToOrder);
    }
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string[]): void {
    this.fragmentsToOrder = value || [];
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
}
