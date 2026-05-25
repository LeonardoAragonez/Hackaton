import { Route, CanDeactivateFn } from '@angular/router';
import { remoteEntryTokenProviders } from '@tractor-store/shared-catalog';
import { CheckoutApiService } from '../data/checkout-api.service';
import { CheckoutFacade } from '../store/checkout.facade';
import { CartPageComponent } from '../pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from '../pages/checkout-page/checkout-page.component';
import { ThanksPageComponent } from '../pages/thanks-page/thanks-page.component';

const canLeaveCheckout: CanDeactivateFn<CheckoutPageComponent> = (component) =>
  component.canDeactivate();

export const remoteRoutes: Route[] = [
  {
    path: '',
    providers: [...remoteEntryTokenProviders, CheckoutApiService, CheckoutFacade],
    children: [
      { path: 'cart', component: CartPageComponent },
      {
        path: 'checkout',
        component: CheckoutPageComponent,
        canDeactivate: [canLeaveCheckout],
      },
      { path: 'thanks', component: ThanksPageComponent },
      { path: '', redirectTo: 'cart', pathMatch: 'full' },
    ],
  },
];
