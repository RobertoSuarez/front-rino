import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
import { ChipModule } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { LearningPathService, LearningPath } from '../../../core/services/learning-path.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-learning-paths-list',
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
    TooltipModule,
    ChipModule
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
                <h2 class="text-2xl font-bold text-900 mb-0">Rutas de Aprendizaje</h2>
                <p class="text-600 mt-1">Gestiona las rutas de aprendizaje de la plataforma</p>
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
                    placeholder="Buscar rutas..." 
                    class="w-full sm:w-auto" />
                </span>
                <button 
                  pButton 
                  pRipple 
                  label="Nueva Ruta" 
                  icon="pi pi-plus" 
                  class="p-button-success"
                  (click)="createNew()">
                </button>
              </div>
            </ng-template>
          </p-toolbar>
          
          <p-table 
            [value]="filteredPaths" 
            [rows]="10"
            [paginator]="true"
            [tableStyle]="{ 'min-width': '60rem' }"
            [loading]="loading"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} rutas"
            [rowsPerPageOptions]="[10, 25, 50]">
            
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 5%">ID</th>
                <th style="width: 10%">Código</th>
                <th style="width: 15%">Nombre</th>
                <th style="width: 20%">Descripción</th>
                <th style="width: 8%">Cursos</th>
                <th style="width: 8%">Estado</th>
                <th style="width: 10%">Creado por</th>
                <th style="width: 12%">Actualizado</th>
                <th style="width: 12%">Acciones</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-path>
              <tr>
                <td>{{ path.id }}</td>
                <td>
                  <span class="font-mono text-sm font-semibold text-primary">{{ path.code }}</span>
                </td>
                <td>
                  <div class="font-semibold">{{ path.name }}</div>
                </td>
                <td>
                  <div class="text-sm text-600" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ path.description }}
                  </div>
                </td>
                <td>
                  <p-chip 
                    [label]="path.coursesCount + ' curso' + (path.coursesCount !== 1 ? 's' : '')" 
                    icon="pi pi-book"
                    styleClass="text-sm">
                  </p-chip>
                </td>
                <td>
                  <p-tag 
                    [value]="path.isActive ? 'Activo' : 'Inactivo'" 
                    [severity]="path.isActive ? 'success' : 'danger'">
                  </p-tag>
                </td>
                <td>
                  <div class="text-sm" *ngIf="path.createdBy">
                    {{ path.createdBy.firstName }} {{ path.createdBy.lastName }}
                  </div>
                  <div class="text-sm text-500" *ngIf="!path.createdBy">
                    N/A
                  </div>
                </td>
                <td>
                  <div class="text-sm text-600">{{ path.updatedAt }}</div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      pButton 
                      pRipple 
                      icon="pi pi-eye" 
                      class="p-button-rounded p-button-info p-button-text"
                      (click)="viewDetails(path)"
                      pTooltip="Ver detalles"
                      tooltipPosition="top">
                    </button>
                    <button 
                      *ngIf="canEditOrDelete(path)"
                      pButton 
                      pRipple 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-warning p-button-text"
                      (click)="edit(path)"
                      pTooltip="Editar"
                      tooltipPosition="top">
                    </button>
                    <button 
                      *ngIf="canEditOrDelete(path)"
                      pButton 
                      pRipple 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-danger p-button-text"
                      (click)="confirmDelete(path)"
                      pTooltip="Eliminar"
                      tooltipPosition="top">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="9" class="text-center py-6">
                  <div class="flex flex-col items-center gap-3">
                    <i class="pi pi-inbox text-4xl text-400"></i>
                    <p class="text-600">No se encontraron rutas de aprendizaje</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <!-- Dialog de detalles -->
          <p-dialog 
            [(visible)]="detailsDialogVisible" 
            [style]="{ width: '700px' }" 
            header="Detalles de la Ruta de Aprendizaje"
            [modal]="true"
            styleClass="p-fluid">
            <ng-template pTemplate="content">
              <div *ngIf="selectedPath" class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="font-semibold text-900">Nombre:</label>
                    <p class="mt-2">{{ selectedPath.name }}</p>
                  </div>
                  
                  <div>
                    <label class="font-semibold text-900">Código:</label>
                    <p class="mt-2">
                      <span class="font-mono text-primary font-semibold">{{ selectedPath.code }}</span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <label class="font-semibold text-900">Descripción:</label>
                  <p class="mt-2">{{ selectedPath.description }}</p>
                </div>
                
                <div>
                  <label class="font-semibold text-900">Estado:</label>
                  <p class="mt-2">
                    <p-tag 
                      [value]="selectedPath.isActive ? 'Activo' : 'Inactivo'" 
                      [severity]="selectedPath.isActive ? 'success' : 'danger'">
                    </p-tag>
                  </p>
                </div>
                
                <div>
                  <label class="font-semibold text-900">Cursos ({{ selectedPath.courses.length }}):</label>
                  <div class="mt-2 flex flex-col gap-2">
                    <div 
                      *ngFor="let course of selectedPath.courses" 
                      class="flex items-center gap-3 p-3 border-1 surface-border border-round">
                      <img 
                        *ngIf="course.urlLogo" 
                        [src]="course.urlLogo" 
                        [alt]="course.title"
                        class="w-12 h-12 border-round"
                        style="object-fit: cover;">
                      <div class="flex-1">
                        <div class="font-semibold">{{ course.title }}</div>
                        <div class="text-sm text-600">{{ course.code }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="font-semibold text-900">Creado por:</label>
                    <p class="mt-2" *ngIf="selectedPath.createdBy">
                      {{ selectedPath.createdBy.firstName }} {{ selectedPath.createdBy.lastName }}
                    </p>
                    <p class="mt-2 text-500" *ngIf="!selectedPath.createdBy">N/A</p>
                  </div>
                  
                  <div>
                    <label class="font-semibold text-900">Fecha de creación:</label>
                    <p class="mt-2">{{ selectedPath.createdAt }}</p>
                  </div>
                  
                  <div>
                    <label class="font-semibold text-900">Última actualización:</label>
                    <p class="mt-2">{{ selectedPath.updatedAt }}</p>
                  </div>
                </div>
              </div>
            </ng-template>
            
            <ng-template pTemplate="footer">
              <button 
                pButton 
                pRipple 
                label="Cerrar" 
                icon="pi pi-times" 
                class="p-button-text"
                (click)="detailsDialogVisible = false">
              </button>
            </ng-template>
          </p-dialog>
        </div>
      </div>
    </div>
  `
})
export class LearningPathsListComponent implements OnInit {
  learningPaths: LearningPath[] = [];
  filteredPaths: LearningPath[] = [];
  loading = false;
  searchTerm = '';
  detailsDialogVisible = false;
  selectedPath: LearningPath | null = null;
  currentUser: User | null = null;

  get totalRecords(): number {
    return this.filteredPaths.length;
  }

  get isAdmin(): boolean {
    return this.currentUser?.typeUser === 'admin';
  }

  canEditOrDelete(path: LearningPath): boolean {
    // Admin puede editar/eliminar todas las rutas
    if (this.isAdmin) {
      return true;
    }
    // Profesor solo puede editar/eliminar sus propias rutas
    return path.createdBy?.id === this.currentUser?.id;
  }

  constructor(
    private learningPathService: LearningPathService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadLearningPaths();
  }

  loadLearningPaths(): void {
    this.loading = true;
    this.learningPathService.getAll().subscribe({
      next: (response) => {
        this.learningPaths = response.data;
        this.filteredPaths = [...this.learningPaths];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar rutas de aprendizaje:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las rutas de aprendizaje'
        });
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPaths = [...this.learningPaths];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPaths = this.learningPaths.filter(path =>
      path.name.toLowerCase().includes(term) ||
      path.description.toLowerCase().includes(term)
    );
  }

  createNew(): void {
    this.router.navigate(['/admin/learning-paths/new']);
  }

  viewDetails(path: LearningPath): void {
    this.selectedPath = path;
    this.detailsDialogVisible = true;
  }

  edit(path: LearningPath): void {
    this.router.navigate(['/admin/learning-paths/edit', path.id]);
  }

  confirmDelete(path: LearningPath): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar la ruta "${path.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletePath(path.id);
      }
    });
  }

  deletePath(id: number): void {
    this.learningPathService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ruta de aprendizaje eliminada correctamente'
        });
        this.loadLearningPaths();
      },
      error: (error) => {
        console.error('Error al eliminar ruta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la ruta de aprendizaje'
        });
      }
    });
  }
}
