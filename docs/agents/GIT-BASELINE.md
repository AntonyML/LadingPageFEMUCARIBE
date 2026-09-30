# Baseline Git local (registro histórico)

> Después de este bootstrap el propietario configuró origin, publicó las ramas e integró dev a main. Al iniciar TOOLING-BASELINE-001, main/dev/origin/main/origin/dev coincidían en 5dcc9ac. La tabla y comprobaciones siguientes registran el cierre de GIT-BASELINE-001; consultar Git para estado vigente.

Preparada el 2026-09-30 por autorización explícita de GIT-BASELINE-001. No hay remoto ni push. [Claim/handoff](claims/GIT-BASELINE-001.md).

## Referencias y significado

| Rama | Base / función |
| --- | --- |
| `main` | `3dd3ee0`, mismo commit original que master. Referencia estable inicial; sin promover documentación, tooling ni features. Solo el propietario puede promover posteriormente a main. |
| `master` | `3dd3ee0`, conservada como referencia histórica; no usar como base de features. |
| `dev` | Baseline preservada más documentación de este slice, integrada exclusivamente por fast-forward. Fuente de futuras tareas. |
| `agent/codex/architecture-baseline` | `efa76f3`, snapshot conservado de la integración MCP y documentación anteriores. |
| `agent/codex/git-baseline-001` | Rama del slice Git; su HEAD coincide con dev al entregar. Checkout actual. |

Crear main consistió en añadir una referencia al commit que ya existía: no renombró master, no cambió commits, no promovió dev y no sobrescribió archivos. Main no afirma que el starter esté listo como sitio FEMUCARIBE de producción.

## Preservación e integración

Antes de operar se respaldaron 36 archivos tracked/untracked no ignorados, con hashes y estado Git, en `C:/Users/Administrator/.codex/backups/FEMUCARIBE-GIT-BASELINE-001`. Los archivos ignorados permanecieron intactos; el respaldo no pretende copiar node_modules ni secretos externos.

Se preservó exactamente el trabajo anterior en dos commits separados, sin instalar/configurar nada:

- `56e5852`: integración MCP, scripts, lockfile aislado, ignores y contexto Penpot existentes.
- `efa76f3`: documentación de arquitectura/gobernanza y AGENTS existentes.

La tarea Git partió de ese dev inicial y solo ajustó documentación. Su integración autorizada avanza dev al descendiente de su base, comprobando ancestry y el SHA anterior para evitar sobrescribir una actualización concurrente. Ningún commit nuevo llegó a main. Las ramas existentes se conservaron.

## Inicio de futuras tareas

Verificar primero `git status`, `git worktree list`, claims y base de dev. Sin remoto, “dev actualizado” significa la referencia local de integración acordada; no ejecutar fetch/pull ni inventar origin. En tareas futuras, incluso con un único agente, utilizar rama específica y worktree independiente:

```powershell
git worktree add -b agent/codex/<tarea> C:/Users/Administrator/LadingPageFEMUCARIBE-worktrees/codex-<tarea> dev
```

Este comando es una plantilla, no se ejecutó ni abrió otro slice. Confirmar nombre/ruta libres y registrar SHA base y claim antes de editar. El worktree se crea bajo el home; CodeGraph necesita índice propio. La configuración MCP preservada usa ruta absoluta del checkout original: su adaptación es un cambio compartido explícito si la tarea necesita Penpot.

La reserva ARCH-001 se cerró y transfirió para estos ajustes por la nueva instrucción del propietario. GIT-BASELINE-001 queda cerrado tras integración local; futuras tareas publican su propio claim. Integración posterior a dev sigue siendo deliberada y autorizada; promoción dev → main sigue siendo exclusivamente humana.

## Comprobación reproducible

```powershell
git branch --show-current
git branch -avv
git status --short
git log --all --oneline --decorate -6
git rev-parse main master dev HEAD
git merge-base --is-ancestor agent/codex/architecture-baseline dev
git diff --exit-code master dev -- src public package.json package-lock.json astro.config.mjs tsconfig.json
git remote -v
```

Esperado: checkout de tarea, working tree limpio, main/master sin cambios, dev/HEAD iguales, ancestry correcto, diff de aplicación vacío y ningún remoto. Protección automática de ramas y remoto quedan pendientes para el propietario; las reglas actuales son gobernanza documental.
