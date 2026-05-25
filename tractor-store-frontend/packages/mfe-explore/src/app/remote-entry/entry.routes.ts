import { Route } from '@angular/router';
import { remoteEntryTokenProviders } from '@tractor-store/shared-catalog';
import { ExploreApiService } from '../data/explore-api.service';
import { ExploreFacade } from '../store/explore.facade';
import { HomePageComponent } from '../pages/home-page/home-page.component';
import { CategoryPageComponent } from '../pages/category-page/category-page.component';
import { StoresPageComponent } from '../pages/stores-page/stores-page.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    providers: [...remoteEntryTokenProviders, ExploreApiService, ExploreFacade],
    children: [
      { path: '', component: HomePageComponent },
      { path: 'products/:key', component: CategoryPageComponent },
      { path: 'stores', component: StoresPageComponent },
    ],
  },
];
