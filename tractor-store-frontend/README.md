# Tractor Store Frontend

[![CI](https://github.com/quind/tractor-store-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/quind/tractor-store-frontend/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=quind_tractor-store-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=quind_tractor-store-frontend)

Nx monorepo with Angular 19 and Module Federation for the Tractor Store hackathon.

## Architecture

| App / Package | Port | Role |
|---------------|------|------|
| `apps/shell` | 4200 | MF host, routing, MSW in dev |
| `packages/mfe-explore` | 4201 | Home, categories, stores |
| `packages/mfe-decide` | 4202 | Product detail, variants (`?sku=`) |
| `packages/mfe-checkout` | 4203 | Cart, checkout, thanks, MiniCart remote |
| `packages/shared-catalog` | — | Models, events, API tokens, MSW |
| `packages/design-tokens` | — | CSS custom properties |
| `packages/ts-design-system` | — | Shared UI + Angular Elements build |

CDN images: `https://blueprint.the-tractor.store`

## Prerequisites

- Node.js 20+
- pnpm 9+
- Backend API on `http://localhost:8080` (optional; MSW mocks `/api` in dev)

## Quick start

```bash
pnpm install
pnpm exec msw init apps/shell/public --save
pnpm start
```

Open http://localhost:4200

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Serve shell + all remotes in parallel |
| `pnpm build` | Production build all apps |
| `pnpm test` | Unit tests |
| `pnpm test:design-system` | Jest tests for UI library |
| `pnpm e2e` | Playwright purchase-flow test |

## Routing (shell)

- `''` → explore (home)
- `products/:key` → explore category
- `stores` → explore stores
- `product/:id` → decide (`?sku=` for variant)
- `checkout/*` → checkout MFE

## API proxy

`apps/shell/proxy.conf.json` forwards `/api` to `http://localhost:8080`. MSW intercepts the same paths when `useMsw: true`.

## Cross-MFE events

`shared-catalog` exposes `catalogEventBus`:

- `checkout:cart-updated`
- `explore:store-selected`

## Docker (producción local)

```bash
docker build -t tractor-store-frontend .
docker run -p 4200:80 tractor-store-frontend
```

Con el stack completo, usa `docker compose up` desde la raíz del monorepo Hackaton.

## Docs

- [TESTING.md](./TESTING.md)
- [docs/adr/](./docs/adr/)
- Despliegue (raíz del hackaton): [../DEPLOYMENT.md](../DEPLOYMENT.md)
