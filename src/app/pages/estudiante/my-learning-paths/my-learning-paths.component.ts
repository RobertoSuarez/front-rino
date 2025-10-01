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
    SkeletonModule
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
          <p-card>
            <p-skeleton width="100%" height="150px"></p-skeleton>
            <p-skeleton width="80%" height="1.5rem" styleClass="mt-3"></p-skeleton>
            <p-skeleton width="60%" height="1rem" styleClass="mt-2"></p-skeleton>
          </p-card>
        </div>
      </ng-container>

      <!-- Empty State -->
      <div class="col-span-12" *ngIf="!loading && subscriptions.length === 0">
        <p-card>
          <div class="text-center py-8">
            <i class="pi pi-inbox text-6xl text-400 mb-4"></i>
            <h3 class="text-xl font-semibold text-700 mb-2">No tienes rutas suscritas</h3>
            <p class="text-600 mb-4">Únete a una ruta de aprendizaje usando el código proporcionado por tu profesor</p>
            <button 
              pButton 
              label="Unirme a una Ruta" 
              icon="pi pi-plus-circle" 
              class="p-button-success"
              (click)="showSubscribeDialog()">
            </button>
          </div>
        </p-card>
      </div>

      <!-- Rutas Suscritas -->
      <div class="col-span-12 md:col-span-6 lg:col-span-4" *ngFor="let sub of subscriptions">
        <p-card>
          <ng-template pTemplate="header">
            <div class="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-1">{{ sub.learningPath.name }}</h3>
                  <p class="text-sm opacity-90 font-mono">{{ sub.learningPath.code }}</p>
                </div>
                <p-tag 
                  [value]="sub.isActive ? 'Activo' : 'Inactivo'" 
                  [severity]="sub.isActive ? 'success' : 'danger'">
                </p-tag>
              </div>
            </div>
          </ng-template>

          <div class="space-y-3">
            <p class="text-600 text-sm line-clamp-3">{{ sub.learningPath.description }}</p>

            <div class="flex items-center gap-2">
              <p-chip 
                [label]="sub.learningPath.coursesCount + ' curso' + (sub.learningPath.coursesCount !== 1 ? 's' : '')" 
                icon="pi pi-book"
                styleClass="text-sm">
              </p-chip>
            </div>

            <div class="text-sm text-600" *ngIf="sub.learningPath.createdBy">
              <i class="pi pi-user mr-1"></i>
              Creado por: {{ sub.learningPath.createdBy.firstName }} {{ sub.learningPath.createdBy.lastName }}
            </div>

            <div class="text-sm text-500">
              <i class="pi pi-calendar mr-1"></i>
              Suscrito: {{ sub.subscribedAt }}
            </div>
          </div>

          <ng-template pTemplate="footer">
            <div class="flex gap-2">
              <button 
                pButton 
                label="Ver Detalles" 
                icon="pi pi-eye" 
                class="p-button-primary flex-1"
                (click)="viewDetails(sub.learningPath.id)">
              </button>
              <button 
                pButton 
                icon="pi pi-trash" 
                class="p-button-danger p-button-outlined"
                (click)="confirmUnsubscribe(sub)"
                pTooltip="Cancelar suscripción"
                tooltipPosition="top">
              </button>
            </div>
          </ng-template>
        </p-card>
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
        this.codeError = error.error?.message || 'Código inválido o ruta no encontrada';
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
}
