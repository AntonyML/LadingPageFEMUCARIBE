# Coordinación

## Flujo

main = estable, promoción y push únicamente humanos. dev = integración. Cada tarea parte de dev actualizado en agent/<agente>/<task> y worktree independiente bajo el home. No reescribir historia, hacer force push, borrar trabajo ajeno ni absorber archivos desconocidos en un commit.

Antes de editar, comprobar estado Git, base y reservas de esta tabla. Registrar task, owner, rama, base, paths y objetivo aquí; no hace falta un Markdown adicional por claim. En paralelo, acordar una copia compartida del registro accesible por ruta absoluta; el coordinador serializa reservas. PROPOSED no reserva. Resolver solapamientos antes de editar. Configs, lockfiles, páginas/layouts, CSS global y recursos compartidos necesitan un responsable definido.

| Task                  | Owner / rama                              | Estado   | Reserva                                             |
| --------------------- | ----------------------------------------- | -------- | --------------------------------------------------- |
| TOPBAR-MODULARITY-001 | Codex / agent/codex/topbar-modularity-001 | CLOSED   | Componente, recursos, pruebas, documentos y ESLint. |
| NAVBAR-001            | Pendiente / agent/codex/navbar-001        | PROPOSED | Solo navegación principal.                          |

Tarea actual: base 3a380a0; worktree y registro compartido en C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-topbar-modularity-001. Paths autorizados: src/components/GovernmentBar.astro, src/components/government-bar/**, src/assets/government/**, recursos anteriores de fuente en public/government, pruebas de GovernmentBar, AGENTS.md, README.md, eslint.config.mjs y docs/**. Reserva liberada al cerrar la entrega; integración a dev autorizada por el propietario.

Navbar aún no está iniciado. Su worktree codex-navbar-001 conserva base ab246b7: verificar y actualizar desde dev antes de comenzar.

Penpot: un responsable de escritura por página; otros trabajan sobre snapshots o código. El MCP sigue una sola pestaña activa. La topbar y Navbar son tareas independientes; su composición en Inicio se reserva posteriormente con un único responsable de página/layout.

## Entrega

Ejecutar controles relevantes, revisar diff y preparar commit solo de paths propios. Entregar rama/base/commit, archivos, resultados y límites. Integrar a dev deliberadamente con autorización del propietario; nunca promover a main. Al terminar, liberar la reserva y detenerse: no iniciar el siguiente slice. Conflicto, scope indispensable ambiguo o decisión pendiente: detener la parte dependiente y reportar evidencia.

## Estado e historial

Git baseline, tooling, separación de cabecera y TOPBAR-001 están entregados; TOPBAR-001 base funcional: 3a380a0. Su historial permanece en Git. Existe origin configurado por el propietario. Protecciones remotas: pendientes de verificación humana. Este registro manual no equivale a un bloqueo automático.

Validación de esta entrega: check sin errores, 8 unit y 10 E2E; seis capturas idénticas a TOPBAR-001; build con base /femucaribe y URLs de fuente/bandera comprobadas. ESLint pasa también después de generar artefactos de fixture. Documentos en docs reducidos de 19 a 7; enlaces locales válidos. Main no se modifica. HARD STOP.
