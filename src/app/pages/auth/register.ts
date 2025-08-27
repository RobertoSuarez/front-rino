import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, DividerModule, TooltipModule, AppFloatingConfigurator],
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
                            <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-2">Únete a Chasquis Ciberseguridad</div>
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
                        
                        <button pButton pRipple label="Crear cuenta" icon="pi pi-user-plus" class="w-full p-3 text-base bg-gradient-to-r from-blue-600 to-purple-700 border-none" [disabled]="!acceptTerms"></button>
                        
                        <div class="mt-4 text-center">
                            <span class="text-surface-600 dark:text-surface-400 text-sm">¿Ya tienes una cuenta? </span>
                            <a routerLink="/auth/login" class="font-medium text-primary text-sm hover:underline cursor-pointer">Inicia sesión</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register {
    name: string = '';
    lastname: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    acceptTerms: boolean = false;
}
