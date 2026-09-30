# FEMUCARIBE

Proyecto Astro. Antes de trabajar, leer [AGENTS.md](AGENTS.md), [coordinación](docs/agents/COORDINATION.md) y [tooling](docs/agents/TOOLING.md).

En Windows:

```powershell
powershell -NoProfile -File scripts/tooling.ps1 versions
powershell -NoProfile -File scripts/tooling.ps1 install
powershell -NoProfile -File scripts/tooling.ps1 check
powershell -NoProfile -File scripts/tooling.ps1 browsers
powershell -NoProfile -File scripts/tooling.ps1 test:e2e
```

Usar rama y worktree propios desde dev. Main se promueve únicamente por el propietario. El starter continúa presente; este slice configura controles sin implementar la interfaz FEMUCARIBE.
