# Coordinación de agentes

Estas reglas son vinculantes para un agente y para trabajo paralelo. El scope de la tarea autoriza el trabajo; disponer de contexto suficiente no autoriza otra tarea. Baseline: [STACK.md](../architecture/STACK.md), [ARCHITECTURE.md](../architecture/ARCHITECTURE.md), [DESIGN-CONTRACT.md](../architecture/DESIGN-CONTRACT.md) y [ADR-0001](../adr/0001-stack-and-architecture-baseline.md).

## Git y autoridad

`main` es producción: **solo el humano propietario** puede promover, hacer push o merge hacia ella y crear releases de producción. Agentes no trabajan directamente en `main` ni `dev`; no rebasean `main`, hacen force push, reescriben historia, resetean commits ajenos, borran ramas ajenas o limpian trabajo compartido. Tener permisos técnicos no otorga autoridad.

`dev` es integración. Flujo obligatorio: rama de tarea → integración deliberada a `dev` → validación del conjunto → revisión humana → promoción humana a `main`. Ninguna feature va directamente de agente a `main`.

Una rama por agente y tarea: `agent/<agente>/<tarea>`, por ejemplo `agent/codex/navbar-001`; terminarla antes de reutilizar el nombre. Crear desde `dev` actualizado y verificar base/HEAD antes de editar. Si falta `dev`, HARD STOP de implementación y bootstrap Git explícito; no elegir `master` como sustituto tácito. Registro del bootstrap Git: [GIT-BASELINE.md](GIT-BASELINE.md); comprobar refs actuales con Git; estado histórico de la auditoría: [AUDIT.md](../architecture/AUDIT.md). Sin remoto, la fuente actualizada es dev local acordado, no un origin inventado.

## Arranque de una tarea

1. Leer reglas y documentos del área; inspeccionar estado Git y cambios existentes. Definir Task, Goal, IN SCOPE, OUT OF SCOPE y criterios verificables. El OUT OF SCOPE es vinculante.
2. Comprobar `dev` actualizado y registrar commit base. No hacer cambios de rama sobre trabajo ajeno ni stash automático de cambios desconocidos.
3. En toda futura tarea crear rama propia desde dev y worktree independiente por agente/tarea, incluso con un solo agente. Preferir `C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/<agente>-<tarea>` o equivalente bajo el home del usuario. Registrar ruta, rama, SHA base y responsable; nunca reutilizar el checkout de otro agente. El bootstrap Git secuencial GIT-BASELINE-001 usó el checkout existente para preservar el trabajo previo.
4. Crear y publicar claim según [plantilla](claims/TEMPLATE.md). Resolver solapamientos antes de tocar paths; registrar dependencias compartidas. Solo después de que el coordinador confirme la reserva comienza la implementación.
5. Para preguntas estructurales, resolver raíz con `git rev-parse --show-toplevel` y verificar proyecto real y `.codegraph/` antes de búsquedas amplias. Si falta índice y está disponible, ejecutar una vez `gentle-ai codegraph init --cwd <raíz>`; consultar MCP `codegraph_explore` o CLI upstream read-only. Cada worktree necesita índice propio; nunca copiar/symlink/reusar uno ajeno. Tras fallo explicado, usar herramientas normales. Auto-sync del watcher por defecto; `sync` solo si está desactivado o hay stale persistente. No usar indexación rutinaria ni comandos de desinstalación/upgrade.
6. Para Penpot verificar archivo/página/IDs y leer su [guía](../penpot/AGENT-GUIDE.md). Un solo responsable de escritura por página. Mantener la pestaña activa; otros agentes pueden revisar código o snapshots. Ningún agente cambia la página activa mientras otro la usa.

## Claims y registro compartido

Un claim reserva paths temporalmente, no crea propiedad permanente. Estados: PROPOSED → ACTIVE → READY_FOR_REVIEW → INTEGRATED → CLOSED, o BLOCKED/CANCELLED con razón. Registrar owner, rama, worktree, objetivo, dependencias, fecha y paths exactos/globs. Un claim ACTIVE/BLOCKED/READY_FOR_REVIEW conserva la reserva hasta liberación explícita; el abandono silencioso no la libera.

