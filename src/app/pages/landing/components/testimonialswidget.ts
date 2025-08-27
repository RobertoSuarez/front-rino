import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'testimonials-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div id="testimonials" class="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent">
            <div class="grid grid-cols-12 gap-4 justify-center">
                <div class="col-span-12 text-center mb-8 md:mb-12">
                    <span class="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 dark:bg-purple-900 dark:text-purple-200">TESTIMONIOS</span>
                    <h2 class="text-surface-900 dark:text-surface-0 font-bold mb-4 text-3xl sm:text-4xl md:text-5xl">Lo que dicen nuestros usuarios</h2>
                    <div class="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-500 mx-auto mb-6 rounded-full"></div>
                    <span class="text-muted-color text-lg sm:text-xl block max-w-3xl mx-auto">Descubre cómo nuestra plataforma ha ayudado a profesionales y estudiantes a mejorar sus habilidades</span>
                </div>
                
                <div class="col-span-12 md:col-span-6 lg:col-span-4 mb-6 md:mb-6 lg:mb-0">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 h-full flex flex-col relative">
                        <div class="absolute -top-5 left-8">
                            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <i class="pi pi-quote-right text-white"></i>
                            </div>
                        </div>
                        <p class="text-surface-600 dark:text-surface-200 mb-6 italic text-base sm:text-lg flex-grow">
                            "Esta plataforma ha transformado completamente mi enfoque hacia la ciberseguridad. Las misiones gamificadas hacen que el aprendizaje sea divertido y efectivo."
                        </p>
                        <div class="flex flex-wrap items-center">
                            <img src="https://randomuser.me/api/portraits/women/32.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4" alt="Foto de perfil" />
                            <div>
                                <h5 class="font-semibold text-surface-900 dark:text-surface-0">María González</h5>
                                <p class="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Ingeniera de Seguridad</p>
                            </div>
                            <div class="ml-auto flex mt-2 sm:mt-0">
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 text-xs sm:text-sm"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-span-12 md:col-span-6 lg:col-span-4 mb-6 md:mb-6 lg:mb-0">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 h-full flex flex-col relative">
                        <div class="absolute -top-5 left-8">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                <i class="pi pi-quote-right text-white"></i>
                            </div>
                        </div>
                        <p class="text-surface-600 dark:text-surface-200 mb-6 italic text-base sm:text-lg flex-grow">
                            "El enfoque narrativo con elementos culturales Chasqui hace que la experiencia sea única. Nunca había disfrutado tanto aprendiendo sobre seguridad informática."
                        </p>
                        <div class="flex flex-wrap items-center">
                            <img src="https://randomuser.me/api/portraits/men/44.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4" alt="Foto de perfil" />
                            <div>
                                <h5 class="font-semibold text-surface-900 dark:text-surface-0">Carlos Mendoza</h5>
                                <p class="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Estudiante Universitario</p>
                            </div>
                            <div class="ml-auto flex mt-2 sm:mt-0">
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star text-yellow-500 text-xs sm:text-sm"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-span-12 md:col-span-6 lg:col-span-4 md:mx-auto lg:mx-0">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 h-full flex flex-col relative">
                        <div class="absolute -top-5 left-8">
                            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                                <i class="pi pi-quote-right text-white"></i>
                            </div>
                        </div>
                        <p class="text-surface-600 dark:text-surface-200 mb-6 italic text-base sm:text-lg flex-grow">
                            "El apoyo de IA generativa es impresionante. Me ha ayudado a superar obstáculos que antes me parecían imposibles. Recomiendo esta plataforma a todos mis colegas."
                        </p>
                        <div class="flex flex-wrap items-center">
                            <img src="https://randomuser.me/api/portraits/women/68.jpg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4" alt="Foto de perfil" />
                            <div>
                                <h5 class="font-semibold text-surface-900 dark:text-surface-0">Ana Rodríguez</h5>
                                <p class="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Analista de Ciberseguridad</p>
                            </div>
                            <div class="ml-auto flex mt-2 sm:mt-0">
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 mr-1 text-xs sm:text-sm"></i>
                                <i class="pi pi-star-fill text-yellow-500 text-xs sm:text-sm"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-span-12 text-center mt-8 md:mt-12">
                    <button class="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full font-medium hover:shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 flex items-center mx-auto text-sm sm:text-base">
                        <i class="pi pi-users mr-2"></i>
                        <span>Ver más testimonios</span>
                    </button>
                </div>
            </div>
        </div>
    `
})
export class TestimonialsWidget {}
