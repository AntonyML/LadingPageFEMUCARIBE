# TOPBAR-001

Task: GovernmentBar independiente de Inicio
Owner / coordinator: Codex
Branch: agent/codex/topbar-001
Worktree: C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-topbar-001
Status: CLOSED
Paths claimed: src/components/GovernmentBar.astro; public/government/*; tests/unit/government-bar*.test.ts; tests/e2e/government-bar*.spec.ts; docs/agents/claims/TOPBAR-001.md; docs/agents/COORDINATION.md; docs/agents/INICIO-SLICES.md; tests/fixtures/government-bar/**; playwright.config.ts; vitest.config.ts; docs/agents/TOPBAR.md
Objective: reproducir exclusivamente L1-TopBar-Gobierno, con adaptación responsive y acceso al contenido.
Dependencies: asignación/claim ACTIVE confirmado por coordinador, evidencia Penpot viva, destinos institucionales verificados o limitación explícita antes de certificar funcionalidad.
Started: 2026-10-01 America/Costa_Rica
Base commit (dev): 8f7ea9f
Published in shared registry: C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-topbar-001/docs/agents/COORDINATION.md; coordinador Codex confirma reserva, sin solapamientos ACTIVE. Ampliación mínima a configuración de tests para harness aislado y Astro Container; no instalación de dependencias. El propietario confirmó destinos como props obligatorias.

## Scope

IN SCOPE: identidad nacional/recursos reales, textos y enlaces de la topbar, skip link parametrizable, estilos locales y validación propia. Fuente: [plan](../INICIO-SLICES.md), forma 1158a0fe-c558-80da-8008-94095c63a028.
OUT OF SCOPE: PublicNavbar/marca FEMUCARIBE/menú principal/CTA, hero/footer, implementación de destinos, autenticación, archivos de layout/página/CSS global/tokens/fonts/config compartidos, salvo la ampliación acotada a configs de tests descrita arriba, y Penpot de escritura.

## Completion criteria

Desktop documentado como CONFIRMED con revisión/IDs y exportación; responsive y estados no dibujados como INFERRED. Sin overflow en mobile/tablet/desktop/zoom; enlaces y skip link operables por teclado y con foco visible. Medir contraste/targets, probar sin JS y contenido largo. Sin dependencias del DOM de PublicNavbar. Tipado/lint/formato/build y pruebas relevantes aprobadas.

Si hace falta un recurso/config/archivo compartido no reservado, solicitar traspaso y declarar ampliación antes de editar. GovernmentBar expone target del skip link; la composición futura es responsable de proveerlo, no esta tarea de modificar Inicio.

## Handoff

Implementado: GovernmentBar aislado, bandera de Penpot y fuente Inter local/OFL. Props obligatorias de destinos según respuesta del propietario; URLs reales siguen pendientes para composición, no para este contrato. Guía/evidencia: [TOPBAR.md](../TOPBAR.md). Base 8f7ea9f; SHA final consultar git log de agent/codex/topbar-001. Controles: astro check 16 archivos, 0 errores/warnings/hints; ESLint/Stylelint/formato/build OK; Vitest 8/8; Playwright 9/9 (8 topbar + smoke starter), sin JS, teclado, foco, responsive y texto ampliado. Contraste mínimo 6.84:1. Comparación visual desktop/mobile realizada; responsive/estados INFERRED. CodeGraph init sin respuesta, fallback documentado. No dependencia nueva, ni cambios de manifests/lockfiles/páginas/layouts. Configs de tests ampliadas para Astro Container/harness aislado. Entrega independiente y publicación en dev según autorización previa; main solo humano. Integración a dev deliberada; main solo humano. HARD STOP al completar TOPBAR; no comenzar Navbar automáticamente.

Claim released: Codex, 2026-10-01 America/Costa_Rica, tras commit e integración/publicación serializada en dev con autorización previa. Consultar refs para SHA final. Navbar sigue PROPOSED.
