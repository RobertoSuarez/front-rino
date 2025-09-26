import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'hero-widget',
    imports: [RouterModule, ButtonModule, RippleModule],
    template: `
        <div
            id="hero"
            class="flex flex-col py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden relative"
            style="background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 180, 216, 0.2) 100%)"
        >
            <div class="absolute top-0 right-0 w-full h-full z-0 opacity-10 bg-pattern-grid"></div>
            <div class="mx-auto px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl relative z-10">
                <div class="grid grid-cols-12 items-center gap-8">
                    <div class="col-span-12 lg:col-span-6 mb-8 lg:mb-0">
                        <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">PLATAFORMA EDUCATIVA</span>
                        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight dark:text-white mb-4">
                            <span class="font-light block mb-2">Aprender</span>
                            <span class="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Cyberseguridad</span> Jugando
                        </h1>
                        <p class="font-normal text-base sm:text-lg md:text-xl lg:text-2xl leading-normal mt-4 md:mt-6 text-gray-700 dark:text-gray-300 max-w-xl">
                            Una aplicación web gamificada con guía generativa que enseña a estudiantes de educación básica superior cómo protegerse en el mundo digital.
                        </p>
                        <div class="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4">
                            <button
                                pButton
                                pRipple
                                [rounded]="true"
                                type="button"
                                label="Quiero probar la demo"
                                routerLink="/landing"
                                fragment="about"
                                class="text-sm sm:text-base md:text-lg px-3 sm:px-4 md:px-6 py-2 md:py-3 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 border-none"
                            ></button>
                            <button
                                pButton
                                pRipple
                                [rounded]="true"
                                type="button"
                                label="Ver características"
                                routerLink="/landing"
                                fragment="features"
                                class="text-sm sm:text-base md:text-lg px-3 sm:px-4 md:px-6 py-2 md:py-3 p-button-outlined p-button-secondary"
                            ></button>
                        </div>
                    </div>
                    <div class="col-span-12 lg:col-span-6 flex justify-center lg:justify-end">
                        <div class="relative">
                            <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-30"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1633265486064-086b219458ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                                alt="Ilustración de ciberseguridad" 
                                class="w-full h-auto rounded-2xl shadow-xl relative z-10 border-4 border-white dark:border-gray-800" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class HeroWidget {}
