#!/usr/bin/env python3
from pathlib import Path
B = Path(__file__).resolve().parent.parent

def w(r, c):
    p = B / r
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(c.rstrip() + "\n")

S = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"

# ============ DECIDE ============
for f, c in {
"packages/mfe-decide/src/index.html": '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>mfe-decide</title><base href="/"/></head><body><app-decide-root></app-decide-root></body></html>',
"packages/mfe-decide/src/styles.scss": S,
"packages/mfe-decide/src/main.ts": """import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
bootstrapApplication(AppComponent, appConfig).catch(console.error);
""",
"packages/mfe-decide/src/app/app.component.ts": """import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({ selector: 'app-decide-root', standalone: true, imports: [RouterOutlet], template: '<router-outlet />' })
export class AppComponent {}
""",
"packages/mfe-decide/src/app/app.config.ts": """import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { DECIDE_API_URL, CDN_BASE_URL } from '@tractor-store/shared-catalog';
import { remoteRoutes } from './remote-entry/entry.routes';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(remoteRoutes),
    provideHttpClient(),
    { provide: DECIDE_API_URL, useValue: '/api/decide' },
    { provide: CDN_BASE_URL, useValue: 'https://blueprint.the-tractor.store' },
  ],
};
""",
"packages/mfe-decide/src/app/remote-entry/entry.routes.ts": """import { Route } from '@angular/router';
import { ProductPageComponent } from '../pages/product-page/product-page.component';
export const remoteRoutes: Route[] = [{ path: '', component: ProductPageComponent }];
""",
"packages/mfe-decide/src/app/store/decide.state.ts": """import { signal } from '@angular/core';
import type { ProductDetail, ProductVariant } from '@tractor-store/shared-catalog';
export interface DecideState {
  product: ProductDetail | null;
  selectedSku: string | null;
  loading: boolean;
  error: string | null;
}
export const initialDecideState = (): DecideState => ({ product: null, selectedSku: null, loading: false, error: null });
export const createDecideStore = () => ({ state: signal<DecideState>(initialDecideState()) });
""",
"packages/mfe-decide/src/app/store/decide.actions.ts": """import type { DecideState } from './decide.state';
export const decideActions = {
  loadStart: (s: DecideState): DecideState => ({ ...s, loading: true, error: null }),
  loadSuccess: (s: DecideState, product: DecideState['product']): DecideState => ({ ...s, loading: false, product }),
  selectSku: (s: DecideState, sku: string): DecideState => ({ ...s, selectedSku: sku }),
  setError: (s: DecideState, error: string): DecideState => ({ ...s, loading: false, error }),
};
""",
"packages/mfe-decide/src/app/store/decide.selectors.ts": """import type { DecideState, ProductVariant } from './decide.state';
import type { ProductVariant as PV } from '@tractor-store/shared-catalog';
export const decideSelectors = {
  product: (s: DecideState) => s.product,
  selectedSku: (s: DecideState) => s.selectedSku,
  selectedVariant: (s: DecideState): PV | undefined =>
    s.product?.variants.find((v) => v.sku === s.selectedSku),
  loading: (s: DecideState) => s.loading,
  error: (s: DecideState) => s.error,
};
""",
"packages/mfe-decide/src/app/data/decide-api.service.ts": """import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DECIDE_API_URL, ProductDetail, Result, ok, err } from '@tractor-store/shared-catalog';
@Injectable({ providedIn: 'root' })
export class DecideApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(DECIDE_API_URL);
  getProduct(id: string): Observable<Result<ProductDetail>> {
    return this.http.get<ProductDetail>(`${this.base}/products/${id}`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Product not found')))
    );
  }
}
""",
}.items():
    w(f, c)

