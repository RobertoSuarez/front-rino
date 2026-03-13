import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-student-onboarding',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './student-onboarding.component.html',
  styleUrls: ['./student-onboarding.component.scss']
})
export class StudentOnboardingComponent {
  @Output() completed = new EventEmitter<void>();

  visible = false;
  step = 1;

  show() {
    this.visible = true;
    this.step = 1;
  }

  hide() {
    this.visible = false;
    this.completed.emit();
  }

  next() {
    if (this.step < 4) {
      this.step++;
    } else {
      this.hide();
    }
  }

  prev() {
    if (this.step > 1) {
      this.step--;
    }
  }
}
