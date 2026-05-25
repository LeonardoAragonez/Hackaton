# ADR 002: Signals store (actions / selectors / facade)

## Status

Accepted

## Context

Each MFE needs predictable state without NgRx boilerplate for a hackathon timeline.

## Decision

Per-MFE state using Angular **signals**:

- `*.state.ts` — signal holder + initial state
- `*.actions.ts` — pure state reducers
- `*.selectors.ts` — pure selectors
- `*.facade.ts` — injectable orchestration (HTTP, router, events)
- `*-api.service.ts` — HttpClient with `InjectionToken` base URLs

## Consequences

- Easy to test selectors/actions in isolation
- Facades remain the only public API for components
- No DevTools time-travel; acceptable for scope
