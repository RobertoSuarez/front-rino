import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TumisShopService, TumisOffer } from '../../../core/services/tumis-shop.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-tumis-shop-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <p-dialog 
      [(visible)]="visible" 
      [header]="'Tienda de Tumis (Vidas)'"
      [modal]="true"
      [appendTo]="'body'"
      [baseZIndex]="10000"
      [style]="{ width: '90vw', maxWidth: '900px' }"
      [contentStyle]="{ maxHeight: '80vh', overflow: 'auto' }"
      (onHide)="onHide()">
      
      <div class="space-y-6 p-4">
        <!-- Información del usuario -->
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm opacity-90">Tu Mullu disponible</p>
              <p class="text-3xl font-bold">{{ userMultu }}</p>
            </div>
            <div class="text-5xl">$</div>
          </div>
        </div>

        <!-- Ofertas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Estado de carga -->
          <div *ngIf="offers.length === 0 && !isLoadingOffers" class="col-span-full text-center py-8">
            <p class="text-slate-600 dark:text-slate-400">No hay ofertas disponibles</p>
          </div>

          <!-- Skeletons de carga -->
          <div *ngIf="isLoadingOffers" class="col-span-full">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let i of [1,2,3]" class="bg-slate-200 dark:bg-slate-700 rounded-lg h-64 animate-pulse"></div>
            </div>
          </div>

          <!-- Ofertas disponibles -->
          <div *ngFor="let offer of offers; trackBy: trackByOfferId" 
               [class.ring-4]="offer.isPromotion"
               [class.ring-yellow-400]="offer.isPromotion"
               class="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
               [ngClass]="offer.isPromotion ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900' : 'bg-white dark:bg-slate-800'">
            
            <!-- Etiqueta de promoción -->
            <div *ngIf="offer.isPromotion" class="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
              {{ offer.promotionLabel }}
            </div>

            <!-- Contenido de la oferta -->
            <div class="p-4 pt-8" [ngClass]="offer.isPromotion ? 'pt-10' : ''">
              <!-- Cantidad de Tumis -->
              <div class="text-center mb-4">
                <p class="text-4xl font-bold text-red-600 dark:text-red-400">❤️ {{ offer.tumisAmount }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">{{ offer.description }}</p>
              </div>

              <!-- Precio -->
              <div class="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mb-4 text-center">
                <p class="text-xs text-slate-600 dark:text-slate-400">Costo</p>
                <div class="flex items-center justify-center gap-2">
                  <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ offer.mulluCost }}</span>
                  <span class="text-2xl">$</span>
                </div>
                <p *ngIf="offer.discount" class="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                  ¡Ahorras {{ offer.discount }}%!
                </p>
              </div>

              <!-- Botón de compra -->
              <button 
                (click)="buyOffer(offer)"
                [disabled]="userMultu < offer.mulluCost || isLoading"
                [ngClass]="userMultu < offer.mulluCost ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'"
                class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isLoading">Comprar</span>
                <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
                  <i class="pi pi-spin pi-spinner"></i>
                  Comprando...
                </span>
              </button>

              <!-- Mensaje de Mullu insuficiente -->
              <p *ngIf="userMultu < offer.mulluCost" class="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                Necesitas {{ offer.mulluCost - userMultu }} Mullu más
              </p>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 rounded">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <i class="pi pi-info-circle mr-2"></i>
            <strong>Nota:</strong> Los Tumis se añadirán inmediatamente a tu cuenta. Todas las transacciones se registran en tu historial.
          </p>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button 
          pButton 
          type="button" 
          label="Cerrar" 
          (click)="visible = false"
          class="p-button-secondary">
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep {
      .p-dialog {
        z-index: 10000 !important;
      }
      
      .p-dialog-mask {
        z-index: 9999 !important;
      }
      
      .p-dialog-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      .p-dialog-header-title {
        font-weight: bold;
      }
      
      .p-dialog-content {
        max-height: 80vh;
        overflow-y: auto;
      }
    }
  `]
})
export class TumisShopModalComponent implements OnInit {
  @Output() onBuySuccess = new EventEmitter<void>();

  visible: boolean = false;
  offers: TumisOffer[] = [];
  userMultu: number = 0;
  isLoading: boolean = false;
  isLoadingOffers: boolean = false;

  constructor(
    private tumisShopService: TumisShopService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoadingOffers = true;
    this.tumisShopService.getOffers().subscribe({
      next: (response) => {
        this.isLoadingOffers = false;
        if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
          this.offers = response.data;
          console.log('Ofertas cargadas:', this.offers);
        } else {
          console.warn('Respuesta de ofertas inválida:', response);
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se pudieron cargar todas las ofertas'
          });
        }
      },
      error: (error) => {
        this.isLoadingOffers = false;
        console.error('Error al cargar ofertas', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ofertas'
        });
      }
    });
  }

  openModal(): void {
    this.loadUserBalance();
    this.visible = true;
  }

  loadUserBalance(): void {
    this.userService.getUserIndicators().subscribe({
      next: (response) => {
        if (response.data) {
          this.userMultu = response.data.mullu;
        }
      },
      error: (error) => {
        console.error('Error al cargar balance', error);
      }
    });
  }

  buyOffer(offer: TumisOffer): void {
    console.log('Comprando oferta:', offer);
    
    if (this.userMultu < offer.mulluCost) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Mullu insuficiente',
        detail: `Necesitas ${offer.mulluCost - this.userMultu} Mullu más`
      });
      return;
    }

    this.isLoading = true;
    const request = { offerId: offer.id };
    console.log('Enviando request:', request);
    
    this.tumisShopService.buyTumis(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        // El interceptor envuelve la respuesta en ApiResponse con statusCode y message
        if (response.statusCode === 200 && response.data) {
          const transactionData = response.data;
          // Actualizar balance local
          this.userMultu = transactionData.userBalance.mullu;

          // Mostrar mensaje de éxito
          this.messageService.add({
            severity: 'success',
            summary: '¡Compra exitosa!',
            detail: `Recibiste ${offer.tumisAmount} Tumis. Mullu restante: ${transactionData.userBalance.mullu}`,
            life: 3000
          });

          // Emitir evento para actualizar indicadores
          this.onBuySuccess.emit();

          // Cerrar modal después de 2 segundos
          setTimeout(() => {
            this.visible = false;
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Respuesta inválida del servidor'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Error al comprar Tumis';
        this.messageService.add({
          severity: 'error',
          summary: 'Error en la compra',
          detail: errorMessage
        });
      }
    });
  }

  onHide(): void {
    // Limpiar estado si es necesario
  }

  trackByOfferId(index: number, offer: TumisOffer): number {
    return offer.id;
  }
}
