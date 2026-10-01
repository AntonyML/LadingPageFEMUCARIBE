# Coordinación

## Flujo

main = estable, promoción y push únicamente humanos. dev = integración. Cada tarea parte de dev actualizado en agent/<agente>/<task> y worktree independiente bajo el home. No reescribir historia, hacer force push, borrar trabajo ajeno ni absorber archivos desconocidos en un commit.

Antes de editar, comprobar estado Git, base y reservas de esta tabla. Registrar task, owner, rama, base, paths y objetivo aquí; no hace falta un Markdown adicional por claim. En paralelo, acordar una copia compartida del registro accesible por ruta absoluta; el coordinador serializa reservas. PROPOSED no reserva. Resolver solapamientos antes de editar. Configs, lockfiles, páginas/layouts, CSS global y recursos compartidos necesitan un responsable definido.

| Task                  | Owner / rama                              | Estado   | Reserva                                             |
| --------------------- | ----------------------------------------- | -------- | --------------------------------------------------- |
| TOPBAR-MODULARITY-001 | Codex / agent/codex/topbar-modularity-001 | CLOSED   | Componente, recursos, pruebas, documentos y ESLint. |
| TOPBAR-REVERT-001 | Codex / agent/codex/topbar-revert-001 | CLOSED | GovernmentBar, imports/tests y tres documentos. |
| PUBLIC-SHELL-001 | Codex / agent/codex/public-shell-001 | CLOSED | Layout compartido, Inicio vacio, purga starter, test y docs. |
| NAVBAR-001 | Codex / agent/codex/navbar-001 | CLOSED | PublicNavbar, recurso de marca, layout, pruebas y documentacion existente. |

Tarea actual: NAVBAR-001; base 6c89eb8; worktree/registro C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-navbar-001. Paths: src/components/PublicNavbar.astro, src/assets/brand/**, src/layouts/PublicLayout.astro, tests/unit/public-navbar.test.ts, tests/e2e/public-navbar.spec.ts, tests/e2e/public-layout.spec.ts, docs/agents/COORDINATION.md y TOPBAR.md. Objetivo: navbar independiente y composicion serializada bajo GovernmentBar; sin Hero/Footer, paginas nuevas ni autenticacion. Reserva liberada al cerrar; integracion a dev autorizada.

Navbar entregada como componente independiente en el layout compartido; Penpot de solo lectura.

Penpot: un responsable de escritura por página; otros trabajan sobre snapshots o código. El MCP sigue una sola pestaña activa. La topbar y Navbar son tareas independientes; su composición en Inicio se reserva posteriormente con un único responsable de página/layout.

## Entrega

Ejecutar controles relevantes, revisar diff y preparar commit solo de paths propios. Entregar rama/base/commit, archivos, resultados y límites. Integrar a dev deliberadamente con autorización del propietario; nunca promover a main. Al terminar, liberar la reserva y detenerse: no iniciar el siguiente slice. Conflicto, scope indispensable ambiguo o decisión pendiente: detener la parte dependiente y reportar evidencia.

## Estado e historial

Git baseline, tooling, separación de cabecera y TOPBAR-001 están entregados; TOPBAR-001 base funcional: 3a380a0. Su historial permanece en Git. Existe origin configurado por el propietario. Protecciones remotas: pendientes de verificación humana. Este registro manual no equivale a un bloqueo automático.

Validación histórica TOPBAR-MODULARITY-001: check sin errores, 8 unit y 10 E2E; seis capturas idénticas a TOPBAR-001; build con base /femucaribe y URLs de fuente/bandera comprobadas. ESLint pasa también después de generar artefactos de fixture. Documentos en docs reducidos de 19 a 7; enlaces locales válidos. Main no se modifica. HARD STOP.

Validación TOPBAR-REVERT-001: check, 8 unit y 9 E2E pasan. Se retira el test específico de CSS externo; preview verifica 14 selectores scoped y un enlace ajeno sin fuga. Fuente mediante url relativa en style, procesada por Vite; fuente y bandera responden HTTP 200 bajo /femucaribe. Seis capturas idénticas a c3381fe. Regla literal de granularidad registrada una sola vez en ARCHITECTURE.md. Sin referencias vivas a la carpeta eliminada en src/docs; contratos y errores preservados, sin cambios de recursos, ESLint ni configuración. CodeGraph no generó índice; fallback de lectura directa. Main intacto. Límites: URLs editoriales y composición en Inicio pendientes. HARD STOP.

PUBLIC-SHELL-001: check, 8 unit y 9 E2E pasan. PublicLayout compartido con titulo, lang es, un header y main enfocable; Inicio vacio. Los tres destinos del propietario quedan configurados en el layout sin alterar GovernmentBar. Eliminados Welcome, layout/assets/favicons starter y excepciones de Stylelint; carpetas conservadas. Prueba publica sin JS verifica URLs exactas, slot vacio, skip y recursos locales sin errores. /accesibilidad aun no tiene pagina; no se implementa su contenido. Navbar/Footer pendientes de sus slices. CodeGraph no genero indice; fallback directo. Main intacto. HARD STOP.

NAVBAR-001: check, 20 unit y 17 E2E pasan; desktop comparado con exportacion Penpot, screenshots en seis anchos, teclado/foco y texto ampliado. Logo exportado 2x y fuente Inter variable local con OFL; base /femucaribe verificado mediante preview: rutas/activo correctos, logo/bandera/fuentes HTTP 200. Responsive y foco INFERRED, desktop CONFIRMED. Plataforma: URL solicitada al propietario, sin respuesta; CTA no interactivo aria-disabled, prop platformUrl preparada sin inventar destino. Otras paginas publicas son rutas inferidas aun no implementadas. No auth, Hero/Footer ni nuevos paquetes/configs. CodeGraph init no genero indice, fallback directo. Main no se toca. HARD STOP.
