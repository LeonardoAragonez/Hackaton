import { err, flatMapResult, mapResult, ok } from './result';

describe('result', () => {
  it('ok wraps value', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
  });

  it('err wraps error', () => {
    expect(err('x')).toEqual({ ok: false, error: 'x' });
  });

  it('mapResult maps ok branch', () => {
    expect(mapResult(ok(2), (n) => n * 2)).toEqual(ok(4));
  });

  it('mapResult preserves err', () => {
    const e = err('fail');
    expect(mapResult(e, (n: number) => n * 2)).toBe(e);
  });

  it('flatMapResult chains ok', () => {
    expect(flatMapResult(ok(1), (n) => ok(n + 1))).toEqual(ok(2));
  });

  it('flatMapResult preserves err', () => {
    const e = err('e');
    expect(flatMapResult(e, () => ok(0))).toBe(e);
  });
});
