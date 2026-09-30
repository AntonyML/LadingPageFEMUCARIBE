# Tooling: inicio y validación

Slice TOOLING-BASELINE-001; rama `agent/codex/tooling-baseline-001`, base `5dcc9ac`. Leer antes de instalar dependencias, iniciar servidor, comprobar tipos, lint/formato o ejecutar tests en cualquier checkout.

## Preparar un checkout

1. Seguir COORDINATION: rama y worktree propios desde dev actualizado, claim publicado.
2. Seleccionar Node fijado por `.node-version`/`.nvmrc` y pnpm fijado por `packageManager`. Usar un gestor existente; no cambiar el runtime global incidentalmente. En Windows `scripts/tooling.ps1` acepta `FEMUCARIBE_NODE_HOME` o descubre el runtime portátil en `%USERPROFILE%/.codex/runtimes/node-v<versión>-win-x64`, y restaura PATH/NODE_OPTIONS al terminar. Si no existe, usa el Node de PATH y rechaza una versión distinta.
3. Ejecutar `powershell -NoProfile -File scripts/tooling.ps1 versions` y después `install`. En shell con runtime correcto: `pnpm install --frozen-lockfile`, seguido de `pnpm --dir tools/penpot install --frozen-lockfile --ignore-scripts`.
4. Ejecutar `check`. Para navegador, ejecutar `browsers` una vez y después `test:e2e`. Estas mismas acciones son argumentos del wrapper Windows. Se usa `--use-system-ca` para conservar TLS verificado con los certificados del equipo; no desactivar validación de certificados.

El runtime validado aquí se descargó del sitio oficial de Node y su archivo ZIP se comprobó contra SHASUMS256.txt; está fuera del repositorio. pnpm 11.15.1 ya estaba instalado y no se actualizó globalmente. En otros sistemas los pins son iguales; el wrapper PowerShell solo facilita Windows.

## Instalaciones reproducibles y límites

La app y `tools/penpot` tienen workspaces y lockfiles separados. Los lockfiles npm anteriores se importaron antes de retirarlos; permanecen recuperables en Git. Astro 7.3.5 y SDK MCP 1.31.0 se conservaron. `engineStrict`, versiones directas exactas y frozen-lockfile evitan resolver cambios silenciosos. esbuild/sharp son las únicas dependencias con scripts de instalación permitidos en la app; Penpot ignora scripts.

TypeScript 6.0.3 satisface los peers de astro check y typescript-eslint; TypeScript 7 todavía no los satisface. strictest comprueba aplicación y configuraciones TS; el puente MCP JS permanece aislado. ESLint comprueba JS/TS/Astro, incluyendo el puente existente. Stylelint analiza CSS scoped de Astro con postcss-html.

Formato cubre `src`, `tests` y configuraciones de raíz. Los documentos históricos y el puente no se reformatean masivamente. Los tres archivos starter Astro solo reciben formato mecánico; no se implementan componentes ni cambios de estilo/comportamiento. `Welcome.astro` conserva cinco excepciones acotadas para notación de colores, alpha, media queries y `-webkit-background-clip`; revisarlas al retirar el starter, sin propagarlas a componentes nuevos.

Prettier/ESLint/Stylelint/check/los runners son devDependencies; no entran como librerías cliente. Justificación de incorporación y paths: [claim](claims/TOOLING-BASELINE-001.md). No se instalan Kysely, adaptadores ni librerías para casos de uso inexistentes.

## Qué demuestra cada control

`check` reúne typecheck, lint, formato y build. No incluye tests de negocio inexistentes ni instala navegadores. `test:e2e` construye y comprueba el HTML y recursos locales en Chromium, detectando errores de navegador/HTTP. Es un smoke del starter, no validación de fidelidad Penpot ni responsive.

Vitest queda configurado para `tests/unit` y `tests/integration`. `test:unit` falla cuando no hay tests (`passWithNoTests: false`); no reportar cobertura ni contratos aprobados hasta que un slice cree pruebas reales. En esta baseline se comprueba el runner con una fixture temporal que pasa y falla deliberadamente y se retira; eso valida el runner, no el dominio.

Playwright controla un servidor `astro preview` local, puerto 4322, y lo cierra al terminar. No inicia un servidor dev ni publica el sitio. Si una tarea necesita dev, usar `pnpm exec astro dev --background` y los comandos stop/status/logs indicados en AGENTS. No reutilizar un servidor de otro agente.

## Fuente y mantenimiento

[Node releases](https://nodejs.org/en/download/releases/), [pnpm instalación](https://pnpm.io/installation), [pnpm import](https://pnpm.io/cli/import), [Astro TypeScript](https://docs.astro.build/en/guides/typescript/), [ESLint Astro](https://ota-meshi.github.io/eslint-plugin-astro/user-guide/), [Stylelint](https://stylelint.io/user-guide/configure/), [Vitest](https://vitest.dev/config/), [Playwright](https://playwright.dev/docs/test-configuration).

Actualizar versiones en un slice deliberado, comprobando engines/peers/licencias, lockfile y controles; no usar latest como contrato. No se configura CI, infraestructura ni protección remota en este slice. Integración a dev requiere autorización; promoción a main es exclusivamente humana.
