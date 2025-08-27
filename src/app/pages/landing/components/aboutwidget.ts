import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'about-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div id="about" class="py-20 px-6 md:px-8 bg-gradient-to-b from-transparent to-blue-50 dark:from-transparent dark:to-blue-950/10">
            <div class="grid grid-cols-12 gap-4 justify-center">
                <div class="col-span-12 text-center mb-12">
                    <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 dark:bg-blue-900 dark:text-blue-200">NUESTRA PLATAFORMA</span>
                    <h2 class="text-surface-900 dark:text-surface-0 font-bold mb-4 text-4xl md:text-5xl">¿Qué es la plataforma?</h2>
                    <div class="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mb-6 rounded-full"></div>
                    <span class="text-muted-color text-xl block max-w-3xl mx-auto">Una experiencia educativa inmersiva que combina gamificación, narrativa cultural y tecnología de IA</span>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 mt-6 lg:mt-0">
                    <div class="group h-full rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
                        <div class="p-8 h-full flex flex-col">
                            <div class="bg-gradient-to-br from-yellow-400 to-yellow-600 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-bolt text-white text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-2xl font-semibold">Aprendizaje Gamificado</h5>
                            <span class="text-surface-600 dark:text-surface-200 text-lg flex-grow">Aprende jugando con misiones, retos y recompensas que hacen divertido el proceso educativo.</span>
                            <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <a href="#" class="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                    Descubrir más
                                    <i class="pi pi-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 mt-6 lg:mt-0">
                    <div class="group h-full rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
                        <div class="p-8 h-full flex flex-col">
                            <div class="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-globe text-white text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-2xl font-semibold">Narrativa Cultural</h5>
                            <span class="text-surface-600 dark:text-surface-200 text-lg flex-grow">Contenido contextualizado con elementos culturales latinoamericanos para una experiencia más cercana.</span>
                            <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <a href="#" class="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                    Descubrir más
                                    <i class="pi pi-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 mt-6 lg:mt-0">
                    <div class="group h-full rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
                        <div class="p-8 h-full flex flex-col">
                            <div class="bg-gradient-to-br from-green-400 to-green-600 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-cog text-white text-3xl"></i>
                            </div>
                            <h5 class="mb-4 text-surface-900 dark:text-surface-0 text-2xl font-semibold">Tecnología de IA</h5>
                            <span class="text-surface-600 dark:text-surface-200 text-lg flex-grow">Guía personalizada con inteligencia artificial que adapta el contenido a tu ritmo de aprendizaje.</span>
                            <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <a href="#" class="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                    Descubrir más
                                    <i class="pi pi-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AboutWidget {}
