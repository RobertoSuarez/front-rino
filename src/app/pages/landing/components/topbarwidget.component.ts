import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from "@/layout/component/app.floatingconfigurator";
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator, TooltipModule],
    template: `<a class="flex items-center" href="#">
            <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3">
                <i class="pi pi-shield text-white text-2xl"></i>
            </div>
            <div class="flex flex-col">
                <span class="text-surface-900 dark:text-surface-0 font-bold text-2xl leading-none">Chasquis</span>
                <span class="text-surface-600 dark:text-surface-300 text-sm">Ciberseguridad</span>
            </div>
        </a>

        <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:hidden!" pStyleClass="@next" enterFromClass="hidden" leaveToClass="hidden" [hideOnOutsideClick]="true">
            <i class="pi pi-bars text-2xl!"></i>
        </a>

        <div class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border shadow-md lg:shadow-none">
            <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-4 lg:gap-8">
                <li>
                    <a (click)="router.navigate(['/landing'], { fragment: 'home' })" pRipple class="flex items-center gap-2 px-3 py-3 text-surface-900 dark:text-surface-0 font-medium text-lg hover:text-primary transition-colors duration-200">
                        <i class="pi pi-home"></i>
                        <span>Inicio</span>
                    </a>
                </li>
                <li>
                    <a (click)="router.navigate(['/landing'], { fragment: 'about' })" pRipple class="flex items-center gap-2 px-3 py-3 text-surface-900 dark:text-surface-0 font-medium text-lg hover:text-primary transition-colors duration-200">
                        <i class="pi pi-info-circle"></i>
                        <span>Nosotros</span>
                    </a>
                </li>
                <li>
                    <a (click)="router.navigate(['/landing'], { fragment: 'features' })" pRipple class="flex items-center gap-2 px-3 py-3 text-surface-900 dark:text-surface-0 font-medium text-lg hover:text-primary transition-colors duration-200">
                        <i class="pi pi-shield"></i>
                        <span>Características</span>
                    </a>
                </li>
                <li>
                    <a (click)="router.navigate(['/landing'], { fragment: 'valueprop' })" pRipple class="flex items-center gap-2 px-3 py-3 text-surface-900 dark:text-surface-0 font-medium text-lg hover:text-primary transition-colors duration-200">
                        <i class="pi pi-bolt"></i>
                        <span>Beneficios</span>
                    </a>
                </li>
                <li>
                    <a (click)="router.navigate(['/landing'], { fragment: 'testimonials' })" pRipple class="flex items-center gap-2 px-3 py-3 text-surface-900 dark:text-surface-0 font-medium text-lg hover:text-primary transition-colors duration-200">
                        <i class="pi pi-users"></i>
                        <span>Testimonios</span>
                    </a>
                </li>
            </ul>
            <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-3">
                <button pButton pRipple label="Acceder" icon="pi pi-lock-open" routerLink="/auth/login" [rounded]="true" [text]="true" class="text-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 transition-colors duration-200"></button>
                <button pButton pRipple label="Crear cuenta" icon="pi pi-shield" routerLink="/auth/register" [rounded]="true" class="bg-gradient-to-r from-blue-600 to-purple-700 border-none text-lg hover:shadow-lg transition-shadow duration-200" pTooltip="¡Comienza tu formación en ciberseguridad!" tooltipPosition="bottom"></button>
                <button pButton pRipple icon="pi pi-play-circle" class="p-button-rounded p-button-success hover:scale-105 transition-transform duration-200" pTooltip="Prueba gratuita" tooltipPosition="bottom"></button>
                <app-floating-configurator [float]="false"/>
            </div>
        </div> `
})
export class TopbarWidget {
    constructor(public router: Router) {}
}
