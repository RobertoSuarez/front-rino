import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-onboarding',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './student-onboarding.component.html',
  styleUrls: ['./student-onboarding.component.scss']
})
export class StudentOnboardingComponent {
  @Output() completed = new EventEmitter<void>();

  private userService = inject(UserService);
  private authService = inject(AuthService);

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
      this.claimGiftAndFinish();
    }
  }

  prev() {
    if (this.step > 1) {
      this.step--;
    }
  }

  private claimGiftAndFinish() {
    this.userService.claimWelcomeGift().subscribe({
      next: (response: any) => {
        const currentUser = this.authService.getCurrentUserValue();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            tumis: response.data.tumis,
            mullu: response.data.mullu,
            yachay: response.data.yachay,
            hasCompletedOnboarding: true
          };
          this.authService.updateUser(updatedUser);
        }
        this.hide();
      },
      error: (err: any) => {
        console.error('Error al reclamar el regalo de bienvenida:', err);
        // Salvaguarda: cerrar el modal de todas formas para no trabar la interfaz
        this.hide();
      }
    });
  }
}
