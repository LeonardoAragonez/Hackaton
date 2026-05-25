import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import {
  CART_API_URL,
  CATALOG_API_URL,
  CDN_BASE_URL,
  ToastService,
  ok,
  err,
} from '@tractor-store/shared-catalog';

import { DecideFacade } from './decide.facade';
import { DecideApiService } from '../data/decide-api.service';

describe('DecideFacade', () => {
  const product = {
    name: 'Tractor',
    id: 'CL-01',
    category: 'classic',
    highlights: ['fuerte'],
    variants: [
      { name: 'Verde', image: '/g.webp', sku: 'CL-01-GR', color: 'green', price: 100 },
      { name: 'Rojo', image: '/r.webp', sku: 'CL-01-RD', color: 'red', price: 110 },
    ],
  };

  let facade: DecideFacade;
  let apiMock: { getProduct: jest.Mock; getRandomRecommendations: jest.Mock };
  let httpMock: { get: jest.Mock; post: jest.Mock };
  let routerMock: { navigate: jest.Mock; navigateByUrl: jest.Mock };
  let toastMock: { show: jest.Mock };
  let routeMock: { snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } };

  beforeEach(() => {
    apiMock = {
      getProduct: jest.fn(),
      getRandomRecommendations: jest.fn().mockReturnValue(of(ok([]))),
    };
    httpMock = {
      get: jest.fn().mockReturnValue(of({ sku: 'CL-01-GR', quantity: 5, available: true })),
      post: jest.fn(),
    };
    routerMock = {
      navigate: jest.fn().mockResolvedValue(true),
      navigateByUrl: jest.fn().mockResolvedValue(true),
    };
    toastMock = { show: jest.fn() };
    routeMock = { snapshot: { queryParamMap: convertToParamMap({}) } };

    TestBed.configureTestingModule({
      providers: [
        DecideFacade,
        { provide: DecideApiService, useValue: apiMock },
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: ToastService, useValue: toastMock },
        { provide: CDN_BASE_URL, useValue: 'https://cdn.test' },
        { provide: CART_API_URL, useValue: '/api/cart' },
        { provide: CATALOG_API_URL, useValue: '/api/catalog' },
      ],
    });

    facade = TestBed.inject(DecideFacade);
  });

  it('cdnUrl y productHeroUrl resuelven la url completa', () => {
    expect(facade.cdnUrl('/product/x.webp')).toContain('https://cdn.test');
    expect(facade.productHeroUrl('/product/[size]/x.webp')).toContain('200');
  });

  it('loadProduct éxito carga producto, selecciona primer sku y pide recomendaciones', () => {
    apiMock.getProduct.mockReturnValue(of(ok(product)));

    facade.loadProduct('CL-01');

    expect(facade.product()?.id).toBe('CL-01');
    expect(facade.selectedVariant()?.sku).toBe('CL-01-GR');
    expect(facade.loading()).toBe(false);
    expect(apiMock.getRandomRecommendations).toHaveBeenCalledWith('CL-01', 4);
    expect(httpMock.get).toHaveBeenCalledWith('/api/inventory/CL-01-GR');
  });

  it('loadProduct usa sku del queryParam cuando está presente', () => {
    routeMock.snapshot.queryParamMap = convertToParamMap({ sku: 'CL-01-RD' });
    apiMock.getProduct.mockReturnValue(of(ok(product)));

    facade.loadProduct('CL-01');

    expect(facade.selectedVariant()?.sku).toBe('CL-01-RD');
  });

  it('loadProduct error setea error y no toca recomendaciones', () => {
    apiMock.getProduct.mockReturnValue(of(err('falló')));

    facade.loadProduct('CL-01');

    expect(facade.error()).toBe('falló');
    expect(facade.loading()).toBe(false);
    expect(apiMock.getRandomRecommendations).not.toHaveBeenCalled();
  });

  it('selectSku actualiza url cuando updateUrl=true y consulta stock', () => {
    facade.selectSku('CL-01-RD');

    expect(routerMock.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { sku: 'CL-01-RD' } })
    );
    expect(httpMock.get).toHaveBeenCalledWith('/api/inventory/CL-01-RD');
    expect(facade.stockAvailable()).toBe(5);
  });

  it('selectSku con error de inventario deja stock en null', () => {
    httpMock.get.mockReturnValueOnce(throwError(() => new Error('boom')));
    facade.selectSku('CL-01-GR', false);
    expect(facade.stockAvailable()).toBeNull();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('addToCart no hace nada si no hay sku seleccionado', () => {
    facade.addToCart();
    expect(httpMock.post).not.toHaveBeenCalled();
  });

  it('addToCart éxito muestra toast, actualiza estado y recarga stock', () => {
    apiMock.getProduct.mockReturnValue(of(ok(product)));
    facade.loadProduct('CL-01');

    httpMock.post.mockReturnValue(
      of({
        sessionId: 'sess',
        items: [{ sku: 'CL-01-GR', name: 'Verde', image: '/g.webp', quantity: 1, unitPrice: 100, lineTotal: 100 }],
        itemCount: 1,
        total: 100,
      })
    );

    facade.addToCart();

    expect(toastMock.show).toHaveBeenCalledWith(expect.stringContaining('Verde'), 'success');
    expect(facade.cartMessage()).toBe('Producto añadido al carrito');
    expect(facade.cartMessageKind()).toBe('success');
  });

  it('addToCart error muestra mensaje de error', () => {
    apiMock.getProduct.mockReturnValue(of(ok(product)));
    facade.loadProduct('CL-01');

    httpMock.post.mockReturnValue(
      throwError(() => ({ error: { code: 'OUT_OF_STOCK', message: 'sin stock' } }))
    );

    facade.addToCart();

    expect(toastMock.show).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(facade.cartMessageKind()).toBe('error');
  });

  it('goToProduct delega en router', () => {
    facade.goToProduct('/product/CL-02');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/product/CL-02');
  });

  it('openRecommendation parseable navega con params', () => {
    facade.openRecommendation({
      name: 'R',
      sku: 'R-1',
      image: '/r.webp',
      url: '/product/CL-02?sku=CL-02-OG',
      rgb: [0, 0, 0],
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/product', 'CL-02'],
      expect.objectContaining({ queryParams: { sku: 'CL-02-OG' } })
    );
  });

  it('openRecommendation no parseable usa navigateByUrl', () => {
    facade.openRecommendation({
      name: 'R',
      sku: 'R-1',
      image: '/r.webp',
      url: '/externa',
      rgb: [0, 0, 0],
    });
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/externa');
  });

  it('loadProduct recomendaciones success guarda en estado', () => {
    apiMock.getProduct.mockReturnValue(of(ok(product)));
    apiMock.getRandomRecommendations.mockReturnValue(
      of(ok([{ name: 'R', sku: 'R-1', image: '/r.webp', url: '/product/CL-02', rgb: [0, 0, 0] }]))
    );

    facade.loadProduct('CL-01');

    expect(facade.recommendations()).toHaveLength(1);
  });
});
