import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  CART_API_URL,
  CATALOG_API_URL,
  ORDER_API_URL,
  BackendCartResponse,
  Cart,
  OrderConfirmation,
  PlaceOrderRequest,
  Result,
  Store,
  err,
  mapBackendCart,
  ok,
} from '@tractor-store/shared-catalog';

interface PlaceOrderResponse {
  orderId: string;
  status: string;
  total: number;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  pickupStore?: Store;
  shipping?: { address: string; city: string; zip: string };
}

@Injectable()
export class CheckoutApiService {
  private readonly http = inject(HttpClient);
  private readonly cartUrl = inject(CART_API_URL);
  private readonly orderUrl = inject(ORDER_API_URL);
  private readonly catalogUrl = inject(CATALOG_API_URL);

  getCart(): Observable<Result<Cart>> {
    return this.http.get<BackendCartResponse>(this.cartUrl).pipe(
      map((value) => ok(mapBackendCart(value))),
      catchError((e) => of(err(e?.message ?? 'Failed to load cart')))
    );
  }

  getStores(): Observable<Result<Store[]>> {
    return this.http.get<Store[]>(`${this.catalogUrl}/stores`).pipe(
      map((value) => ok(value)),
      catchError((e) => of(err(e?.message ?? 'Failed to load stores')))
    );
  }

  updateQuantity(sku: string, quantity: number): Observable<Result<Cart>> {
    return this.getCart().pipe(
      switchMap((current) => {
        if (!current.ok) return of(current);
        const line = current.value.items.find((i) => i.sku === sku);
        const currentQty = line?.quantity ?? 0;
        if (quantity === currentQty) return of(current);
        const url =
          quantity > currentQty
            ? `${this.cartUrl}/items`
            : `${this.cartUrl}/items/${sku}`;
        const body = quantity > currentQty ? { sku } : undefined;
        const request =
          quantity > currentQty
            ? this.http.post<BackendCartResponse>(url, body)
            : this.http.delete<BackendCartResponse>(url);
        return request.pipe(
          map((value) => ok(mapBackendCart(value))),
          catchError((e) => of(err(e?.message ?? 'Update failed')))
        );
      })
    );
  }

  placeOrder(payload: PlaceOrderRequest): Observable<Result<OrderConfirmation>> {
    return this.http.post<PlaceOrderResponse>(this.orderUrl, payload).pipe(
      map((value) =>
        ok({
          orderId: value.orderId,
          fulfillmentType: value.fulfillmentType,
          pickupStore: value.pickupStore,
          shipping: value.shipping,
          message: `Order ${value.orderId} placed successfully`,
        })
      ),
      catchError((e) => of(err(e?.message ?? 'Order failed')))
    );
  }
}
