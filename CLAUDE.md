# Convenciones del proyecto

- **Spec:** https://github.com/JesusMaVe/auth/blob/main/docs/superpowers/specs/2026-09-24-auth-dashboard-design.md (repo `auth`). Los planes de este repo están en `docs/superpowers/plans/`.
- **Qué es este repo:** la SPA del dashboard. Login contra auth-svc (repo `auth`), items contra la API (repo `api`). El JWT vive en `sessionStorage` y `src/api/client.ts` es el único `fetch`: inyecta `Authorization: Bearer` en cada request.
- **TDD:** cada feature empieza con un test que falla (Vitest + Testing Library + MSW). No se da por terminado nada sin tests en verde.
- **Nada hardcodeado:** destinos del proxy, puerto y flags salen de `.env` (`make env`). Versiones exactas (`.npmrc` save-exact, `package-lock.json`, `.nvmrc`).
- **KISS / DRY / YAGNI:** el Makefile es el único punto de entrada; el CI solo invoca targets de `make`. La lógica vive en `src/features/`; las rutas (`src/routes/`) solo la montan.
- **Seguridad:** nunca `localStorage` para el token; `redirect` solo a rutas internas; dev server solo en 127.0.0.1.
- **Git:** un issue = una rama `feat/<n>-<slug>` = un PR con `Closes #n`, merge por squash a `main`. Conventional Commits.
