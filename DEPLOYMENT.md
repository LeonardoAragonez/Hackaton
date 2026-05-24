# Despliegue — Tractor Store

Guía de despliegue y rollback del monorepo (Sesión 3 del reto).

## Entornos

| Entorno | Frontend | Backend | Base de datos |
|---------|----------|---------|---------------|
| Local (dev) | `pnpm start` → `:4200` | `mvn spring-boot:run` → `:8080` | PostgreSQL `:5433` |
| Local (Docker) | `docker compose` → `:4200` | mismo stack → `:8080` | contenedor `postgres` |
| Producción | CDN / Nginx / estáticos | Contenedor en PaaS | PostgreSQL gestionado |

---

## Despliegue local con Docker Compose

Desde la raíz del monorepo:

```bash
cd Hackaton
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Tienda | http://localhost:4200 |
| API + Swagger | http://localhost:8080/swagger-ui.html |
| PostgreSQL (host) | `localhost:5433` — `tractor` / `tractor` / `tractor_store` |

### Verificación

1. Logs del backend sin errores de Flyway.
2. `GET http://localhost:8080/actuator/health` → `UP`.
3. Flujo en el navegador: home → producto → carrito → checkout.

### Rollback local

```bash
docker compose down
# Opcional: borrar datos
docker volume rm hackaton_tractor_pg_data
```

---

## Despliegue en producción (recomendado)

### 1. Base de datos

1. Crear PostgreSQL gestionado (Neon, Supabase, RDS, etc.).
2. Anotar host, puerto, base, usuario y contraseña.

### 2. Backend

Variables de entorno:

| Variable | Ejemplo |
|----------|---------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DATABASE_URL` | `jdbc:postgresql://host:5432/tractor_store` |
| `DATABASE_USERNAME` | `tractor` |
| `DATABASE_PASSWORD` | *(secreto)* |
| `TRACTOR_CORS_ALLOWED_ORIGINS` | `https://tu-tienda.com` |

Build y ejecución:

```bash
cd tractor-store-backend
docker build -t tractor-store-backend:latest .
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL=... \
  -e DATABASE_USERNAME=... \
  -e DATABASE_PASSWORD=... \
  -e TRACTOR_CORS_ALLOWED_ORIGINS=https://tu-tienda.com \
  tractor-store-backend:latest
```

- Health check: `/actuator/health`
- Flyway aplica migraciones al arrancar.

### 3. Frontend

```bash
cd tractor-store-frontend
pnpm install --frozen-lockfile
pnpm exec msw init apps/shell/public --save
NODE_ENV=production pnpm build
docker build -t tractor-store-frontend:latest .
```

Servir `dist/` (o imagen Nginx del Dockerfile) con:

- Rutas de remotes en producción (`/mfe-explore/remoteEntry.js`, etc.).
- Proxy o gateway de `/api` hacia el backend **HTTPS**.

### 4. HTTPS

- Certificado en el balanceador, CDN o Nginx (Let's Encrypt).
- CORS del backend debe incluir el origen exacto del frontend (`https://...`).

---

## CI/CD (GitHub Actions)

El workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) ejecuta:

- **Backend / frontend** según carpetas modificadas.
- **Docker** en push a `main` (build de imágenes; push a registry pendiente de configurar).

Para publicar imágenes en GHCR, descomenta los pasos de `docker login` / `docker push` en el workflow y configura permisos del repositorio.

---

## Rollback en producción

1. Redesplegar la imagen o artefacto de la versión anterior (tag/commit conocido).
2. Flyway: no revertir migraciones en caliente sin script `U__` planificado; en hackaton suele bastar redeploy de app.
3. Verificar health y un smoke test del flujo de compra.

---

## Troubleshooting

| Problema | Acción |
|----------|--------|
| Backend no conecta a PG | Revisar `DATABASE_URL` y puerto; en local usar `5433` en el host |
| CORS en browser | Añadir origen del frontend en `TRACTOR_CORS_ALLOWED_ORIGINS` |
| MFE en blanco | Verificar que `remoteEntry.js` sea accesible en las rutas de producción |
| Flyway falla | Revisar logs; no mezclar esquema manual con migraciones |
