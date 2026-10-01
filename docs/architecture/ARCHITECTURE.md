# Arquitectura

## Base vigente

Astro y TypeScript strictest, HTML semántico, CSS nativo y JavaScript cliente solo cuando una interacción lo necesita. Versiones e instalaciones: package.json, lockfiles y TOOLING.md son las fuentes actuales. No añadir frameworks frontend ni Tailwind; preferir capacidades nativas. La salida actual es estática; DB, autenticación, hosting y adaptador servidor están pendientes.

## Estructura Astro

- src/pages: rutas y composición de páginas; Astro requiere esta carpeta para routing.
- src/layouts: estructura compartida de documentos, metadata y slots.
- src/components: unidades de UI reutilizables, con carpetas locales cuando ayudan a agrupar responsabilidades.
- src/assets: recursos procesados por el build, incluyendo fuentes y medios importados.
- public: archivos servidos sin transformación; las URLs deben respetar BASE_URL.
- tests: contratos y flujos; fixtures aisladas fuera de las rutas públicas.

Astro admite frontmatter, props tipadas, HTML y estilos scoped en un único .astro. Eso es una opción oficial válida, no un incumplimiento de modularidad. Tampoco exige una estructura universal de cuatro archivos. Extraer contratos compartidos, validaciones relevantes o estilos extensos cuando mejore claridad y pruebas; evitar módulos vacíos, helpers genéricos y capas sin consumidores.

GovernmentBar conserva la separación solicitada por el propietario en src/components/government-bar: plantilla/composición .astro, contrato .types.ts, validación .validation.ts y estilos .css. El frontmatter se ejecuta durante rendering y no se envía como JavaScript cliente. Los CSS importados son globales: limitar selectores a la clase raíz exclusiva; los style internos son scoped por defecto. Las fuentes locales procesadas por Vite conservan rutas válidas al desplegar bajo un base.

## Límites de responsabilidad

La UI prepara presentación y valida su contrato; las reglas de negocio pertenecen a casos de uso reales. Cuando se incorpore servidor, usar Astro Actions para operaciones internas, Zod en fronteras y astro:env para configuración. Sessions aporta estado, no autenticación. Estas capacidades no están implementadas hoy.

Si se incorpora persistencia, dominio y aplicación usan contratos propios; infraestructura implementa esos contratos con Kysely, SQL y drivers. Tipos tecnológicos y consultas permanecen en el adaptador. Composición inyecta dependencias. DB, driver y despliegue se deciden al existir un caso real. No crear ahora carpetas ni repositorios ficticios.

## Criterios verificables

Preservar HTML funcional sin JS, teclado, foco visible, enlaces reales, reflow y texto ampliado. El consumidor proporciona contenido y URLs: no inventar destinos. Confirmar diseño desktop e identificar como INFERRED responsive y estados ausentes en Penpot. Ejecutar check y pruebas relevantes; declarar límites de la evidencia. Build no reemplaza typecheck.

Una dependencia nueva necesita problema observable, alternativa nativa evaluada e impacto. Cambios de arquitectura/DB/auth/despliegue requieren decisión del propietario antes de implementación. La tarea termina con evidencia y HARD STOP.

## Fuentes oficiales

[Componentes y props](https://docs.astro.build/en/basics/astro-components/), [estructura](https://docs.astro.build/en/basics/project-structure/), [CSS scoped y externo](https://docs.astro.build/en/guides/styling/), [TypeScript](https://docs.astro.build/en/guides/typescript/), [Actions](https://docs.astro.build/en/guides/actions/), [Sessions](https://docs.astro.build/en/guides/sessions/), [configuración](https://docs.astro.build/en/guides/environment-variables/), [Kysely](https://kysely.dev/docs/intro).

La base aprobada el 2026-09-30 se conserva en estas reglas. Auditorías, claims cerrados y estados de arranque anteriores se consultan en Git; no describen el estado vigente.
