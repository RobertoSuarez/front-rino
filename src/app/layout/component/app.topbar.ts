import { Component, OnInit, OnDestroy, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
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
import { TagModule } from 'primeng/tag';
import { TumisShopModalComponent } from '../../shared/components/tumis-shop-modal/tumis-shop-modal.component';

@Component({
    selector: 'app-topbar',
    standalone: true,
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, TooltipModule, ButtonModule, TagModule, TumisShopModalComponent],
    styles: [`
        .resource-item {
            position: relative;
            background-color: var(--surface-card) !important;
            border-width: 2px !important;
            border-style: solid !important;
            border-radius: 1rem !important;
            display: flex !important;
            align-items: center !important;
            transition: all 0.2s ease-in-out !important;
            box-sizing: border-box !important;

            img {
                filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
            }

            span {
                font-family: 'Outfit', 'Inter', sans-serif !important;
                font-weight: 900 !important;
                line-height: 1;
            }

            &:hover {
                transform: translateY(-2px) !important;
            }

            &.xp-pill {
                border-color: #0284c7 !important;
                box-shadow: 0 3px 0 0 #0284c7 !important;
                span { color: #0284c7 !important; }
                &:hover { background-color: rgba(2, 132, 199, 0.05) !important; }
            }

            &.tumi-pill {
                border-color: #dc2626 !important;
                box-shadow: 0 3px 0 0 #dc2626 !important;
                span { color: #dc2626 !important; }
                &:hover { background-color: rgba(220, 38, 38, 0.05) !important; }
            }

            &.mullu-pill {
                border-color: #d97706 !important;
                box-shadow: 0 3px 0 0 #d97706 !important;
                span { color: #d97706 !important; }
                &:hover { background-color: rgba(217, 119, 6, 0.05) !important; }
            }
        }

        :host-context(.app-dark) .resource-item {
            background-color: #1e293b !important;
            
            &.xp-pill {
                border-color: #38bdf8 !important;
                box-shadow: 0 3px 0 0 #075985 !important;
                span { color: #38bdf8 !important; }
            }
            &.tumi-pill {
                border-color: #f87171 !important;
                box-shadow: 0 3px 0 0 #991b1b !important;
                span { color: #f87171 !important; }
            }
            &.mullu-pill {
                border-color: #fbbf24 !important;
                box-shadow: 0 3px 0 0 #92400e !important;
                span { color: #fbbf24 !important; }
            }
        }

        @media (max-width: 640px) {
            .resource-item {
                padding: 0.25rem 0.5rem !important;
                gap: 0.25rem !important;
                img { width: 1.25rem !important; height: 1.25rem !important; }
                span { font-size: 0.75rem !important; }
            }
        }
    `],
    template: `
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <svg width="34" height="34" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="45" width="60" height="45" rx="10" fill="#10b981" />
                    <path d="M 30 40 A 15 15 0 0 1 70 45 L 70 40 A 20 20 0 0 0 30 45 Z" fill="#4d4c5d" />
                    <rect x="20" y="45" width="60" height="45" rx="10" stroke="#4d4c5d" stroke-width="5" fill="none" />
                    <path d="M 30 40 A 15 15 0 0 1 70 45 L 70 40 A 20 20 0 0 0 30 45 Z" stroke="#4d4c5d" stroke-width="5" fill="none" />
                    <circle cx="50" cy="65" r="8" fill="#4d4c5d" />
                    <rect x="47" y="70" width="6" height="12" fill="#4d4c5d" />
                </svg>
                <span class="logo-text hidden lg:block">CYBERIMPERIUM</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <!-- Recursos (XP, Vidas, Monedas) -->
            <div class="user-indicators flex items-center gap-2 sm:gap-3 mr-2" *ngIf="userIndicators">
                <!-- Yachay (XP) -->
                <div class="resource-item xp-pill flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-2xl transition-all" 
                     pTooltip="Puntos Yachay (Experiencia)" tooltipPosition="bottom">
                    <img src="assets/elementos/yachay.png" alt="XP" class="w-5 h-5 sm:w-7 sm:h-7 object-contain">
                    <span class="text-sm sm:text-lg font-black text-sky-600 dark:text-sky-400">{{userIndicators.yachay}}</span>
                </div>

                <!-- Tumis (Vidas) -->
                <div class="resource-item tumi-pill flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-2xl transition-all cursor-pointer group" 
                     (click)="openTumisShop()" 
                     pTooltip="Tienda: Obtener más Tumis" tooltipPosition="bottom">
                    <div class="relative flex items-center">
                        <img src="assets/elementos/corazon_de_tumi.png" alt="Vidas" class="w-5 h-5 sm:w-7 sm:h-7 object-contain">
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 group-hover:scale-110 transition-all shadow-sm">
                            <i class="pi pi-plus text-[8px] sm:text-[10px] text-white font-black"></i>
                        </div>
                    </div>
                    <span class="text-sm sm:text-lg font-black text-red-600 dark:text-red-400">{{userIndicators.tumis}}</span>
                </div>

                <!-- Mullu (Monedas) -->
                <div class="resource-item mullu-pill flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-2xl transition-all" 
                     pTooltip="Monedas Mullu" tooltipPosition="bottom">
                    <img src="assets/elementos/mullu.png" alt="Mullu" class="w-5 h-5 sm:w-7 sm:h-7 object-contain">
                    <span class="text-sm sm:text-lg font-black text-amber-600 dark:text-amber-400">{{userIndicators.mullu}}</span>
                </div>
            </div>

            <div class="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

            <!-- Menú de Configuración -->
            <div class="flex items-center gap-1 sm:gap-2">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                
                <div class="relative">
                    <button type="button" class="layout-topbar-action layout-topbar-action-highlight" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <!-- Perfil de Usuario -->
            <div class="relative ml-2">
                <button type="button" class="layout-topbar-action !w-auto !h-auto flex items-center p-1 rounded-full border-1 border-gray-200 dark:border-gray-700 hover:border-primary transition-colors" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <img *ngIf="currentUserAvatar" [src]="currentUserAvatar" alt="Perfil" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover">
                    <i *ngIf="!currentUserAvatar" class="pi pi-user text-xl p-2 bg-gray-100 dark:bg-gray-800 rounded-full"></i>
                </button>
                
                <div class="hidden absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div class="px-4 py-2 border-bottom border-gray-100 dark:border-gray-800 mb-1">
                        <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Usuario</span>
                        <p-tag [value]="getUserTypeLabel(currentUserType)" [severity]="getUserTypeColor(currentUserType)" class="text-[10px]"></p-tag>
                    </div>
                    <a routerLink="/profile" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                        <i class="pi pi-user text-primary"></i>
                        <span>Mi Perfil</span>
                    </a>
                    <a routerLink="/profile/change-password" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                        <i class="pi pi-lock text-primary"></i>
                        <span>Contraseña</span>
                    </a>
                    <div class="h-[1px] bg-gray-100 dark:bg-gray-800 my-1"></div>
                    <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <i class="pi pi-sign-out"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <app-tumis-shop-modal #tumisShopModal (onBuySuccess)="onTumisBuySuccess()"></app-tumis-shop-modal>`
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    userIndicators: UserIndicators | null = null;
    currentUserType: string = '';
    currentUserAvatar: string = '';
    @ViewChild('tumisShopModal') tumisShopModal!: TumisShopModalComponent;
    private destroy$ = new Subject<void>();

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.loadUserIndicators();
        this.loadCurrentUserType();
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

    loadCurrentUserType() {
        if (this.authService.isAuthenticated()) {
            this.authService.currentUser$.subscribe(user => {
                if (user) {
                    if (user.typeUser) {
                        this.currentUserType = user.typeUser;
                    }
                    if (user.urlAvatar) {
                        this.currentUserAvatar = user.urlAvatar;
                    }
                }
            });
        }
    }

    getUserTypeLabel(typeUser: string): string {
        const typeLabels: { [key: string]: string } = {
            'student': 'Estudiante',
            'teacher': 'Profesor',
            'admin': 'Admin',
            'parent': 'Padre'
        };
        return typeLabels[typeUser] || typeUser;
    }

    getUserTypeColor(typeUser: string): string {
        const typeColors: { [key: string]: string } = {
            'student': 'success',
            'teacher': 'info',
            'admin': 'warning',
            'parent': 'help'
        };
        return typeColors[typeUser] || 'secondary';
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    openTumisShop(): void {
        if (this.tumisShopModal) {
            this.tumisShopModal.openModal();
        }
    }

    onTumisBuySuccess(): void {
        this.loadUserIndicators();
    }
}
