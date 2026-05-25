import { normalizeBootstrapFailure, rethrowBootstrapFailure } from './bootstrap-error.util';

describe('normalizeBootstrapFailure', () => {
  it('returns Error instances unchanged', () => {
    const err = new Error('bootstrap failed');
    expect(normalizeBootstrapFailure(err)).toBe(err);
  });

  it('wraps non-Error values', () => {
    expect(normalizeBootstrapFailure('oops').message).toBe('oops');
  });
});

describe('rethrowBootstrapFailure', () => {
  it('rethrows Error instances', () => {
    const err = new Error('bootstrap failed');
    expect(() => rethrowBootstrapFailure(err)).toThrow(err);
  });

  it('wraps non-Error values', () => {
    expect(() => rethrowBootstrapFailure('oops')).toThrow('oops');
  });
});
