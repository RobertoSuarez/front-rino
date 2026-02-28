import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+])[A-Za-z\d@$!%*?&._\-+]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get newPasswordValue(): string {
    return this.changePasswordForm.get('newPassword')?.value || '';
  }

  hasMinLength(): boolean {
    return this.newPasswordValue.length >= 8;
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.newPasswordValue);
  }

  hasNumber(): boolean {
    return /\d/.test(this.newPasswordValue);
  }

  hasSpecialChar(): boolean {
    return /[@$!%*?&._\-+]/.test(this.newPasswordValue);
  }

  get passwordStrengthCount(): number {
    return [this.hasMinLength(), this.hasUppercase(), this.hasNumber(), this.hasSpecialChar()]
      .filter(v => v).length;
  }

  get passwordStrengthLabel(): string {
    const count = this.passwordStrengthCount;
    if (count === 0) return '';
    if (count <= 1) return 'Débil';
    if (count <= 3) return 'Media';
    return 'Fuerte';
  }

  get passwordStrengthClass(): string {
    const count = this.passwordStrengthCount;
    if (count === 0) return '';
    if (count <= 1) return 'weak';
    if (count <= 3) return 'medium';
    return 'strong';
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    this.submitted = true;

    // Check custom requirements separately from simple form.invalid if pattern fails but we manually show it
    if (this.changePasswordForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los campos correctamente'
      });
      return;
    }

    this.loading = true;

    const payload = {
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword
    };

    this.apiService.post('auth/change-password-from-inside', payload).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.message || 'Contraseña actualizada correctamente'
        });

        this.changePasswordForm.reset();
        this.submitted = false;

        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.message || 'Error al cambiar la contraseña';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }

  get oldPassword() {
    return this.changePasswordForm.get('oldPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }
}