w("packages/mfe-decide/src/app/store/decide.facade.ts", """import { computed, inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CDN_BASE_URL, CHECKOUT_API_URL, resolveCdnUrl, catalogEventBus, CATALOG_EVENTS } from '@tractor-store/shared-catalog';
import { DecideApiService } from '../data/decide-api.service';
import { createDecideStore } from './decide.state';
import { decideActions } from './decide.actions';
import { decideSelectors } from './decide.selectors';

@Injectable({ providedIn: 'root' })
export class DecideFacade {
  private readonly api = inject(DecideApiService);
  private readonly http = inject(HttpClient);
  private readonly checkoutUrl = inject(CHECKOUT_API_URL, { optional: true }) ?? '/api/checkout';
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdn = inject(CDN_BASE_URL);
  private readonly { state } = createDecideStore();

  readonly product = computed(() => decideSelectors.product(this.state()));
  readonly selectedVariant = computed(() => decideSelectors.selectedVariant(this.state()));
  readonly loading = computed(() => decideSelectors.loading(this.state()));
  readonly error = computed(() => decideSelectors.error(this.state()));

  cdnUrl(path: string): string {
    return resolveCdnUrl(path, this.cdn);
  }

  loadProduct(id: string): void {
    this.state.update((s) => decideActions.loadStart(s));
    this.api.getProduct(id).subscribe((result) => {
      if (result.ok) {
        this.state.update((s) => decideActions.loadSuccess(s, result.value));
        const sku = this.route.snapshot.queryParamMap.get('sku');
        const defaultSku = sku ?? result.value.variants[0]?.sku;
        if (defaultSku) this.selectSku(defaultSku, false);
      } else {
        this.state.update((s) => decideActions.setError(s, String(result.error)));
      }
    });
  }

  selectSku(sku: string, updateUrl = true): void {
    this.state.update((s) => decideActions.selectSku(s, sku));
    if (updateUrl) {
      void this.router.navigate([], { queryParams: { sku }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  addToCart(): void {
    const sku = this.state().selectedSku;
    if (!sku) return;
    this.http.post(`${this.checkoutUrl}/cart/items`, { sku, quantity: 1 }).subscribe((cart: { itemCount: number; subtotal: number }) => {
      catalogEventBus.emit(CATALOG_EVENTS.CART_UPDATED, { itemCount: cart.itemCount, subtotal: cart.subtotal });
    });
  }
}
""")

w("packages/mfe-decide/src/app/pages/product-page/product-page.component.ts", """import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ButtonComponent, VariantOptionComponent } from '@tractor-store/ts-design-system';
import { DecideFacade } from '../../store/decide.facade';

@Component({
  selector: 'decide-product-page',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent, VariantOptionComponent],
  template: `
    <div class="max-w-5xl px-6 py-8 mx-auto">
      @if (facade.loading()) { <p>Loading product...</p> }
      @else if (facade.error()) { <p class="text-danger">{{ facade.error() }}</p> }
      @else if (facade.product(); as product) {
        <div class="grid gap-8 md:grid-cols-2">
          <img [src]="facade.cdnUrl(facade.selectedVariant()?.image ?? product.variants[0].image)" [alt]="product.name" class="rounded-card shadow-card" />
          <div>
            <h1 class="mb-2 text-3xl font-display">{{ product.name }}</h1>
            <p class="mb-4 text-2xl font-bold text-brand-primary">{{ facade.selectedVariant()?.price | currency }}</p>
            <ul class="mb-6 space-y-1 list-disc list-inside text-text-muted">
              @for (h of product.highlights; track h) { <li>{{ h }}</li> }
            </ul>
            <p class="mb-2 font-medium">Choose variant</p>
            <div class="flex gap-2 mb-6">
              @for (v of product.variants; track v.sku) {
                <ts-variant-option [color]="v.color" [label]="v.name" [selected]="facade.selectedVariant()?.sku === v.sku" (select)="facade.selectSku(v.sku)" />
              }
            </div>
            <ts-button (clicked)="facade.addToCart()">Add to cart</ts-button>
          </div>
        </div>
      }
    </motion>
  `,
})

# fix product page closing tag
p = (B / "packages/mfe-decide/src/app/pages/product-page/product-page.component.ts").read_text()
p = p.replace("</motion>", "</div>").replace(
  "  `,\n})\n\n",
  "  `,\n})\nexport class ProductPageComponent implements OnInit {\n  readonly facade = inject(DecideFacade);\n  private readonly route = inject(ActivatedRoute);\n  ngOnInit(): void {\n    const id = this.route.parent?.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('id') ?? '';\n    this.facade.loadProduct(id);\n  }\n}\n",
  1,
)
(B / "packages/mfe-decide/src/app/pages/product-page/product-page.component.ts").write_text(p.replace("</motion>", "</div>"))

print("decide done")
