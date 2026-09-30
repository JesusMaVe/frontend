# frontend

Dashboard de favoritos: login contra **auth-svc** ([`auth`](https://github.com/JesusMaVe/auth)), listado y alta de items contra la **API** ([`api`](https://github.com/JesusMaVe/api)). El JWT se inyecta como `Authorization: Bearer` en cada request.

Diseño: [spec en el repo auth](https://github.com/JesusMaVe/auth/blob/main/docs/superpowers/specs/2026-09-24-auth-dashboard-design.md)

## Requisitos

- Node 26 (`.nvmrc`), GNU Make
- Los repos `auth` y `api` levantados (`make up` en cada uno) para usar la app

## Primeros pasos

```bash
make env       # crea .env desde .env.example
make install   # dependencias exactas
make test      # tests
make dev       # http://127.0.0.1:5173
```

## Demo con los 3 repos

```bash
(cd ../auth && make up)   # ldap + auth-svc en 127.0.0.1:8081
(cd ../api && make up)    # postgres + api en 127.0.0.1:8082 (importa la clave pública de ../auth)
make dev                  # http://127.0.0.1:5173
```

1. Abre http://127.0.0.1:5173 con DevTools (Console + Network).
2. Inicia sesión con `alice` y la contraseña `LDAP_SEED_USER_PASSWORD` de `../auth/.env`.
3. **Console:** cada request a `/api` imprime `[api] GET /api/items Bearer eyJ…` (con `VITE_LOG_JWT=true`).
4. **Network:** cada request a `/api/items` lleva el header `Authorization: Bearer eyJ…`.
5. Agrega un elemento en "Agregar" → al guardar vuelve al dashboard y aparece en el listado.
6. Cierra sesión → el token se borra y el dashboard vuelve a pedir login.

## Imagen web (nginx)

```bash
make up        # construye y levanta nginx en http://127.0.0.1:8088 (requiere auth y api levantados)
make test-web  # tests de la imagen: estáticos, CSP, fallback SPA y proxy a auth-svc/api
```

nginx sirve el build y hace proxy de `/auth` → auth-svc y `/api` → api por la red Docker compartida `practica`, con IP fija (`WEB_PROXY_IP`) para que auth-svc confíe en su `X-Forwarded-For`. `WEB_LOG_JWT=false` en producción; ponlo en `true` (y `make up`) si grabas la demo sobre la imagen.

## E2E

```bash
make e2e-browsers   # una vez: Chromium para Playwright
make stack          # levanta auth, api y la imagen web (repos hermanos ../auth y ../api)
make e2e            # login → dashboard → agregar → listado → logout, verificando el Bearer en cada request a /api
```

Con `WEB_LOG_JWT=true` en `.env` (y `make up`), el E2E además verifica un `console.log` con el JWT por cada request. El CI corre lo mismo con `auth` y `api` en commits fijados (`.github/workflows/ci.yml`).
