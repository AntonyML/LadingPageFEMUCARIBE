# Inicio: slices independientes de cabecera

Al comenzar un componente de la cabecera de Inicio, leer este plan y activar exclusivamente su claim en [COORDINATION.md](COORDINATION.md). Autorización de separación: propietario, 2026-10-01. [Registro de esta preparación](claims/HEADER-SLICES-001.md).

## Fuente y límites

Penpot: archivo `81f57451-85cc-819d-8008-80dd99536505`, página `f279c6b1-74d9-80c4-8008-9409133a2ea9`, [Screen-01-Home](https://design.penpot.app/#/workspace?team-id=3be9e5e1-190f-8090-8008-80dcf1507a24&file-id=81f57451-85cc-819d-8008-80dd99536505&page-id=f279c6b1-74d9-80c4-8008-9409133a2ea9&board-id=1158a0fe-c558-80da-8008-94095c56b6a4). MCP confirmó archivo/página activos el 2026-10-01. Las medidas del [contrato visual](../architecture/DESIGN-CONTRACT.md) proceden de la auditoría del 2026-09-30; releer formas/exportaciones vivas antes de implementar y registrar cualquier cambio. Confirmar contexto no equivale a revalidar estilos o revisión del archivo.

| Slice | Forma Penpot | Archivo propio | Alcance |
| --- | --- | --- | --- |
| [TOPBAR-001](claims/TOPBAR-001.md) | `1158a0fe-c558-80da-8008-94095c63a028` / `L1-TopBar-Gobierno` | `src/components/GovernmentBar.astro` | Identidad de Costa Rica y enlaces institucionales/skip link. |
| [NAVBAR-001](claims/NAVBAR-001.md) | `1158a0fe-c558-80da-8008-94095cbb1269` / `L1-Navigation-Principal` | `src/components/PublicNavbar.astro` | Marca FEMUCARIBE, seis enlaces y dos CTA, navegación responsive. |

La topbar no forma parte de NAVBAR-001. PublicNavbar no importa GovernmentBar y GovernmentBar no importa PublicNavbar. Estilos scoped por componente, recursos y pruebas separados. No crear un Header monolítico ni dependencias entre tareas para leer el DOM de la otra.

## Orden y Git

Orden recomendado: TOPBAR-001 → revisión e integración deliberada a dev → NAVBAR-001 → revisión e integración deliberada a dev. Es una secuencia de entrega, no una dependencia de implementación: cada componente puede revisarse por separado.

Cada slice parte del dev actualizado, en `agent/<agente>/<task>` y worktree propio bajo el home. Confirmar SHA/claims antes de activar. El worktree `C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-navbar-001` ya existe en base `ab246b7`, limpio y sin código de Navbar; comprobar y avanzar únicamente por fast-forward al dev vigente antes de implementarlo. Su existencia no constituye un claim ACTIVE. No borrar recursos ni reutilizarlo para TOPBAR.

Después de asignar TOPBAR crear su rama/worktree; no hay checkout ni owner de implementación asignado todavía. Cada slice termina con handoff y HARD STOP; no se inicia el siguiente por inercia. La separación documental no certifica componentes implementados.

## Composición en Inicio y archivos compartidos

La composición conjunta se reserva como tarea posterior de integración de cabecera: un único responsable, sin desarrolladores concurrentes sobre `src/pages/index.astro`, `src/layouts/Layout.astro`, CSS global, fonts o tokens. Esa reserva futura se activa solo cuando los dos componentes estén revisados. El orden visual será GovernmentBar → PublicNavbar → contenido principal existente.

Para probar un slice aisladamente usar Astro Container/tests o un harness de prueba aislado; si una ruta temporal resulta necesaria, declararla en el claim, no publicarla como página institucional y retirarla al cerrar. No tocar la página/layout compartidos desde los dos claims independientes.

La composición deberá dar al skip link un target único y enfocable (`id` acordado como prop/contrato), pasar el estado activo de la página a PublicNavbar y revisar que exista un solo landmark banner y una sola navegación principal. Evitar dos headers globales anidados. Estos contratos HTML son INFERRED, no especificaciones de Penpot.

## Evidencia y decisiones

**CONFIRMED:** desktop observado en auditoría, separado por forma/ID. **INFERRED:** breakpoints, menú móvil, wrap de topbar, targets táctiles, teclado, foco, zoom, reducción de movimiento y estados no dibujados. Documentar la razón y las pruebas; no afirmar que Penpot tiene variantes mobile/tablet ni interacciones.

Destinos de accesibilidad, contraloría, Ley 7600 y plataforma: UNKNOWN hasta confirmación; nombres de rutas públicas: INFERRED hasta existir páginas aprobadas. No introducir URLs inventadas, controles que aparenten funcionar, login ni páginas vacías para resolver navegación. La pregunta ya enviada sobre plataforma continúa pendiente; no bloquea la separación documental. Un destino desconocido debe quedar explícito en el handoff y resolverse antes de certificar navegación funcional.

Hero, Footer, búsqueda, tarjetas, autenticación y contenido completo de Inicio quedan fuera de ambos slices. El Path suelto entre navbar/hero tampoco pertenece a ninguno: su intención sigue UNKNOWN.
