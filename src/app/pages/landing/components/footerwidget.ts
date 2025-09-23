import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
        <div class="py-16 px-6 md:px-8 bg-blue-50/30 dark:bg-blue-950/10 border-t border-gray-200 dark:border-gray-800">
            <div class="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
                <div class="col-span-12 md:col-span-3 lg:col-span-2 mb-8 md:mb-0">
                    <a (click)="router.navigate(['/pages/landing'], { fragment: 'home' })" class="flex flex-wrap items-center justify-center md:justify-start md:mb-0 mb-6 cursor-pointer">
                    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="45" width="60" height="45" rx="10" fill="var(--primary-color)" />

                        <path d="M 30 40 A 15 15 0 0 1 70 45 L 70 40 A 20 20 0 0 0 30 45 Z" fill="#4d4c5d" />

                        <rect x="20" y="45" width="60" height="45" rx="10" stroke="#4d4c5d" stroke-width="5" fill="none" />

                        <path d="M 30 40 A 15 15 0 0 1 70 45 L 70 40 A 20 20 0 0 0 30 45 Z" stroke="#4d4c5d" stroke-width="5" fill="none" />
                        
                        <circle cx="50" cy="65" r="8" fill="#4d4c5d" />
                        <rect x="47" y="70" width="6" height="12" fill="#4d4c5d" />
                    </svg>
                        <h4 class="font-medium text-3xl text-surface-900 dark:text-surface-0">CYBER IMPERIUM</h4>
                    </a>
                </div>

                <div class="col-span-12 md:col-span-9 lg:col-span-10">
                    <div class="grid grid-cols-12 gap-8 text-center md:text-left">
                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0 border-b border-gray-200 dark:border-gray-700 pb-2">Empresa</h4>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-info-circle mr-2"></i>
                                <span>Sobre Nosotros</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-bell mr-2"></i>
                                <span>Noticias</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-chart-line mr-2"></i>
                                <span>Relaciones con Inversores</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-briefcase mr-2"></i>
                                <span>Carreras</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-folder mr-2"></i>
                                <span>Kit de Medios</span>
                            </a>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0 border-b border-gray-200 dark:border-gray-700 pb-2">Recursos</h4>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-play mr-2"></i>
                                <span>Comenzar</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-book mr-2"></i>
                                <span>Aprender</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-file mr-2"></i>
                                <span>Casos de Estudio</span>
                            </a>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0 border-b border-gray-200 dark:border-gray-700 pb-2">Comunidad</h4>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-discord mr-2"></i>
                                <span>Discord</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-calendar mr-2"></i>
                                <span>Eventos</span>
                                <span class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">Nuevo</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-question-circle mr-2"></i>
                                <span>FAQ</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-comment mr-2"></i>
                                <span>Blog</span>
                            </a>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0 border-b border-gray-200 dark:border-gray-700 pb-2">Legal</h4>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-id-card mr-2"></i>
                                <span>Política de Marca</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer mb-3 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-lock mr-2"></i>
                                <span>Política de Privacidad</span>
                            </a>
                            <a class="leading-normal text-sm cursor-pointer text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 flex items-center">
                                <i class="pi pi-file-pdf mr-2"></i>
                                <span>Términos de Servicio</span>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="col-span-12 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div class="text-sm text-surface-500 dark:text-surface-400">
                            © 2025 Cyber Imperium. Todos los derechos reservados.
                        </div>
                        <div class="flex gap-4">
                            <a class="w-10 h-10 bg-surface-50 dark:bg-surface-900 rounded-full flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors duration-200">
                                <i class="pi pi-facebook"></i>
                            </a>
                            <a class="w-10 h-10 bg-surface-50 dark:bg-surface-900 rounded-full flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors duration-200">
                                <i class="pi pi-twitter"></i>
                            </a>
                            <a class="w-10 h-10 bg-surface-50 dark:bg-surface-900 rounded-full flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors duration-200">
                                <i class="pi pi-github"></i>
                            </a>
                            <a class="w-10 h-10 bg-surface-50 dark:bg-surface-900 rounded-full flex items-center justify-center text-surface-600 dark:text-surface-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors duration-200">
                                <i class="pi pi-linkedin"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class FooterWidget {
    constructor(public router: Router) {}
}
