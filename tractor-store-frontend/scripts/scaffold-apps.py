#!/usr/bin/env python3
"""Scaffold Angular MFE source files."""
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

def w(rel: str, content: str) -> None:
    p = BASE / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip() + "\n")

# Common styles
STYLES_SCSS = """@tailwind base;
@tailwind components;
@tailwind utilities;
"""

# --- EXPLORE ---
w("packages/mfe-explore/src/index.html", """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>mfe-explore</title><base href="/"/></head>
<body><app-explore-root></app-explore-root></body></html>""")

w("packages/mfe-explore/src/styles.scss", STYLES_SCSS)
w("packages/mfe-explore/src/main.ts", """import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
""")

w("packages/mfe-explore/src/app/app.config.ts", """import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { EXPLORE_API_URL, CDN_BASE_URL } from '@tractor-store/shared-catalog';
import { remoteRoutes } from './remote-entry/entry.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(remoteRoutes),
    provideHttpClient(),
    { provide: EXPLORE_API_URL, useValue: '/api/explore' },
    { provide: CDN_BASE_URL, useValue: 'https://blueprint.the-tractor.store' },
  ],
};
""")

w("packages/mfe-explore/src/app/app.component.ts", """import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-explore-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
""")

w("packages/mfe-explore/src/app/remote-entry/entry.routes.ts", """import { Route } from '@angular/router';
import { HomePageComponent } from '../pages/home-page/home-page.component';
import { CategoryPageComponent } from '../pages/category-page/category-page.component';
import { StoresPageComponent } from '../pages/stores-page/stores-page.component';

export const remoteRoutes: Route[] = [
  { path: '', component: HomePageComponent },
  { path: 'products/:key', component: CategoryPageComponent },
  { path: 'stores', component: StoresPageComponent },
];
""")

# Explore store
w("packages/mfe-explore/src/app/store/explore.state.ts", """import { signal } from '@angular/core';
import type { Category, ExploreHome, Store } from '@tractor-store/shared-catalog';

export interface ExploreState {
  home: ExploreHome | null;
  category: Category | null;
  stores: Store[];
  recommendations: Record<string, unknown>;
  loading: boolean;
  error: string | null;
}

export const initialExploreState = (): ExploreState => ({
  home: null,
  category: null,
  stores: [],
  recommendations: {},
  loading: false,
  error: null,
});

export const createExploreStore = () => {
  const state = signal<ExploreState>(initialExploreState());
  return { state };
};
""")

w("packages/mfe-explore/src/app/store/explore.actions.ts", """import type { ExploreState } from './explore.state';

export const exploreActions = {
  loadHomeStart: (s: ExploreState): ExploreState => ({ ...s, loading: true, error: null }),
  loadHomeSuccess: (s: ExploreState, home: ExploreState['home']): ExploreState => ({
    ...s,
    loading: false,
    home,
  }),
  loadCategorySuccess: (s: ExploreState, category: ExploreState['category']): ExploreState => ({
    ...s,
    loading: false,
    category,
  }),
  loadStoresSuccess: (s: ExploreState, stores: ExploreState['stores']): ExploreState => ({
    ...s,
    loading: false,
    stores,
  }),
  loadRecommendationsSuccess: (
    s: ExploreState,
    recommendations: ExploreState['recommendations']
  ): ExploreState => ({ ...s, recommendations }),
  setError: (s: ExploreState, error: string): ExploreState => ({ ...s, loading: false, error }),
};
""")

w("packages/mfe-explore/src/app/store/explore.selectors.ts", """import type { ExploreState } from './explore.state';

export const exploreSelectors = {
  home: (s: ExploreState) => s.home,
  category: (s: ExploreState) => s.category,
  stores: (s: ExploreState) => s.stores,
  recommendations: (s: ExploreState) => s.recommendations,
  loading: (s: ExploreState) => s.loading,
  error: (s: ExploreState) => s.error,
};
""")

w("packages/mfe-explore/src/app/data/explore-api.service.ts", """import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EXPLORE_API_URL,
  Category,
  ExploreHome,
  Store,
  Result,
  ok,
  err,
} from '@tractor-store/shared-catalog';
import { map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExploreApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(EXPLORE_API_URL);

  getHome(): Observable<Result<ExploreHome>> {
    return this.http.get<ExploreHome>(`${this.base}/home`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Failed to load home')))
    );
  }

  getCategory(key: string): Observable<Result<Category>> {
    return this.http.get<Category>(`${this.base}/categories/${key}`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Category not found')))
    );
  }

  getStores(): Observable<Result<Store[]>> {
    return this.http.get<Store[]>(`${this.base}/stores`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Failed to load stores')))
    );
  }

  getRecommendations(): Observable<Result<Record<string, unknown>>> {
    return this.http.get<Record<string, unknown>>(`${this.base}/recommendations`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Failed')))
    );
  }
}
""")

