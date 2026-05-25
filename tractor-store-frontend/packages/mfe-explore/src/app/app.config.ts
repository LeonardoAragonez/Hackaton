import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CATALOG_API_URL, CDN_BASE_URL } from '@tractor-store/shared-catalog';
import { remoteRoutes } from './remote-entry/entry.routes';
import { ExploreApiService } from './data/explore-api.service';
import { ExploreFacade } from './store/explore.facade';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(remoteRoutes),
    provideHttpClient(),
    { provide: CATALOG_API_URL, useValue: '/api/catalog' },
    { provide: CDN_BASE_URL, useValue: 'https://blueprint.the-tractor.store' },
    ExploreApiService,
    ExploreFacade,
  ],
};
