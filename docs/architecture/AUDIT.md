# Auditoría del estado real

Fecha: 2026-09-30, America/Costa_Rica. Base inspeccionada: commit `3dd3ee0` (`Initial commit from Astro`). Auditoría de documentación; ninguna feature implementada.

## Repositorio

| Evidencia | Estado confirmado |
| --- | --- |
| `package.json` / instalación local | Única dependencia directa de aplicación: `astro: ^7.3.5`; instalada 7.3.5. Node declarado `>=22.12.0`. |
| Runtime observado | Node 24.18.0; pnpm disponible 11.15.1. Compatibilidad del pnpm observado con Node 22: no validada. |
| `tsconfig.json` | Extiende `astro/tsconfigs/strict`, no `strictest`. |
| `astro.config.mjs` | `defineConfig({})`; sin adaptador servidor, sesiones ni schema env configurados. |
| `src/pages/index.astro` | Importa `Welcome.astro` y `Layout.astro`; página starter. |
| `src/layouts/Layout.astro` | `lang="en"`, título `Astro Basics`, favicons del starter y slot. |
| `src/components/Welcome.astro` / assets / public | Demo Astro, CSS local y recursos de ejemplo; no implementación de FEMUCARIBE. |
| Tooling de calidad | Sin scripts/configs/dependencias directas para check, lint, Stylelint, Prettier, Vitest o Playwright. Dependencias transitivas no constituyen configuración aprobada. |
| Lockfiles | `package-lock.json` raíz y en `tools/penpot`; sin `pnpm-lock.yaml` ni `packageManager` fijado. |
| Documentación previa | README del starter; AGENTS con instrucciones Astro/Penpot; docs/penpot y tooling MCP de la sesión anterior. |
| `CLAUDE.md` | Symlink versionado a `AGENTS.md`; conservar una única fuente de reglas. |

## Git y cambios preservados

Antes de la auditoría: solo rama `master`, un commit, sin remotos; un checkout. No existen `main` ni `dev`. Se creó `agent/codex/architecture-baseline` para aislar documentación. No se crearon ramas de producción/integración, commits, merges, pushes ni releases.

Se preservó el trabajo local de la integración anterior: `.gitignore`, referencia Penpot en `AGENTS.md` y archivos todavía no versionados en `.codex/`, `docs/penpot/`, `scripts/` y `tools/penpot/`. No atribuir todo el diff desde HEAD a esta auditoría ni hacer `git add .` para mezclar entregas.

La excepción de base `master` corresponde solo al arranque documental y se registra en [ARCH-001](../agents/claims/ARCH-001.md). Futuros slices requieren el flujo de [COORDINATION.md](../agents/COORDINATION.md). El propietario debe establecer `main`/`dev` y la baseline revisada antes del trabajo normal. `gitlock` no se encontró como comando disponible; el protocolo de claims es el mecanismo documentado, no un bloqueo automatizado.

## Inspección y validación

- Se resolvió la raíz y comprobó ausencia de `.codegraph/`. `gentle-ai codegraph init --cwd` no produjo índice y el MCP CodeGraph rechazó la consulta por falta de índice. Tras ese fallo se leyeron los archivos directamente; no se ejecutó indexación, upgrade ni comandos destructivos de CodeGraph.
- `npm run build` pasó: salida estática con una ruta `/index.html`. Se utilizó el comando existente para no migrar el tooling en una sesión documental. Este resultado corresponde al starter, no a una feature ni a una homologación Node 22.
- Se consultaron guías oficiales de Astro para componentes, routing, CSS, TypeScript, Actions, Sessions y environment variables, y la introducción oficial de Kysely.
- MCP autenticó y permitió leer archivo/páginas, biblioteca, 1.860 formas de ocho páginas activas y exportaciones visuales. El respaldo histórico se inventarió por separado, sin tratarlo como fuente actual. Detalles en [DESIGN-CONTRACT.md](DESIGN-CONTRACT.md).

## Diferencias a resolver en tareas posteriores

Verificación documental final: entregables presentes, enlaces locales válidos, sin credenciales en Markdown ni whitespace inválido. `git diff` de `src/`, `public/`, `package.json`, lockfile raíz, Astro config y tsconfig permanece vacío. La configuración/scripts/dependencias MCP preexistentes no se editaron. Handoff: [ARCH-001](../agents/claims/ARCH-001.md).

Node 22 homologado; migración deliberada de npm a pnpm; `strictest`; formato/lint/typecheck/tests; bootstrap Git y política remota; diseño móvil/estados/destinos. No se corrigieron estas diferencias hoy. Proveedor de hosting, adaptador SSR, DB, driver SQL, autenticación y CMS: TO BE DECIDED.
