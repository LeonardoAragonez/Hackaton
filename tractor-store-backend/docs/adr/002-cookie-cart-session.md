# ADR 002: HttpOnly cookie cart session

## Status

Accepted

## Context

The storefront is anonymous; carts must persist across page loads without user login. The learning guide specifies cookie `CART_SESSION`.

## Decision

- Store cart identity in PostgreSQL table `cart_session`
- Issue an **HttpOnly**, `SameSite=Lax` cookie named `CART_SESSION` (30-day max age)
- `CartSessionResolver` reads or creates the session on each cart/order request
- CORS allows credentials from `http://localhost:4200`

## Consequences

- Frontend must call APIs with `withCredentials: true`
- Session fixation mitigated by server-generated UUIDs
- Cart data is server-authoritative; price and name are snapshotted on add-to-cart
