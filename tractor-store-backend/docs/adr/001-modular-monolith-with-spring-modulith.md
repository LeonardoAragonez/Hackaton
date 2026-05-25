# ADR 001: Modular monolith with Spring Modulith

## Status

Accepted

## Context

The Tractor Store hackathon requires clear team boundaries (explore, decide, buy) while shipping a single deployable backend.

## Decision

Organize the application as a **modular monolith** using Spring Modulith:

- One module per bounded context: `catalog`, `inventory`, `cart`, `order`, `notifications`
- `internal` packages hide persistence and implementation details
- **Facades** (`CatalogFacade`, `InventoryFacade`, `CartFacade`) expose cross-module operations
- Domain events (`CheckoutRequested`, `OrderPlaced`) live in the open `shared` module

## Consequences

- Enforced module boundaries via `ApplicationModules.verify()` in tests
- Simpler operations than microservices; future extraction remains possible per module
- Cross-module access must go through facades or published types, not foreign `internal` packages
