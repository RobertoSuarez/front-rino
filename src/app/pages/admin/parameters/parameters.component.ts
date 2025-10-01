import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ApiKeyService, ApiKey, ApiKeyHistory } from '../../../core/services/api-key.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
    PasswordModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="grid grid-cols-12 gap-4">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <!-- Header -->
      <div class="col-span-12">
        <h1 class="text-3xl font-bold text-900 mb-2">Parámetros del Sistema</h1>
        <p class="text-600">Gestiona las configuraciones y API Keys de la plataforma</p>
      </div>

      <!-- API Key de Gemini -->
      <div class="col-span-12">
        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 pt-6 flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold text-900 mb-1">API Key de Gemini</h2>
                <p class="text-600">Configura la clave de API para el servicio de Gemini AI</p>
              </div>
              <button 
                pButton 
                label="Nueva API Key" 
                icon="pi pi-plus" 
                class="p-button-success"
                (click)="showCreateDialog()"
                *ngIf="apiKeys.length === 0">
              </button>
            </div>
          </ng-template>

          <!-- Tabla de API Keys -->
          <p-table 
            [value]="apiKeys" 
            [loading]="loading"
            styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 20%">Nombre</th>
                <th style="width: 25%">Valor</th>
                <th style="width: 20%">Descripción</th>
                <th style="width: 10%">Estado</th>
                <th style="width: 15%">Última Actualización</th>
                <th style="width: 10%">Acciones</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-key>
              <tr>
                <td>
                  <div class="font-semibold">{{ key.keyName }}</div>
                </td>
                <td>
                  <code class="text-sm bg-gray-100 px-2 py-1 border-round">{{ key.maskedValue }}</code>
                </td>
                <td>
                  <div class="text-sm text-600">{{ key.description || 'Sin descripción' }}</div>
                </td>
                <td>
                  <p-tag 
                    [value]="key.isActive ? 'Activa' : 'Inactiva'" 
                    [severity]="key.isActive ? 'success' : 'danger'">
                  </p-tag>
                </td>
                <td>
                  <div class="text-sm">
                    <div>{{ key.updatedAt }}</div>
                    <div class="text-xs text-500" *ngIf="key.updatedBy">
                      por {{ key.updatedBy.firstName }} {{ key.updatedBy.lastName }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      pButton 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text p-button-warning"
                      (click)="showUpdateDialog(key)"
                      pTooltip="Editar"
                      tooltipPosition="top">
                    </button>
                    <button 
                      pButton 
                      [icon]="key.isActive ? 'pi pi-eye-slash' : 'pi pi-eye'" 
                      class="p-button-rounded p-button-text p-button-info"
                      (click)="toggleActive(key)"
                      [pTooltip]="key.isActive ? 'Desactivar' : 'Activar'"
                      tooltipPosition="top">
                    </button>
                    <button 
                      pButton 
                      icon="pi pi-history" 
                      class="p-button-rounded p-button-text p-button-secondary"
                      (click)="showHistory(key)"
                      pTooltip="Ver Historial"
                      tooltipPosition="top">
                    </button>
                    <button 
                      pButton 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-text p-button-danger"
                      (click)="confirmDelete(key)"
                      pTooltip="Eliminar"
                      tooltipPosition="top">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center py-8">
                  <div class="flex flex-col items-center gap-3">
                    <i class="pi pi-key text-6xl text-400"></i>
                    <p class="text-600 text-lg">No hay API Keys configuradas</p>
                    <button 
                      pButton 
                      label="Crear Primera API Key" 
                      icon="pi pi-plus" 
                      class="p-button-success"
                      (click)="showCreateDialog()">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>

      <!-- Diálogo Crear/Editar API Key -->
      <p-dialog 
        [(visible)]="dialogVisible" 
        [header]="isEditMode ? 'Actualizar API Key' : 'Nueva API Key'"
        [modal]="true"
        [style]="{ width: '600px' }"
        styleClass="p-fluid">
        <ng-template pTemplate="content">
          <div class="flex flex-col gap-4">
            <div *ngIf="!isEditMode">
              <label for="keyName" class="block text-900 font-medium mb-2">
                Nombre de la API Key <span class="text-red-500">*</span>
              </label>
              <input 
                id="keyName"
                type="text" 
                pInputText 
                [(ngModel)]="formData.keyName"
                placeholder="Ej: GEMINI_API_KEY"
                class="w-full" />
            </div>

            <div>
              <label for="keyValue" class="block text-900 font-medium mb-2">
                Valor de la API Key <span class="text-red-500">*</span>
              </label>
              <p-password 
                [(ngModel)]="formData.keyValue"
                [toggleMask]="true"
                [feedback]="false"
                placeholder="Ingresa la API Key"
                styleClass="w-full"
                inputStyleClass="w-full">
              </p-password>
              <small class="text-500">La API Key será encriptada antes de guardarse</small>
            </div>

            <div>
              <label for="description" class="block text-900 font-medium mb-2">
                Descripción
              </label>
              <textarea 
                id="description"
                pInputTextarea 
                [(ngModel)]="formData.description"
                rows="3"
                placeholder="Descripción opcional de la API Key"
                class="w-full">
              </textarea>
            </div>

            <div class="bg-blue-50 border-1 border-blue-200 border-round p-3">
              <div class="flex gap-2">
                <i class="pi pi-info-circle text-blue-500 mt-1"></i>
                <div class="text-sm text-blue-900">
                  <p class="font-semibold mb-1">Información de Seguridad</p>
                  <ul class="list-disc ml-4">
                    <li>La API Key se almacenará encriptada en la base de datos</li>
                    <li>Se registrará quién creó/modificó la key y desde qué IP</li>
                    <li>Solo se mostrará una versión enmascarada de la key</li>
                  </ul>
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
            (click)="dialogVisible = false"
            [disabled]="saving">
          </button>
          <button 
            pButton 
            [label]="isEditMode ? 'Actualizar' : 'Crear'" 
            icon="pi pi-check" 
            class="p-button-success"
            (click)="save()"
            [disabled]="!formData.keyValue || (!isEditMode && !formData.keyName) || saving"
            [loading]="saving">
          </button>
        </ng-template>
      </p-dialog>

      <!-- Diálogo de Historial -->
      <p-dialog 
        [(visible)]="historyDialogVisible" 
        header="Historial de Cambios"
        [modal]="true"
        [style]="{ width: '800px' }">
        <ng-template pTemplate="content">
          <p-table 
            [value]="history" 
            [loading]="loadingHistory"
            styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Acción</th>
                <th>Valor Anterior</th>
                <th>Valor Nuevo</th>
                <th>Usuario</th>
                <th>IP</th>
                <th>Fecha</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
              <tr>
                <td>
                  <p-tag 
                    [value]="item.action" 
                    [severity]="getActionSeverity(item.action)">
                  </p-tag>
                </td>
                <td>
                  <code class="text-xs" *ngIf="item.previousValue">{{ item.previousValue }}</code>
                  <span class="text-500" *ngIf="!item.previousValue">-</span>
                </td>
                <td>
                  <code class="text-xs" *ngIf="item.newValue">{{ item.newValue }}</code>
                  <span class="text-500" *ngIf="!item.newValue">-</span>
                </td>
                <td>
                  <div class="text-sm">
                    {{ item.performedBy.firstName }} {{ item.performedBy.lastName }}
                  </div>
                </td>
                <td>
                  <code class="text-xs">{{ item.ipAddress }}</code>
                </td>
                <td>
                  <div class="text-sm">{{ item.createdAt }}</div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center py-4 text-600">
                  No hay historial disponible
                </td>
              </tr>
            </ng-template>
          </p-table>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class ParametersComponent implements OnInit {
  apiKeys: ApiKey[] = [];
  history: ApiKeyHistory[] = [];
  loading = false;
  loadingHistory = false;
  saving = false;
  dialogVisible = false;
  historyDialogVisible = false;
  isEditMode = false;
  selectedKey: ApiKey | null = null;

  formData = {
    keyName: '',
    keyValue: '',
    description: ''
  };

  constructor(
    private apiKeyService: ApiKeyService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadApiKeys();
  }

  loadApiKeys(): void {
    this.loading = true;
    this.apiKeyService.getAll().subscribe({
      next: (response) => {
        this.apiKeys = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar API Keys:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las API Keys'
        });
        this.loading = false;
      }
    });
  }

  showCreateDialog(): void {
    this.isEditMode = false;
    this.selectedKey = null;
    this.formData = {
      keyName: 'GEMINI_API_KEY',
      keyValue: '',
      description: 'API Key para el servicio de Gemini AI'
    };
    this.dialogVisible = true;
  }

  showUpdateDialog(key: ApiKey): void {
    this.isEditMode = true;
    this.selectedKey = key;
    this.formData = {
      keyName: key.keyName,
      keyValue: '',
      description: key.description
    };
    this.dialogVisible = true;
  }

  save(): void {
    this.saving = true;

    const operation = this.isEditMode
      ? this.apiKeyService.update(this.selectedKey!.id, this.formData.keyValue, this.formData.description)
      : this.apiKeyService.create(this.formData.keyName, this.formData.keyValue, this.formData.description);

    operation.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.data.message || `API Key ${this.isEditMode ? 'actualizada' : 'creada'} exitosamente`
        });
        this.dialogVisible = false;
        this.saving = false;
        this.loadApiKeys();
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo guardar la API Key'
        });
        this.saving = false;
      }
    });
  }

  toggleActive(key: ApiKey): void {
    this.apiKeyService.toggleActive(key.id).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: response.data.message
        });
        this.loadApiKeys();
      },
      error: (error) => {
        console.error('Error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cambiar el estado'
        });
      }
    });
  }

  showHistory(key: ApiKey): void {
    this.loadingHistory = true;
    this.historyDialogVisible = true;
    this.apiKeyService.getHistory(key.id).subscribe({
      next: (response) => {
        this.history = response.data;
        this.loadingHistory = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el historial'
        });
        this.loadingHistory = false;
      }
    });
  }

  confirmDelete(key: ApiKey): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar la API Key "${key.keyName}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.delete(key);
      }
    });
  }

  delete(key: ApiKey): void {
    this.apiKeyService.delete(key.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'API Key eliminada correctamente'
        });
        this.loadApiKeys();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la API Key'
        });
      }
    });
  }

  getActionSeverity(action: string): string {
    const severities: { [key: string]: string } = {
      'CREATE': 'success',
      'UPDATE': 'info',
      'DELETE': 'danger',
      'ACTIVATE': 'success',
      'DEACTIVATE': 'warning'
    };
    return severities[action] || 'secondary';
  }
}
