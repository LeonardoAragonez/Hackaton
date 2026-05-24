# Guía de contribución — Tractor Store

Monorepo único: `tractor-store-frontend/`, `tractor-store-backend/` y configuración en la raíz.

## Requisitos previos

- Java 21, Maven 3.9+
- Node.js 20+, pnpm 9+
- Docker (opcional, para Compose y Testcontainers)

## Flujo de trabajo

1. Crear rama desde `develop` o `main`: `feature/<descripcion-corta>`.
2. Hacer cambios acotados (backend **o** frontend cuando sea posible).
3. Ejecutar tests en local antes del PR.
4. Abrir **Pull Request** hacia `main` o `develop`.
5. Esperar que pase el workflow **CI/CD** en GitHub Actions.

## Commits

Usa mensajes claros en español o inglés:

```text
feat(backend): descripción
feat(frontend): descripción
fix(frontend): descripción
test(backend): descripción
docs: descripción
ci: descripción
```

Prefiere commits pequeños y revisables.

## Tests en local

```bash
# Backend
cd tractor-store-backend && mvn test

# Frontend
cd tractor-store-frontend && pnpm test && pnpm lint
```

## Estándares

### Backend

- Respetar fronteras **Spring Modulith** (no saltar módulos sin facade/eventos).
- API REST bajo `/api/...` con errores `{ code, message, details? }`.
- Migraciones solo vía **Flyway** en `src/main/resources/db/migration/`.

### Frontend

- No acoplar MFEs directamente; usar **shared-catalog** (modelos, eventos, tokens).
- Mantener **Module Federation**: shell carga remotes; exponer rutas en `remote-entry/`.
- Estilos con **design tokens** y componentes de **ts-design-system**.

## Pull requests

Usa la [plantilla de PR](.github/PULL_REQUEST_TEMPLATE.md). Incluye:

- Qué cambia y por qué.
- Cómo probarlo (pasos o capturas).
- Confirmación de tests locales.

## CI/CD

El pipeline [`.github/workflows/ci.yml`](.github/workflows/ci.yml) corre jobs según paths:

- Cambios en `tractor-store-backend/**` → job Backend.
- Cambios en `tractor-store-frontend/**` → job Frontend.
- Cambios en `.github/`, `docker-compose.yml` o README raíz → ambos.

## Documentación

Al cambiar arquitectura relevante, actualiza o crea un **ADR** en `docs/adr/` del proyecto afectado.

| Tipo de cambio | Documentación |
|----------------|---------------|
| API o módulos backend | README backend + ADR si aplica |
| MFEs o federation | README frontend + ADR si aplica |
| Despliegue | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Tests | [TESTING.md](./tractor-store-frontend/TESTING.md) o [TESTING.md](./tractor-store-backend/TESTING.md) |

## Secretos

No subas `.env`, tokens ni credenciales. Usa variables de entorno y **GitHub Secrets** para CI (p. ej. `SONAR_TOKEN`).
