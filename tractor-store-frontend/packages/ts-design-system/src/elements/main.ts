import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ButtonComponent } from '../lib/button/button.component';
import { ProductCardComponent } from '../lib/product-card/product-card.component';
import { VariantOptionComponent } from '../lib/variant-option/variant-option.component';
import { CartCounterComponent } from '../lib/cart-counter/cart-counter.component';
import { MiniCartComponent } from '../lib/mini-cart/mini-cart.component';

(async () => {
  const app = await createApplication({ providers: [] });
  const register = (component: unknown, tag: string) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, createCustomElement(component as never, { injector: app.injector }));
    }
  };
  register(ButtonComponent, 'ts-button-el');
  register(ProductCardComponent, 'ts-product-card-el');
  register(VariantOptionComponent, 'ts-variant-option-el');
  register(CartCounterComponent, 'ts-cart-counter-el');
  register(MiniCartComponent, 'ts-mini-cart-el');
})();
