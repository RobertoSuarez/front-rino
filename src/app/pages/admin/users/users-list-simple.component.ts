import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UserService, UsersListResponse } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    RippleModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users-list-simple.component.html'
})
export class UsersListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  totalRecords = 0;
  searchTerm = '';
  userDetailDialog = false;
  selectedUser: User | null = null;
  currentUserType: string = '';

  private searchTimeout: any;
  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Obtener el tipo de usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserType = user.typeUser;
      }
    });
    
    this.loadUsers();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadUsers(event?: any) {
    this.loading = true;

    const page = event ? (event.first / event.rows) + 1 : 1;
    const limit = event ? event.rows : 10;

    const subscription = this.userService.getAllUsers(page, limit, this.searchTerm).subscribe({
      next: (response) => {
        if (response && response.data) {
          let users = response.data.users;
          
          // Si el usuario actual es profesor, filtrar solo estudiantes
          if (this.currentUserType === 'teacher') {
            users = users.filter((user: User) => user.typeUser === 'student');
            this.totalRecords = users.length;
          } else {
            this.totalRecords = response.data.total;
          }
          
          this.users = users;
        } else {
          this.users = [];
          this.totalRecords = 0;
          console.warn('Respuesta del servidor no tiene el formato esperado:', response);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los usuarios. ' + (error.error?.message || '')
        });
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  onSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadUsers();
    }, 500);
  }

  viewUser(user: User) {
    this.selectedUser = user;
    this.userDetailDialog = true;
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'desactivar';

    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${action} al usuario ${user.firstName} ${user.lastName}?`,
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Usuario`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const subscription = this.userService.changeUserStatus(user.id, newStatus).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Usuario ${action}do correctamente`
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error changing user status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al ${action} el usuario: ${error.error?.message || ''}`
            });
          }
        });
        this.subscriptions.push(subscription);
      }
    });
  }

  approveUser(user: User) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea aprobar al usuario ${user.firstName} ${user.lastName}?`,
      header: 'Aprobar Usuario',
      icon: 'pi pi-thumbs-up',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        const subscription = this.userService.approveUser(user.id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario aprobado correctamente'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error approving user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al aprobar el usuario: ' + (error.error?.message || '')
            });
          }
        });
        this.subscriptions.push(subscription);
      }
    });
  }

  sendVerificationEmail(user: User) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea enviar un email de verificación al usuario ${user.firstName} ${user.lastName}?`,
      header: 'Enviar Verificación',
      icon: 'pi pi-envelope',
      acceptButtonStyleClass: 'p-button-info',
      accept: () => {
        // Para enviar verificación, necesitamos crear un nuevo token y enviar el email
        // Por simplicidad, podríamos llamar al backend para reenviar la verificación
        // o simplemente mostrar un mensaje indicando que se debería implementar
        this.messageService.add({
          severity: 'info',
          summary: 'Funcionalidad pendiente',
          detail: 'La funcionalidad para reenviar emails de verificación está pendiente de implementación'
        });
      }
    });
  }

  getUserTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'teacher': 'Profesor',
      'student': 'Estudiante',
      'parent': 'Padre de Familia'
    };
    return labels[type] || type;
  }

  getUserTypeSeverity(type: string): string {
    const severities: { [key: string]: string } = {
      'admin': 'danger',
      'teacher': 'info',
      'student': 'success',
      'parent': 'warning'
    };
    return severities[type] || 'info';
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
