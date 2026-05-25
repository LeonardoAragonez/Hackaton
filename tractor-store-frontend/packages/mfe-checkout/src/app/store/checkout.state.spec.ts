import { createCheckoutStore, initialCheckoutState } from './checkout.state';

describe('checkoutState', () => {
  it('createCheckoutStore expone signal con estado inicial', () => {
    const store = createCheckoutStore();
    expect(store.state()).toEqual(initialCheckoutState());
  });

  it('createCheckoutStore permite mutar el signal', () => {
    const store = createCheckoutStore();
    store.state.update((s) => ({ ...s, loading: true }));
    expect(store.state().loading).toBe(true);
  });
});
