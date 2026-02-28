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
        <header class="shop-header">
          <div class="shop-brand">
            <div class="shop-brand-icon">
              <i class="pi pi-shopping-cart"></i>
            </div>
            <div>
              <h2>Tienda de Tumis</h2>
              <p>Adquiere vidas y mejoras para tu aprendizaje</p>
            </div>
          </div>

          <div class="shop-header-right">
            <div class="balance-block">
              <span class="balance-label">SALDO DISPONIBLE</span>
              <div class="balance-pill">
                <img src="assets/elementos/mullu.png" alt="Mullu" />
                <strong>{{ formatNumber(userMullu()) }}</strong>
                <span>Mullu</span>
              </div>
            </div>

            <button type="button" class="shop-close-icon" (click)="visible.set(false)" aria-label="Cerrar modal">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </header>

        <div class="shop-body">
          <section class="shop-section">
            <h3><i class="pi pi-heart-fill"></i> Paquetes de Vidas</h3>

            @if (isLoadingOffers()) {
              <div class="offer-grid">
                @for (item of [1, 2, 3]; track $index) {
                  <div class="offer-card offer-card--skeleton"></div>
                }
              </div>
            } @else if (displayedOffers().length === 0) {
              <div class="empty-state">
                No hay ofertas disponibles en este momento.
              </div>
            } @else {
              <div class="offer-grid">
                @for (offer of displayedOffers(); track offer.id; let i = $index) {
                  @let isFeatured = isFeaturedOffer(offer, i);
                  @let isSpecial = isSpecialOffer(offer, i);
                  @let badge = getBadgeText(offer, i);
                  @let desc = getOfferDescription(offer, i);
                  @let oldPrice = getOriginalCost(offer);

                  <article
                    class="offer-card"
                    [style.--stagger]="i"
                    [class.offer-card--featured]="isFeatured"
                    [class.offer-card--special]="isSpecial"
                  >
                    @if (badge) {
                      <span
                        class="offer-badge"
                        [class.offer-badge--special]="isSpecial"
                      >
                        {{ badge }}
                      </span>
                    }

                    <div class="offer-heart">
                      <div class="heart-circle">❤</div>
                      @if (offer.tumisAmount > 1) {
                        <span class="heart-multiplier">x{{ offer.tumisAmount }}</span>
                      }
                    </div>

                    <h4>{{ offer.tumisAmount }} {{ offer.tumisAmount === 1 ? 'Vida' : 'Vidas' }}</h4>
                    <p class="offer-description">{{ desc }}</p>

                    <div class="offer-pricing">
                      @if (oldPrice) {
                        <p class="offer-old-price">
                          {{ formatNumber(oldPrice) }} Mullu
                        </p>
                      }
                      <p class="offer-price"><span>{{ formatNumber(offer.mulluCost) }}</span> Mullu</p>
                    </div>

                    <button
                      type="button"
                      class="offer-buy-btn"
                      [class.offer-buy-btn--featured]="isFeatured"
                      [disabled]="userMullu() < offer.mulluCost || isLoading()"
                      (click)="buyOffer(offer)"
                    >
                      @if (!isLoading()) {
                        <span>{{ isFeatured ? 'Comprar Ahora' : 'Comprar' }}</span>
                      } @else {
                        <span><i class="pi pi-spin pi-spinner"></i> Comprando...</span>
                      }
                    </button>

                    @if (userMullu() < offer.mulluCost) {
                      <p class="offer-warning">
                        Necesitas {{ formatNumber(offer.mulluCost - userMullu()) }} Mullu más
                      </p>
                    }
                  </article>
                }
              </div>
            }
          </section>
        </div>

        <footer class="shop-footer">
          <p><i class="pi pi-info-circle"></i> Los Mullu se añaden de inmediato y cada compra queda registrada en tu historial.</p>
          <button type="button" class="shop-close-btn" (click)="visible.set(false)">
            <i class="pi pi-times"></i>
            Cerrar
          </button>
        </footer>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      :host {
        --shop-text: #1f2f46;
        --shop-muted: #6b7b93;
        --shop-border: #dde5f0;
        --shop-bg: #f3f7fc;
        --shop-white: #ffffff;
        --shop-green: #19be84;
        --shop-green-dark: #11a873;
        --shop-gray-btn: #e8edf4;
      }

      :host ::ng-deep .p-dialog-mask {
        backdrop-filter: blur(2px);
        background: rgba(15, 28, 48, 0.35);
        animation: mask-fade 0.26s ease;
      }

      :host ::ng-deep .tumis-shop-dialog.p-dialog {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 28px 70px rgba(24, 39, 75, 0.28);
        transform-origin: top center;
        animation: modal-pop 0.46s cubic-bezier(0.2, 0.86, 0.32, 1);
      }

      :host ::ng-deep .tumis-shop-dialog .p-dialog-content {
        padding: 0;
        background: var(--shop-bg);
      }

      .shop-shell {
        display: flex;
        flex-direction: column;
        max-height: min(88vh, 860px);
        position: relative;
        isolation: isolate;
      }


      .shop-header {
        background: var(--shop-white);
        border-bottom: 1px solid var(--shop-border);
        padding: 20px 24px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        animation: fade-rise 0.45s ease both;
      }

      .shop-brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .shop-brand-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: #e2f8ef;
        color: var(--shop-green);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      }

      .shop-brand h2 {
        margin: 0;
        color: var(--shop-text);
        font-size: 31px;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      .shop-brand p {
        margin: 3px 0 0;
        color: var(--shop-muted);
        font-size: 13px;
      }

      .shop-header-right {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .balance-block {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      .balance-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #8a98ad;
      }

      .balance-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 12px;
        border-radius: 999px;
        background: #edf2f8;
        color: var(--shop-text);
        animation: none;
      }

      .balance-pill img {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      .balance-pill strong {
        font-size: 29px;
        line-height: 1;
      }

      .balance-pill span {
        font-size: 13px;
        color: var(--shop-muted);
      }

      .shop-close-icon {
        border: 0;
        background: transparent;
        color: #8191a8;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .shop-close-icon:hover {
        background: #eef3fa;
        color: #5f738f;
      }

      .shop-body {
        padding: 22px 24px;
        overflow-y: auto;
      }

      .shop-section + .shop-section {
        margin-top: 24px;
      }

      .shop-section {
        opacity: 0;
        transform: translateY(10px);
        animation: fade-rise 0.5s ease forwards;
      }


      .shop-section h3 {
        margin: 0 0 14px;
        color: var(--shop-text);
        font-size: 22px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .shop-section h3 i {
        font-size: 16px;
      }

      .shop-section h3 .pi-heart-fill {
        color: #ef4b54;
      }


      .offer-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .offer-card {
        position: relative;
        background: var(--shop-white);
        border: 1px solid var(--shop-border);
        border-radius: 18px;
        padding: 18px 16px 14px;
        min-height: 345px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        opacity: 0;
        transform: translateY(15px) scale(0.985);
        animation: card-rise 0.56s cubic-bezier(0.22, 0.88, 0.3, 1) forwards;
        animation-delay: calc(90ms * var(--stagger, 0));
        transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
      }

      .offer-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 14px 28px rgba(31, 53, 94, 0.14);
      }

      .offer-card--featured {
        border: 2px solid var(--shop-green);
        box-shadow: 0 16px 28px rgba(25, 190, 132, 0.16);
        transform: translateY(-6px);
      }

      .offer-card--featured:hover {
        transform: translateY(-10px) scale(1.01);
        box-shadow: 0 22px 34px rgba(21, 173, 121, 0.22);
      }

      .offer-card--special {
        border-color: #d6e1f0;
      }

      .offer-card--skeleton {
        border: none;
        min-height: 345px;
        background: #e2e8f0;
      }

      .offer-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: #13b978;
        color: #ffffff;
        border-radius: 12px;
        padding: 5px 14px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.02em;
        white-space: nowrap;
        box-shadow: 0 4px 10px rgba(19, 185, 120, 0.25);
        z-index: 2;
      }

      .offer-badge--special {
        background: #f5a313;
        box-shadow: 0 4px 10px rgba(245, 163, 19, 0.25);
        left: auto;
        right: 18px;
        transform: none;
        top: -12px;
      }

      .offer-heart {
        margin-top: 10px;
        position: relative;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .heart-circle {
        width: 74px;
        height: 74px;
        border-radius: 50%;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 42px;
        line-height: 1;
        color: #ef4b54;
        transition: transform 0.3s ease;
      }

      .offer-card:hover .heart-circle {
        transform: scale(1.08);
      }

      .offer-card--featured .heart-circle {
        background: #eefdf8;
      }

      .heart-multiplier {
        position: absolute;
        right: -4px;
        bottom: 8px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        color: #1f2f46;
        box-shadow: 0 4px 8px rgba(0,0,0,0.06);
      }

      .offer-card h4 {
        margin: 16px 0 6px;
        font-size: 32px;
        font-weight: 800;
        line-height: 1.2;
        color: #1f2f46;
      }

      .offer-description {
        margin: 0;
        min-height: 48px;
        color: #64748b;
        font-size: 14px;
        line-height: 1.4;
        max-width: 220px;
      }

      .offer-pricing {
        margin-top: auto;
        padding-top: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .offer-old-price {
        margin: 0;
        color: #94a3b8;
        font-size: 14px;
        text-decoration: line-through;
        font-weight: 500;
      }

      .offer-price {
        margin: 0;
        color: #64748b;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .offer-price span {
        color: #1f2f46;
        font-size: 38px;
        font-weight: 900;
        line-height: 1;
      }

      .offer-card--featured .offer-price span {
        color: #10b981;
      }

      .offer-buy-btn {
        width: 100%;
        margin-top: 20px;
        border: none;
        border-radius: 12px;
        background: #f1f5f9;
        color: #334155;
        font-size: 15px;
        font-weight: 700;
        padding: 12px 18px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .offer-buy-btn:hover:not(:disabled) {
        background: #e2e8f0;
        transform: translateY(-2px);
      }

      .offer-buy-btn--featured {
        background: #10b981;
        color: #ffffff;
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
      }

      .offer-buy-btn--featured:hover:not(:disabled) {
        background: #059669;
        box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25);
      }


      .offer-buy-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .offer-warning {
        margin: 8px 0 0;
        font-size: 11px;
        color: #d94747;
      }


      .empty-state {
        text-align: center;
        color: var(--shop-muted);
        padding: 28px 14px;
        background: var(--shop-white);
        border: 1px solid var(--shop-border);
        border-radius: 14px;
      }

      .shop-footer {
        border-top: 1px solid var(--shop-border);
        background: var(--shop-white);
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .shop-footer p {
        margin: 0;
        font-size: 11px;
        color: var(--shop-muted);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .shop-close-btn {
        border: none;
        border-radius: 8px;
        background: #e9eef5;
        color: #3a4e69;
        font-size: 12px;
        font-weight: 700;
        padding: 10px 14px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }

      .shop-close-btn:hover {
        background: #dfe7f2;
      }


      @keyframes modal-pop {
        from {
          opacity: 0;
          transform: translateY(-12px) scale(0.975);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes mask-fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fade-rise {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes card-rise {
        from {
          opacity: 0;
          transform: translateY(15px) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes badge-drop {
        0% {
          opacity: 0;
          transform: translate(-50%, -10px) scale(0.9);
        }
        65% {
          opacity: 1;
          transform: translate(-50%, 2px) scale(1.02);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, 0) scale(1);
        }
      }





      @media (max-width: 991px) {
        .offer-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }


        .offer-card--featured {
          transform: none;
        }
      }

      @media (max-width: 760px) {
        .shop-header,
        .shop-body,
        .shop-footer {
          padding-left: 14px;
          padding-right: 14px;
        }

        .shop-header {
          flex-direction: column;
          align-items: stretch;
        }

        .shop-header-right {
          justify-content: space-between;
        }

        .balance-block {
          align-items: flex-start;
        }
        .offer-grid {
          grid-template-columns: 1fr;
        }


        .offer-card {
          min-height: auto;
        }

        .offer-card h4 {
          font-size: 33px;
        }

        .shop-footer {
          flex-direction: column;
          align-items: stretch;
        }

        .shop-close-btn {
          width: 100%;
          justify-content: center;
        }
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
