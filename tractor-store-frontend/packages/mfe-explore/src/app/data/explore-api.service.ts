import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CATALOG_API_URL,
  Category,
  ExploreHome,
  Store,
  Result,
  ok,
  err,
} from '@tractor-store/shared-catalog';
import { map, catchError, of } from 'rxjs';

@Injectable()
export class ExploreApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(CATALOG_API_URL);

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

  getRecommendations(skus?: string): Observable<Result<Record<string, unknown>>> {
    const query = skus ? `?skus=${encodeURIComponent(skus)}` : '';
    return this.http.get<Record<string, unknown>>(`${this.base}/recommendations${query}`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Failed')))
    );
  }
}
