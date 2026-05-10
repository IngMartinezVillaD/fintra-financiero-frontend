# fintra-financiero-frontend

> **Módulo 9 – Préstamos Intercompañía** | Frontend · Fintra S.A.S.

Angular 21 · NgRx SignalStore · Tailwind CSS · TypeScript estricto

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 21 (Standalone + Signals) |
| Estado | NgRx SignalStore |
| Estilos | Tailwind CSS 3 + design tokens Fintra |
| Tests | Jest + Testing Library + Playwright |
| Iconos | Lucide Angular |
| Fechas | date-fns |
| Decimales | decimal.js |

## Quickstart (5 comandos)

```bash
# 1. Clonar
git clone <url-repo> && cd fintra-financiero-frontend

# 2. Instalar dependencias
pnpm install

# 3. Levantar en desarrollo (requiere backend en :8080)
pnpm start

# 4. Lint y tests
pnpm lint && pnpm test

# 5. Build producción
pnpm build:prod
```

## Estructura

```
src/app/
├── core/      ← interceptors, guards, auth, notifications
├── shared/    ← UI atómica reutilizable, pipes, directives
├── layout/    ← shell, navbar, sidebar, breadcrumbs
└── features/  ← módulos de negocio (prestamos, reportes...)
```

## Variables de entorno

Configurar en `src/environments/environment.ts`:
- `apiBaseUrl`: URL del backend (default: `http://localhost:8080/api/v1`)

## Backend

→ [fintra-financiero-backend](../fintra-financiero-backend)
