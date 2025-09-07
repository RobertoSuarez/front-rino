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
  template: `
    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <div class="card px-6 py-6">
          <p-toast></p-toast>
          <p-confirmDialog [style]="{ width: '450px' }"></p-confirmDialog>
          
          <p-toolbar styleClass="mb-4 gap-2">
            <ng-template pTemplate="left">
              <div class="my-2">
                <h2 class="text-2xl font-bold text-900 mb-0">Gestión de Usuarios</h2>
                <p class="text-600 mt-1">Administra todos los usuarios del sistema</p>
              </div>
            </ng-template>
            
            <ng-template pTemplate="right">
              <div class="flex align-items-center gap-2">
                <span class="p-input-icon-left">
                  <i class="pi pi-search"></i>
                  <input 
                    pInputText 
                    type="text" 
                    [(ngModel)]="searchTerm"
                    (input)="onSearch()"
                    placeholder="Buscar usuarios..." 
                    class="w-full sm:w-auto" />
                </span>
                <button 
                  pButton 
                  pRipple 
                  label="Nuevo Usuario" 
                  icon="pi pi-plus" 
                  class="p-button-success mr-2"
                  routerLink="/admin/users/new">
                </button>
              </div>
            </ng-template>
          </p-toolbar>
          
          <p-table 
            [value]="users" 
            [rows]="10"
            [paginator]="true"
            [tableStyle]="{ 'min-width': '75rem' }"
            [loading]="loading"
            [totalRecords]="totalRecords"
            [lazy]="true"
            (onLazyLoad)="loadUsers($event)"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            [rowsPerPageOptions]="[10, 25, 50]">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="id">
                  ID <p-sortIcon field="id"></p-sortIcon>
                </th>
                <th pSortableColumn="firstName">
                  Nombre <p-sortIcon field="firstName"></p-sortIcon>
                </th>
                <th pSortableColumn="email">
                  Email <p-sortIcon field="email"></p-sortIcon>
                </th>
                <th pSortableColumn="typeUser">
                  Tipo <p-sortIcon field="typeUser"></p-sortIcon>
                </th>
                <th pSortableColumn="status">
                  Estado <p-sortIcon field="status"></p-sortIcon>
                </th>
                <th>Acciones</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-user>
              <tr>
                <td>{{ user.id }}</td>
                <td>
                  <div class="flex align-items-center gap-2">
                    <div class="flex align-items-center justify-content-center bg-primary text-white border-circle w-2rem h-2rem">
                      {{ getInitials(user.firstName, user.lastName) }}
                    </div>
                    <span class="font-medium">{{ user.firstName }} {{ user.lastName }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <p-tag 
                    [value]="getUserTypeLabel(user.typeUser)" 
                    [severity]="getUserTypeSeverity(user.typeUser)">
                  </p-tag>
                </td>
                <td>
                  <p-tag 
                    [value]="user.status === 'active' ? 'Activo' : 'Inactivo'" 
                    [severity]="user.status === 'active' ? 'success' : 'danger'">
                  </p-tag>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      pButton 
                      pRipple 
                      icon="pi pi-eye" 
                      class="p-button-rounded p-button-info p-button-text"
                      pTooltip="Ver detalles"
                      (click)="viewUser(user)">
                    </button>
                    <button 
                      pButton 
                      pRipple 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-success p-button-text"
                      pTooltip="Editar usuario"
                      [routerLink]="['/admin/users/edit', user.id]">
                    </button>
                    <button 
                      pButton 
                      pRipple 
                      [icon]="user.status === 'active' ? 'pi pi-ban' : 'pi pi-check'" 
                      [class]="user.status === 'active' ? 'p-button-rounded p-button-warning p-button-text' : 'p-button-rounded p-button-success p-button-text'"
                      [pTooltip]="user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'"
                      (click)="toggleUserStatus(user)">
                    </button>
                    <button 
                      pButton 
                      pRipple 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-danger p-button-text"
                      pTooltip="Eliminar usuario"
                      (click)="deleteUser(user)">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center py-4">
                  <div class="flex flex-column align-items-center gap-3">
                    <i class="pi pi-users text-4xl text-400"></i>
                    <span class="text-lg text-600">No se encontraron usuarios</span>
                    <button 
                      pButton 
                      pRipple 
                      label="Crear primer usuario" 
                      icon="pi pi-plus" 
                      class="p-button-outlined"
                      routerLink="/admin/users/new">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
          
          <!-- Dialog para ver detalles del usuario -->
          <p-dialog 
            [(visible)]="userDetailDialog" 
            [modal]="true" 
            [style]="{ width: '800px', maxWidth: '95vw' }"
            [draggable]="false" 
            [resizable]="false"
            styleClass="user-detail-dialog"
            [showHeader]="false"
            [dismissableMask]="true"
            [closeOnEscape]="true">
            
            <div *ngIf="selectedUser" class="p-0">
              <!-- Encabezado con título y botón de cerrar -->
              <div class="flex justify-between align-items-center p-4 border-bottom-1 surface-border">
                <h2 class="text-2xl font-bold m-0">Detalles del Usuario</h2>
                <button 
                  pButton 
                  pRipple 
                  icon="pi pi-times" 
                  class="p-button-rounded p-button-text p-button-plain"
                  (click)="userDetailDialog = false">
                </button>
              </div>
              
              <!-- Perfil del usuario con avatar -->
              <div class="p-4 bg-primary text-white">
                <div class="flex flex-wrap align-items-center gap-4">
                  <!-- Avatar -->
                  <div class="flex align-items-center justify-content-center bg-white text-primary border-circle shadow-4 w-8rem h-8rem flex-shrink-0">
                    <span class="text-5xl font-bold">{{ getInitials(selectedUser.firstName, selectedUser.lastName) }}</span>
                  </div>
                  
                  <!-- Información principal -->
                  <div class="flex flex-column flex-grow-1">
                    <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between">
                      <h2 class="text-3xl font-bold m-0 mb-2 sm:mb-0">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h2>
                      
                      <div class="flex gap-2">
                        <span class="bg-white text-primary py-1 px-3 border-round font-medium flex align-items-center">
                          <i class="pi {{ selectedUser.typeUser === 'admin' ? 'pi-shield' : selectedUser.typeUser === 'teacher' ? 'pi-book' : 'pi-user' }} mr-1"></i>
                          {{ getUserTypeLabel(selectedUser.typeUser) }}
                        </span>
                        <span class="{{ selectedUser.status === 'active' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900' }} py-1 px-3 border-round font-medium flex align-items-center">
                          <i class="pi {{ selectedUser.status === 'active' ? 'pi-check-circle' : 'pi-times-circle' }} mr-1"></i>
                          {{ selectedUser.status === 'active' ? 'Activo' : 'Inactivo' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="flex align-items-center gap-2 mt-3">
                      <i class="pi pi-envelope mr-1"></i>
                      <span class="text-lg">{{ selectedUser.email }}</span>
                    </div>
                    
                    <div class="flex align-items-center gap-2 mt-2" *ngIf="selectedUser.whatsApp">
                      <i class="pi pi-phone mr-1"></i>
                      <span class="text-lg">{{ selectedUser.whatsApp }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Información detallada -->
              <div class="p-4">
                <!-- Pestañas de información -->
                <div class="surface-card p-0 shadow-2 border-round">
                  <div class="flex justify-content-between align-items-center border-bottom-1 surface-border">
                    <ul class="flex list-none p-0 m-0 overflow-x-auto">
                      <li class="px-4 py-3 font-medium text-primary border-bottom-2 border-primary flex align-items-center">
                        <i class="pi pi-user mr-2"></i>
                        <span>Información Personal</span>
                      </li>
                    </ul>
                    <div class="px-3">
                      <span class="text-500 text-sm">ID: {{ selectedUser.id }}</span>
                    </div>
                  </div>
                  
                  <div class="p-4">
                    <div class="flex flex-col gap-4">
                      <!-- Columna 1: Información Básica -->
                      <div class="flex-1">
                        <div class="card border-1 surface-border p-0 h-full shadow-1">
                          <div class="bg-primary p-3 flex align-items-center">
                            <i class="pi pi-id-card text-white mr-2 text-xl"></i>
                            <span class="font-medium text-lg text-white">Información Básica</span>
                          </div>
                          <div class="p-4">
                            <div class="flex flex-column gap-4">
                              <div class="flex flex-column">
                                <div class="flex align-items-center mb-2">
                                  <i class="pi pi-user text-primary mr-2"></i>
                                  <span class="font-medium">Nombre Completo</span>
                                </div>
                                <div class="pl-4 text-900 font-medium">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</div>
                              </div>
                              
                              <div class="flex flex-column">
                                <div class="flex align-items-center mb-2">
                                  <i class="pi pi-tag text-primary mr-2"></i>
                                  <span class="font-medium">Tipo de Usuario</span>
                                </div>
                                <div class="pl-4">
                                  <span class="inline-flex align-items-center bg-primary-100 text-primary-900 px-3 py-2 border-round">
                                    <i class="pi {{ selectedUser.typeUser === 'admin' ? 'pi-shield' : selectedUser.typeUser === 'teacher' ? 'pi-book' : 'pi-user' }} mr-2"></i>
                                    {{ getUserTypeLabel(selectedUser.typeUser) }}
                                  </span>
                                </div>
                              </div>
                              
                              <div class="flex flex-column">
                                <div class="flex align-items-center mb-2">
                                  <i class="pi pi-calendar text-primary mr-2"></i>
                                  <span class="font-medium">Fecha de Nacimiento</span>
                                </div>
                                <div class="pl-4 text-900">{{ (selectedUser.birthday | date:'dd/MM/yyyy') || 'No especificada' }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Columna 2: Información de Contacto -->
                      <div class="flex-1">
                        <div class="card border-1 surface-border p-0 h-full shadow-1">
                          <div class="bg-primary p-3 flex align-items-center">
                            <i class="pi pi-envelope text-white mr-2 text-xl"></i>
                            <span class="font-medium text-lg text-white">Información de Contacto</span>
                          </div>
                          <div class="p-4">
                            <div class="flex flex-column gap-4">
                              <div class="flex flex-column">
                                <div class="flex align-items-center mb-2">
                                  <i class="pi pi-at text-primary mr-2"></i>
                                  <span class="font-medium">Email</span>
                                </div>
                                <div class="pl-4">
                                  <a href="mailto:{{ selectedUser.email }}" class="text-primary font-medium no-underline hover:underline flex align-items-center">
                                    <i class="pi pi-envelope mr-2"></i>
                                    <span>{{ selectedUser.email }}</span>
                                  </a>
                                </div>
                              </div>
                              
                              <div class="flex flex-column">
                                <div class="flex align-items-center mb-2">
                                  <i class="pi pi-phone text-primary mr-2"></i>
                                  <span class="font-medium">WhatsApp</span>
                                </div>
                                <div class="pl-4">
                                  <span class="text-900 flex align-items-center">
                                    <i class="pi pi-whatsapp mr-2 text-green-500"></i>
                                    <span>{{ selectedUser.whatsApp || 'No especificado' }}</span>
                                  </span>
                                </div>
                              </div>
                              
                              <div class="flex flex-column">
                                <div class="flex align-items-center mb-2">
                                  <i class="pi pi-check-circle text-primary mr-2"></i>
                                  <span class="font-medium">Estado</span>
                                </div>
                                <div class="pl-4">
                                  <span class="inline-flex align-items-center {{ selectedUser.status === 'active' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900' }} px-3 py-2 border-round">
                                    <i class="pi {{ selectedUser.status === 'active' ? 'pi-check-circle' : 'pi-times-circle' }} mr-2"></i>
                                    {{ selectedUser.status === 'active' ? 'Activo' : 'Inactivo' }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Acciones en la parte inferior -->
            <div class="p-4 border-top-1 surface-border flex justify-content-end gap-2">
              <button 
                pButton 
                pRipple 
                label="Editar Usuario" 
                icon="pi pi-pencil" 
                class="p-button-primary p-button-raised"
                [routerLink]="['/admin/users/edit', selectedUser?.id]"
                (click)="userDetailDialog = false">
              </button>
            </div>
          </p-dialog>
        </div>
      </div>
    </div>
  `
})
export class UsersListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  totalRecords = 0;
  searchTerm = '';
  userDetailDialog = false;
  selectedUser: User | null = null;
  
  private searchTimeout: any;
  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
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
          this.users = response.data.users;
          this.totalRecords = response.data.total;
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

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar al usuario ${user.firstName} ${user.lastName}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const subscription = this.userService.deleteUser(user.id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado correctamente'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el usuario: ' + (error.error?.message || '')
            });
          }
        });
        this.subscriptions.push(subscription);
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
