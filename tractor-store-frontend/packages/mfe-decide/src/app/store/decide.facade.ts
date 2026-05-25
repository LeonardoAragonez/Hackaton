import { computed, inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  CDN_BASE_URL,
  CART_API_URL,
  CATALOG_EVENTS,
  catalogEventBus,
  type BackendCartResponse,
  mapBackendCart,
  messageFromHttpError,
  parseProductUrl,
  resolveCdnUrl,
  ToastService,
  type RecommendationItem,
} from '@tractor-store/shared-catalog';
import { DecideApiService } from '../data/decide-api.service';
import { createDecideStore } from './decide.state';
import { decideActions } from './decide.actions';
import { decideSelectors } from './decide.selectors';

interface InventoryResponse {
  sku: string;
  quantity: number;
  available: boolean;
}

@Injectable()
export class DecideFacade {
  private readonly api = inject(DecideApiService);
  private readonly http = inject(HttpClient);
  private readonly cartUrl = inject(CART_API_URL);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdn = inject(CDN_BASE_URL);
  private readonly toast = inject(ToastService);
  private readonly store = createDecideStore();

  readonly product = computed(() => decideSelectors.product(this.store.state()));
  readonly selectedVariant = computed(() => decideSelectors.selectedVariant(this.store.state()));
  readonly recommendations = computed(() => decideSelectors.recommendations(this.store.state()));
  readonly loading = computed(() => decideSelectors.loading(this.store.state()));
  readonly error = computed(() => decideSelectors.error(this.store.state()));
  readonly cartMessage = computed(() => decideSelectors.cartMessage(this.store.state()));
  readonly cartMessageKind = computed(() => decideSelectors.cartMessageKind(this.store.state()));
  readonly stockAvailable = computed(() => decideSelectors.stockAvailable(this.store.state()));

  cdnUrl(path: string, size?: string): string {
    return resolveCdnUrl(path, this.cdn, size);
  }

  /** Máxima resolución disponible en el CDN blueprint para /product/ (200px). */
  productHeroUrl(path: string): string {
    return resolveCdnUrl(path, this.cdn, '200');
  }

  loadProduct(id: string): void {
    this.store.state.update((s) => decideActions.loadStart(s));
    this.api.getProduct(id).subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => decideActions.loadSuccess(s, result.value));
        const sku = this.route.snapshot.queryParamMap.get('sku');
        const defaultSku = sku ?? result.value.variants[0]?.sku;
        if (defaultSku) this.selectSku(defaultSku, false);
        this.loadRandomRecommendations(id);
      } else {
        this.store.state.update((s) => decideActions.setError(s, String(result.error)));
      }
    });
  }

  selectSku(sku: string, updateUrl = true): void {
    this.store.state.update((s) => decideActions.selectSku(s, sku));
    if (updateUrl) {
      void this.router.navigate([], {
        queryParams: { sku },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
    this.loadStock(sku);
  }

  private loadRandomRecommendations(productId: string): void {
    this.api.getRandomRecommendations(productId, 4).subscribe((result) => {
      if (result.ok) {
        this.store.state.update((s) => decideActions.setRecommendations(s, result.value));
      }
    });
  }

  private loadStock(sku: string): void {
    this.http.get<InventoryResponse>(`/api/inventory/${encodeURIComponent(sku)}`).subscribe({
      next: (inv) => {
        this.store.state.update((s) => decideActions.setStock(s, inv.quantity));
      },
      error: () => {
        this.store.state.update((s) => decideActions.setStock(s, null));
      },
    });
  }

  addToCart(): void {
    const sku = this.store.state().selectedSku;
    if (!sku) return;

    this.http.post<BackendCartResponse>(`${this.cartUrl}/items`, { sku }).subscribe({
      next: (cart) => {
        const mapped = mapBackendCart(cart);
        catalogEventBus.emit(CATALOG_EVENTS.CART_UPDATED, {
          itemCount: mapped.itemCount,
          subtotal: mapped.subtotal,
        });
        const name = this.selectedVariant()?.name ?? 'Tractor';
        this.toast.show(`¡${name} añadido al carrito!`, 'success');
        this.store.state.update((s) =>
          decideActions.setCartMessage(s, 'Producto añadido al carrito', 'success')
        );
        this.loadStock(sku);
      },
      error: (err) => {
        const msg = messageFromHttpError(err);
        this.toast.show(msg, 'error');
        this.store.state.update((s) => decideActions.setCartMessage(s, msg, 'error'));
      },
    });
  }

  goToProduct(url: string): void {
    void this.router.navigateByUrl(url);
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
}
