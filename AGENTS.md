## Reglas de trabajo

Antes de editar, lee `docs/agents/COORDINATION.md` y declara scope/claim. Stack aprobado: `docs/architecture/STACK.md`; límites: `docs/architecture/ARCHITECTURE.md`; decisiones: `docs/adr/`. Implementa solo la tarea autorizada y haz HARD STOP al terminarla. Los agentes no trabajan directamente en `main`/`dev`; solo el propietario humano promueve a `main`. En paralelo, rama y worktree propios por tarea, con claims publicados y sin solapamientos. La tarea ARCH-001 se limita a inspección/documentación: ningún código de aplicación ni scaffolding.

Para preguntas de estructura, referencias o impacto, sigue el orden CodeGraph de COORDINATION antes de búsquedas amplias. Worktrees bajo el home, índice propio por checkout y fallback explicado tras fallo.

## Penpot

Para inspeccionar diseños, exportar recursos o implementar cambios desde Penpot, lee `docs/penpot/AGENT-GUIDE.md` y `docs/architecture/DESIGN-CONTRACT.md`. Ejecuta `powershell -File scripts/penpot.ps1 doctor` y consulta el esquema real con `tools`. La configuración MCP está en `.codex/config.toml`; la credencial se carga desde el perfil del usuario. Usa `docs/penpot/CONTEXT.md` como índice de archivo/páginas verificados.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
