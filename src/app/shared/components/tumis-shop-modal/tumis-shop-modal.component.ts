import { Component, OnInit, computed, inject, signal, output, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TumisOffer, TumisShopService } from '../../../core/services/tumis-shop.service';
import { UserService } from '../../../core/services/user.service';


@Component({
  selector: 'app-tumis-shop-modal',
  standalone: true,
  imports: [DialogModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <p-dialog
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      [modal]="true"
      [appendTo]="'body'"
      [baseZIndex]="10000"
      [dismissableMask]="true"
      [showHeader]="false"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: 'min(95vw, 960px)' }"
      [contentStyle]="{ padding: '0', overflow: 'hidden' }"
      styleClass="tumis-shop-dialog"
      (onHide)="onHide()"
    >
      <div class="shop-shell">
        <!-- Botón Cerrar Absoluto -->
        <button type="button" class="close-action-btn" (click)="visible.set(false)" aria-label="Cerrar">
          <i class="pi pi-times"></i>
        </button>

        <header class="shop-header">
          <div class="shop-brand">
            <div class="shop-brand-icon">
              <img src="assets/elementos/corazon_de_tumi.png" alt="Tumis" class="w-8 h-8 object-contain">
            </div>
            <div>
              <h2 class="text-2xl font-black text-slate-800 dark:text-white">Tienda de Tumis</h2>
              <p class="text-slate-500 dark:text-slate-400 font-medium font-outfit">Recupera tus vidas para seguir aprendiendo</p>
            </div>
          </div>

          <div class="shop-header-right">
            <div class="balance-block">
              <span class="balance-label">MI SALDO</span>
              <div class="balance-pill-premium">
                <img src="assets/elementos/mullu.png" alt="Mullu" class="w-6 h-6 object-contain" />
                <span class="value">{{ formatNumber(userMullu()) }}</span>
                <span class="unit">Mullu</span>
              </div>
            </div>
          </div>
        </header>

        <div class="shop-body">
          <section class="shop-content">
            <div class="section-title">
                <i class="pi pi-bolt text-amber-500"></i>
                <span>Paquetes de Vidas</span>
            </div>

            @if (isLoadingOffers()) {
              <div class="offer-grid">
                @for (item of [1, 2, 3]; track $index) {
                  <div class="offer-card-skeleton"></div>
                }
              </div>
            } @else if (displayedOffers().length === 0) {
              <div class="empty-shop-state">
                <i class="pi pi-search text-4xl mb-2 opacity-20"></i>
                <p>No hay ofertas disponibles en este momento.</p>
              </div>
            } @else {
              <div class="offer-grid">
                @for (offer of displayedOffers(); track offer.id; let i = $index) {
                  @let isFeatured = isFeaturedOffer(offer, i);
                  @let badge = getBadgeText(offer, i);
                  @let desc = getOfferDescription(offer, i);
                  @let oldPrice = getOriginalCost(offer);

                  <article
                    class="gamified-card"
                    [class.featured]="isFeatured"
                    [style.--stagger]="i"
                  >
                    @if (badge) {
                      <div class="card-badge" [class.badge-featured]="isFeatured">
                        {{ badge }}
                      </div>
                    }

                    <div class="card-visual">
                        <div class="blob-bg"></div>
                        <img src="assets/elementos/corazon_de_tumi.png" alt="Vidas" class="main-icon">
                        @if (offer.tumisAmount > 1) {
                            <div class="amount-badge">x{{ offer.tumisAmount }}</div>
                        }
                    </div>

                    <div class="card-info">
                        <h4 class="card-title">{{ offer.tumisAmount }} {{ offer.tumisAmount === 1 ? 'Vida' : 'Vidas' }}</h4>
                        <p class="card-desc">{{ desc }}</p>
                    </div>

                    <div class="card-footer">
                        <div class="price-tag">
                            @if (oldPrice) {
                                <span class="old-price">{{ formatNumber(oldPrice) }}</span>
                            }
                            <div class="current-price">
                                <span class="num">{{ formatNumber(offer.mulluCost) }}</span>
                                <img src="assets/elementos/mullu.png" alt="Mullu" class="w-4 h-4">
                            </div>
                        </div>

                        <button
                          type="button"
                          class="buy-button"
                          [class.buy-button-featured]="isFeatured"
                          [disabled]="userMullu() < offer.mulluCost || isLoading()"
                          (click)="buyOffer(offer)"
                        >
                          @if (!isLoading()) {
                            <span class="flex items-center justify-center gap-2">
                                {{ isFeatured ? '¡LO QUIERO!' : 'COMPRAR' }}
                            </span>
                          } @else {
                            <span><i class="pi pi-spin pi-spinner mr-2"></i> Procesando...</span>
                          }
                        </button>

                        @if (userMullu() < offer.mulluCost) {
                          <div class="insufficient-mullu">
                            <i class="pi pi-exclamation-circle text-[10px]"></i>
                            Te faltan {{ formatNumber(offer.mulluCost - userMullu()) }} Mullu
                          </div>
                        }
                    </div>
                  </article>
                }
              </div>
            }
          </section>
        </div>

        <footer class="shop-status-footer">
          <div class="info-note">
            <i class="pi pi-shield-check text-green-500"></i>
            <span>Tus compras se sincronizan al instante en todos tus dispositivos.</span>
          </div>
          <button type="button" class="btn-secondary" (click)="visible.set(false)">
            Entendido
          </button>
        </footer>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      ::ng-deep .tumis-shop-dialog {
        --shop-primary: #10b981;
        --shop-primary-dark: #059669;
        --shop-bg-canvas: #f0f4f8;
        --shop-bg-card: #ffffff;
        --shop-text-main: #1e293b;
        --shop-text-muted: #64748b;
        --shop-border-color: #e2e8f0;
        --shop-accent-red: #ef4444;
        --shop-accent-amber: #f59e0b;
      }

      ::ng-deep .app-dark .tumis-shop-dialog {
        --shop-bg-canvas: #0f172a;
        --shop-bg-card: #1e293b;
        --shop-text-main: #f1f5f9;
        --shop-text-muted: #94a3b8;
        --shop-border-color: #334155;
      }

      :host ::ng-deep .p-dialog-mask {
        backdrop-filter: blur(8px);
        background: rgba(15, 23, 42, 0.6);
      }

      :host ::ng-deep .tumis-shop-dialog.p-dialog {
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: none;
      }

      .shop-shell {
        display: flex;
        flex-direction: column;
        background: var(--shop-bg-canvas);
        min-height: 500px;
        position: relative;
        isolation: isolate;
      }

      .close-action-btn {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: var(--shop-bg-canvas);
        color: var(--shop-text-muted);
        cursor: pointer;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.25);
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);

        &:hover {
            background: #f1f5f9;
            color: #ef4444;
            transform: scale(1.1) rotate(90deg);
        }
        
        &:active {
            transform: scale(0.95);
        }
      }

      .shop-header {
        background: var(--shop-bg-card);
        padding: 2.5rem 6.5rem 2rem 2.5rem; /* Espacio extra a la derecha para el botón flotante */
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid var(--shop-border-color);
      }

      .shop-brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .balance-pill-premium {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--shop-bg-canvas);
        padding: 8px 16px;
        border-radius: 99px;
        border: 2px solid var(--shop-border-color);

        .value {
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--shop-text-main);
        }
        .unit {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--shop-text-muted);
            text-transform: uppercase;
        }
      }

      .shop-body {
        padding: 32px;
        flex: 1;
        overflow-y: auto;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--shop-text-main);
        margin-bottom: 24px;
      }

      .offer-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      .gamified-card {
        background: var(--shop-bg-card);
        border-radius: 24px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        border: 2px solid var(--shop-border-color);
        box-shadow: 0 4px 0 0 var(--shop-border-color);
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        &:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 0 0 var(--shop-border-color);
        }

        &.featured {
            border-color: var(--shop-primary);
            box-shadow: 0 4px 0 0 var(--shop-primary);
            &:hover {
                box-shadow: 0 12px 0 0 var(--shop-primary);
            }
        }
      }

      .card-badge {
        position: absolute;
        top: -12px;
        background: #3b82f6;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        z-index: 10;
        &.badge-featured {
            background: var(--shop-primary);
        }
      }

      .card-visual {
        position: relative;
        margin-bottom: 20px;
        .blob-bg {
            position: absolute;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
            z-index: 0;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .main-icon {
            width: 80px;
            height: 80px;
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
            position: relative;
            z-index: 1;
        }
        .amount-badge {
            position: absolute;
            bottom: 0;
            right: -5px;
            background: white;
            color: #1e293b;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 0.75rem;
            border: 2px solid var(--shop-border-color);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 2;
        }
      }

      .card-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: var(--shop-text-main);
        margin: 0 0 8px;
      }

      .card-desc {
        font-size: 0.875rem;
        color: var(--shop-text-muted);
        line-height: 1.4;
        margin-bottom: 20px;
        height: 3rem;
        display: flex;
        align-items: center;
      }

      .price-tag {
        margin-bottom: 16px;
        .old-price {
            font-size: 0.9rem;
            color: var(--shop-text-muted);
            text-decoration: line-through;
            opacity: 0.6;
        }
        .current-price {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            .num {
                font-size: 2rem;
                font-weight: 900;
                color: var(--shop-text-main);
            }
        }
      }

      .buy-button {
        width: 100%;
        padding: 12px;
        border-radius: 16px;
        border: none;
        background: var(--shop-border-color);
        color: var(--shop-text-main);
        font-weight: 900;
        font-size: 0.9rem;
        cursor: pointer;
        box-shadow: 0 4px 0 0 rgba(0,0,0,0.1);
        transition: all 0.1s;

        &:active:not(:disabled) {
            transform: translateY(2px);
            box-shadow: 0 2px 0 0 rgba(0,0,0,0.1);
        }

        &.buy-button-featured {
            background: var(--shop-primary);
            color: white;
            box-shadow: 0 4px 0 0 var(--shop-primary-dark);
            &:active:not(:disabled) {
                box-shadow: 0 2px 0 0 var(--shop-primary-dark);
            }
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: scale(0.98);
        }
      }

      .insufficient-mullu {
        margin-top: 10px;
        font-size: 10px;
        font-weight: 800;
        color: var(--shop-accent-red);
        text-transform: uppercase;
      }

      .shop-status-footer {
        background: var(--shop-bg-card);
        padding: 24px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 2px solid var(--shop-border-color);

        .info-note {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--shop-text-muted);
        }
      }

      .btn-secondary {
        padding: 10px 24px;
        border-radius: 12px;
        border: 2px solid var(--shop-border-color);
        background: transparent;
        color: var(--shop-text-main);
        font-weight: 800;
        cursor: pointer;
        &:hover {
            background: var(--shop-bg-canvas);
        }
      }

      .offer-card-skeleton {
        height: 350px;
        background: var(--shop-border-color);
        border-radius: 24px;
      }

      .empty-shop-state {
        text-align: center;
        padding: 40px;
        color: var(--shop-text-muted);
      }

      @media (max-width: 900px) {
        .offer-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 600px) {
        .offer-grid { grid-template-columns: 1fr; }
        .shop-header { flex-direction: column; gap: 16px; align-items: flex-start; }
      }
    `
  ]
})
export class TumisShopModalComponent implements OnInit {
  onBuySuccess = output<void>();

  private tumisShopService = inject(TumisShopService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  visible = signal(false);
  offers = signal<TumisOffer[]>([]);
  displayedOffers = computed(() => this.offers().slice(0, 3));
  userMullu = signal(0);
  isLoading = signal(false);
  isLoadingOffers = signal(false);


  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoadingOffers.set(true);
    this.tumisShopService.getOffers().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.isLoadingOffers.set(false);
        if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
          const sortedOffers = [...response.data].sort((a, b) => a.tumisAmount - b.tumisAmount);
          this.offers.set(sortedOffers);
        } else {
          this.offers.set([]);
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se pudieron cargar todas las ofertas'
          });
        }
      },
      error: () => {
        this.isLoadingOffers.set(false);
        this.offers.set([]);
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
    this.visible.set(true);
  }

  loadUserBalance(): void {
    this.userService.getUserIndicators().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        if (response.data) {
          this.userMullu.set(response.data.mullu);
        }
      }
    });
  }

  buyOffer(offer: TumisOffer): void {
    const currentMullu = this.userMullu();
    if (currentMullu < offer.mulluCost) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Mullu insuficiente',
        detail: `Necesitas ${offer.mulluCost - currentMullu} Mullu más`
      });
      return;
    }

    this.isLoading.set(true);
    const request = { offerId: offer.id };

    this.tumisShopService.buyTumis(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.statusCode === 200 && response.data) {
          const transactionData = response.data;
          this.userMullu.set(transactionData.userBalance.mullu);

          this.messageService.add({
            severity: 'success',
            summary: 'Compra exitosa',
            detail: `Recibiste ${offer.tumisAmount} Tumis. Mullu restante: ${transactionData.userBalance.mullu}`,
            life: 3000
          });

          this.onBuySuccess.emit();
          setTimeout(() => {
            this.visible.set(false);
          }, 1300);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Respuesta inválida del servidor'
          });
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'Error al comprar Tumis';
        this.messageService.add({
          severity: 'error',
          summary: 'Error en la compra',
          detail: errorMessage
        });
      }
    });
  }

  isFeaturedOffer(offer: TumisOffer, index: number): boolean {
    if (offer.id === 2 || offer.discount === 20) {
      return true;
    }
    return index === 1 && !this.isSpecialOffer(offer, index);
  }

  isSpecialOffer(offer: TumisOffer, index: number): boolean {
    if (offer.id === 3 || offer.discount === 30) {
      return true;
    }
    if (offer.promotionLabel && /especial/i.test(offer.promotionLabel)) {
      return true;
    }
    return index === 2;
  }

  getBadgeText(offer: TumisOffer, index: number): string | null {
    if (this.isFeaturedOffer(offer, index)) {
      return '¡GRAN PROMOCIÓN!';
    }
    if (this.isSpecialOffer(offer, index)) {
      return 'OFERTA ESPECIAL';
    }
    return null;
  }

  getOfferDescription(offer: TumisOffer, index: number): string {
    if (offer.tumisAmount === 1) {
      return 'Recuperación inmediata para seguir aprendiendo.';
    }
    if (this.isFeaturedOffer(offer, index)) {
      return 'Ahorra un 20% comparado con el pack básico.';
    }
    if (this.isSpecialOffer(offer, index)) {
      return 'El mejor valor para expertos que quieren dominarlo todo.';
    }
    return offer.description;
  }

  getOriginalCost(offer: TumisOffer): number | null {
    if (!offer.discount || offer.discount <= 0 || offer.discount >= 100) {
      return null;
    }
    const original = offer.mulluCost / (1 - offer.discount / 100);
    return Math.round(original);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  onHide(): void {
    this.isLoading.set(false);
  }
}
