#!/usr/bin/env python3
from pathlib import Path
BASE = Path(__file__).resolve().parent.parent

def w(rel, content):
    p = BASE / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.rstrip() + "\n")

SCSS = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"

def mfe_project(name, port):
    w(f"packages/mfe-{name}/project.json", f'''{{
  "name": "mfe-{name}",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "{name[:3]}",
  "sourceRoot": "packages/mfe-{name}/src",
  "tags": ["scope:{name}", "type:mfe"],
  "targets": {{
    "build": {{
      "executor": "@nx/angular:webpack-browser",
      "outputs": ["{{options.outputPath}}"],
      "options": {{
        "outputPath": "dist/packages/mfe-{name}",
        "index": "packages/mfe-{name}/src/index.html",
        "main": "packages/mfe-{name}/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "packages/mfe-{name}/tsconfig.app.json",
        "styles": ["packages/design-tokens/src/index.css", "packages/mfe-{name}/src/styles.scss"],
        "customWebpackConfig": {{ "path": "packages/mfe-{name}/webpack.config.ts" }}
      }},
      "configurations": {{
        "production": {{ "outputHashing": "all" }},
        "development": {{ "optimization": false, "sourceMap": true }}
      }},
      "defaultConfiguration": "production"
    }},
    "serve": {{
      "executor": "@nx/angular:module-federation-dev-server",
      "options": {{
        "port": {port},
        "publicHost": "http://localhost:{port}",
        "buildTarget": "mfe-{name}:build:development"
      }},
      "defaultConfiguration": "development"
    }},
    "lint": {{ "executor": "@nx/eslint:lint" }}
  }}
}}''')

for n, p in [("decide", 4202), ("checkout", 4203)]:
    mfe_project(n, p)

# Update checkout module federation for MiniCart expose
w("packages/mfe-checkout/module-federation.config.ts", '''import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe-checkout',
  exposes: {
    './Routes': 'packages/mfe-checkout/src/app/remote-entry/entry.routes.ts',
    './MiniCart': 'packages/mfe-checkout/src/app/remote-entry/mini-cart.entry.ts',
  },
  shared: (libraryName, defaultConfig) => {
    if (['@angular/core', '@angular/common', '@angular/router', 'rxjs', '@tractor-store/shared-catalog'].includes(libraryName)) {
      return { ...defaultConfig, singleton: true, strictVersion: false };
    }
    return defaultConfig;
  },
};

export default config;
''')

print("projects ok")
