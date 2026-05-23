# Testing Guide

## Unit tests (Jest)

Design system components live in `packages/ts-design-system` with co-located `*.spec.ts` files.

```bash
pnpm test:design-system
```

Shared catalog MSW handlers can be tested with Node/Jest (`packages/shared-catalog`).

## E2E (Playwright)

Full purchase flow: home → product → cart → checkout → thanks.

```bash
pnpm e2e
```

Starts all MF dev servers via `pnpm start` unless `BASE_URL` is set.

## MSW in development

Seed data: `packages/shared-catalog/src/mocks/data/*.json` (from `/tmp/*-db.json`).

Handlers: `packages/shared-catalog/src/lib/msw/handlers.ts`

Enable in shell via `environment.useMsw`.

## Manual checklist

1. Home loads teasers and categories
2. Product page syncs `?sku=` with variant selector
3. Add to cart updates MiniCart in shell header
4. Checkout form blocks navigation when dirty (CanDeactivate)
5. Thanks page after order
