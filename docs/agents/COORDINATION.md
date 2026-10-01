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
| FOOTER-001 | Codex / agent/codex/footer-001 | CLOSED | InstitutionalFooter y CSS Module local, layout, dos pruebas, COORDINATION y TOPBAR. |

Tarea actual: GLOBAL-LAYOUT-001; base faf77e4; worktree/registro C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-global-layout-001. Paths y objetivo: reserva GLOBAL-LAYOUT-001 al final del registro.

Navbar entregada como componente independiente en el layout compartido; Penpot de solo lectura.

Penpot: un responsable de escritura por página; otros trabajan sobre snapshots o código. El MCP sigue una sola pestaña activa. GovernmentBar, PublicNavbar e InstitutionalFooter son componentes independientes compuestos por PublicLayout; reservar cambios del layout global con un unico responsable.

## Entrega

Ejecutar controles relevantes, revisar diff y preparar commit solo de paths propios. Entregar rama/base/commit, archivos, resultados y límites. Integrar a dev deliberadamente con autorización del propietario; nunca promover a main. Al terminar, liberar la reserva y detenerse: no iniciar el siguiente slice. Conflicto, scope indispensable ambiguo o decisión pendiente: detener la parte dependiente y reportar evidencia.

## Estado e historial

Git baseline, tooling, separación de cabecera y TOPBAR-001 están entregados; TOPBAR-001 base funcional: 3a380a0. Su historial permanece en Git. Existe origin configurado por el propietario. Protecciones remotas: pendientes de verificación humana. Este registro manual no equivale a un bloqueo automático.

Validación histórica TOPBAR-MODULARITY-001: check sin errores, 8 unit y 10 E2E; seis capturas idénticas a TOPBAR-001; build con base /femucaribe y URLs de fuente/bandera comprobadas. ESLint pasa también después de generar artefactos de fixture. Documentos en docs reducidos de 19 a 7; enlaces locales válidos. Main no se modifica. HARD STOP.

Validación TOPBAR-REVERT-001: check, 8 unit y 9 E2E pasan. Se retira el test específico de CSS externo; preview verifica 14 selectores scoped y un enlace ajeno sin fuga. Fuente mediante url relativa en style, procesada por Vite; fuente y bandera responden HTTP 200 bajo /femucaribe. Seis capturas idénticas a c3381fe. Regla literal de granularidad registrada una sola vez en ARCHITECTURE.md. Sin referencias vivas a la carpeta eliminada en src/docs; contratos y errores preservados, sin cambios de recursos, ESLint ni configuración. CodeGraph no generó índice; fallback de lectura directa. Main intacto. Límites: URLs editoriales y composición en Inicio pendientes. HARD STOP.

PUBLIC-SHELL-001: check, 8 unit y 9 E2E pasan. PublicLayout compartido con titulo, lang es, un header y main enfocable; Inicio vacio. Los tres destinos del propietario quedan configurados en el layout sin alterar GovernmentBar. Eliminados Welcome, layout/assets/favicons starter y excepciones de Stylelint; carpetas conservadas. Prueba publica sin JS verifica URLs exactas, slot vacio, skip y recursos locales sin errores. /accesibilidad aun no tiene pagina; no se implementa su contenido. Navbar/Footer pendientes de sus slices. CodeGraph no genero indice; fallback directo. Main intacto. HARD STOP.

NAVBAR-001: check, 20 unit y 17 E2E pasan; desktop comparado con exportacion Penpot, screenshots en seis anchos, teclado/foco y texto ampliado. Logo exportado 2x y fuente Inter variable local con OFL; base /femucaribe verificado mediante preview: rutas/activo correctos, logo/bandera/fuentes HTTP 200. Responsive y foco INFERRED, desktop CONFIRMED. Plataforma: URL solicitada al propietario, sin respuesta; CTA no interactivo aria-disabled, prop platformUrl preparada sin inventar destino. Otras paginas publicas son rutas inferidas aun no implementadas. No auth, Hero/Footer ni nuevos paquetes/configs. CodeGraph init no genero indice, fallback directo. Main no se toca. HARD STOP.

