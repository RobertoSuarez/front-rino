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
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

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
    ProgressBarModule,
    BreadcrumbModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './my-learning-paths.component.html',
  styleUrl: './my-learning-paths.component.css'
})
export class MyLearningPathsComponent implements OnInit {
  subscriptions: any[] = [];
  loading = false;
  subscribeDialogVisible = false;
  subscriptionCode = '';
  subscribing = false;
  codeError = '';
  breadcrumbItems: MenuItem[] = [];
  breadcrumbHome: MenuItem | undefined;

  constructor(
    private learningPathService: LearningPathService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.breadcrumbItems = [
      { label: 'Mis Rutas' }
    ];
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
