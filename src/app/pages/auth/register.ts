import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, DividerModule, TooltipModule, ToastModule, AppFloatingConfigurator, CommonModule],
    providers: [MessageService],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-6">
                            <div class="flex items-center justify-center mb-6">
                                <div class="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                    <i class="pi pi-shield text-white text-3xl"></i>
                                </div>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-2">Únete a CyberImperium</div>
                            <div class="text-surface-600 dark:text-surface-300 text-base mb-4">Crea tu cuenta para acceder a todos los recursos</div>
                            <p-divider>
                                <span class="px-2 text-sm text-surface-500">Completa tus datos</span>
                            </p-divider>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="name" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">Nombre</label>
                                <div class="p-input-icon-left w-full mb-4">
                                    <i class="pi pi-user"></i>
                                    <input pInputText id="name" type="text" placeholder="Tu nombre" class="w-full" [(ngModel)]="name" />
                                </div>
                            </div>
                            
                            <div>
                                <label for="lastname" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">Apellido</label>
                                <div class="p-input-icon-left w-full mb-4">
                                    <i class="pi pi-user"></i>
                                    <input pInputText id="lastname" type="text" placeholder="Tu apellido" class="w-full" [(ngModel)]="lastname" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label for="email" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">Correo electrónico</label>
                            <div class="p-input-icon-left w-full mb-4">
                                <i class="pi pi-envelope"></i>
                                <input pInputText id="email" type="email" placeholder="tu@email.com" class="w-full" [(ngModel)]="email" />
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="birthday" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">Fecha de nacimiento</label>
                                <div class="w-full mb-4">
                                    <input type="date" id="birthday" [(ngModel)]="birthday" class="w-full p-inputtext" />
                                </div>
                            </div>
                            
                            <div>
                                <label for="userType" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">Tipo de usuario</label>
                                <div class="w-full mb-4">
                                    <select id="userType" [(ngModel)]="userType" class="w-full p-inputtext">
                                        <option value="">Selecciona un tipo</option>
                                        <option *ngFor="let type of userTypes" [value]="type.value">{{type.name}}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-base mb-2">Contraseña</label>
                            <div class="mb-4">
                                <p-password id="password" [(ngModel)]="password" placeholder="Contraseña" [toggleMask]="true" styleClass="w-full" [feedback]="true">
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
                        </div>

                        <div>
                            <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-base mb-2">Confirmar contraseña</label>
                            <div class="mb-4">
                                <p-password id="confirmPassword" [(ngModel)]="confirmPassword" placeholder="Confirmar contraseña" [toggleMask]="true" styleClass="w-full" [feedback]="false"></p-password>
                            </div>
                        </div>

                        <div class="flex items-center mb-4">
                            <p-checkbox [(ngModel)]="acceptTerms" id="acceptTerms" binary class="mr-2"></p-checkbox>
                            <label for="acceptTerms" class="text-sm">
                                Acepto los <a class="text-primary cursor-pointer hover:underline">Términos y Condiciones</a> y la <a class="text-primary cursor-pointer hover:underline">Política de Privacidad</a>
                            </label>
                        </div>
                        
                        <button pButton pRipple label="Crear cuenta" icon="pi pi-user-plus" class="w-full p-3 text-base bg-gradient-to-r from-blue-600 to-purple-700 border-none" [disabled]="!acceptTerms || isLoading" (click)="register()" [loading]="isLoading"></button>
                        
                        <div class="mt-4 text-center">
                            <span class="text-surface-600 dark:text-surface-400 text-sm">¿Ya tienes una cuenta? </span>
                            <a routerLink="/auth/login" class="font-medium text-primary text-sm hover:underline cursor-pointer">Inicia sesión</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p-toast></p-toast>
    `
})
export class Register {
    name: string = '';
    lastname: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    birthday: string = '';
    userType: string = '';
    acceptTerms: boolean = false;
    isLoading: boolean = false;
    
    userTypes = [
        { name: 'Administrador', value: 'admin' },
        { name: 'Estudiante', value: 'student' },
        { name: 'Profesor', value: 'teacher' },
        { name: 'Padre de familia', value: 'parent' }
    ];
    
    constructor(
        private apiService: ApiService,
        private messageService: MessageService,
        private router: Router
    ) {}
    
    /**
     * Registra un nuevo usuario
     */
    register(): void {
        if (!this.validateForm()) {
            return;
        }
        
        this.isLoading = true;
        
        const userData = {
            firstName: this.name,
            lastName: this.lastname,
            email: this.email,
            birthday: this.formatDate(this.birthday),
            password: this.password,
            typeUser: this.userType
        };
        
        this.apiService.post('users', userData).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Registro exitoso',
                    detail: 'Tu cuenta ha sido creada correctamente'
                });
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 2000);
            },
            error: (error) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error en el registro',
                    detail: error.error?.message || 'Ha ocurrido un error al crear la cuenta'
                });
            }
        });
    }
    
    /**
     * Valida el formulario antes de enviarlo
     */
    private validateForm(): boolean {
        if (!this.name || !this.lastname || !this.email || !this.password || !this.confirmPassword || !this.birthday || !this.userType) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos incompletos',
                detail: 'Por favor completa todos los campos'
            });
            return false;
        }
        
        if (this.password !== this.confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseñas no coinciden',
                detail: 'Las contraseñas ingresadas no coinciden'
            });
            return false;
        }
        
        if (!this.validateEmail(this.email)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Email inválido',
                detail: 'Por favor ingresa un correo electrónico válido'
            });
            return false;
        }
        
        if (!this.validatePassword(this.password)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseña débil',
                detail: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial'
            });
            return false;
        }
        
        if (!this.acceptTerms) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Términos y condiciones',
                detail: 'Debes aceptar los términos y condiciones para continuar'
            });
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida el formato del email
     */
    private validateEmail(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    
    /**
     * Valida que la contraseña cumpla con los requisitos
     */
    private validatePassword(password: string): boolean {
        // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        return passwordRegex.test(password);
    }
    
    /**
     * Formatea la fecha para enviarla al servidor en formato DD/MM/YYYY HH:MM:SS
     */
    private formatDate(dateStr: string): string {
        if (!dateStr) return '';
        
        // Convertir de YYYY-MM-DD a Date
        const date = new Date(dateStr);
        
        // Formatear como DD/MM/YYYY HH:MM:SS
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        // Agregar hora fija 06:48:00 como en el ejemplo
        return `${day}/${month}/${year} 06:48:00`;
    }
}
