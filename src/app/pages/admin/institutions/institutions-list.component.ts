import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ConfirmationService, MessageService } from 'primeng/api';

import { InstitutionService, ApiInstitutionResponse, ApiInstitutionSingleResponse } from '../../../core/services/institution.service';
import { Institution, CreateInstitutionDto, UpdateInstitutionDto } from '../../../core/models/institution.interface';

@Component({
  selector: 'app-institutions-list',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './institutions-list.component.html'
})
export class InstitutionsListComponent implements OnInit {
  institutions: Institution[] = [];
  institution: Partial<Institution> = {};
  institutionDialog = false;
  loading = false;
  submitted = false;
  editMode = false;
  uploadingImage = false;
  selectedFile: File | null = null;

  constructor(
    private institutionService: InstitutionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    console.log('InstitutionsListComponent constructor llamado');
  }

  ngOnInit(): void {
    console.log('InstitutionsListComponent inicializado');
    this.loadInstitutions();
  }

  loadInstitutions(): void {
    this.loading = true;
    this.institutionService.getAll().subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        
        // El interceptor del backend envuelve la respuesta, así que necesitamos extraer los datos correctamente
        let institutions: Institution[] = [];
        
        if (response.data) {
          // Si response.data tiene otra propiedad data (respuesta anidada)
          if (response.data.data && Array.isArray(response.data.data)) {
            institutions = response.data.data;
          } 
          // Si response.data es directamente el array
          else if (Array.isArray(response.data)) {
            institutions = response.data;
          }
          // Si response.data es un objeto con las instituciones
          else if (typeof response.data === 'object') {
            console.warn('Estructura de respuesta inesperada:', response.data);
          }
        }
        
        this.institutions = institutions;
        console.log('Instituciones cargadas:', this.institutions.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar instituciones:', error);
        let errorMessage = 'No se pudieron cargar las instituciones';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 401) {
          errorMessage = 'No tienes permisos para ver instituciones';
        } else if (error.status === 403) {
          errorMessage = 'Acceso denegado';
        } else if (error.status >= 500) {
          errorMessage = 'Error interno del servidor';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar instituciones',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    console.log('openNew() llamado');
    this.institution = {
      name: '',
      description: '',
      logoUrl: '',
      status: 'active'
    };
    this.submitted = false;
    this.editMode = false;
    this.institutionDialog = true;
    console.log('institutionDialog:', this.institutionDialog);
  }

  editInstitution(institution: Institution): void {
    this.institution = { ...institution };
    this.editMode = true;
    this.institutionDialog = true;
  }

  hideDialog(): void {
    this.institutionDialog = false;
    this.submitted = false;
    this.selectedFile = null;
    this.uploadingImage = false;
  }

  saveInstitution(): void {
    this.submitted = true;

    if (!this.institution.name?.trim()) {
      return;
    }

    if (this.editMode && this.institution.id) {
      // Actualizar
      const updateData: UpdateInstitutionDto = {
        name: this.institution.name,
        description: this.institution.description,
        logoUrl: this.institution.logoUrl,
        status: this.institution.status
      };

      this.institutionService.update(this.institution.id, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Institución actualizada correctamente'
          });
          this.loadInstitutions();
          this.hideDialog();
        },
        error: (error) => {
          console.error('Error al actualizar institución:', error);
          let errorMessage = 'No se pudo actualizar la institución';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.status === 400) {
            errorMessage = 'Datos de institución inválidos';
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para actualizar instituciones';
          } else if (error.status === 403) {
            errorMessage = 'Acceso denegado';
          } else if (error.status === 404) {
            errorMessage = 'Institución no encontrada';
          } else if (error.status >= 500) {
            errorMessage = 'Error interno del servidor';
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error al actualizar institución',
            detail: errorMessage
          });
        }
      });
    } else {
      // Crear
      const createData: CreateInstitutionDto = {
        name: this.institution.name,
        description: this.institution.description,
        logoUrl: this.institution.logoUrl
      };

      this.institutionService.create(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Institución creada correctamente'
          });
          this.loadInstitutions();
          this.hideDialog();
        },
        error: (error) => {
          console.error('Error al crear institución:', error);
          let errorMessage = 'No se pudo crear la institución';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.status === 400) {
            errorMessage = 'Datos de institución inválidos';
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para crear instituciones';
          } else if (error.status === 403) {
            errorMessage = 'Acceso denegado';
          } else if (error.status >= 500) {
            errorMessage = 'Error interno del servidor';
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Error al crear institución',
            detail: errorMessage
          });
        }
      });
    }
  }

  deleteInstitution(institution: Institution): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar la institución "${institution.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.institutionService.delete(institution.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Institución eliminada correctamente'
            });
            this.loadInstitutions();
          },
          error: (error) => {
            console.error('Error al eliminar institución:', error);
            let errorMessage = 'No se pudo eliminar la institución';

            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (error.status === 400) {
              errorMessage = 'No se puede eliminar esta institución';
            } else if (error.status === 401) {
              errorMessage = 'No tienes permisos para eliminar instituciones';
            } else if (error.status === 403) {
              errorMessage = 'Acceso denegado';
            } else if (error.status === 404) {
              errorMessage = 'Institución no encontrada';
            } else if (error.status >= 500) {
              errorMessage = 'Error interno del servidor';
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Error al eliminar institución',
              detail: errorMessage
            });
          }
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El archivo es demasiado grande. Máximo 5MB.'
      });
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo se permiten archivos de imagen.'
      });
      return;
    }

    this.selectedFile = file;
    this.uploadImage(file);
  }

  uploadImage(file: File): void {
    this.uploadingImage = true;
    this.institutionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response && response.data?.url) {
          this.institution.logoUrl = response.data.url;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Logo subido correctamente'
          });
        }
        this.uploadingImage = false;
      },
      error: (error) => {
        console.error('Error al subir imagen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo subir la imagen'
        });
        this.uploadingImage = false;
        this.selectedFile = null;
      }
    });
  }

  onImageError(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No se pudo cargar la imagen del logo'
    });
  }
}
