# ADR 003: Transactional domain events for checkout

## Status

Accepted

## Context

Order placement must notify other parts of the system only after data is committed. Inventory reservation and cart clearing must stay consistent.

## Decision

- `OrderService.placeOrder()` runs in a single `@Transactional` boundary
- Publish `CheckoutRequested` at checkout start and `OrderPlaced` after the order is persisted
- Listeners use `@TransactionalEventListener(phase = AFTER_COMMIT)`:
  - `CheckoutEventListener` (order module) — audit logging
  - `OrderPlacedNotificationListener` (notifications module) — persists notification log

## Consequences

- Side effects (email simulation, logs) never run on rolled-back transactions
- Notifications module stays decoupled from order persistence
- Event types in `shared` are stable contracts between modules
