import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'valueprop-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div id="value-prop" class="py-20 px-6 md:px-8 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/10 dark:to-transparent">
            <div class="text-center mb-12">
                <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 dark:bg-blue-900 dark:text-blue-200">PROPUESTA DE VALOR</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-bold mb-4 text-4xl md:text-5xl">Propuesta de Valor</h2>
                <div class="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mb-6 rounded-full"></div>
                <span class="text-muted-color text-xl block max-w-3xl mx-auto">Aprende ciberseguridad de forma innovadora con nuestra plataforma educativa de última generación</span>
            </div>

            <div class="grid grid-cols-12 gap-6 justify-center mt-10">
                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                        <div class="p-8">
                            <div class="bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-bolt text-yellow-600 dark:text-yellow-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-xl font-semibold group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">Aprendizaje divertido y gamificado</h5>
                            <span class="text-surface-600 dark:text-surface-200 block">Misiones, niveles y recompensas para mantener la motivación y hacer del aprendizaje una experiencia emocionante.</span>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div class="p-8">
                            <div class="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-globe text-blue-600 dark:text-blue-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Narrativa cultural relevante</h5>
                            <span class="text-surface-600 dark:text-surface-200 block">Contenido adaptado al contexto latinoamericano que conecta con nuestra identidad y realidad regional.</span>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-green-400 to-green-600"></div>
                        <div class="p-8">
                            <div class="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-cog text-green-600 dark:text-green-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-xl font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Guía adaptativa con IA</h5>
                            <span class="text-surface-600 dark:text-surface-200 block">Contenido personalizado según tu nivel y progreso para un aprendizaje optimizado y eficiente.</span>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        <div class="p-8">
                            <div class="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-shield text-purple-600 dark:text-purple-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-xl font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Enfoque práctico y real</h5>
                            <span class="text-surface-600 dark:text-surface-200 block">Casos de estudio y simulaciones basados en situaciones reales para prepararte ante amenazas actuales.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-center mt-12">
                <button pButton pRipple label="Explorar todas las características" icon="pi pi-play" iconPos="right" class="p-button-rounded bg-gradient-to-r from-blue-600 to-cyan-500 border-none shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-lg"></button>
            </div>
        </div>
    `
})
export class ValuePropWidget {}
