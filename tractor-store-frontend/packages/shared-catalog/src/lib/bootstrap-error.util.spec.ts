import { rethrowBootstrapFailure } from './bootstrap-error.util';

describe('rethrowBootstrapFailure', () => {
  it('rethrows Error instances', () => {
    const err = new Error('bootstrap failed');
    expect(() => rethrowBootstrapFailure(err)).toThrow(err);
  });

  it('wraps non-Error values', () => {
    expect(() => rethrowBootstrapFailure('oops')).toThrow('oops');
  });
});
