import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-activity-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Layout minimalista para activity-solver -->
    <div class="activity-layout min-h-screen flex flex-col overflow-hidden">

      <!-- Barra superior minimalista -->
      <header class="activity-header px-6 py-4 flex-shrink-0">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Logo o título de la plataforma -->
              <div class="flex items-center gap-2">
                <div class="logo-chip w-8 h-8 rounded-lg flex items-center justify-center">
                  <span class="logo-text font-bold text-sm">R</span>
                </div>
                <span class="brand-text text-lg font-semibold">Cyber Imperium</span>
              </div>
            </div>

            <!-- Información del usuario (opcional) -->
            <div class="flex items-center gap-2">
              <span class="status-text text-sm">Actividad en progreso</span>
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
    :host {
      --activity-layout-bg: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      --activity-layout-header-bg: rgba(255, 255, 255, 0.92);
      --activity-layout-header-border: #cbd5e1;
      --activity-layout-text: #0f172a;
      --activity-layout-muted: #475569;
      --activity-layout-logo-bg: #2563eb;
      --activity-layout-logo-text: #ffffff;
    }

    :host-context(.app-sepia) {
      --activity-layout-bg: linear-gradient(135deg, #f5ede0 0%, #ede0c8 100%);
      --activity-layout-header-bg: rgba(245, 242, 232, 0.96);
      --activity-layout-header-border: #cbb89a;
      --activity-layout-text: #4b3d2b;
      --activity-layout-muted: #6b5a44;
      --activity-layout-logo-bg: #8b5e3c;
      --activity-layout-logo-text: #ffffff;
    }

    :host-context(.app-inverted) {
      --activity-layout-bg: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
      --activity-layout-header-bg: #ffffff;
      --activity-layout-header-border: #1a1a1a;
      --activity-layout-text: #111111;
      --activity-layout-muted: #222222;
      --activity-layout-logo-bg: #111111;
      --activity-layout-logo-text: #ffffff;
    }

    :host-context(.app-dark) {
      --activity-layout-bg: linear-gradient(135deg, #0b1220 0%, #111827 100%);
      --activity-layout-header-bg: rgba(15, 23, 42, 0.92);
      --activity-layout-header-border: #334155;
      --activity-layout-text: #e2e8f0;
      --activity-layout-muted: #94a3b8;
      --activity-layout-logo-bg: #0ea5e9;
      --activity-layout-logo-text: #0f172a;
    }

    .activity-layout {
      background: var(--activity-layout-bg);
    }

    .activity-header {
      background: var(--activity-layout-header-bg);
      border-bottom: 1px solid var(--activity-layout-header-border);
      box-shadow: 0 2px 14px rgba(15, 23, 42, 0.08);
      backdrop-filter: blur(8px);
    }

    .logo-chip {
      background: var(--activity-layout-logo-bg);
    }

    .logo-text {
      color: var(--activity-layout-logo-text);
    }

    .brand-text {
      color: var(--activity-layout-text);
    }

    .status-text {
      color: var(--activity-layout-muted);
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
