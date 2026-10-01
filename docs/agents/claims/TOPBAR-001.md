# TOPBAR-001

Task: GovernmentBar independiente de Inicio
Owner: por asignar al activar
Branch: agent/<agente>/topbar-001 (plantilla, no creada)
Worktree: por crear bajo el home desde dev actualizado
Status: PROPOSED
Paths proposed: src/components/GovernmentBar.astro; public/government/*; tests/unit/government-bar*.test.ts; tests/e2e/government-bar*.spec.ts; docs/agents/claims/TOPBAR-001.md
Objective: reproducir exclusivamente L1-TopBar-Gobierno, con adaptación responsive y acceso al contenido.
Dependencies: asignación/claim ACTIVE confirmado por coordinador, evidencia Penpot viva, destinos institucionales verificados o limitación explícita antes de certificar funcionalidad.
Started: no iniciado; propuesta 2026-10-01 America/Costa_Rica
Base commit (dev): registrar al activar, no fijar a una base histórica
Published in shared registry: docs/agents/COORDINATION.md en dev después de integrar HEADER-SLICES-001. PROPOSED no reserva paths.

## Scope

IN SCOPE: identidad nacional/recursos reales, textos y enlaces de la topbar, skip link parametrizable, estilos locales y validación propia. Fuente: [plan](../INICIO-SLICES.md), forma 1158a0fe-c558-80da-8008-94095c63a028.
OUT OF SCOPE: PublicNavbar/marca FEMUCARIBE/menú principal/CTA, hero/footer, implementación de destinos, autenticación, archivos de layout/página/CSS global/tokens/fonts/config compartidos y Penpot de escritura.

## Completion criteria

Desktop documentado como CONFIRMED con revisión/IDs y exportación; responsive y estados no dibujados como INFERRED. Sin overflow en mobile/tablet/desktop/zoom; enlaces y skip link operables por teclado y con foco visible. Medir contraste/targets, probar sin JS y contenido largo. Sin dependencias del DOM de PublicNavbar. Tipado/lint/formato/build y pruebas relevantes aprobadas.

Si hace falta un recurso/config/archivo compartido no reservado, solicitar traspaso y declarar ampliación antes de editar. GovernmentBar expone target del skip link; la composición futura es responsable de proveerlo, no esta tarea de modificar Inicio.

## Handoff

Pendiente: base/HEAD, commits, archivos, controles/evidencia, destinos resueltos/pendientes, adaptaciones inferidas y limitaciones. Integración a dev deliberada; main solo humano. HARD STOP al completar TOPBAR; no comenzar Navbar automáticamente.
