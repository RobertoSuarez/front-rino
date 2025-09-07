import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, DividerModule, ToastModule, AppFloatingConfigurator, NgIf],
    providers: [MessageService],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center mb-6">
                                <div class="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                    <i class="pi pi-lock-open text-white text-4xl"></i>
                                </div>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-2">Restablecer Contraseña</div>
                            <div class="text-surface-600 dark:text-surface-300 text-lg mb-4">Crea una nueva contraseña segura</div>
                            <p-divider>
                                <span class="px-2 text-sm text-surface-500">Completa el formulario</span>
                            </p-divider>
                        </div>

                        <div *ngIf="!tokenValid && !loading" class="text-center">
                            <div class="flex items-center justify-center mb-4">
                                <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl"></i>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Enlace inválido o expirado</div>
                            <div class="text-surface-600 dark:text-surface-300 mb-4">El enlace para restablecer tu contraseña no es válido o ha expirado.</div>
                            <button pButton pRipple label="Solicitar nuevo enlace" icon="pi pi-refresh" 
                                class="p-button-outlined" routerLink="/auth/forgot-password"></button>
                        </div>

                        <div *ngIf="tokenValid || loading">
                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-lg mb-2">Nueva contraseña</label>
                            <div class="mb-4">
                                <p-password id="password" [(ngModel)]="password" placeholder="Ingresa tu nueva contraseña" [toggleMask]="true" styleClass="w-full" [feedback]="true">
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
                            </div>

                            <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-lg mb-2">Confirmar contraseña</label>
                            <div class="mb-6">
                                <p-password id="confirmPassword" [(ngModel)]="confirmPassword" placeholder="Confirma tu nueva contraseña" [toggleMask]="true" styleClass="w-full" [feedback]="false"></p-password>
                            </div>
                            
                            <button pButton pRipple label="Restablecer contraseña" icon="pi pi-check" 
                                class="w-full p-3 text-lg bg-gradient-to-r from-blue-600 to-purple-700 border-none" 
                                [loading]="loading" (click)="onSubmit()"></button>
                            <div *ngIf="errorMessage" class="mt-3 text-red-500 text-center">{{ errorMessage }}</div>
                            <div *ngIf="successMessage" class="mt-3 text-green-500 text-center">{{ successMessage }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p-toast></p-toast>
    `
})
export class ResetPassword implements OnInit {
    token: string = '';
    password: string = '';
    confirmPassword: string = '';
    loading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    tokenValid: boolean = true; // Asumimos que el token es válido hasta que se demuestre lo contrario

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // Obtener el token de la URL
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            
            if (!this.token) {
                this.tokenValid = false;
                this.errorMessage = 'No se proporcionó un token válido.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se proporcionó un token válido.'
                });
            }
        });
    }

    onSubmit(): void {
        if (!this.validateForm()) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';
        
        this.authService.resetPassword(this.token, this.password).subscribe({
            next: (response) => {
                this.loading = false;
                
                if (response.statusCode === 200) {
                    this.successMessage = 'Tu contraseña ha sido restablecida correctamente.';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Contraseña restablecida',
                        detail: 'Tu contraseña ha sido restablecida correctamente.'
                    });
                    
                    // Redirigir al login después de 2 segundos
                    setTimeout(() => {
                        this.router.navigate(['/auth/login']);
                    }, 2000);
                } else {
                    this.errorMessage = response.message || 'Error al restablecer la contraseña';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: this.errorMessage
                    });
                }
            },
            error: (error) => {
                this.loading = false;
                
                if (error.error && error.error.message) {
                    this.errorMessage = error.error.message;
                } else {
                    this.errorMessage = 'Error al restablecer la contraseña. Por favor, intenta nuevamente.';
                }
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.errorMessage
                });
                
                console.error('Error al restablecer contraseña:', error);
            }
        });
    }

    validateForm(): boolean {
        if (!this.password || !this.confirmPassword) {
            this.errorMessage = 'Por favor, completa todos los campos.';
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos incompletos',
                detail: 'Por favor, completa todos los campos.'
            });
            return false;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Las contraseñas no coinciden.';
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseñas no coinciden',
                detail: 'Las contraseñas ingresadas no coinciden.'
            });
            return false;
        }

        if (!this.validatePassword(this.password)) {
            this.errorMessage = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.';
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseña débil',
                detail: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.'
            });
            return false;
        }

        return true;
    }

    validatePassword(password: string): boolean {
        // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        return passwordRegex.test(password);
    }
}
