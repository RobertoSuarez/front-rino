import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';

import { LearningPathService } from '../../../core/services/learning-path.service';

@Component({
  selector: 'app-my-learning-paths',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    ChipModule,
    TagModule,
    SkeletonModule,
    ProgressBarModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="grid grid-cols-12 gap-4">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <!-- Header -->
      <div class="col-span-12">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-3xl font-bold text-900 mb-2">Mis Rutas de Aprendizaje</h2>
            <p class="text-600">Explora y gestiona las rutas a las que estás suscrito</p>
          </div>
          <button 
            pButton 
            label="Unirme a una Ruta" 
            icon="pi pi-plus-circle" 
            class="p-button-success"
            (click)="showSubscribeDialog()">
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <ng-container *ngIf="loading">
        <div class="col-span-12 md:col-span-6 lg:col-span-4" *ngFor="let i of [1,2,3]">
          <div class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div class="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
              <p-skeleton width="60%" height="1.5rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton width="40%" height="1rem"></p-skeleton>
            </div>
            <div class="p-5">
              <p-skeleton width="100%" height="0.75rem" styleClass="mb-3"></p-skeleton>
              <p-skeleton width="100%" height="0.75rem" styleClass="mb-3"></p-skeleton>
              <p-skeleton width="80%" height="0.75rem" styleClass="mb-4"></p-skeleton>
              
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-blue-50 rounded-lg p-3">
                  <p-skeleton width="50%" height="1rem" styleClass="mx-auto mb-1"></p-skeleton>
                  <p-skeleton width="30%" height="1.5rem" styleClass="mx-auto"></p-skeleton>
                </div>
                <div class="bg-green-50 rounded-lg p-3">
                  <p-skeleton width="50%" height="1rem" styleClass="mx-auto mb-1"></p-skeleton>
                  <p-skeleton width="30%" height="1.5rem" styleClass="mx-auto"></p-skeleton>
                </div>
              </div>
              
              <p-skeleton height="2rem" styleClass="w-full"></p-skeleton>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Empty State -->
      <div class="col-span-12" *ngIf="!loading && subscriptions.length === 0">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div class="empty-state-wrap">
            <div class="empty-state-icon">
              <i class="pi pi-map"></i>
            </div>

            <h3 class="empty-state-title">No tienes rutas de aprendizaje</h3>
            <p class="empty-state-description">
              Únete con el código que te compartió tu profesor para empezar tu recorrido en Cyber Imperium.
            </p>

            <div class="empty-state-tips">
              <span><i class="pi pi-check-circle"></i> Usa el código exacto de la ruta</span>
              <span><i class="pi pi-info-circle"></i> Formato sugerido: LP-AAAAMMDD-XXXX</span>
            </div>

            <button 
              pButton 
              label="Unirme a una Ruta" 
              icon="pi pi-plus-circle" 
              class="p-button-primary p-button-raised px-8"
              (click)="showSubscribeDialog()">
            </button>
          </div>
        </div>
      </div>

      <!-- Rutas Suscritas -->
      <div class="col-span-12 md:col-span-6 lg:col-span-4" *ngFor="let sub of subscriptions">
        <div class="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
          <!-- Header con gradiente minimalista -->
          <div class="relative">
            <div class="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-800 mb-1 line-clamp-2">{{ sub.learningPath.name }}</h3>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
                      {{ sub.learningPath.code }}
                    </span>
                    <p-tag 
                      [value]="sub.isActive ? 'Activo' : 'Inactivo'" 
                      [severity]="sub.isActive ? 'success' : 'danger'"
                      [rounded]="true"
                      styleClass="text-xs">
                    </p-tag>
                  </div>
                </div>
                <div class="flex-shrink-0 ml-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                    <i class="pi pi-map text-white text-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Contenido principal -->
          <div class="p-5 flex-grow flex flex-col">
            <!-- Descripción -->
            <p class="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
              {{ sub.learningPath.description }}
            </p>

            <!-- Métricas -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-blue-50 rounded-lg p-3 text-center">
                <i class="pi pi-book text-blue-600 text-lg mb-1"></i>
                <div class="text-lg font-bold text-blue-900">{{ sub.learningPath.coursesCount || 0 }}</div>
                <div class="text-xs text-blue-700">Cursos</div>
              </div>
              <div class="bg-green-50 rounded-lg p-3 text-center">
                <i class="pi pi-check-circle text-green-600 text-lg mb-1"></i>
                <div class="text-lg font-bold text-green-900">{{ sub.completedCourses || 0 }}</div>
                <div class="text-xs text-green-700">Completados</div>
              </div>
            </div>

            <!-- Información adicional -->
            <div class="space-y-2 mb-4 border-t border-gray-100 pt-4">
              <div class="flex items-center text-sm text-gray-600" *ngIf="sub.learningPath.createdBy">
                <i class="pi pi-user mr-2 text-primary-500"></i>
                <span class="truncate">{{ sub.learningPath.createdBy.firstName }} {{ sub.learningPath.createdBy.lastName }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <i class="pi pi-calendar mr-2 text-gray-400"></i>
                <span>Suscrito: {{ sub.subscribedAt | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            
            <!-- Barra de progreso -->
            <div class="mb-4 mt-auto">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Progreso general</span>
                <span class="text-sm font-bold bg-primary-100 text-primary px-2 py-1 rounded-full">
                  {{ getProgressPercentage(sub) || 0 }}%
                </span>
              </div>
              <p-progressBar 
                [value]="getProgressPercentage(sub) || 0" 
                [showValue]="false" 
                styleClass="h-2 rounded-full" 
                [style]="{'background': 'var(--surface-200)'}">
              </p-progressBar>
            </div>
            
            <!-- Botones de acción -->
            <div class="flex gap-2">
              <button 
                pButton 
                label="Ver Ruta" 
                icon="pi pi-arrow-right" 
                class="p-button-primary p-button-raised flex-1"
                (click)="viewDetails(sub.learningPath.id)">
              </button>
              <button 
                pButton 
                icon="pi pi-times" 
                class="p-button-danger p-button-outlined p-button-sm"
                (click)="confirmUnsubscribe(sub)"
                pTooltip="Cancelar suscripción"
                tooltipPosition="top">
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Diálogo de Suscripción -->
      <p-dialog 
        [(visible)]="subscribeDialogVisible" 
        [style]="{ width: '450px' }" 
        header="Unirme a una Ruta"
        [modal]="true"
        styleClass="p-fluid">
        <ng-template pTemplate="content">
          <div class="flex flex-col gap-4">
            <p class="text-600">
              Ingresa el código de la ruta de aprendizaje proporcionado por tu profesor
            </p>
            
            <div>
              <label for="code" class="block text-900 font-medium mb-2">
                Código de la Ruta <span class="text-red-500">*</span>
              </label>
              <input 
                id="code"
                type="text" 
                pInputText 
                [(ngModel)]="subscriptionCode"
                placeholder="Ej: LP-20251001-0001"
                class="w-full uppercase"
                [class.ng-invalid]="codeError"
                [class.ng-dirty]="codeError"
                (input)="onCodeInput()"
                (keyup.enter)="subscribe()" />
              <small class="text-red-500" *ngIf="codeError">
                {{ codeError }}
              </small>
            </div>

            <div class="bg-blue-50 border-1 border-blue-200 border-round p-3">
              <div class="flex gap-2">
                <i class="pi pi-info-circle text-blue-500 mt-1"></i>
                <div class="text-sm text-blue-900">
                  <p class="font-semibold mb-1">¿Dónde encuentro el código?</p>
                  <p>Tu profesor te proporcionará el código de la ruta. El formato es: LP-AAAAMMDD-XXXX</p>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
        
        <ng-template pTemplate="footer">
          <button 
            pButton 
            label="Cancelar" 
            icon="pi pi-times" 
            class="p-button-text"
            (click)="subscribeDialogVisible = false"
            [disabled]="subscribing">
          </button>
          <button 
            pButton 
            label="Suscribirme" 
            icon="pi pi-check" 
            class="p-button-success"
            (click)="subscribe()"
            [disabled]="!subscriptionCode || subscribing"
            [loading]="subscribing">
          </button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .empty-state-wrap {
      max-width: 720px;
      margin: 0 auto;
      min-height: 320px;
      padding: 2.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 0.9rem;
    }

    .empty-state-icon {
      width: 5.5rem;
      height: 5.5rem;
      border-radius: 9999px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #dcfce7, #d1fae5);
      color: #10b981;
      font-size: 2rem;
      margin-bottom: 0.4rem;
    }

    .empty-state-title {
      margin: 0;
      color: #1f2937;
      font-size: clamp(1.6rem, 2.4vw, 2rem);
      font-weight: 700;
      line-height: 1.2;
    }

    .empty-state-description {
      margin: 0;
      color: #4b5563;
      font-size: 1.03rem;
      line-height: 1.65;
      max-width: 52ch;
      text-align: center;
    }

    .empty-state-tips {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }

    .empty-state-tips span {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
      border-radius: 9999px;
      padding: 0.35rem 0.75rem;
      font-size: 0.84rem;
      font-weight: 600;
    }
  `]
})
export class MyLearningPathsComponent implements OnInit {
  subscriptions: any[] = [];
  loading = false;
  subscribeDialogVisible = false;
  subscriptionCode = '';
  subscribing = false;
  codeError = '';

  constructor(
    private learningPathService: LearningPathService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.learningPathService.getMySubscriptions().subscribe({
      next: (response) => {
        this.subscriptions = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar suscripciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar tus rutas'
        });
        this.loading = false;
      }
    });
  }

  showSubscribeDialog(): void {
    this.subscriptionCode = '';
    this.codeError = '';
    this.subscribeDialogVisible = true;
  }

  onCodeInput(): void {
    this.codeError = '';
    this.subscriptionCode = this.subscriptionCode.toUpperCase();
  }

  subscribe(): void {
    if (!this.subscriptionCode.trim()) {
      this.codeError = 'El código es requerido';
      return;
    }

    this.subscribing = true;
    this.learningPathService.subscribeToPath(this.subscriptionCode).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.data.message || 'Te has suscrito exitosamente'
        });
        this.subscribeDialogVisible = false;
        this.subscribing = false;
        this.loadSubscriptions();
      },
      error: (error) => {
        console.error('Error al suscribirse:', error);
        const rawMessage = String(error.error?.message || '').toLowerCase();
        if (rawMessage.includes('duplicate key')) {
          this.codeError = 'Tu suscripción previa se está reactivando. Intenta nuevamente en unos segundos.';
        } else {
          this.codeError = error.error?.message || 'Código inválido o ruta no encontrada';
        }
        this.subscribing = false;
      }
    });
  }

  viewDetails(pathId: number): void {
    this.router.navigate(['/estudiante/my-learning-paths', pathId, 'detail']);
  }

  confirmUnsubscribe(subscription: any): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas cancelar tu suscripción a "${subscription.learningPath.name}"?`,
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.unsubscribe(subscription.learningPath.id);
      }
    });
  }

  unsubscribe(pathId: number): void {
    this.learningPathService.unsubscribeFromPath(pathId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Suscripción cancelada correctamente'
        });
        this.loadSubscriptions();
      },
      error: (error) => {
        console.error('Error al cancelar suscripción:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cancelar la suscripción'
        });
      }
    });
  }

  getProgressPercentage(subscription: any): number {
    if (!subscription.learningPath.coursesCount || subscription.learningPath.coursesCount === 0) {
      return 0;
    }
    const completed = subscription.completedCourses || 0;
    const total = subscription.learningPath.coursesCount;
    return Math.round((completed / total) * 100);
  }
}
