# Arquitectura Frontend — Fintra Financiero

## Estructura de carpetas

```
src/app/
├── core/                    ← Infraestructura de la app (singleton)
│   ├── auth/                ← AuthStore, AuthService, authGuard, LoginPage
│   ├── http/                ← Interceptors: auth, error, loading, trace
│   ├── notifications/       ← NotificationStore, LoadingStore
│   ├── i18n/                ← Locale es-CO, pipes de formato
│   └── tokens/              ← InjectionTokens de config
├── shared/                  ← Componentes reutilizables
│   ├── ui/                  ← Design system atómico
│   ├── pipes/               ← currencyCop, percentageEa, etc.
│   ├── directives/          ← hasRole, debounceClick, autofocus
│   └── utils/               ← Helpers de decimal, fecha, formulario
├── layout/                  ← Chrome de la aplicación
│   ├── shell/               ← ShellPage (router-outlet + sidebar + navbar)
│   ├── sidebar/             ← Navegación lateral con control de roles
│   ├── navbar/              ← Notificaciones toasts + menú usuario
│   └── breadcrumbs/         ← Migas de pan
└── features/                ← Módulos de negocio (lazy-loaded)
    └── prestamos/
        ├── data-access/     ← HTTP services
        ├── domain/          ← Interfaces TypeScript del dominio
        ├── feature/         ← Páginas / smart components
        └── ui/              ← Presentational components
```

## Flujo de datos

```
Componente → store.method() → HTTP Service → Backend API
                ↓
          patchState(store, ...)
                ↓
          store.signal()   ← Componente se actualiza reactivamente
```

## Convenciones

- Todos los componentes son `standalone: true`
- Estado de app solo en SignalStores (`providedIn: 'root'`)
- Ningún componente llama HTTP directo — siempre vía store o service
- Pipes financieros para todo formato de moneda/porcentaje
- Control flow nuevo: `@if`, `@for`, `@defer`
