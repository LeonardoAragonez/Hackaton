# Testing

## Test suite

| Test | Purpose |
|------|---------|
| `ModulithArchitectureTest` | `ApplicationModules.verify()` — module boundaries and dependencies |
| `ArchUnitRulesTest` | REST controllers live in `api` packages; no cross-module `internal` usage |
| `CartFlowIntegrationTest` | End-to-end cart and catalog flows against PostgreSQL (Testcontainers) |

## Requirements

- **JDK 21**
- **Maven 3.9+**
- **Docker** running (for Testcontainers integration tests)

## Commands

```bash
# All tests
mvn test

# Single class
mvn -Dtest=CartFlowIntegrationTest test

# With coverage (JaCoCo)
mvn verify
```

Report: `target/site/jacoco/index.html`

## Integration test profile

`CartFlowIntegrationTest` uses profile `test` and `@DynamicPropertySource` to wire a disposable PostgreSQL 16 container. Flyway migrations and seed loaders run on context startup, same as production.

## Manual smoke checks

```bash
curl -s http://localhost:8080/api/catalog/home | jq '.teaser | length'
curl -c /tmp/cookies.txt -X POST http://localhost:8080/api/cart/items \
  -H 'Content-Type: application/json' -d '{"sku":"AU-01-SI"}'
curl -b /tmp/cookies.txt http://localhost:8080/api/cart/mini
```
