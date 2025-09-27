import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-activity-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Layout minimalista para activity-solver -->
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">

      <!-- Barra superior minimalista -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Logo o título de la plataforma -->
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-sm">R</span>
                </div>
                <span class="text-lg font-semibold text-gray-900">Cyber Imperium</span>
              </div>
            </div>

            <!-- Información del usuario (opcional) -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Actividad en progreso</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido del router-outlet (activity-solver) con scroll -->
      <main class="flex-1 overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    /* Asegurar que no haya padding/margin del body afectando el layout */
    :host {
 
    }

    /* Estilos para dispositivos móviles */
    @media (max-width: 768px) {
      header .px-6 {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class ActivityLayoutComponent { }
