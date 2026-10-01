# Reglas para agentes

Antes de editar, leer [arquitectura](docs/architecture/ARCHITECTURE.md) y [coordinación](docs/agents/COORDINATION.md). Implementar la tarea autorizada y detenerse al completarla.

- Instalación y verificaciones: [TOOLING.md](docs/agents/TOOLING.md); usar los pins y scripts existentes.
- Diseño: [guía MCP](docs/penpot/AGENT-GUIDE.md), [índice Penpot](docs/penpot/CONTEXT.md) y [evidencia visual](docs/architecture/DESIGN-CONTRACT.md).
- Consumo de GovernmentBar y separación de Navbar: [TOPBAR.md](docs/agents/TOPBAR.md).
- Responsive obligatorio en toda UI: consumir contenedor/grid y accesibilidad global segun ARCHITECTURE.md; validar reflow, zoom y teclado antes de entregar.
- Git: rama y worktree propios desde dev actualizado; main lo promueve únicamente el propietario humano.

Para preguntas estructurales, resolver raíz con git rev-parse --show-toplevel y comprobar .codegraph antes de búsquedas amplias. Cada worktree necesita índice propio bajo el home. Si falta y la herramienta está disponible, intentar una vez gentle-ai codegraph init --cwd <raíz>; consultar codegraph_explore o CLI read-only. Explicar el fallback si falla. Usar auto-sync; sync solo ante watcher desactivado o stale persistente. Evitar comandos de administración, reinstalación e indexación rutinaria.

Si hace falta servidor dev, usar astro dev --background; gestionar con astro dev stop/status/logs. Consultar primero la guía oficial pertinente: [componentes](https://docs.astro.build/en/basics/astro-components/), [estructura](https://docs.astro.build/en/basics/project-structure/), [estilos](https://docs.astro.build/en/guides/styling/), [routing](https://docs.astro.build/en/guides/routing/), [contenido](https://docs.astro.build/en/guides/content-collections/).
