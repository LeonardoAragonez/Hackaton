const buildAngularPkg = require.resolve('@angular-devkit/build-angular/package.json');
const { container } = require(require.resolve('webpack', { paths: [buildAngularPkg] }));

const shared = {
  '@angular/core': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/common': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/common/http': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@angular/router': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  rxjs: { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@tractor-store/shared-catalog': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
};

const applyAliases = require('../../tools/webpack-aliases');

const isProd = process.env['NODE_ENV'] === 'production';

module.exports = (config) => {
  config = applyAliases(config);
  config.optimization = {
    ...config.optimization,
    runtimeChunk: false,
  };
  config.plugins = config.plugins ?? [];
  config.plugins.push(
    new container.ModuleFederationPlugin({
      name: 'mfe_checkout',
      library: { type: 'window', name: 'mfe_checkout' },
      filename: 'remoteEntry.js',
      exposes: {
        './Routes': './packages/mfe-checkout/src/app/remote-entry/entry.routes.ts',
        './MiniCart': './packages/mfe-checkout/src/app/remote-entry/mini-cart.entry.ts',
      },
      shared,
    })
  );
  config.output = {
    ...config.output,
    publicPath: isProd ? '/mfe-checkout/' : 'auto',
    uniqueName: 'mfe_checkout',
  };
  return config;
};
