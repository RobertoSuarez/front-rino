import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule],
    template: `<div id="features" class="py-20 px-6 md:px-8 bg-gradient-to-b from-transparent to-blue-50/50 dark:from-transparent dark:to-blue-950/5">
        <div class="grid grid-cols-12 gap-4 justify-center">
            <div class="col-span-12 text-center mb-12">
                <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4 dark:bg-blue-900 dark:text-blue-200">CARACTERÍSTICAS</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-bold mb-4 text-4xl md:text-5xl">Características principales</h2>
                <div class="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mb-6 rounded-full"></div>
                <span class="text-muted-color text-xl block max-w-3xl mx-auto">Descubre todas las herramientas y funcionalidades que nuestra plataforma ofrece</span>
            </div>
            
            <div class="col-span-12 lg:col-span-6 mb-8 lg:mb-0">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden h-full">
                    <div class="relative overflow-hidden aspect-video">
                        <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80" 
                             class="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                             alt="Plataforma de aprendizaje" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                            <h3 class="text-white text-2xl font-bold">Aprende a tu ritmo</h3>
                        </div>
                    </div>
                    <div class="p-6">
                        <p class="text-surface-600 dark:text-surface-200 mb-4">Nuestra plataforma se adapta a tu nivel de conocimiento y ritmo de aprendizaje, permitiéndote avanzar de manera personalizada.</p>
                        <div class="flex flex-wrap gap-2">
                            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Personalizado</span>
                            <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Adaptativo</span>
                            <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">Flexible</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-span-12 lg:col-span-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col">
                        <div class="bg-gradient-to-br from-cyan-400 to-blue-600 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                            <i class="pi pi-shield text-white text-xl"></i>
                        </div>
                        <h4 class="text-lg font-semibold mb-2 text-surface-900 dark:text-surface-0">Seguridad práctica</h4>
                        <p class="text-surface-600 dark:text-surface-200 text-sm flex-grow">Aprende con ejercicios prácticos basados en escenarios reales de ciberseguridad.</p>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col">
                        <div class="bg-gradient-to-br from-yellow-400 to-orange-600 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                            <i class="pi pi-chart-bar text-white text-xl"></i>
                        </div>
                        <h4 class="text-lg font-semibold mb-2 text-surface-900 dark:text-surface-0">Seguimiento de progreso</h4>
                        <p class="text-surface-600 dark:text-surface-200 text-sm flex-grow">Visualiza tu avance y logros con estadísticas detalladas y personalizadas.</p>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col">
                        <div class="bg-gradient-to-br from-green-400 to-emerald-600 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                            <i class="pi pi-users text-white text-xl"></i>
                        </div>
                        <h4 class="text-lg font-semibold mb-2 text-surface-900 dark:text-surface-0">Comunidad activa</h4>
                        <p class="text-surface-600 dark:text-surface-200 text-sm flex-grow">Conecta con otros estudiantes y expertos para compartir conocimientos.</p>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col">
                        <div class="bg-gradient-to-br from-purple-400 to-indigo-600 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                            <i class="pi pi-star text-white text-xl"></i>
                        </div>
                        <h4 class="text-lg font-semibold mb-2 text-surface-900 dark:text-surface-0">Sistema de recompensas</h4>
                        <p class="text-surface-600 dark:text-surface-200 text-sm flex-grow">Gana insignias, puntos y reconocimientos a medida que avanzas en tu aprendizaje.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class FeaturesWidget {}
