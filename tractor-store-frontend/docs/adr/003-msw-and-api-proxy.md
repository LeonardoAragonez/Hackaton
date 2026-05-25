# ADR 003: MSW for dev/tests and proxy to backend

## Status

Accepted

## Context

Backend may be unavailable during UI work. E2E and local dev need deterministic data.

## Decision

- **MSW** handlers in `shared-catalog` backed by seed JSON
- Shell enables worker when `environment.useMsw`
- **proxy.conf.json** forwards `/api` to `localhost:8080` when backend is up (unhandled MSW requests bypass to network)

## Consequences

- Single source of mock data for dev and unit tests
- Cart state is in-memory in MSW (resets on reload)
- Production builds disable MSW
