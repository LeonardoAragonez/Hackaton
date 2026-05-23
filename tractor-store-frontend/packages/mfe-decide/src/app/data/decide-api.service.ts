import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CATALOG_API_URL,
  ProductDetail,
  RecommendationItem,
  Result,
  err,
  ok,
} from '@tractor-store/shared-catalog';

@Injectable()
export class DecideApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(CATALOG_API_URL);

  getProduct(id: string): Observable<Result<ProductDetail>> {
    return this.http.get<ProductDetail>(`${this.base}/products/${id}`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Product not found')))
    );
  }

  getRandomRecommendations(productId: string, limit = 4): Observable<Result<RecommendationItem[]>> {
    return this.http
      .get<RecommendationItem[]>(`${this.base}/recommendations`, {
        params: { random: 'true', excludeProductId: productId, limit: String(limit) },
      })
      .pipe(
        map((value) => ok(Array.isArray(value) ? value : [])),
        catchError(() => of(ok([])))
      );
  }
}
