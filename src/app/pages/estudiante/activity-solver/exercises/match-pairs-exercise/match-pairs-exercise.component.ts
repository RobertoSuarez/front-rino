import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-match-pairs-exercise',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './match-pairs-exercise.component.html',
  styleUrl: './match-pairs-exercise.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatchPairsExerciseComponent),
      multi: true
    }
  ]
})
export class MatchPairsExerciseComponent {
  @Input() leftOptions: string[] = [];
  @Input() rightOptions: string[] = [];
  @Input() matchedPairs: { left: string; right: string }[] = [];
  @Output() answerSubmitted = new EventEmitter<{ left: string; right: string }[]>();

  shuffledRightOptions: string[] = [];
  selectedLeft: string | null = null;
  selectedRight: string | null = null;
  pairs: { left: string; right: string }[] = [];

  ngOnChanges() {
    if (this.matchedPairs && this.matchedPairs.length > 0) {
      this.pairs = [...this.matchedPairs];
    } else {
      this.pairs = [];
    }
    
    if (this.rightOptions && this.rightOptions.length > 0) {
      this.shuffledRightOptions = this.shuffleArray([...this.rightOptions]);
    }
  }

  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: { left: string; right: string }[]): void {
    if (value) {
      this.pairs = [...value];
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

  selectLeft(item: string) {
    this.selectedLeft = this.selectedLeft === item ? null : item;
    this.tryMatch();
  }

  selectRight(item: string) {
    this.selectedRight = this.selectedRight === item ? null : item;
    this.tryMatch();
  }

  tryMatch() {
    if (this.selectedLeft && this.selectedRight) {
      // Verificar si ya existe un par con estos elementos
      const existingPairIndex = this.pairs.findIndex(
        p => p.left === this.selectedLeft || p.right === this.selectedRight
      );
      
      if (existingPairIndex > -1) {
        // Reemplazar el par existente
        this.pairs[existingPairIndex] = { left: this.selectedLeft, right: this.selectedRight };
      } else {
        // Agregar nuevo par
        this.pairs.push({ left: this.selectedLeft, right: this.selectedRight });
      }
      
      this.selectedLeft = null;
      this.selectedRight = null;
      this.onChange(this.pairs);
      this.onTouch();
      this.answerSubmitted.emit([...this.pairs]);
    }
  }

  removePair(pair: { left: string; right: string }) {
    this.pairs = this.pairs.filter(p => !(p.left === pair.left && p.right === pair.right));
    this.onChange(this.pairs);
    this.answerSubmitted.emit([...this.pairs]);
  }

  isLeftMatched(item: string): boolean {
    return this.pairs.some(p => p.left === item);
  }

  isRightMatched(item: string): boolean {
    return this.pairs.some(p => p.right === item);
  }

  getRightMatch(leftItem: string): string | null {
    const pair = this.pairs.find(p => p.left === leftItem);
    return pair ? pair.right : null;
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
