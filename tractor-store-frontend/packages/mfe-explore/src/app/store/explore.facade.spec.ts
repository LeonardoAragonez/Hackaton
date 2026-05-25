import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CDN_BASE_URL, ok, err } from '@tractor-store/shared-catalog';

import { ExploreFacade } from './explore.facade';
import { ExploreApiService } from '../data/explore-api.service';

describe('ExploreFacade', () => {
  let facade: ExploreFacade;
  let apiMock: {
    getHome: jest.Mock;
    getCategory: jest.Mock;
    getStores: jest.Mock;
    getRecommendations: jest.Mock;
  };
  let routerMock: { navigate: jest.Mock; navigateByUrl: jest.Mock };

  beforeEach(() => {
    apiMock = {
      getHome: jest.fn(),
      getCategory: jest.fn(),
      getStores: jest.fn(),
      getRecommendations: jest.fn().mockReturnValue(of(ok({}))),
    };
    routerMock = {
      navigate: jest.fn().mockResolvedValue(true),
      navigateByUrl: jest.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        ExploreFacade,
        { provide: ExploreApiService, useValue: apiMock },
        { provide: Router, useValue: routerMock },
        { provide: CDN_BASE_URL, useValue: 'https://cdn.test' },
      ],
    });

    facade = TestBed.inject(ExploreFacade);
  });

  it('cdnUrl resuelve la url', () => {
    expect(facade.cdnUrl('/scene/x.webp')).toContain('https://cdn.test');
  });

  it('loadHome éxito carga home y luego recomendaciones', () => {
    const home = { teaser: [], categories: [] } as never;
    const recs = { 'CL-01': [{ sku: 'X' }] } as never;
    apiMock.getHome.mockReturnValue(of(ok(home)));
    apiMock.getRecommendations.mockReturnValue(of(ok(recs)));

    facade.loadHome();

    expect(facade.home()).toBe(home);
    expect(facade.recommendations()).toBe(recs);
    expect(facade.loading()).toBe(false);
  });

  it('loadHome falla setea error', () => {
    apiMock.getHome.mockReturnValue(of(err('boom')));
    facade.loadHome();
    expect(facade.error()).toBe('boom');
    expect(facade.loading()).toBe(false);
  });

  it('loadHome ignora recomendaciones cuando fallan', () => {
    apiMock.getHome.mockReturnValue(of(ok({} as never)));
    apiMock.getRecommendations.mockReturnValue(of(err('rec fail')));
    facade.loadHome();
    expect(facade.recommendations()).toEqual({});
  });

  it('loadCategory éxito guarda categoría', () => {
    const cat = { key: 'classic', name: 'Classic', products: [] } as never;
    apiMock.getCategory.mockReturnValue(of(ok(cat)));
    facade.loadCategory('classic');
    expect(facade.category()).toBe(cat);
    expect(facade.loading()).toBe(false);
  });

  it('loadCategory falla setea error', () => {
    apiMock.getCategory.mockReturnValue(of(err('no cat')));
    facade.loadCategory('x');
    expect(facade.error()).toBe('no cat');
  });

  it('loadStores guarda lista', () => {
    const stores = [{ id: 's1' }] as never;
    apiMock.getStores.mockReturnValue(of(ok(stores)));
    facade.loadStores();
    expect(facade.stores()).toBe(stores);
  });

  it('loadStores ignora si falla', () => {
    apiMock.getStores.mockReturnValue(of(err('no')));
    facade.loadStores();
    expect(facade.stores()).toEqual([]);
  });

  it('selectStore emite evento de bus', () => {
    expect(() => facade.selectStore('s1', 'Tienda')).not.toThrow();
  });

  it('goToProduct navega a /product/:id', () => {
    facade.goToProduct('CL-01');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/product', 'CL-01']);
  });

  it('goToCategory navega a /products/:key', () => {
    facade.goToCategory('classic');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products', 'classic']);
  });

  it('openRecommendation parseable navega con sku', () => {
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

  it('openRecommendation parseable sin sku navega sin queryParams', () => {
    facade.openRecommendation({
      name: 'R',
      sku: 'R-1',
      image: '/r.webp',
      url: '/product/CL-02',
      rgb: [0, 0, 0],
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/product', 'CL-02'],
      expect.objectContaining({ queryParams: {} })
    );
  });

  it('openRecommendation no parseable usa navigateByUrl', () => {
    facade.openRecommendation({
      name: 'R',
      sku: 'R-1',
      image: '/r.webp',
      url: '/externo',
      rgb: [0, 0, 0],
    });
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/externo');
  });
});
