# ADR 001: Module Federation for micro-frontends

## Status

Accepted

## Context

Tractor Store is split into explore, decide, and checkout bounded contexts. Teams need independent deployability and local development per slice.

## Decision

Use **Webpack Module Federation** (`@module-federation/enhanced` via Nx) with:

- `shell` as host on port 4200
- Three remotes on 4201–4203 exposing `./Routes` (and `./MiniCart` from checkout)
- Shared singletons: `@angular/core`, `@angular/common`, `@angular/router`, `rxjs`, `@tractor-store/shared-catalog`

## Consequences

- Requires all remotes running in dev (`pnpm start`)
- Routing owned by shell; remotes export route arrays only
- Shared catalog prevents duplicate event bus instances
