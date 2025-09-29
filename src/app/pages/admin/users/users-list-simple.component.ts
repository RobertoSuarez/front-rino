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
                <th pSortableColumn="isVerified">
                  Verificado <p-sortIcon field="isVerified"></p-sortIcon>
                </th>
                <th pSortableColumn="approved">
                  Aprobado <p-sortIcon field="approved"></p-sortIcon>
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
                  @if (user.isVerified) {
                    <p-tag 
                      [value]="'Sí'" 
                      [severity]="'success'">
                    </p-tag>
                  } @else {
                    <p-tag 
                      [value]="'No'" 
                      [severity]="'warn'">
                    </p-tag>
                  }
                </td>
                <td>
                  <p-tag 
                    [value]="user.approved ? 'Sí' : 'No'" 
                    [severity]="user.approved ? 'success' : 'danger'">
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
                      [icon]="user.approved ? 'pi pi-check' : 'pi pi-thumbs-up'" 
                      [class]="user.approved ? 'p-button-rounded p-button-success p-button-text' : 'p-button-rounded p-button-warning p-button-text'"
                      [pTooltip]="user.approved ? 'Usuario ya aprobado' : 'Aprobar usuario'"
                      [disabled]="user.approved"
                      (click)="approveUser(user)">
                    </button>
                    <button 
                      pButton 
                      pRipple 
                      [icon]="user.isVerified ? 'pi pi-check-circle' : 'pi pi-envelope'" 
                      [class]="user.isVerified ? 'p-button-rounded p-button-success p-button-text' : 'p-button-rounded p-button-info p-button-text'"
                      [pTooltip]="user.isVerified ? 'Usuario ya verificado' : 'Enviar verificación'"
                      [disabled]="user.isVerified"
                      (click)="sendVerificationEmail(user)">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="text-center py-4">
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
            [style]="{ width: '900px' }"
            [draggable]="false" 
            [resizable]="false"
            styleClass="user-detail-dialog"
            [showHeader]="false"
            [dismissableMask]="true"
            [closeOnEscape]="true"
            [contentStyle]="{ padding: '0' }">
            
            <ng-container *ngIf="selectedUser as user">
              <div class="relative border border-slate-200/70 bg-white text-slate-900 overflow-hidden shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                <div class="relative bg-slate-900 px-6 py-8 text-white dark:bg-slate-950">
                  <button 
                    pButton 
                    pRipple 
                    type="button"
                    icon="pi pi-times" 
                    class="p-button-rounded"
                    (click)="userDetailDialog = false">
                  </button>

                  <div class="flex flex-col gap-6 md:flex-row md:items-end">
                    <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-white/30 bg-white/20 text-4xl font-semibold uppercase shadow-[0_12px_35px_rgba(15,23,42,0.28)] backdrop-blur-sm">
                      {{ getInitials(user.firstName, user.lastName) }}
                    </div>

                    <div class="flex-1 space-y-6">
                      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p class="text-xs font-medium uppercase tracking-[0.35em] text-white/80">Perfil del usuario</p>
                          <h2 class="text-3xl font-bold leading-tight">{{ user.firstName }} {{ user.lastName }}</h2>
                          <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                            <div class="inline-flex items-center gap-2">
                              <i class="pi pi-envelope"></i>
                              <span>{{ user.email }}</span>
                            </div>
                            <div class="inline-flex items-center gap-2" *ngIf="user.whatsApp; else noWhatsApp">
                              <i class="pi pi-whatsapp text-emerald-200"></i>
                              <span>{{ user.whatsApp }}</span>
                            </div>
                            <ng-template #noWhatsApp>
                              <div class="inline-flex items-center gap-2 opacity-70">
                                <i class="pi pi-whatsapp"></i>
                                <span>WhatsApp no registrado</span>
                              </div>
                            </ng-template>
                          </div>
                        </div>

                        <div class="flex flex-wrap gap-3">
                          <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                            <i class="pi {{ user.typeUser === 'admin' ? 'pi-shield' : user.typeUser === 'teacher' ? 'pi-book' : user.typeUser === 'parent' ? 'pi-users' : 'pi-user' }}"></i>
                            {{ getUserTypeLabel(user.typeUser) }}
                          </span>
                          <span 
                            class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                            [ngClass]="user.status === 'active' ? 'bg-emerald-400/20 text-emerald-50 border border-emerald-200/60' : 'bg-rose-400/15 text-rose-50 border border-rose-200/60'">
                            <i class="pi {{ user.status === 'active' ? 'pi-check-circle' : 'pi-times-circle' }}"></i>
                            {{ user.status === 'active' ? 'Activo' : 'Inactivo' }}
                          </span>
                        </div>
                      </div>

                      <div class="flex flex-wrap items-center gap-4 text-sm text-white/85">
                        <div class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5">
                          <i class="pi pi-id-card"></i>
                          <span>ID: {{ user.id }}</span>
                        </div>
                        <div class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5">
                          <i class="pi pi-calendar"></i>
                          <span>
                            {{ user.birthday ? (user.birthday | date:'dd/MM/yyyy') : 'Fecha de nacimiento no registrada' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="px-6 py-6 space-y-6">
                  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section class="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
                      <h3 class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Información Personal</h3>
                      <div class="mt-5 space-y-5">
                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                            <i class="pi pi-user text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nombre completo</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">{{ user.firstName }} {{ user.lastName }}</p>
                          </div>
                        </div>

                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                            <i class="pi pi-tag text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tipo de usuario</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">{{ getUserTypeLabel(user.typeUser) }}</p>
                          </div>
                        </div>

                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                            <i class="pi pi-shield text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">
                              {{ user.status === 'active' ? 'Activo' : 'Inactivo' }}
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                            <i class="pi pi-check-circle text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Verificado</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">
                              {{ user.isVerified ? 'Sí' : 'No' }}
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                            <i class="pi pi-thumbs-up text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Aprobado</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">
                              {{ user.approved ? 'Sí' : 'No' }}
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200">
                            <i class="pi pi-calendar text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fecha de nacimiento</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">
                              {{ user.birthday ? (user.birthday | date:'dd/MM/yyyy') : 'No especificada' }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section class="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
                      <h3 class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Información de Contacto</h3>
                      <div class="mt-5 space-y-5">
                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200">
                            <i class="pi pi-envelope text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
                            <a 
                              class="text-base font-medium text-slate-900 underline-offset-4 transition-colors hover:underline dark:text-slate-100"
                              [href]="'mailto:' + user.email">
                              {{ user.email }}
                            </a>
                          </div>
                        </div>

                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200">
                            <i class="pi pi-whatsapp text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">WhatsApp</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">
                              {{ user.whatsApp || 'No especificado' }}
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-4">
                          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200">
                            <i class="pi pi-paperclip text-lg"></i>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Otros detalles</p>
                            <p class="text-base font-medium text-slate-900 dark:text-slate-100">
                              Información adicional disponible en la edición del perfil.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div class="flex flex-col gap-3 border-t border-slate-200/80 pt-6 dark:border-slate-800">
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      Puedes actualizar datos y añadir notas internas desde la vista de edición del usuario.
                    </p>
                    <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button 
                        type="button"
                        class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
                        (click)="userDetailDialog = false">
                        <i class="pi pi-times"></i>
                        <span>Cerrar</span>
                      </button>
                      <button
                        pButton
                        pRipple
                        type="button"
                        label="Editar Usuario"
                        icon="pi pi-pencil"
                        [routerLink]="['/admin/users/edit', user.id]"
                        (click)="userDetailDialog = false"
                        class="p-button-rounded p-button-primary px-5 py-2.5 shadow-lg shadow-indigo-500/30">
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
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
  ) { }

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
