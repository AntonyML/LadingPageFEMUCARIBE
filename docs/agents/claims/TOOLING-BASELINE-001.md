# TOOLING-BASELINE-001

Task: alinear tooling aprobado
Owner / coordinator: Codex, ejecución única autorizada por el propietario
Branch: agent/codex/tooling-baseline-001
Worktree: C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-tooling-baseline-001
Status: CLOSED
Base commit (dev): 5dcc9ac
Started: 2026-09-30 America/Costa_Rica
Published in shared registry: COORDINATION.md en esta rama, ruta absoluta indicada; sin otros agentes activos. Reserva comprobada y confirmada por el coordinador Codex.
Paths claimed: package.json; package-lock.json; pnpm-lock.yaml; pnpm-workspace.yaml; .npmrc; .nvmrc; .node-version; .gitignore; .prettierignore; prettier.config.mjs; eslint.config.mjs; stylelint.config.mjs; vitest.config.ts; playwright.config.ts; tsconfig.json; scripts/tooling.ps1; tests/e2e/tooling.spec.ts; tools/penpot/package.json; tools/penpot/package-lock.json; tools/penpot/pnpm-lock.yaml; tools/penpot/pnpm-workspace.yaml; scripts/penpot.ps1; docs/agents/COORDINATION.md; docs/agents/GIT-BASELINE.md; docs/agents/claims/TOOLING-BASELINE-001.md; docs/agents/TOOLING.md; docs/architecture/STACK.md; docs/penpot/AGENT-GUIDE.md; AGENTS.md; README.md; formato mecánico de archivos existentes sin cambio de comportamiento.

## Scope

IN SCOPE: Node 22 portátil y pin reproducible, migración pnpm de ambos paquetes preservando Astro/SDK, strictest, formato/lint/typecheck/build, runners unit/E2E y smoke del starter, guía/handoff.
OUT OF SCOPE: diseño/UI, Navbar/Footer, Actions, DB/auth, despliegue/CI, modificar Penpot, promoción a main y nuevas features.

Dependencias de desarrollo: @astrojs/check + TypeScript + @types/node 22 (Astro build no comprueba tipos; configuración de tests usa APIs Node); Prettier + plugin Astro (formato); ESLint + @eslint/js + typescript-eslint + plugin Astro + globals (análisis JS/TS/Astro); Stylelint + config standard + postcss-html (CSS dentro de Astro); Vitest (runner de futuros contratos); @playwright/test (smoke real de navegador). Herramientas ya aprobadas en STACK; alternativas nativas no proporcionan estos análisis/runners. Sin dependencias nuevas en bundle de aplicación. Pin de TypeScript compatible con peers en lugar de major 7 incompatible. Runtime y herramientas fuera del repositorio no se versionan.

## Completion criteria

Instalación frozen de ambos paquetes con pnpm fijado; verificación bajo Node 22; typecheck/lint/formato/build; smoke de navegador; prueba negativa de lint/tipado; sin cambio semántico de aplicación; árbol limpio con commit local de tarea. Runners sin contratos aún se declaran sin pruebas de negocio, no cobertura ficticia.

## Handoff

Commit(s): consultar git log de la rama; base 5dcc9ac. Registro actualizado antes del commit.
Changed files: pins/manifests/lockfiles/configuraciones/scripts/tests/guía listados en Paths claimed; src Astro y astro.config solo formato mecánico.
Tests executed / Result: instalaciones frozen de ambos paquetes OK; Node 22.23.3/pnpm 11.15.1; astro check 11 archivos, 0 errores/warnings/hints; ESLint/Stylelint/formato/build OK; Playwright Chromium 1/1 OK; servidor preview cerrado. Probes temporales rechazadas por typecheck, ESLint y Stylelint; Vitest acepta prueba válida y falla assertion inválida, luego falla explícitamente sin suites. Wrapper rechaza Node 24. Parsers PowerShell y node --check del puente OK. Fixtures retiradas.
Penpot validation: no conexión ni cambios de diseño; smoke CLI help/import del SDK migrado OK. El catálogo MCP se preserva.
Known limitations: no tests de negocio aún, test:unit falla intencionalmente sin suites; cinco excepciones Stylelint solo en starter Welcome; CodeGraph init sin respuesta y status Not initialized, fallback documental. Runtime global sigue Node 24; usar wrapper/runtime fijado. No CI ni deploy.
Dependency review: engines/peers compatibles comprobados en registry/paquetes; dependencias nuevas de desarrollo MIT, excepto TypeScript y Playwright Apache-2.0. pnpm agregó excepciones de edad únicamente para tres versiones exactas Vitest 5.0.3/mocker/spy, conservadas explícitamente, sin desactivar TLS ni políticas generales.
Integration notes: preservar main; dev solo fast-forward deliberado, con verificación de SHA esperado y remoto. El propietario había autorizado publicar cambios en dev y realizar él mismo merge a main; ninguna promoción a main por el agente.
Possible conflicts: manifests/lockfiles y configs son compartidos; no otros claims activos. main/dev ya publicados por humano antes de este slice.
Claim released: Codex, 2026-09-30 America/Costa_Rica, al completar commit/publicación e integración serializada en dev con autorización previa del propietario. Consultar refs remotas para SHA final.
HARD STOP: no iniciar Navbar ni otro slice.
