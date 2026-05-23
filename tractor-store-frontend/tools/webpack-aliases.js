const path = require('path');

const root = path.join(__dirname, '..');

const aliases = {
  '@tractor-store/shared-catalog': path.join(root, 'packages/shared-catalog/src/index.ts'),
  '@tractor-store/ts-design-system': path.join(root, 'packages/ts-design-system/src/index.ts'),
  '@tractor-store/design-tokens': path.join(root, 'packages/design-tokens/src/index.css'),
};

module.exports = (config) => {
  config.resolve = config.resolve ?? {};
  config.resolve.alias = { ...config.resolve.alias, ...aliases };
  return config;
};
