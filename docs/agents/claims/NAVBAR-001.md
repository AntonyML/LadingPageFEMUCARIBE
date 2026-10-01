# NAVBAR-001

Task: PublicNavbar independiente de Inicio
Owner: Codex propuesto; confirmar al activar
Branch: agent/codex/navbar-001
Worktree: C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-navbar-001
Status: PROPOSED
Paths proposed: src/components/PublicNavbar.astro; public/brand/*; tests/unit/public-navbar*.test.ts; tests/e2e/public-navbar*.spec.ts; docs/agents/claims/NAVBAR-001.md
Objective: reproducir exclusivamente L1-Navigation-Principal, con estado activo único y navegación responsive.
Dependencies: claim ACTIVE confirmado por coordinador, evidencia Penpot viva y destinos revisados. TOPBAR no es dependencia de código.
Started: implementación no iniciada; worktree preparado el 2026-10-01 America/Costa_Rica
Base commit (dev): preparación ab246b7; comprobar/actualizar por fast-forward y registrar base vigente al activar
Published in shared registry: docs/agents/COORDINATION.md en dev después de integrar HEADER-SLICES-001. PROPOSED no reserva paths.

## Scope

IN SCOPE: marca/recursos FEMUCARIBE, Inicio/Nosotros/Municipalidades/Proyectos/Transparencia/Noticias, CTA Contáctenos/plataforma, estado activo parametrizable, menú responsive, estilos locales y pruebas propias. Fuente: [plan](../INICIO-SLICES.md), forma 1158a0fe-c558-80da-8008-94095cbb1269.
OUT OF SCOPE: GovernmentBar/identidad nacional/enlaces institucionales, hero/footer/búsqueda, creación de páginas destino vacías, login/auth, archivos de layout/página/CSS global/tokens/fonts/config compartidos y Penpot de escritura.

## Completion criteria

Desktop documentado como CONFIRMED con revisión/IDs y exportación; mobile/tablet/hover/focus/menú como INFERRED. Estado activo único con aria-current, enlaces reales y CTA sin destinos inventados; si plataforma sigue UNKNOWN, resolver o declarar HARD STOP de esa parte sin aparentar funcionamiento. HTML usable sin JS; teclado, Escape/cierre/restauración de foco si corresponde al patrón elegido, targets, contraste, zoom y ausencia de overflow. Pruebas relevantes y tipado/lint/formato/build aprobados. Sin importar GovernmentBar ni depender de su DOM.

Si faltan recursos o hay necesidad de shared paths, acordar ampliación del claim antes de editar. El componente recibe estado activo/destinos según contrato documentado; la composición futura decide la página activa, no esta tarea de modificar Inicio.

## Handoff

Pendiente: base/HEAD, commits, archivos, controles/evidencia, destinos pendientes y responsive inferido. La instalación congelada del worktree ya se completó sin modificar manifests/lockfiles. La pregunta de URL de plataforma sigue pendiente; no se inventa.

Integración a dev deliberada; main solo humano. HARD STOP al completar Navbar; no empezar Hero, Footer ni otro slice automáticamente.
