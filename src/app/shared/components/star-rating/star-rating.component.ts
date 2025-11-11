import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <div class="flex gap-1">
        <button
          *ngFor="let star of [1, 2, 3, 4, 5]"
          type="button"
          class="transition-all duration-200 transform hover:scale-110"
          [class.text-yellow-400]="star <= (hoverRating || rating)"
          [class.text-gray-300]="star > (hoverRating || rating)"
          (click)="selectRating(star)"
          (mouseenter)="hoverRating = star"
          (mouseleave)="hoverRating = 0"
          [title]="'Calificar con ' + star + ' estrella' + (star > 1 ? 's' : '')"
          [disabled]="disabled">
          <i class="pi pi-star-fill text-2xl"></i>
        </button>
      </div>
      <span *ngIf="rating > 0" class="text-sm font-medium text-gray-600">
        {{ rating }}/5
      </span>
      <span *ngIf="rating === 0" class="text-sm text-gray-400">
        Califica esta retroalimentación
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() disabled: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  selectRating(star: number): void {
    if (!this.disabled) {
      this.rating = star;
      this.ratingChange.emit(star);
      this.cdr.markForCheck();
    }
  }
}