w("packages/mfe-explore/src/app/store/explore.facade.ts", """import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  catalogEventBus,
  CATALOG_EVENTS,
  CDN_BASE_URL,
  resolveCdnUrl,
} from '@tractor-store/shared-catalog';
import { ExploreApiService } from '../data/explore-api.service';
import { createExploreStore } from './explore.state';
import { exploreActions } from './explore.actions';
import { exploreSelectors } from './explore.selectors';

@Injectable({ providedIn: 'root' })
export class ExploreFacade {
  private readonly api = inject(ExploreApiService);
  private readonly router = inject(Router);
  private readonly cdn = inject(CDN_BASE_URL);
  private readonly { state } = createExploreStore();

  readonly home = computed(() => exploreSelectors.home(this.state()));
  readonly category = computed(() => exploreSelectors.category(this.state()));
  readonly stores = computed(() => exploreSelectors.stores(this.state()));
  readonly recommendations = computed(() => exploreSelectors.recommendations(this.state()));
  readonly loading = computed(() => exploreSelectors.loading(this.state()));
  readonly error = computed(() => exploreSelectors.error(this.state()));

  cdnUrl(path: string): string {
    return resolveCdnUrl(path, this.cdn);
  }

  loadHome(): void {
    this.state.update((s) => exploreActions.loadHomeStart(s));
    this.api.getHome().subscribe((result) => {
      if (result.ok) {
        this.state.update((s) => exploreActions.loadHomeSuccess(s, result.value));
        this.api.getRecommendations().subscribe((rec) => {
          if (rec.ok) {
            this.state.update((s) => exploreActions.loadRecommendationsSuccess(s, rec.value));
          }
        });
      } else {
        this.state.update((s) => exploreActions.setError(s, String(result.error)));
      }
    });
  }

  loadCategory(key: string): void {
    this.state.update((s) => exploreActions.loadHomeStart(s));
    this.api.getCategory(key).subscribe((result) => {
      if (result.ok) {
        this.state.update((s) => exploreActions.loadCategorySuccess(s, result.value));
      } else {
        this.state.update((s) => exploreActions.setError(s, String(result.error)));
      }
    });
  }

  loadStores(): void {
    this.api.getStores().subscribe((result) => {
      if (result.ok) {
        this.state.update((s) => exploreActions.loadStoresSuccess(s, result.value));
      }
    });
  }

  selectStore(storeId: string, storeName: string): void {
    catalogEventBus.emit(CATALOG_EVENTS.STORE_SELECTED, { storeId, storeName });
  }

  goToProduct(id: string): void {
    void this.router.navigate(['/product', id]);
  }

  goToCategory(key: string): void {
    void this.router.navigate(['/products', key]);
  }
}
""")

# Explore layout components
for name, sel, tmpl in [
  ("header", "explore-header", """<header class="flex items-center justify-between px-6 py-4 bg-brand-primary text-white">
  <a routerLink="/" class="text-xl font-display">Tractor Store</a>
  <nav class="flex gap-4">
    <a routerLink="/" class="hover:underline">Home</a>
    <a routerLink="/stores" class="hover:underline">Stores</a>
    <a routerLink="/checkout/cart" class="hover:underline">Cart</a>
  </nav>
</header>"""),
  ("footer", "explore-footer", """<footer class="px-6 py-8 mt-auto text-sm text-center text-text-muted bg-surface-muted">
  &copy; {{ year }} Tractor Store — Hackathon Edition
</footer>"""),
]:
    extra = "readonly year = new Date().getFullYear();" if name == "footer" else ""
    imp = "import { RouterLink } from '@angular/router';\n" if name == "header" else ""
    imps = "[RouterLink]" if name == "header" else "[]"
    w(f"packages/mfe-explore/src/app/components/{name}/{name}.component.ts", f"""import {{ Component }} from '@angular/core';
{imp}
@Component({{
  selector: '{sel}',
  standalone: true,
  imports: {imps},
  template: `{tmpl}`,
}})
export class {name.title()}Component {{
  {extra}
}}
""")

w("packages/mfe-explore/src/app/components/recommendations/recommendations.component.ts", """import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExploreFacade } from '../../store/explore.facade';

@Component({
  selector: 'explore-recommendations',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (items().length) {
      <section class="px-6 py-8">
        <h2 class="mb-4 text-2xl font-display">Recommended for you</h2>
        <motion class="grid grid-cols-2 gap-4 md:grid-cols-4">
          @for (item of items(); track item.sku) {
            <a [routerLink]="item.url" class="block p-3 bg-white rounded-card shadow-card">
              <img [src]="facade.cdnUrl(item.image)" [alt]="item.name" class="object-cover w-full aspect-square rounded" />
              <p class="mt-2 text-sm font-medium">{{ item.name }}</p>
            </a>
          }
        </motion>
      </section>
    }
  `,
})
export class RecommendationsComponent {
  readonly facade = inject(ExploreFacade);
  readonly items = input<{ name: string; sku: string; image: string; url: string }[]>([]);
}
""".replace("<motion", "<div").replace("</motion>", "</motion>").replace("</motion>", "</motion>"))

# fix recommendations template
rec_content = Path(BASE / "packages/mfe-explore/src/app/components/recommendations/recommendations.component.ts").read_text()
rec_content = rec_content.replace("<motion class", "<motion class").replace("<motion class", "<div class", 1).replace("</motion>", "</motion>", 1)
# simpler rewrite
w("packages/mfe-explore/src/app/components/recommendations/recommendations.component.ts", """import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExploreFacade } from '../../store/explore.facade';

@Component({
  selector: 'explore-recommendations',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (items().length) {
      <section class="px-6 py-8">
        <h2 class="mb-4 text-2xl font-display">Recommended for you</h2>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          @for (item of items(); track item.sku) {
            <a [routerLink]="item.url" class="block p-3 bg-white rounded-card shadow-card">
              <img [src]="facade.cdnUrl(item.image)" [alt]="item.name" class="object-cover w-full aspect-square rounded" />
              <p class="mt-2 text-sm font-medium">{{ item.name }}</p>
            </a>
          }
        </motion>
      </section>
    }
  `,
})
export class RecommendationsComponent {
  readonly facade = inject(ExploreFacade);
  readonly items = input<{ name: string; sku: string; image: string; url: string }[]>([]);
}
""".replace("</motion>", "</motion>", 1).replace("<motion", "<div", 1).replace("</motion>", "</motion>", 1))

print("partial")
