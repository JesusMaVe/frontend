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
