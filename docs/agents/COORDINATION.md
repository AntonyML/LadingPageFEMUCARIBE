# Coordinación

## Flujo

main = estable, promoción y push únicamente humanos. dev = integración. Cada tarea parte de dev actualizado en agent/<agente>/<task> y worktree independiente bajo el home. No reescribir historia, hacer force push, borrar trabajo ajeno ni absorber archivos desconocidos en un commit.

Antes de editar, comprobar estado Git, base y reservas de esta tabla. Registrar task, owner, rama, base, paths y objetivo aquí; no hace falta un Markdown adicional por claim. En paralelo, acordar una copia compartida del registro accesible por ruta absoluta; el coordinador serializa reservas. PROPOSED no reserva. Resolver solapamientos antes de editar. Configs, lockfiles, páginas/layouts, CSS global y recursos compartidos necesitan un responsable definido.

| Task                  | Owner / rama                              | Estado   | Reserva                                             |
| --------------------- | ----------------------------------------- | -------- | --------------------------------------------------- |
| TOPBAR-MODULARITY-001 | Codex / agent/codex/topbar-modularity-001 | CLOSED   | Componente, recursos, pruebas, documentos y ESLint. |
| TOPBAR-REVERT-001 | Codex / agent/codex/topbar-revert-001 | CLOSED | GovernmentBar, imports/tests y tres documentos. |
| NAVBAR-001            | Pendiente / agent/codex/navbar-001        | PROPOSED | Solo navegación principal.                          |

Tarea actual: TOPBAR-REVERT-001; base c3381fe; worktree y registro compartido C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-topbar-revert-001. Paths: src/components/GovernmentBar.astro y los cuatro archivos anteriores del componente; tests/unit/government-bar.test.ts, tests/e2e/government-bar.spec.ts, el index.astro de la fixture aislada de GovernmentBar; docs/agents/COORDINATION.md, docs/agents/TOPBAR.md y docs/architecture/ARCHITECTURE.md. Objetivo: revertir solo la estructura del componente y registrar la regla de granularidad. Reserva liberada al cerrar; integrar a dev autorizado.

Navbar aún no está iniciado. Su worktree codex-navbar-001 conserva base ab246b7: verificar y actualizar desde dev antes de comenzar.

Penpot: un responsable de escritura por página; otros trabajan sobre snapshots o código. El MCP sigue una sola pestaña activa. La topbar y Navbar son tareas independientes; su composición en Inicio se reserva posteriormente con un único responsable de página/layout.

## Entrega

Ejecutar controles relevantes, revisar diff y preparar commit solo de paths propios. Entregar rama/base/commit, archivos, resultados y límites. Integrar a dev deliberadamente con autorización del propietario; nunca promover a main. Al terminar, liberar la reserva y detenerse: no iniciar el siguiente slice. Conflicto, scope indispensable ambiguo o decisión pendiente: detener la parte dependiente y reportar evidencia.

## Estado e historial

Git baseline, tooling, separación de cabecera y TOPBAR-001 están entregados; TOPBAR-001 base funcional: 3a380a0. Su historial permanece en Git. Existe origin configurado por el propietario. Protecciones remotas: pendientes de verificación humana. Este registro manual no equivale a un bloqueo automático.

Validación histórica TOPBAR-MODULARITY-001: check sin errores, 8 unit y 10 E2E; seis capturas idénticas a TOPBAR-001; build con base /femucaribe y URLs de fuente/bandera comprobadas. ESLint pasa también después de generar artefactos de fixture. Documentos en docs reducidos de 19 a 7; enlaces locales válidos. Main no se modifica. HARD STOP.

Validación TOPBAR-REVERT-001: check, 8 unit y 9 E2E pasan. Se retira el test específico de CSS externo; preview verifica 14 selectores scoped y un enlace ajeno sin fuga. Fuente mediante url relativa en style, procesada por Vite; fuente y bandera responden HTTP 200 bajo /femucaribe. Seis capturas idénticas a c3381fe. Regla literal de granularidad registrada una sola vez en ARCHITECTURE.md. Sin referencias vivas a la carpeta eliminada en src/docs; contratos y errores preservados, sin cambios de recursos, ESLint ni configuración. CodeGraph no generó índice; fallback de lectura directa. Main intacto. Límites: URLs editoriales y composición en Inicio pendientes. HARD STOP.
