import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { celebratePurchase, ToastService } from '@tractor-store/shared-catalog';
import { CheckoutFacade } from '../../store/checkout.facade';

@Component({
  selector: 'checkout-thanks-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (showCelebration()) {
      <div class="ts-success-overlay" role="dialog" aria-modal="true" aria-labelledby="thanks-title">
        <div class="ts-success-modal">
          <div class="ts-success-modal__badge" aria-hidden="true">✓</div>
          <h2 id="thanks-title" class="text-2xl ts-heading">¡Pedido confirmado!</h2>
          @if (facade.orderId()) {
            <p class="mt-2 text-text-muted">
              Referencia <span class="font-semibold text-text">#{{ facade.orderId() }}</span>
            </p>
          }
          <p class="mt-4 text-sm text-text-muted leading-relaxed">
            Gracias por confiar en Tractor Store.
          </p>
          <button type="button" class="mt-8 ts-btn-cta w-full" (click)="closeCelebration()">
            Continuar
          </button>
        </div>
      </div>
    }

    <div
      class="flex flex-col items-center justify-center min-h-[55vh] py-16 ts-page-container text-center animate-fade-in"
    >
      <div class="ts-panel max-w-lg w-full text-center">
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-semibold text-brand-primary border-2 border-brand-secondary rounded-full animate-scale-in"
          aria-hidden="true"
        >✓</div>
        <h1 class="text-3xl ts-heading md:text-4xl">Pedido confirmado</h1>
        @if (facade.orderId()) {
          <p class="mt-3 text-text-muted">
            Referencia <span class="font-semibold text-text">#{{ facade.orderId() }}</span>
          </p>
        }
        @if (facade.orderConfirmation()?.fulfillmentType === 'PICKUP' && facade.orderConfirmation()?.pickupStore; as store) {
          <div class="mt-8 p-5 text-left rounded-card bg-surface-muted border border-border">
            <p class="ts-eyebrow">Recogida en tienda</p>
            <p class="mt-2 text-lg font-semibold text-text">{{ store.name }}</p>
            <p class="mt-1 text-sm text-text-muted">{{ store.street }}, {{ store.city }}</p>
          </div>
        }
        @if (facade.orderConfirmation()?.fulfillmentType === 'DELIVERY' && facade.orderConfirmation()?.shipping; as shipping) {
          <div class="mt-8 p-5 text-left rounded-card bg-surface-muted border border-border">
            <p class="ts-eyebrow">Envío a domicilio</p>
            <p class="mt-2 text-sm text-text-muted leading-relaxed">
              {{ shipping.address }}<br />
              {{ shipping.zip }} {{ shipping.city }}
            </p>
          </div>
        }
        <p class="mt-8 text-sm text-text-muted leading-relaxed">
          Recibirás la confirmación por email en breve.
        </p>
        <a routerLink="/" class="inline-block mt-8 ts-btn-cta no-underline">Seguir explorando</a>
      </div>
    </div>
  `,
})
export class ThanksPageComponent implements OnInit {
  readonly facade = inject(CheckoutFacade);
  private readonly toast = inject(ToastService);
  readonly showCelebration = signal(true);

  ngOnInit(): void {
    if (!this.facade.orderId()) {
      this.facade.loadCart();
      this.showCelebration.set(false);
      return;
    }
    void celebratePurchase();
    this.toast.show('¡Compra realizada con éxito!', 'success', 5000);
  }

  closeCelebration(): void {
    this.showCelebration.set(false);
  }
}
