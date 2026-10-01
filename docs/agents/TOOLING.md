# Tooling

Usar las versiones fijadas en .node-version, package.json y lockfiles; no sustituir el runtime global incidentalmente. App y tools/penpot tienen instalaciones y lockfiles separados.

En Windows, scripts/tooling.ps1 acepta FEMUCARIBE_NODE_HOME o descubre Node portátil en el perfil del usuario. Valida la versión y restaura PATH/NODE_OPTIONS. Conserva TLS verificado mediante certificados del sistema.

```powershell
powershell -NoProfile -File scripts/tooling.ps1 versions
powershell -NoProfile -File scripts/tooling.ps1 install
powershell -NoProfile -File scripts/tooling.ps1 check
powershell -NoProfile -File scripts/tooling.ps1 test:unit
powershell -NoProfile -File scripts/tooling.ps1 browsers
powershell -NoProfile -File scripts/tooling.ps1 test:e2e
```

install usa frozen-lockfile; browsers solo es necesario al preparar el equipo. check reúne typecheck, ESLint, Stylelint, formato y build. format aplica Prettier. Vitest comprueba contratos; falla si no hay pruebas. Playwright construye y sirve previews aisladas, cierra sus procesos al terminar y comprueba flujos en Chromium. La fixture de GovernmentBar está en tests/fixtures/government-bar: no es una página de producción. Configuración y puertos: playwright.config.ts.

Los controles son dependencias de desarrollo. Actualizar versiones deliberadamente, con engines/peers, lockfiles y verificaciones; no instalar librerías para capacidades todavía inexistentes.

Fuentes: [Astro testing](https://docs.astro.build/en/guides/testing/), [Astro TypeScript](https://docs.astro.build/en/guides/typescript/), [pnpm instalación](https://pnpm.io/installation), [Vitest](https://vitest.dev/config/), [Playwright](https://playwright.dev/docs/test-configuration).

ESLint excluye .astro, dist y node_modules también en fixtures anidadas: son artefactos generados, no código fuente. [Patrones oficiales](https://eslint.org/docs/latest/use/configure/ignore).
