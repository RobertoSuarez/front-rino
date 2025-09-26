import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'valueprop-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div id="valueprop" class="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/10 dark:to-transparent">
            <div class="text-center mb-12">
                <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 dark:bg-blue-900 dark:text-blue-200">PROPUESTA DE VALOR</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-bold mb-4 text-3xl sm:text-4xl md:text-5xl">Propuesta de Valor</h2>
                <div class="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mb-6 rounded-full"></div>
                <span class="text-muted-color text-lg sm:text-xl block max-w-3xl mx-auto">Descubre Cyber Imperium: una plataforma educativa gamificada para aprender ciberseguridad de manera divertida y efectiva</span>
            </div>

            <div class="grid grid-cols-12 gap-6 justify-center mt-10">
                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                        <div class="p-6 sm:p-8">
                            <div class="bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-bolt text-yellow-600 dark:text-yellow-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-lg sm:text-xl font-semibold group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">Aprendizaje divertido y gamificado</h5>
                            <span class="text-surface-600 dark:text-surface-200 text-sm sm:text-base block">Misiones, niveles y recompensas con Yachay (sabiduría) y Tumis (corazones) para una experiencia emocionante y motivadora.</span>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                        <div class="p-6 sm:p-8">
                            <div class="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-trophy text-orange-600 dark:text-orange-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-lg sm:text-xl font-semibold group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">Sistema de Leaderboard y Comunidad</h5>
                            <span class="text-surface-600 dark:text-surface-200 text-sm sm:text-base block">Compite con tus compañeros, sube en el ranking y conecta con otros estudiantes en la comunidad.</span>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-green-400 to-green-600"></div>
                        <div class="p-6 sm:p-8">
                            <div class="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-cog text-green-600 dark:text-green-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-lg sm:text-xl font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Guía adaptativa con IA</h5>
                            <span class="text-surface-600 dark:text-surface-200 text-sm sm:text-base block">Contenido personalizado según tu nivel y progreso. Incluye chat con IA para consultas y apoyo continuo.</span>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-3 p-0 mt-6 lg:mt-0">
                    <div class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                        <div class="h-3 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        <div class="p-6 sm:p-8">
                            <div class="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-shield text-purple-600 dark:text-purple-400 text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-lg sm:text-xl font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Evaluaciones y Logros</h5>
                            <span class="text-surface-600 dark:text-surface-200 text-sm sm:text-base block">Realiza evaluaciones, obtén logros y accede a cursos con capítulos, temas y actividades gamificadas.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-center mt-8 sm:mt-12">
                <button pButton pRipple label="Explorar todas las características" icon="pi pi-play" iconPos="right" class="p-button-rounded bg-gradient-to-r from-blue-600 to-cyan-500 border-none shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg"></button>
            </div>
        </div>
    `
})
export class ValuePropWidget {}
