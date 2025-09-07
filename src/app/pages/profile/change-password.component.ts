import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    PasswordModule,
    ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="flex align-items-center justify-between p-4 border-bottom-1 surface-border">
        <div class="flex align-items-center">
          <i class="pi pi-lock text-primary text-2xl mr-3"></i>
          <div>
            <div class="text-900 font-bold text-xl">Cambiar Contraseña</div>
            <div class="text-600">Actualiza tu contraseña para mantener tu cuenta segura</div>
          </div>
        </div>
      </div>

      <div class="p-4">
        <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="p-fluid">
          <div class="mb-4">
            <label for="currentPassword" class="block text-900 font-medium mb-2">Contraseña actual</label>
            <p-password id="currentPassword" formControlName="currentPassword" [toggleMask]="true" styleClass="w-full" [feedback]="false" placeholder="Ingresa tu contraseña actual"></p-password>
            <small *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched" class="p-error block mt-1">
              <i class="pi pi-exclamation-circle mr-1"></i>La contraseña actual es requerida
            </small>
          </div>

          <p-divider></p-divider>

          <div class="mb-4">
            <label for="newPassword" class="block text-900 font-medium mb-2">Nueva contraseña</label>
            <p-password id="newPassword" formControlName="newPassword" [toggleMask]="true" styleClass="w-full" [feedback]="true" placeholder="Ingresa tu nueva contraseña">
              <ng-template pTemplate="header">
                <div class="p-3 text-center bg-surface-0 dark:bg-surface-900">
                  <i class="pi pi-shield text-3xl text-primary mb-2"></i>
                  <h4 class="mt-2">Crea una contraseña segura</h4>
                </div>
              </ng-template>
              <ng-template pTemplate="footer">
                <div class="p-3 bg-surface-0 dark:bg-surface-900">
                  <p class="text-sm text-surface-600 dark:text-surface-400 mb-2">Tu contraseña debe incluir:</p>
                  <ul class="text-xs text-surface-600 dark:text-surface-400 pl-4">
                    <li>Al menos 8 caracteres</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos un número</li>
                    <li>Al menos un carácter especial</li>
                  </ul>
                </div>
              </ng-template>
            </p-password>
            <small *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched" class="p-error block mt-1">
              <i class="pi pi-exclamation-circle mr-1"></i>La nueva contraseña es requerida
            </small>
          </div>

          <div class="mb-4">
            <label for="confirmPassword" class="block text-900 font-medium mb-2">Confirmar nueva contraseña</label>
            <p-password id="confirmPassword" formControlName="confirmPassword" [toggleMask]="true" styleClass="w-full" [feedback]="false" placeholder="Confirma tu nueva contraseña"></p-password>
            <small *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched" class="p-error block mt-1">
              <i class="pi pi-exclamation-circle mr-1"></i>La confirmación de contraseña es requerida
            </small>
            <small *ngIf="passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched" class="p-error block mt-1">
              <i class="pi pi-exclamation-circle mr-1"></i>Las contraseñas no coinciden
            </small>
          </div>

          <div class="flex justify-content-end">
            <button pButton type="submit" label="Cambiar contraseña" icon="pi pi-check" 
              [disabled]="passwordForm.invalid || loading" [loading]="loading"></button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.loading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.statusCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Contraseña actualizada',
            detail: 'Tu contraseña ha sido actualizada correctamente.'
          });
          
          // Resetear el formulario
          this.passwordForm.reset();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Error al actualizar la contraseña'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        
        const errorMessage = error.error?.message || 'Error al actualizar la contraseña. Por favor, intenta nuevamente.';
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        
        console.error('Error al cambiar contraseña:', error);
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  passwordStrengthValidator(control: any) {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    
    if (!passwordRegex.test(value)) {
      return { weakPassword: true };
    }

    return null;
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
