import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../core/services/user.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  providers: [MessageService],
  template: `
    
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Verificación de Email
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Estamos verificando tu dirección de email...
          </p>
        </div>

        <div class="mt-8">
          <p-card class="shadow-lg">
            <ng-container *ngIf="loading">
              <div class="text-center py-8">
                <p-progressSpinner
                  styleClass="w-8 h-8"
                  strokeWidth="4"
                  fill="transparent"
                  animationDuration="1s">
                </p-progressSpinner>
                <p class="mt-4 text-gray-600">Verificando tu email...</p>
              </div>
            </ng-container>

            <ng-container *ngIf="!loading && !verified">
              <div class="text-center py-8">
                <i class="pi pi-times-circle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  Error en la verificación
                </h3>
                <p class="text-gray-600 mb-6">
                  {{ errorMessage || 'Ha ocurrido un error al verificar tu email.' }}
                </p>
                <p-button
                  label="Ir al Login"
                  icon="pi pi-sign-in"
                  (click)="goToLogin()">
                </p-button>
              </div>
            </ng-container>

            <ng-container *ngIf="!loading && verified">
              <div class="text-center py-8">
                <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  ¡Email verificado exitosamente!
                </h3>
                <p class="text-gray-600 mb-6">
                  Tu dirección de email ha sido verificada correctamente.
                  Ya puedes iniciar sesión en tu cuenta.
                </p>
                <p class="text-sm text-gray-500 mb-4">
                  Serás redirigido al login en {{ countdown }} segundos...
                </p>
                <p-button
                  label="Ir al Login ahora"
                  icon="pi pi-sign-in"
                  (click)="goToLogin()">
                </p-button>
              </div>
            </ng-container>
          </p-card>
        </div>
      </div>
    </div>
  `
})
export class VerifyEmail implements OnInit {
  loading = true;
  verified = false;
  errorMessage = '';
  countdown = 5;
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.loading = false;
      this.errorMessage = 'Token de verificación no encontrado.';
      return;
    }

    this.verifyEmail(token);
  }

  private verifyEmail(token: string) {
    this.userService.verifyEmail(token).subscribe({
      next: (response) => {
        this.loading = false;
        this.verified = true;
        this.startCountdown();
      },
      error: (error) => {
        this.loading = false;
        this.verified = false;
        this.errorMessage = error.error?.message || 'Error al verificar el email.';
        console.error('Error verifying email:', error);
      }
    });
  }

  private startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.goToLogin();
      }
    }, 1000);
  }

  goToLogin() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/auth/login']);
  }
}
