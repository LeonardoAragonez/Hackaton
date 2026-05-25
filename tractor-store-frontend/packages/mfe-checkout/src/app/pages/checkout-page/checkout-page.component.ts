import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ButtonComponent } from '@tractor-store/ts-design-system';
import { FulfillmentType } from '@tractor-store/shared-catalog';
import { CheckoutFacade } from '../../store/checkout.facade';

@Component({
  selector: 'checkout-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, ButtonComponent],
  template: `
    <div class="py-12 ts-page-container max-w-lg animate-slide-up">
      <div class="ts-section-header">
        <p class="ts-eyebrow">Checkout</p>
        <h1 class="ts-section-title">Confirmar pedido</h1>
        <p class="mt-3 text-text-muted">
          Importe <span class="font-bold text-text">{{ facade.subtotal() | currency }}</span>
        </p>
      </div>

      <div class="ts-panel mt-8">
        <p class="ts-form-label">Entrega</p>
        <div class="ts-segmented mb-8" role="tablist" aria-label="Tipo de entrega">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="fulfillment() === 'PICKUP'"
            class="ts-segmented__btn"
            (click)="setFulfillment('PICKUP')"
          >
            Recoger en tienda
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="fulfillment() === 'DELIVERY'"
            class="ts-segmented__btn"
            (click)="setFulfillment('DELIVERY')"
          >
            Envío a domicilio
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="ts-form-label" for="email">Email</label>
            <input id="email" formControlName="email" type="email" class="ts-input" autocomplete="email" />
          </div>
          <div>
            <label class="ts-form-label" for="name">Nombre completo</label>
            <input id="name" formControlName="name" class="ts-input" autocomplete="name" />
          </div>

          @if (fulfillment() === 'PICKUP') {
            <fieldset class="space-y-4">
              <legend class="ts-form-label">Punto de recogida</legend>
              @for (store of facade.stores(); track store.id) {
                <label
                  class="ts-lineup-card block !aspect-[2.4/1] !min-h-[8rem] cursor-pointer"
                  [class.ring-2]="form.controls.storeId.value === store.id"
                  [class.ring-brand-accent]="form.controls.storeId.value === store.id"
                >
                  <input type="radio" formControlName="storeId" [value]="store.id" class="sr-only" />
                  <img [src]="facade.cdnUrl(store.image)" [alt]="store.name" />
                  <div class="ts-lineup-card__overlay"></div>
                  <div class="ts-lineup-card__body !py-4">
                    <span class="ts-lineup-card__title !text-lg">{{ store.name }}</span>
                    <span class="block mt-1 text-sm text-white/80">{{ store.street }}, {{ store.city }}</span>
                  </div>
                </label>
              }
            </fieldset>
          } @else {
            <div>
              <label class="ts-form-label" for="address">Dirección</label>
              <input id="address" formControlName="address" class="ts-input" autocomplete="street-address" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="ts-form-label" for="city">Ciudad</label>
                <input id="city" formControlName="city" class="ts-input" autocomplete="address-level2" />
              </div>
              <div>
                <label class="ts-form-label" for="zip">Código postal</label>
                <input id="zip" formControlName="zip" class="ts-input" autocomplete="postal-code" />
              </div>
            </div>
          }

          @if (facade.error()) {
            <p class="text-sm text-danger" role="alert">{{ facade.error() }}</p>
          }

          <ts-button
            type="submit"
            variant="cta"
            class="block w-full !mt-6"
            [disabled]="form.invalid || facade.loading()"
          >
            Confirmar pedido
          </ts-button>
        </form>
      </div>
    </div>
  `,
})
export class CheckoutPageComponent implements OnInit {
  readonly facade = inject(CheckoutFacade);
  private readonly fb = inject(FormBuilder);
  private dirty = false;

  readonly fulfillment = signal<FulfillmentType>('DELIVERY');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    storeId: [''],
    address: [''],
    city: [''],
    zip: [''],
  });

  constructor() {
    effect(() => {
      const stores = this.facade.stores();
      if (this.fulfillment() === 'PICKUP' && stores.length && !this.form.controls.storeId.value) {
        this.form.controls.storeId.setValue(stores[0].id);
      }
    });
  }

  ngOnInit(): void {
    this.facade.loadCart();
    this.facade.loadStores();
    this.applyFulfillmentValidators('DELIVERY');
    this.form.valueChanges.subscribe(() => {
      this.dirty = true;
    });
  }

  setFulfillment(type: FulfillmentType): void {
    this.fulfillment.set(type);
    this.applyFulfillmentValidators(type);
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const type = this.fulfillment();
    const request =
      type === 'PICKUP'
        ? this.facade.buildPlaceOrderRequest(
            type,
            { email: raw.email, name: raw.name },
            undefined,
            raw.storeId
          )
        : this.facade.buildPlaceOrderRequest(type, { email: raw.email, name: raw.name }, {
            address: raw.address,
            city: raw.city,
            zip: raw.zip,
          });
    this.facade.placeOrder(request);
    this.dirty = false;
  }

  canDeactivate(): boolean {
    if (!this.dirty || this.form.pristine) return true;
    return confirm('Tienes cambios sin guardar. ¿Salir del checkout?');
  }

  private applyFulfillmentValidators(type: FulfillmentType): void {
    const storeId = this.form.controls.storeId;
    const address = this.form.controls.address;
    const city = this.form.controls.city;
    const zip = this.form.controls.zip;

    if (type === 'PICKUP') {
      storeId.setValidators(Validators.required);
      address.clearValidators();
      city.clearValidators();
      zip.clearValidators();
      address.setValue('');
      city.setValue('');
      zip.setValue('');
      if (!storeId.value && this.facade.stores()[0]) {
        storeId.setValue(this.facade.stores()[0].id);
      }
    } else {
      storeId.clearValidators();
      storeId.setValue('');
      address.setValidators(Validators.required);
      city.setValidators(Validators.required);
      zip.setValidators(Validators.required);
    }

    storeId.updateValueAndValidity();
    address.updateValueAndValidity();
    city.updateValueAndValidity();
    zip.updateValueAndValidity();
  }
}
