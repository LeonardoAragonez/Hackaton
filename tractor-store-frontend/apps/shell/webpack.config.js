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

const remotes = isProd
  ? {
      'mfe-explore': 'mfe_explore@/mfe-explore/remoteEntry.js',
      'mfe-decide': 'mfe_decide@/mfe-decide/remoteEntry.js',
      'mfe-checkout': 'mfe_checkout@/mfe-checkout/remoteEntry.js',
    }
  : {
      'mfe-explore': 'mfe_explore@http://localhost:4201/remoteEntry.js',
      'mfe-decide': 'mfe_decide@http://localhost:4202/remoteEntry.js',
      'mfe-checkout': 'mfe_checkout@http://localhost:4203/remoteEntry.js',
    };

module.exports = (config) => {
  config = applyAliases(config);
  config.plugins = config.plugins ?? [];
  config.plugins.push(
    new container.ModuleFederationPlugin({
      name: 'shell',
      remotes,
      shared,
    })
  );
  config.output = { ...config.output, publicPath: 'auto', uniqueName: 'shell' };
  return config;
};
