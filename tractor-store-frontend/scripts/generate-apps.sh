#!/usr/bin/env bash
# Generator script - run once during scaffold
set -e
BASE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BASE"

write_mfe_config() {
  local name=$1 port=$2
  cat > "packages/mfe-${name}/module-federation.config.ts" << EOF
import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe-${name}',
  exposes: {
    './Routes': 'packages/mfe-${name}/src/app/remote-entry/entry.routes.ts',
  },
  shared: (libraryName, defaultConfig) => {
    if (['@angular/core', '@angular/common', '@angular/router', 'rxjs', '@tractor-store/shared-catalog'].includes(libraryName)) {
      return { ...defaultConfig, singleton: true, strictVersion: false };
    }
    return defaultConfig;
  },
};

export default config;
EOF

  cat > "packages/mfe-${name}/webpack.config.ts" << EOF
import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

export default withModuleFederation(config, { dts: false });
EOF

  cat > "packages/mfe-${name}/tsconfig.app.json" << EOF
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "outDir": "../../dist/out-tsc/packages/mfe-${name}" },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
EOF

  cat > "packages/mfe-${name}/tsconfig.json" << EOF
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "../../dist/out-tsc/packages/mfe-${name}" },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts"]
}
EOF
}

write_mfe_config explore 4201
write_mfe_config decide 4202
write_mfe_config checkout 4203

echo "MFE configs written"
