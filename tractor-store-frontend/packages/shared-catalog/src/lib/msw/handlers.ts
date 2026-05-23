import { http, HttpResponse } from 'msw';
import exploreDb from '../../mocks/data/explore-db.json';
import decideDb from '../../mocks/data/decide-db.json';
import checkoutDb from '../../mocks/data/checkout-db.json';
import type { CartLine } from '../models/checkout.models';

const cartState: { items: CartLine[] } = { items: [] };

const calcCart = () => {
  const subtotal = cartState.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cartState.items.reduce((s, i) => s + i.quantity, 0);
  return { items: [...cartState.items], subtotal, itemCount };
};

const toBackendCart = () => {
  const cart = calcCart();
  return {
    sessionId: 'msw-session',
    items: cart.items.map((i) => ({
      sku: i.sku,
      name: i.name,
      image: i.image,
      quantity: i.quantity,
      unitPrice: i.price,
      lineTotal: i.price * i.quantity,
    })),
    itemCount: cart.itemCount,
    total: cart.subtotal,
  };
};

const findVariant = (sku: string) =>
  (checkoutDb as { variants: Array<Record<string, unknown>> }).variants.find(
    (v) => v['sku'] === sku
  );

const productResponse = (id: string) => {
  const product = decideDb.products.find((p) => p.id === id);
  if (!product) return null;
  const highlights =
    (product as { highlights?: string[] }).highlights ??
    (product as { highlightsa?: string[] }).highlightsa ??
    [];
  return HttpResponse.json({ ...product, highlights });
};

type RecItem = { name: string; sku: string; image: string; url: string };

const allRecommendations = (): RecItem[] =>
  Object.values(
    (exploreDb as { recommendations: Record<string, RecItem> }).recommendations
  );

const randomRecommendations = (excludeProductId: string, limit: number): RecItem[] => {
  const shuffled = [...allRecommendations()].sort(() => Math.random() - 0.5);
  const seen = new Set<string>();
  const picked: RecItem[] = [];
  const excludePath = `/product/${excludeProductId}`;

  for (const item of shuffled) {
    const match = item.url.match(/\/product\/([^/?]+)/);
    const productId = match?.[1];
    if (!productId || productId === excludeProductId || item.url.includes(excludePath)) {
      continue;
    }
    if (seen.has(productId)) continue;
    seen.add(productId);
    picked.push(item);
    if (picked.length >= limit) break;
  }
  return picked;
};

const addSku = async ({ request }: { request: Request }) => {
  const body = (await request.json()) as { sku: string; quantity?: number };
  const variant = findVariant(body.sku);
  if (!variant) return new HttpResponse(null, { status: 404 });
  const qty = body.quantity ?? 1;
  const existing = cartState.items.find((i) => i.sku === body.sku);
  if (existing) {
    existing.quantity += qty;
  } else {
    cartState.items.push({
      sku: String(variant['sku']),
      name: String(variant['name']),
      price: Number(variant['price']),
      quantity: qty,
      image: String(variant['image']),
    });
  }
  return HttpResponse.json(toBackendCart());
};

export const handlers = [
  // Backend contract (Spring Boot)
  http.get('/api/catalog/home', () =>
    HttpResponse.json({ teaser: exploreDb.teaser, categories: exploreDb.categories })
  ),
  http.get('/api/catalog/categories/:key', ({ params }) => {
    const category = exploreDb.categories.find((c) => c.key === params['key']);
    return category ? HttpResponse.json(category) : new HttpResponse(null, { status: 404 });
  }),
  http.get('/api/catalog/stores', () => HttpResponse.json(exploreDb.stores)),
  http.get('/api/catalog/recommendations', ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('random') === 'true') {
      const exclude = url.searchParams.get('excludeProductId') ?? '';
      const limit = Number(url.searchParams.get('limit') ?? '4');
      return HttpResponse.json(randomRecommendations(exclude, limit));
    }
    const skus = url.searchParams.get('skus');
    if (skus) {
      const list = skus.split(',').map((s) => s.trim());
      return HttpResponse.json(allRecommendations().filter((r) => list.includes(r.sku)));
    }
    return HttpResponse.json(allRecommendations().slice(0, 4));
  }),
  http.get('/api/catalog/products/:id', ({ params }) => {
    const res = productResponse(String(params['id']));
    return res ?? new HttpResponse(null, { status: 404 });
  }),
  http.get('/api/cart', () => HttpResponse.json(toBackendCart())),
  http.get('/api/cart/mini', () => {
    const c = calcCart();
    return HttpResponse.json({ itemCount: c.itemCount, total: c.subtotal });
  }),
  http.post('/api/cart/items', addSku),
  http.delete('/api/cart/items/:sku', ({ params }) => {
    const line = cartState.items.find((i) => i.sku === params['sku']);
    if (!line) return new HttpResponse(null, { status: 404 });
    if (line.quantity > 1) line.quantity -= 1;
    else cartState.items = cartState.items.filter((i) => i.sku !== params['sku']);
    return HttpResponse.json(toBackendCart());
  }),
  http.post('/api/orders', async ({ request }) => {
    const body = (await request.json()) as {
      fulfillmentType: string;
      storeId?: string;
      address?: string;
      city?: string;
      zip?: string;
    };
    const total = cartState.items.reduce((s, i) => s + i.price * i.quantity, 0);
    cartState.items = [];
    const isPickup = body.fulfillmentType === 'PICKUP';
    const store = isPickup
      ? exploreDb.stores.find((s) => s.id === body.storeId) ?? exploreDb.stores[0]
      : null;
    return HttpResponse.json({
      orderId: crypto.randomUUID(),
      status: 'PLACED',
      total,
      fulfillmentType: body.fulfillmentType,
      pickupStore: store ?? undefined,
      shipping: isPickup
        ? undefined
        : { address: body.address ?? '', city: body.city ?? '', zip: body.zip ?? '' },
    });
  }),
];

export const resetCartState = (): void => {
  cartState.items = [];
};
