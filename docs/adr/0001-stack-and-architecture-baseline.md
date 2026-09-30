# ADR-0001: Stack y límites iniciales

Status: ACCEPTED por instrucción del propietario; adopción técnica parcial según auditoría
Date: 2026-09-30 (America/Costa_Rica)

## Context

FEMUCARIBE dispone de un starter Astro 7.3.5 y un prototipo Penpot multipágina. El desarrollo será incremental: una tarea pequeña debe terminar con calidad de producción y detenerse. El propietario aprobó un stack concreto y exige independencia conceptual de persistencia, fidelidad visual, accesibilidad y coordinación segura de agentes. La sesión actual solo documenta.

## Decision

Adoptar Node 22 LTS compatible con Astro, Astro 7.x como framework principal/full-stack, TypeScript `strictest`, frontend Astro puro, CSS nativo, Astro Actions para operaciones internas, Astro Sessions cuando corresponda, Zod preferentemente `astro/zod` y `astro:env`. Adoptar pnpm, Prettier con plugin Astro, ESLint con plugin Astro, Stylelint, Vitest y Playwright en slices de configuración delimitados.

Aplicar SOLID pragmático, server-first, progressive enhancement y YAGNI. Dependencias hacia el núcleo; contratos Repository como ports propios, implementaciones adapters e inyección explícita. Kysely es únicamente la implementación inicial aprobada del adaptador SQL. **La aplicación NO está arquitectónicamente casada con Kysely ni con una base de datos concreta.** Tipos de Kysely, consultas, drivers y migraciones permanecen en infraestructura. Motor, driver, hosting y autenticación están pendientes.

Penpot es la principal fuente visual, con datos confirmados separados de inferencias/incógnitas. Trabajo por rama/tarea; worktree propio en paralelo, claims de paths y entregas deliberadas a `dev`. Solo el humano propietario promueve, hace push o merge a `main`. El scope explícito y HARD STOP impiden avanzar a otra feature por iniciativa del agente.

## Consequences

Menos JS/dependencias iniciales; capacidades de servidor requieren un despliegue compatible cuando se usen. Los casos de uso se prueban sin red, DB o Astro. Reemplazar persistencia conserva contratos, pero exige verificar semántica y migrar datos. El checkout todavía usa npm, TypeScript `strict` y Node 24; esas diferencias se documentan sin corregirlas en esta sesión. No crear capas, repositorios ni carpetas sin consumidores.

## Alternatives considered

- SPA o framework frontend adicional: descartado inicialmente por alcance y capacidades nativas de Astro/Web Platform.
- Tailwind: descartado por decisión del propietario a favor de CSS nativo scoped y tokens mínimos.
- REST interno universal: descartado a favor de Actions; HTTP independiente se admite para integraciones justificadas.
- DB/query builder como modelo del dominio: descartado por DIP y necesidad de adapters reemplazables.
- Arquitectura empresarial anticipada: descartada por YAGNI y slices pequeños.

## References

[Stack](../architecture/STACK.md), [arquitectura](../architecture/ARCHITECTURE.md), [auditoría](../architecture/AUDIT.md), [contrato visual](../architecture/DESIGN-CONTRACT.md), [coordinación](../agents/COORDINATION.md). Las justificaciones técnicas y enlaces oficiales están junto a las reglas correspondientes. Sustituir esta decisión requiere nuevo ADR y decisión explícita del propietario.
