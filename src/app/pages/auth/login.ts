import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WelcomeService } from '../../core/services/welcome.service';
import { ApiResponse, AuthData } from '../../core/models';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, DividerModule, TooltipModule, ToastModule, DialogModule, AppFloatingConfigurator, NgIf],
    providers: [MessageService, WelcomeService],
    template: `
        <p-toast></p-toast>
        
        <!-- Modal de Bienvenida -->
        <p-dialog 
            [(visible)]="showWelcomeDialog" 
            [modal]="true" 
            [closable]="false"
            [draggable]="false"
            [header]="welcomeTitle"
            [contentStyle]="{'padding': '2rem'}"
            styleClass="welcome-dialog"
            [style]="{'width': '90vw', 'max-width': '500px'}">
            <div class="text-center">
                <div class="mb-4">
                    <i [class]="'pi ' + welcomeIcon" style="font-size: 3rem; color: var(--primary-color);"></i>
                </div>
                <p class="text-lg mb-6">{{ welcomeMessage }}</p>
                <button 
                    pButton 
                    label="Continuar" 
                    icon="pi pi-arrow-right"
                    (click)="closeWelcomeDialog()"
                    class="w-full"
                    [style]="{'background': 'var(--primary-color)', 'border': 'none'}">
                </button>
            </div>
        </p-dialog>

        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center mb-6">
                                <div class="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                    <i class="pi pi-shield text-white text-4xl"></i>
                                </div>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-2">¡Bienvenido a Cyber Imperium!</div>
                            <div class="text-surface-600 dark:text-surface-300 text-lg mb-4">Plataforma de formación en ciberseguridad</div>
                            <p-divider>
                                <span class="px-2 text-sm text-surface-500">Inicia sesión para continuar</span>
                            </p-divider>
                        </div>

                        <form (ngSubmit)="onSubmit()">
                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 font-medium text-lg mb-2">Correo electrónico</label>
                            <div class="mb-4">
                                <input pInputText id="email1" name="email" type="text" placeholder="tu@email.com" class="w-full md:w-120" [(ngModel)]="email" />
                            </div>

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-lg mb-2">Contraseña</label>
                            <div class="mb-4">
                                <p-password id="password1" name="password" [(ngModel)]="password" placeholder="Contraseña" [toggleMask]="true" styleClass="w-full" [fluid]="true" [feedback]="false">
                                    <ng-template pTemplate="header">
                                        <div class="p-3 text-center bg-surface-0 dark:bg-surface-900">
                                            <i class="pi pi-shield text-3xl text-primary mb-2"></i>
                                            <h4 class="mt-2">Seguridad de contraseña</h4>
                                        </div>
                                    </ng-template>
                                </p-password>
                            </div>

                            <div class="flex items-center justify-between mt-4 mb-6 gap-4 flex-wrap">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" name="checked" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1" class="text-sm">Recordar sesión</label>
                                </div>
                                <a routerLink="/auth/forgot-password" class="font-medium no-underline text-sm cursor-pointer text-primary hover:underline">¿Olvidaste tu contraseña?</a>
                            </div>
                            
                            <button pButton pRipple label="Iniciar sesión" icon="pi pi-lock-open" type="submit" class="w-full p-3 text-lg bg-gradient-to-r from-blue-600 to-purple-700 border-none" [loading]="loading"></button>
            <div *ngIf="errorMessage" class="mt-3 text-red-500 text-center">{{ errorMessage }}</div>
                            
                            <div class="mt-4 text-center">
                                <span class="text-surface-600 dark:text-surface-400 text-sm">¿No tienes una cuenta? </span>
                                <a routerLink="/auth/register" class="font-medium text-primary text-sm hover:underline cursor-pointer">Regístrate ahora</a>
                            </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';
    password: string = '';
    checked: boolean = false;
    loading: boolean = false;
    errorMessage: string = '';
    
    // Propiedades para el diálogo de bienvenida
    showWelcomeDialog: boolean = false;
    welcomeTitle: string = '';
    welcomeMessage: string = '';
    welcomeIcon: string = 'pi-check-circle';

    constructor(
        private authService: AuthService,
        private welcomeService: WelcomeService,
        private router: Router
    ) {}

    onSubmit(): void {
        this.loading = true;
        this.errorMessage = '';
        
        this.authService.login(this.email, this.password).subscribe({
            next: (response: ApiResponse<AuthData>) => {
                this.loading = false;
                
                if (response.statusCode === 200) {
                    // Preparar datos del diálogo de bienvenida
                    const user = response.data.user;
                    const { firstName, lastName, typeUser } = user;
                    const fullName = `${firstName} ${lastName}`.trim();

                    // Mensajes personalizados por tipo de usuario
                    const messages: { [key: string]: { title: string; message: string; icon: string } } = {
                        student: {
                            title: '¡Bienvenido de nuevo! 🎓',
                            message: `Hola ${fullName}, ¡es un placer verte de nuevo! Continúa aprendiendo sobre ciberseguridad y demuestra tus habilidades.`,
                            icon: 'pi-graduation-cap'
                        },
                        teacher: {
                            title: '¡Bienvenido de nuevo! 👨‍🏫',
                            message: `Hola ${fullName}, ¡qué bueno verte nuevamente! Accede a tus cursos y gestiona el aprendizaje de tus estudiantes.`,
                            icon: 'pi-briefcase'
                        },
                        admin: {
                            title: '¡Bienvenido de nuevo! 👨‍💼',
                            message: `Hola ${fullName}, ¡es un honor contar contigo! Revisa las estadísticas y gestiona la plataforma.`,
                            icon: 'pi-shield'
                        }
                    };

                    const welcomeData = messages[typeUser] || {
                        title: '¡Bienvenido de nuevo! 👋',
                        message: `Hola ${fullName}, ¡es un placer verte nuevamente en Cyber Imperium!`,
                        icon: 'pi-check-circle'
                    };

                    // Mostrar el diálogo de bienvenida
                    this.welcomeTitle = welcomeData.title;
                    this.welcomeMessage = welcomeData.message;
                    this.welcomeIcon = welcomeData.icon;
                    this.showWelcomeDialog = true;
                    
                    // Guardar la información para la redirección después de cerrar el diálogo
                    this.userDataForNavigation = {
                        requiredUpdate: response.data.user.requiredUpdate
                    };
                } else {
                    this.errorMessage = response.message || 'Error al iniciar sesión';
                }
            },
            error: (error) => {
                this.loading = false;
                
                if (error.error && error.error.message) {
                    this.errorMessage = error.error.message;
                } else {
                    this.errorMessage = 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
                }
                
                console.error('Error de login:', error);
            }
        });
    }

    closeWelcomeDialog(): void {
        this.showWelcomeDialog = false;
        
        // Redirigir después de cerrar el diálogo
        if (this.userDataForNavigation) {
            if (this.userDataForNavigation.requiredUpdate) {
                this.router.navigate(['/profile']);
            } else {
                this.router.navigate(['/dashboard']);
            }
        }
    }

    private userDataForNavigation: any = null;
}
