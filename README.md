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
