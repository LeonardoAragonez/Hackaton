import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  catalogEventBus,
  CATALOG_EVENTS,
  CDN_BASE_URL,
  parseProductUrl,
  resolveCdnUrl,
  type RecommendationItem,
} from '@tractor-store/shared-catalog';
import { ExploreApiService } from '../data/explore-api.service';
import { createExploreStore } from './explore.state';
import { exploreActions } from './explore.actions';
import { exploreSelectors } from './explore.selectors';

@Injectable()
export class ExploreFacade {
  private readonly api = inject(ExploreApiService);
  private readonly router = inject(Router);
  private readonly cdn = inject(CDN_BASE_URL);
  private readonly store = createExploreStore();

  readonly home = computed(() => exploreSelectors.home(this.store.state()));
  readonly category = computed(() => exploreSelectors.category(this.store.state()));
  readonly stores = computed(() => exploreSelectors.stores(this.store.state()));
  readonly recommendations = computed(() => exploreSelectors.recommendations(this.store.state()));
  readonly loading = computed(() => exploreSelectors.loading(this.store.state()));
  readonly error = computed(() => exploreSelectors.error(this.store.state()));

  cdnUrl(path: string): string {
    return resolveCdnUrl(path, this.cdn);
  }

  loadHome(): void {
    this.store.state.update((s) => exploreActions.loadHomeStart(s));
    this.api.getHome().subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => exploreActions.loadHomeSuccess(s, result.value));
        this.api.getRecommendations().subscribe((rec) => {
          if (rec.ok) {
            this.store.state.update((s) => exploreActions.loadRecommendationsSuccess(s, rec.value));
          }
        });
      } else {
        this.store.state.update((s) => exploreActions.setError(s, String(result.error)));
      }
    });
  }

  loadCategory(key: string): void {
    this.store.state.update((s) => exploreActions.loadHomeStart(s));
    this.api.getCategory(key).subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => exploreActions.loadCategorySuccess(s, result.value));
      } else {
        this.store.state.update((s) => exploreActions.setError(s, String(result.error)));
      }
    });
  }

  loadStores(): void {
    this.api.getStores().subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => exploreActions.loadStoresSuccess(s, result.value));
      }
    });
  }

  selectStore(storeId: string, storeName: string): void {
    catalogEventBus.emit(CATALOG_EVENTS.STORE_SELECTED, { storeId, storeName });
  }

  goToProduct(id: string): void {
    void this.router.navigate(['/product', id]);
  }

  openRecommendation(item: RecommendationItem): void {
    const parsed = parseProductUrl(item.url);
    if (!parsed) {
      void this.router.navigateByUrl(item.url);
      return;
    }
    void this.router.navigate(['/product', parsed.productId], {
      queryParams: parsed.sku ? { sku: parsed.sku } : {},
    });
  }

  goToCategory(key: string): void {
    void this.router.navigate(['/products', key]);
  }
}
