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
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AvatarModule } from 'primeng/avatar';
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
    ChipModule,
    BreadcrumbModule,
    AvatarModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './learning-paths-list.component.html',
  styleUrl: './learning-paths-list.component.css'
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

  breadcrumbItems: any[] = [];
  breadcrumbHome = { label: 'Panel principal', icon: 'pi pi-home', routerLink: '/dashboard' };

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

    this.breadcrumbItems = [
      { label: 'Administración' },
      { label: 'Rutas de Aprendizaje' }
    ];

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
