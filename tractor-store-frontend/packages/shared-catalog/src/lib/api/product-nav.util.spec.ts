import { parseProductUrl } from './product-nav.util';

describe('parseProductUrl', () => {
  it('parses product id', () => {
    expect(parseProductUrl('/product/CL-01')).toEqual({ productId: 'CL-01', sku: undefined });
  });

  it('parses product id and sku query', () => {
    expect(parseProductUrl('/product/AU-02?sku=AU-02-OG')).toEqual({
      productId: 'AU-02',
      sku: 'AU-02-OG',
    });
  });

  it('returns null for invalid url', () => {
    expect(parseProductUrl('/catalog/list')).toBeNull();
  });
});