En paralelo, el propietario designa un coordinador y una copia compartida de este registro con ruta absoluta visible para todos. El coordinador serializa altas/cambios y publica los claims/refs/worktrees para que cada agente pueda leerlos; puede consultar un claim desde su rama o desde su ruta de worktree. **Un claim existente solo en un worktree privado no reserva nada hasta publicarse y comprobar solapamientos.** Las copias versionadas sirven de historial, no se presume que sus ramas se sincronizan automáticamente. Esta gobernanza es manual, no un lock implementado. `gitlock` puede aportar notificación si se configura y autoriza; no reemplaza el registro ni permite enviar mensajes externos sin autorización.

| Task | Owner | Rama | Estado | Paths / fuente |
| --- | --- | --- | --- | --- |
| ARCH-001 | Codex | `agent/codex/architecture-baseline` | CLOSED | [Claim](claims/ARCH-001.md); trabajo preservado, reserva liberada/traspasada por GIT-BASELINE-001 |
| GIT-BASELINE-001 | Codex | `agent/codex/git-baseline-001` | CLOSED | [Claim](claims/GIT-BASELINE-001.md); bootstrap e integración documental local autorizados |
| TOOLING-BASELINE-001 | Codex | `agent/codex/tooling-baseline-001` | CLOSED | [Claim](claims/TOOLING-BASELINE-001.md); registro compartido: C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-tooling-baseline-001/docs/agents/COORDINATION.md; ejecución única |

Si se necesita un path reservado: HARD STOP antes de editar, señalar dependencia y acordar serialización/traspaso con owner/coordinador. No ampliar unilateralmente el claim. Toda tarea nueva verifica el registro actualizado.

## Archivos compartidos y dependencias

Alto conflicto: `package.json`, todos los lockfiles, `astro.config.*`, `tsconfig.*`, `src/env.*`, middleware, CSS global, design tokens, configuración de tests/lint/CI y `.codex/config.toml`. Cambiarlos requiere explicar y justificar, comprobar claims, registrar el ajuste y limitarlo al mínimo; preferir tarea de configuración separada. No sustituir configuraciones funcionales incidentalmente.

Antes de añadir dependencias comprobar Astro, TypeScript, CSS y Web Platform; registrar problema, alternativas, mantenimiento e impacto según STACK. Cualquier nueva dependencia se declara antes de implementarla. Si altera arquitectura, framework, DB, auth, contratos compartidos, persistencia o design system: HARD STOP y decisión explícita/ADR. No ocultarla dentro de una feature.

## Hard stops y Definition of Done

Detener la parte dependiente ante scope ambiguo, feature adicional necesaria, conflicto de paths, decisión arquitectónica pendiente o contrato visual UNKNOWN indispensable. Registrar el bloqueo con evidencia; trabajo independiente dentro de scope puede continuar. Al completar el slice, STOP: no empezar Hero, Footer, auth, CMS ni otra feature espontáneamente.

DoD según aplique: fidelidad Penpot documentada; desktop/tablet/mobile y adaptación justificada; HTML semántico, landmarks/headings/labels; teclado, foco visible, contraste, reduced motion y targets; TypeScript, CSS, formato, lint, tests unitarios/integración y E2E relevantes; errores y edge cases; rendimiento/recursos y ausencia de JS/dependencias innecesarias; documentación, sin código muerto ni archivos fuera de scope. Verificar estados interactivos y operación base sin JS cuando sea razonable. Si un control falta o no aplica, declarar motivo; no sustituirlo por “se ve bien”. No imponer números responsive que Penpot todavía no define sin una decisión registrada.

## Handoff e integración

Entregar Task, Branch, base/HEAD, Commit(s), Changed files, Tests executed con resultados, Penpot validation (archivo/página/IDs), Known limitations, Integration notes y Possible conflicts. Distinguir cambios propios de los preexistentes. Commit solo paths propios; nunca stage global que absorba trabajo ajeno.

El responsable de integración revisa alcance, claims, diff, pruebas y compatibilidad. Un agente puede preparar una propuesta hacia `dev`; integrar requiere autorización explícita del propietario/coordinador autorizado y ejecución serializada. Quien integra no desarrolla features sobre `dev`; registra la integración y valida localmente el conjunto, incluido diseño. No integrar features ajenas automáticamente. Conflictos se comprenden con ambos responsables; si no hay evidencia suficiente, detenerse antes de resolver arbitrariamente.

Liberar claim después de integración/revisión acordada; limpiar solo recursos propios al estar preservados. El propietario revisa `dev` y realiza personalmente la promoción a `main`. Estas reglas Markdown no equivalen a branch protection remota; las protecciones automáticas siguen pendientes de verificación del propietario; origin ya fue configurado y main/dev publicados por él.
