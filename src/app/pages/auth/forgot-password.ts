import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, RouterModule, RippleModule, DividerModule, ToastModule, AppFloatingConfigurator, NgIf],
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
                                    <i class="pi pi-lock text-white text-4xl"></i>
                                </div>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-2">Recuperar Contraseña</div>
                            <div class="text-surface-600 dark:text-surface-300 text-lg mb-4">Ingresa tu correo electrónico para recibir instrucciones</div>
                            <p-divider>
                                <span class="px-2 text-sm text-surface-500">Te enviaremos un enlace</span>
                            </p-divider>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Correo electrónico</label>
                            <div class="p-input-icon-left w-full mb-6">
                                <i class="pi pi-envelope"></i>
                                <input pInputText id="email1" type="text" placeholder="tu@email.com" class="w-full md:w-120" [(ngModel)]="email" />
                            </div>
                            
                            <button pButton pRipple label="Enviar instrucciones" icon="pi pi-envelope" class="w-full p-3 text-lg bg-gradient-to-r from-blue-600 to-purple-700 border-none" [loading]="loading" (click)="onSubmit()"></button>
                            <div *ngIf="errorMessage" class="mt-3 text-red-500 text-center">{{ errorMessage }}</div>
                            <div *ngIf="successMessage" class="mt-3 text-green-500 text-center">{{ successMessage }}</div>
                            
                            <div class="mt-4 text-center">
                                <span class="text-surface-600 dark:text-surface-400 text-sm">¿Recordaste tu contraseña? </span>
                                <a routerLink="/auth/login" class="font-medium text-primary text-sm hover:underline cursor-pointer">Volver al inicio de sesión</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p-toast></p-toast>
    `
})
export class ForgotPassword {
    email: string = '';
    loading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';

    constructor(
        private authService: AuthService, 
        private router: Router,
        private messageService: MessageService
    ) {}

    onSubmit(): void {
        if (!this.validateEmail()) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';
        
        this.authService.recoverPassword(this.email).subscribe({
            next: (response) => {
                this.loading = false;
                
                if (response.statusCode === 200) {
                    this.successMessage = 'Se han enviado las instrucciones a tu correo electrónico.';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Correo enviado',
                        detail: 'Se han enviado las instrucciones a tu correo electrónico.'
                    });
                    
                    // Limpiar el campo de email después de un envío exitoso
                    this.email = '';
                } else {
                    this.errorMessage = response.message || 'Error al procesar la solicitud';
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
                    this.errorMessage = 'Error al procesar la solicitud. Por favor, intenta nuevamente.';
                }
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.errorMessage
                });
                
                console.error('Error de recuperación de contraseña:', error);
            }
        });
    }

    validateEmail(): boolean {
        if (!this.email) {
            this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
            this.messageService.add({
                severity: 'warn',
                summary: 'Campo requerido',
                detail: 'Por favor, ingresa tu correo electrónico.'
            });
            return false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
            this.messageService.add({
                severity: 'warn',
                summary: 'Formato inválido',
                detail: 'Por favor, ingresa un correo electrónico válido.'
            });
            return false;
        }

        return true;
    }
}
