import { Route } from '@angular/router';
import { remoteEntryTokenProviders } from '@tractor-store/shared-catalog';
import { DecideApiService } from '../data/decide-api.service';
import { DecideFacade } from '../store/decide.facade';
import { ProductPageComponent } from '../pages/product-page/product-page.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    providers: [...remoteEntryTokenProviders, DecideApiService, DecideFacade],
    children: [{ path: '', component: ProductPageComponent }],
  },
];
