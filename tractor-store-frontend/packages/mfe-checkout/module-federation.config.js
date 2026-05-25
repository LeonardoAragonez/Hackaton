module.exports = {
  name: 'mfe-checkout',
  exposes: {
    './Routes': 'packages/mfe-checkout/src/app/remote-entry/entry.routes.ts',
    './MiniCart': 'packages/mfe-checkout/src/app/remote-entry/mini-cart.entry.ts',
  },
};
