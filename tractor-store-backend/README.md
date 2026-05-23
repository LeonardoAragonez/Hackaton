# Tractor Store Backend

[![CI](https://github.com/quind/tractor-store-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/quind/tractor-store-backend/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=quind_tractor-store-backend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=quind_tractor-store-backend)

Modular monolith backend for the Tractor Store learning blueprint, built with **Spring Boot 3.4**, **Java 21**, **Spring Modulith**, **PostgreSQL**, and **Flyway**.

## Modules

| Module | Responsibility |
|--------|----------------|
| `catalog` | Home, categories, products, recommendations, stores |
| `inventory` | Stock per SKU |
| `cart` | Cookie-based session cart (`CART_SESSION`) |
| `order` | Checkout and order retrieval |
| `notifications` | Reacts to `OrderPlaced` domain events |
| `shared` | Cross-cutting API errors, config, domain events |

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/catalog/home` | Teasers and categories |
| GET | `/api/catalog/categories/{filter}` | Products in a category |
| GET | `/api/catalog/products/{id}` | Product detail with variants |
| GET | `/api/catalog/recommendations?skus=` | Related SKUs |
| GET | `/api/catalog/stores` | Physical stores |
| GET | `/api/inventory/{sku}` | Stock for a SKU |
| GET | `/api/cart` | Full cart (creates session cookie if needed) |
| GET | `/api/cart/mini` | Item count and total |
| POST | `/api/cart/items` | Body: `{ "sku": "AU-01-SI" }` |
| DELETE | `/api/cart/items/{sku}` | Decrease quantity or remove line |
| POST | `/api/orders` | Place order from current cart |
| GET | `/api/orders/{id}` | Order details |

Errors follow `{ "code", "message", "details?" }`.

OpenAPI UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## Run locally

```bash
# PostgreSQL (example)
docker run --name tractor-pg -e POSTGRES_DB=tractor_store -e POSTGRES_USER=tractor -e POSTGRES_PASSWORD=tractor -p 5433:5432 -d postgres:16-alpine

cd tractor-store-backend
mvn spring-boot:run
```

Seed JSON is loaded from `src/main/resources/seed/` on first startup when tables are empty.

## Profiles

- `dev` (default): local PostgreSQL on `localhost:5433`
- `prod`: datasource from `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

CORS allows `http://localhost:4200` for the Angular frontend.

## Docker

```bash
docker build -t tractor-store-backend .
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5433/tractor_store \
  -e DATABASE_USERNAME=tractor \
  -e DATABASE_PASSWORD=tractor \
  tractor-store-backend
```

## Tests

```bash
mvn test
```

See [TESTING.md](TESTING.md) for details. Integration tests require Docker (Testcontainers).

## Architecture decisions

See [docs/adr/](docs/adr/).
