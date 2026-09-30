# Stack aprobado

Estado: aprobado por el propietario, 2026-09-30. Esta aprobación define la dirección; no afirma que todo esté instalado. Evidencia del checkout: [AUDIT.md](AUDIT.md). Decisión formal: [ADR-0001](../adr/0001-stack-and-architecture-baseline.md).

| Tecnología | Propósito y límite |
| --- | --- |
| Node.js 22 LTS | Runtime objetivo, en una versión oficialmente compatible con Astro y las herramientas seleccionadas. |
| Astro 7.x | Framework principal para componentes, layouts, routing y capacidades full-stack cuando hagan falta. |
| TypeScript + `astro/tsconfigs/strictest` | Tipado estricto. Tipos explícitos en fronteras; `unknown` para datos no confiables. `any` solo con excepción extraordinaria documentada. |
| Astro puro | `.astro`, HTML semántico y APIs web; JavaScript nativo cliente solo por necesidad de interacción. |
| CSS nativo moderno | Custom properties, `@layer`, Grid, Flexbox, container queries, `clamp()`, `min()`, `max()`, media queries y logical properties. Estilos locales scoped. |
| Astro Actions | Comunicación interna aplicación-servidor y formularios. No crear REST interno por costumbre. |
| Zod, preferentemente `astro/zod` | Validar inputs, parámetros, formularios, configuración y payloads externos al cruzar fronteras. |
| Astro Sessions | Estado de sesión cuando corresponda. No decide ni implementa autenticación. |
| `astro:env` | Acceso tipado y centralizado a configuración de la aplicación; separación cliente/servidor y secretos. |
| Repository + ports/adapters + DI | Contratos de persistencia propios, implementaciones intercambiables y composición explícita. |
| Kysely | Adaptador SQL inicial aprobado, solamente dentro de infraestructura; DB y driver aún TO BE DECIDED. |
| pnpm | Gestor aprobado; versión compatible con Node elegido y fijada deliberadamente para instalaciones reproducibles. |
| Prettier + `prettier-plugin-astro` | Formato de código y documentos. |
| ESLint + `eslint-plugin-astro` | Lint de TypeScript y Astro. |
| Stylelint | Lint de CSS. |
| Vitest | Pruebas unitarias y de integración por contratos/casos de uso. |
| Playwright | Flujos de navegador, teclado y verificación responsive/visual por slice. |

## Principios y alternativas iniciales

Astro-first, server-first, progressive enhancement, accesibilidad, SOLID pragmático, YAGNI y dependencias mínimas. Global CSS limitado a reset/base, tokens, tipografía y utilidades realmente compartidas; evitar cientos de clases utilitarias propias.

React, Vue, Svelte, Alpine, Angular, HTMX y Tailwind quedan descartados inicialmente. Tampoco se adopta un framework backend adicional. Patrones permitidos: Repository, Adapter y DI; Factory o Strategy solo si existe una necesidad real de selección/comportamiento intercambiable. No interfaces por cada clase ni factories de un único objeto.

Motor de DB, driver, implementación de repositorio, Kysely y proveedor de despliegue son detalles reemplazables. Los contratos propios deben conservar sus invariantes y errores al cambiar un adaptador. Intercambiable no significa migración gratuita de datos ni equivalencia automática entre motores.

## Versiones y nuevas dependencias

Versiones menores/patch no son contratos permanentes: actualizar deliberadamente con compatibilidad oficial, changelog, lockfile y verificación. No actualizar automáticamente ni cambiar una major escondida en una feature. Astro observado es 7.3.5 y declara Node `>=22.12.0`; el puente MCP usa certificados del sistema y requiere una revisión compatible de Node 22, según su guía. La auditoría observó Node 24 global; TOOLING-BASELINE-001 valida Node 22.23.3 portátil sin sustituirlo. [Requisitos oficiales](https://docs.astro.build/en/install-and-setup/).

Antes de añadir una dependencia, justificar problema, límites de Astro/TypeScript/CSS/Web Platform, alternativa nativa, mantenimiento, impacto en bundle/runtime y licencias. Registrar la justificación y claim del archivo compartido. Si cambia la arquitectura, HARD STOP y decisión humana/ADR antes de implementarla. Las dependencias aprobadas se instalan en tareas de configuración específicas, cuando exista consumidor; TOOLING-BASELINE-001 incorpora exclusivamente controles de desarrollo aprobados.

TOOLING-BASELINE-001 migra a pnpm con lockfiles separados para aplicación y `tools/penpot`, conservando las versiones de Astro/SDK. Estado, runtime validado, límites y comandos: [TOOLING.md](../agents/TOOLING.md). La auditoría previa conserva el estado histórico. El SDK MCP es tooling de agentes, no una dependencia del frontend.
