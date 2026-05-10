# Decisiones de Arquitectura — Frontend

## ADR-001: Angular 21 Standalone

**Estado:** Aceptada  
**Decisión:** Sin NgModules. Todos los componentes son standalone.  
**Consecuencias:** Tree-shaking agresivo, imports explícitos, testing más simple.

## ADR-002: NgRx SignalStore

**Estado:** Aceptada  
**Decisión:** SignalStore en lugar de NgRx Store clásico (Actions/Reducers/Effects).  
**Consecuencias:** Menos boilerplate, integración natural con Signals de Angular, compatibilidad futura con zoneless.

## ADR-003: Tailwind CSS + Design Tokens

**Estado:** Aceptada  
**Decisión:** Tailwind con tema corporativo Fintra. Sin CSS-in-JS ni Sass.  
**Consecuencias:** Consistencia visual, clases utilitarias sin CSS custom salvo design system. Modo dark preparado.