FOOTER-001 CLOSED: Codex / agent/codex/footer-001; base 15265bc; worktree C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-footer-001. Reserva: src/components/InstitutionalFooter.astro, src/layouts/PublicLayout.astro, tests/unit/institutional-footer.test.ts, tests/e2e/institutional-footer.spec.ts, docs/agents/COORDINATION.md y TOPBAR.md. Objetivo: footer compartido desde el board de Inicio; sin Hero ni paginas nuevas.
Ajuste de reserva FOOTER-001: src/components/institutional-footer/InstitutionalFooter.astro y styles.module.css sustituyen el path plano; CSS Module local por tamaño del componente, sin directorios globales.
Reserva adicional FOOTER-001: tests/e2e/public-navbar.spec.ts; acotar el selector de marca a su navbar, ahora que existe otro enlace de marca en footer.
Reserva adicional FOOTER-001: tests/e2e/public-layout.spec.ts; verificar footer unico y conservar skip a main vacio enfocable con altura minima.

FOOTER-001 entregado: check pasa, 29 unit y 25 E2E seriales pasan; la primera corrida paralela tuvo bloqueos de carga de fuentes/recursos. Ajustados targets tablet, selector de marca de navbar y main vacio con minimo 1rem para skip/foco. Capturas en seis anchos, texto al 200%, teclado y CSS sin fuga; comparacion con exportacion desktop, sin afirmar igualdad pixel a pixel. Build bajo /femucaribe verifica 14 rutas/assets de footer y existencia de recursos. Datos de Penpot sujetos a validacion editorial; URLs documentales/privacidad pendientes, renderizadas como texto. CodeGraph init sin indice, fallback directo. Reserva liberada; integracion deliberada a dev autorizada. Main no se modifica. HARD STOP.
RESPONSIVE-FIX-001 CLOSED: Codex / agent/codex/responsive-fix-001; base cd05443; worktree codex-responsive-fix-001. Reserva PublicNavbar.astro, institutional-footer/styles.module.css, tests/e2e/responsive-layout.spec.ts, COORDINATION.md y TOPBAR.md. Objetivo: franja completa, columnas fluidas y CTA agrupados bajo zoom; sin cambios de contenido.

RESPONSIVE-FIX-001: check, 29 unit y 36 E2E seriales pasan. Capturas revisadas; franja completa, grupos CTA a 12px, columnas sin overflow en once anchos y limites de breakpoint. CodeGraph init sin indice: fallback directo. Preview actualizado en 4327. Reserva liberada; dev autorizado, main intacto. HARD STOP.

GLOBAL-LAYOUT-001 CLOSED: Codex / agent/codex/global-layout-001; base faf77e4; worktree C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-global-layout-001. Reserva: src/styles/global.css, src/layouts/PublicLayout.astro, GovernmentBar.astro, PublicNavbar.astro, institutional-footer/InstitutionalFooter.astro y styles.module.css; tests/e2e/global-layout.spec.ts y public-layout.spec.ts; AGENTS.md, docs/architecture/ARCHITECTURE.md, docs/agents/COORDINATION.md y TOPBAR.md. Objetivo: reset minimo, contenedor/grid comunes y accesibilidad global; responsive obligatorio, sin Hero, contenido nuevo de Inicio ni paginas nuevas.
Reserva adicional GLOBAL-LAYOUT-001: README.md; actualizar la entrada del proyecto al estado del layout compartido.

GLOBAL-LAYOUT-001 entregado: reset/base global importados desde PublicLayout; contenedor compartido 80rem, grid 1/2/3, fuente de marca unica, landmarks/skip/foco y ayudas accesibles. Check, 29 unit y 50 E2E seriales Chromium pasan; 280-3840px, horizontal, contenido largo, texto 200% y viewport reducido. Ultimo ajuste de ruta accesibilidad verificado nuevamente con test PublicLayout. Build /femucaribe verifica 26 URLs locales prefijadas y recursos existentes; sin cambios de URLs editoriales. Documentacion vigente en ARCHITECTURE, AGENTS, README y TOPBAR; no nuevos Markdown. CodeGraph init y consulta fallaron sin indice, fallback directo. Capturas revisadas. Reserva liberada, dev autorizado; main intacto. HARD STOP.
