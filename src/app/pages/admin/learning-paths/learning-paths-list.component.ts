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
    <div class="card bg-white dark:bg-gray-900 border-none sm:rounded-3xl">
      <p-toast></p-toast>
      <p-confirmDialog [style]="{ width: '450px' }"></p-confirmDialog>

      <!-- Header Controls -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6 pt-4 px-4 sm:px-0">
          <div class="flex flex-col gap-2 w-full lg:w-1/3">
              <div class="font-semibold text-2xl text-gray-800 dark:text-white">Rutas de Aprendizaje</div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Gestiona las rutas de aprendizaje de la plataforma</p>
          </div>
          
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <span class="p-input-icon-left w-full sm:w-64 lg:w-72">
                  <i class="pi pi-search"></i>
                  <input pInputText type="text" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Buscar rutas..." class="w-full rounded-xl" />
              </span>

              <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div class="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl flex items-center gap-1 shrink-0 border border-transparent dark:border-gray-700 shadow-inner">
                      <button (click)="viewMode = 'table'" 
                              [class]="viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400 rounded-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg'" 
                              class="px-4 py-2 transition-all duration-300 flex items-center gap-2 font-semibold">
                          <i class="pi pi-list"></i>
                          <span class="hidden sm:inline">Tabla</span>
                      </button>
                      <button (click)="viewMode = 'grid'" 
                              [class]="viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400 rounded-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg'" 
                              class="px-4 py-2 transition-all duration-300 flex items-center gap-2 font-semibold">
                          <i class="pi pi-th-large"></i>
                          <span class="hidden sm:inline">Tarjetas</span>
                      </button>
                  </div>
                  
                  <p-button label="Nueva" icon="pi pi-plus" severity="success" [raised]="true" (click)="createNew()" class="shadow-md hover:shadow-lg transition-all duration-300 shrink-0"></p-button>
              </div>
          </div>
      </div>
      
      @if (viewMode === 'table') {
          <p-table 
            [value]="filteredPaths" 
            [rows]="10"
            [paginator]="true"
            [tableStyle]="{ 'min-width': '60rem' }"
            [loading]="loading"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} rutas"
            [rowsPerPageOptions]="[10, 25, 50]"
            [rowHover]="true"
            [showGridlines]="true">
            
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
                <td class="dark:text-gray-300">{{ path.id }}</td>
                <td>
                  <span class="font-mono text-sm font-semibold text-primary dark:text-emerald-400">{{ path.code }}</span>
                </td>
                <td>
                  <div class="font-semibold dark:text-white">{{ path.name }}</div>
                </td>
                <td>
                  <div class="text-sm text-600 dark:text-gray-400" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ path.description }}
                  </div>
                </td>
                <td>
                  <p-chip 
                    [label]="path.coursesCount + ' curso' + (path.coursesCount !== 1 ? 's' : '')" 
                    icon="pi pi-book"
                    styleClass="text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                  </p-chip>
                </td>
                <td>
                  <p-tag 
                    [value]="path.isActive ? 'Activo' : 'Inactivo'" 
                    [severity]="path.isActive ? 'success' : 'danger'">
                  </p-tag>
                </td>
                <td>
                  <div class="text-sm dark:text-gray-300" *ngIf="path.createdBy">
                    {{ path.createdBy.firstName }} {{ path.createdBy.lastName }}
                  </div>
                  <div class="text-sm text-500 dark:text-gray-500" *ngIf="!path.createdBy">
                    N/A
                  </div>
                </td>
                <td>
                  <div class="text-sm text-600 dark:text-gray-400">{{ path.updatedAt }}</div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      pButton 
                      pRipple 
                      icon="pi pi-eye" 
                      class="p-button-rounded p-button-info p-button-text dark:text-blue-400"
                      (click)="viewDetails(path)"
                      pTooltip="Ver detalles"
                      tooltipPosition="top">
                    </button>
                    <button 
                      *ngIf="canEditOrDelete(path)"
                      pButton 
                      pRipple 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-warning p-button-text dark:text-yellow-400"
                      (click)="edit(path)"
                      pTooltip="Editar"
                      tooltipPosition="top">
                    </button>
                    <button 
                      *ngIf="canEditOrDelete(path)"
                      pButton 
                      pRipple 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-danger p-button-text dark:text-red-400"
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
                    <i class="pi pi-inbox text-4xl text-400 dark:text-gray-500"></i>
                    <p class="text-600 dark:text-gray-400">No se encontraron rutas de aprendizaje</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
      }

      @if (viewMode === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (path of filteredPaths; track path.id) {
                  <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 hover:border-emerald-100 dark:hover:border-emerald-800 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
                      
                      <div class="p-6 flex-1 flex flex-col relative">
                          <!-- Background subtle gradient -->
                          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-transparent rounded-bl-full -z-10 opacity-70"></div>
                          
                          <div class="flex justify-between items-start mb-4 gap-2">
                              <span class="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">{{ path.code }}</span>
                              <p-tag [value]="path.isActive ? 'Activo' : 'Inactivo'" [severity]="path.isActive ? 'success' : 'danger'" styleClass="font-bold"></p-tag>
                          </div>
                          
                          <h3 class="text-xl font-extrabold text-gray-800 dark:text-white mb-3 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ path.name }}</h3>
                          <p class="text-gray-500 dark:text-gray-400 mb-6 flex-1 text-sm leading-relaxed line-clamp-2">{{ path.description || 'Sin descripción' }}</p>
                          
                          <div class="flex items-center gap-3 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-5">
                              <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600">
                                  <i class="pi pi-book text-gray-500 dark:text-gray-400"></i>
                                  <span class="dark:text-gray-300">{{ path.coursesCount }} Cursos</span>
                              </div>
                              <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600">
                                  <i class="pi pi-user text-gray-500 dark:text-gray-400"></i>
                                  <span class="dark:text-gray-300">{{ path.createdBy ? path.createdBy.firstName + ' ' + path.createdBy.lastName : 'N/A' }}</span>
                              </div>
                          </div>
                          
                          <div class="border-t border-gray-100 dark:border-gray-700 w-full pt-4"></div>
                          
                          <div class="flex items-center justify-between gap-2">
                              <div class="flex gap-1 -ml-2">
                                  <button pButton pRipple icon="pi pi-eye" class="p-button-rounded p-button-info p-button-text dark:text-blue-400" (click)="viewDetails(path)" pTooltip="Ver detalles" tooltipPosition="top"></button>
                                  <button *ngIf="canEditOrDelete(path)" pButton pRipple icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-text dark:text-yellow-400" (click)="edit(path)" pTooltip="Editar" tooltipPosition="top"></button>
                                  <button *ngIf="canEditOrDelete(path)" pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text dark:text-red-400" (click)="confirmDelete(path)" pTooltip="Eliminar" tooltipPosition="top"></button>
                              </div>
                          </div>
                      </div>
                  </div>
              }
          </div>
          
          @if (filteredPaths.length === 0) {
              <div class="w-full py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-600 mt-6">
                  <i class="pi pi-map text-6xl text-gray-300 dark:text-gray-600 mb-6 block"></i>
                  <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No se encontraron rutas</h3>
                  <p class="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">Prueba ajustando los filtros de búsqueda o comienza a estructurar nuevas rutas de aprendizaje.</p>
                  <p-button label="Nueva Ruta" icon="pi pi-plus" [raised]="true" severity="success" size="large" (click)="createNew()"></p-button>
              </div>
          }
      }

          <!-- Dialog de detalles -->
          <p-dialog 
            [(visible)]="detailsDialogVisible" 
            [style]="{ width: '700px' }" 
            header="Detalles de la Ruta de Aprendizaje"
            [modal]="true"
            styleClass="p-fluid dark:bg-gray-800">
            <ng-template pTemplate="content">
              <div *ngIf="selectedPath" class="flex flex-col gap-4 text-gray-800 dark:text-gray-200">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="font-semibold text-900 dark:text-gray-100">Nombre:</label>
                    <p class="mt-2">{{ selectedPath.name }}</p>
                  </div>
                  
                  <div>
                    <label class="font-semibold text-900 dark:text-gray-100">Código:</label>
                    <p class="mt-2">
                      <span class="font-mono text-primary dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/40 px-2 py-1 rounded">{{ selectedPath.code }}</span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <label class="font-semibold text-900 dark:text-gray-100">Descripción:</label>
                  <p class="mt-2 text-gray-600 dark:text-gray-400">{{ selectedPath.description }}</p>
                </div>
                
                <div>
                  <label class="font-semibold text-900 dark:text-gray-100">Estado:</label>
                  <p class="mt-2">
                    <p-tag 
                      [value]="selectedPath.isActive ? 'Activo' : 'Inactivo'" 
                      [severity]="selectedPath.isActive ? 'success' : 'danger'">
                    </p-tag>
                  </p>
                </div>
                
                <div>
                  <label class="font-semibold text-900 dark:text-gray-100">Cursos ({{ selectedPath.courses.length }}):</label>
                  <div class="mt-2 flex flex-col gap-2">
                    <div 
                      *ngFor="let course of selectedPath.courses" 
                      class="flex items-center gap-3 p-3 border-1 surface-border dark:border-gray-700 border-round dark:bg-gray-800 rounded-xl">
                      <img 
                        *ngIf="course.urlLogo" 
                        [src]="course.urlLogo" 
                        [alt]="course.title"
                        class="w-12 h-12 border-round rounded-lg"
                        style="object-fit: cover;">
                      <div class="flex-1">
                        <div class="font-semibold dark:text-white">{{ course.title }}</div>
                        <div class="text-sm text-600 dark:text-gray-400">{{ course.code }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                  <div>
                    <label class="font-semibold text-900 dark:text-gray-100">Creado por:</label>
                    <p class="mt-2" *ngIf="selectedPath.createdBy">
                      {{ selectedPath.createdBy.firstName }} {{ selectedPath.createdBy.lastName }}
                    </p>
                    <p class="mt-2 text-500 dark:text-gray-500" *ngIf="!selectedPath.createdBy">N/A</p>
                  </div>
                  
                  <div>
                    <label class="font-semibold text-900 dark:text-gray-100">Fecha de creación:</label>
                    <p class="mt-2 text-gray-600 dark:text-gray-400">{{ selectedPath.createdAt }}</p>
                  </div>
                  
                  <div>
                    <label class="font-semibold text-900 dark:text-gray-100">Última actualización:</label>
                    <p class="mt-2 text-gray-600 dark:text-gray-400">{{ selectedPath.updatedAt }}</p>
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
                class="p-button-text dark:text-gray-300 pointer-events-auto"
                (click)="detailsDialogVisible = false">
              </button>
            </ng-template>
          </p-dialog>
    </div>
  `
})
export class LearningPathsListComponent implements OnInit {
  learningPaths: LearningPath[] = [];
  filteredPaths: LearningPath[] = [];
  viewMode: 'table' | 'grid' = 'table';
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
  ) { }

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
