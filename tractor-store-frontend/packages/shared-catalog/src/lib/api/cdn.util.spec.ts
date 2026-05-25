import { resolveCdnUrl } from './cdn.util';

describe('resolveCdnUrl', () => {
  const base = 'https://cdn.example.com';

  it('returns absolute urls unchanged', () => {
    expect(resolveCdnUrl('https://img.test/a.png', base)).toBe('https://img.test/a.png');
  });

  it('resolves product path with default size 200', () => {
    expect(resolveCdnUrl('/product/[size]/x.png', base)).toBe(
      'https://cdn.example.com/product/200/x.png'
    );
  });

  it('resolves scene path with default size 500', () => {
    expect(resolveCdnUrl('/scene/[size]/hero.png', base)).toBe(
      'https://cdn.example.com/scene/500/hero.png'
    );
  });

  it('uses explicit size', () => {
    expect(resolveCdnUrl('/product/[size]/x.png', base, '120')).toBe(
      'https://cdn.example.com/product/120/x.png'
    );
  });
});
