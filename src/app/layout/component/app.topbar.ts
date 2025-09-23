import { Component, OnInit, OnDestroy, NO_ERRORS_SCHEMA } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService, UserIndicators } from '../../core/services/user.service';
import { Subject, takeUntil, interval } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-topbar',
    standalone: true,
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, TooltipModule, ButtonModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">


                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="45" width="60" height="45" rx="10" fill="var(--primary-color)" />

                    <path d="M 30 40 A 15 15 0 0 1 70 45 L 70 40 A 20 20 0 0 0 30 45 Z" fill="#4d4c5d" />

                    <rect x="20" y="45" width="60" height="45" rx="10" stroke="#4d4c5d" stroke-width="5" fill="none" />

                    <path d="M 30 40 A 15 15 0 0 1 70 45 L 70 40 A 20 20 0 0 0 30 45 Z" stroke="#4d4c5d" stroke-width="5" fill="none" />
                    
                    <circle cx="50" cy="65" r="8" fill="#4d4c5d" />
                    <rect x="47" y="70" width="6" height="12" fill="#4d4c5d" />
                </svg>
                <span class="logo-text hidden sm:block">CYBERIMPERIUM</span>
            </a>
        </div>

        <div class="layout-topbar-actions">

            <div class="user-indicators flex items-center gap-2 mr-6 hidden md:flex" *ngIf="userIndicators">
                <p-button severity="info" class="indicator-item flex items-center gap-1.5 px-3 py-1.5 text-sm" badge="{{userIndicators.yachay}} Yachay" pTooltip="Puntos de experiencia" tooltipPosition="bottom" rounded>
                    <i class="pi pi-star text-sm"></i>
                </p-button>
                <p-button severity="danger" class="indicator-item flex items-center gap-1.5 px-3 py-1.5 text-sm" badge="{{userIndicators.tumis}} Tumis" pTooltip="Vidas disponibles" tooltipPosition="bottom" rounded>
                    <i class="pi pi-heart text-sm"></i>
                </p-button>
                <p-button severity="warn" class="indicator-item flex items-center gap-1.5 px-3 py-1.5 text-sm" badge="{{userIndicators.mullu}} Mullu" pTooltip="Moneda virtual" tooltipPosition="bottom" rounded>
                    <i class="pi pi-dollar text-sm"></i>
                </p-button>
            </div>

            <!-- Indicadores compactos para móviles y tablet - solo íconos -->
            <div class="user-indicators-compact flex items-center gap-1 mr-2 md:hidden" *ngIf="userIndicators">
                <p-button severity="info" class="layout-topbar-action" badge="{{userIndicators.yachay}}" pTooltip="Yachay: {{userIndicators.yachay}}" tooltipPosition="bottom" [text]="true" rounded>
                    <i class="pi pi-star"></i>
                </p-button>
                <p-button severity="danger" class="layout-topbar-action" badge="{{userIndicators.tumis}}" pTooltip="Tumis: {{userIndicators.tumis}}" tooltipPosition="bottom" [text]="true" rounded>
                    <i class="pi pi-heart"></i>
                </p-button>
                <p-button severity="warn" class="layout-topbar-action" badge="{{userIndicators.mullu}}" pTooltip="Mullu: {{userIndicators.mullu}}" tooltipPosition="bottom" [text]="true" rounded>
                    <i class="pi pi-dollar"></i>
                </p-button>
            </div>

            <!-- Controles principales - ocultos en móviles -->
            <div class="layout-config-menu hidden sm:flex">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button 
                        type="button" 
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action sm:hidden" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <div class="relative">
                        <button 
                            type="button" 
                            class="layout-topbar-action"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <i class="pi pi-user"></i>
                            <span>Perfil</span>
                        </button>
                        <div class="hidden absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
                            <a routerLink="/profile" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <i class="pi pi-user mr-2"></i>
                                <span>Mi Perfil</span>
                            </a>
                            <button (click)="logout()" class="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <i class="pi pi-sign-out mr-2"></i>
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>

            <!-- Menú móvil mejorado -->
            <div class="layout-topbar-menu-mobile lg:hidden">
                <div class="layout-topbar-menu-content-mobile">
                    <div class="menu-mobile-header">
                        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Opciones</h4>
                    </div>
                    <div class="menu-mobile-items space-y-1">
                        <a routerLink="/profile" class="menu-mobile-item">
                            <i class="pi pi-user mr-2"></i>
                            <span>Mi Perfil</span>
                        </a>
                        <button class="menu-mobile-item text-red-600" (click)="logout()">
                            <i class="pi pi-sign-out mr-2"></i>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    userIndicators: UserIndicators | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.loadUserIndicators();
        // Actualizar indicadores cada 30 segundos
        interval(30000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadUserIndicators());
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadUserIndicators() {
        if (this.authService.isAuthenticated()) {
            this.userService.getUserIndicators()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response) => {
                        this.userIndicators = response.data;
                    },
                    error: (error) => {
                        console.error('Error loading user indicators:', error);
                    }
                });
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    /**
     * Cierra la sesión del usuario y redirige al login
     */
    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
