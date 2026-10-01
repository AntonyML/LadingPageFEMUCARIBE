# TOPBAR-001: GovernmentBar

Componente aislado: [GovernmentBar.astro](../../src/components/GovernmentBar.astro). No se inserta todavía en Inicio; PublicNavbar y composición de cabecera pertenecen a sus propias tareas. Leer este documento al consumir el componente, validar responsive o suministrar destinos. [Claim/handoff](claims/TOPBAR-001.md).

## Contrato de consumo

```astro
---
import GovernmentBar from '../components/GovernmentBar.astro';
// Las URLs deben venir de la decisión editorial del consumidor.
const { institutionalDestinations } = Astro.props;
---
<GovernmentBar contentId="contenido-principal" destinations={institutionalDestinations} />
<main id="contenido-principal" tabindex="-1"><slot /></main>
```

`destinations` requiere `accessibility`, `serviceComptroller` y `law7600`, como strings no vacíos de enlaces HTTP(S), rutas relativas o anchors funcionales. El propietario confirmó esta entrega como props obligatorias: no hay URLs de producción aprobadas en este slice. Se rechazan destino ausente, `#` sin target y protocolos ejecutables. `contentId` es obligatorio, ASCII empezando por letra y seguido de letras/dígitos/guiones/underscore. El consumidor debe proveer un elemento único y enfocable con ese ID; el componente no crea ni busca targets en el DOM.

El root es div y la navegación tiene nombre «Enlaces institucionales»: no crea un banner global ni depende de Navbar. La composición posterior coloca ambos dentro de un único header apropiado. Enlaces se abren en la misma pestaña; no hay JS, toggles de accesibilidad, menús ni control que prometa una acción inexistente.

## Evidencia visual

Archivo `81f57451-85cc-819d-8008-80dd99536505`, página `f279c6b1-74d9-80c4-8008-9409133a2ea9`, forma `1158a0fe-c558-80da-8008-94095c63a028` / L1-TopBar-Gobierno. Lectura y exportación MCP de solo lectura: 2026-10-01. No se obtuvo un nuevo número de revisión mediante esta consulta; 1061 corresponde a la auditoría histórica, no se presenta como revisión actual.

**CONFIRMED desktop:** ancho de referencia 1440, altura 48, padding horizontal 80, fondo #1E3A5F, bandera 35×21 y gap de identidad 10; enlaces gap 16. Inter 11/line-height 1.2; identidad 600, skip 700, accesibilidad 500, contraloría 600 y Ley 500. Colores: blanco, #EFEFFF, #F0F6FF, #FFBC34 y #CDE1FF respectivamente. Etiquetas exactas preservadas. Se compararon visualmente exportación Penpot y captura Chromium; no se declara igualdad pixel a pixel (rasterización/icono del sistema y tolerancias tipográficas).

Bandera exportada del grupo `9bdf285e-3fd8-80e0-8008-9556036f8e04`; recurso SVG sin scripts/enlaces externos. Inter latin se descargó de la URL incluida en la exportación de Penpot y se sirve localmente desde public/government; incluye licencia OFL oficial. No se añaden dependencias, familias globales ni tokens compartidos. El CSS usa nombre de familia específico Government Inter; fallback Inter/sans-serif. Artefactos de evidencia fuera del repositorio: `C:/Users/Administrator/.codex/audits/topbar-001` y test-results del worktree.

**INFERRED:** min-height en lugar de clipping/height rígida; target desktop de al menos 26 px; foco con outline blanco 2 px y underline; no animación (sin restricciones de reduced motion). Breakpoint 1100 deriva del espacio disponible para grupos/paddings, no de Penpot; debajo, wrap, padding 24, texto 13/1.5 y targets de al menos 44 px. Debajo de 600, columna y padding 16. No ocultar enlaces detrás de un menú ni depender de JS permite reflow, texto largo y ampliación. No se afirma que exista diseño mobile/tablet en Penpot.

Contrastes calculados frente a #1E3A5F: identidad 11.50:1, skip 10.11:1, accesibilidad 10.59:1, contraloría 6.84:1, Ley 8.66:1. Outline blanco 11.50:1. Estos resultados verifican esta combinación; no certifican toda la web ni conformidad normativa global.

## Pruebas y límites

`powershell -NoProfile -File scripts/tooling.ps1 check`, `test:unit` y `test:e2e`. Unit tests usan Astro Container mediante la integración de Astro/Vite existente, sin nuevos paquetes. Prueban contratos de destino/target y rechazo de valores inválidos, no lógica de negocio ficticia.

El harness está en tests/fixtures/government-bar, con root/publicDir propios. Playwright construye/preview ese proyecto en puerto 4323 además del smoke del starter en 4322; ambos servidores son cerrados por el runner. No es una ruta de src/pages ni entra en dist de la aplicación. Las anclas del harness son exclusivamente destinos de prueba. CSS/texto de su contenido principal no son implementación de Inicio.

E2E: 320/375/768/1024/1440/1920 px, tamaño desktop 48 y color de fondo, bandera cargada, targets, scroll horizontal, tabulación/foco/Enter en skip y destinos sin JS, contenido largo y texto móvil al 200%. Esto prueba ampliación de texto y reflow; no se presenta como prueba automatizada del zoom de chrome/browser UI, ni como validación de responsive Penpot.

CodeGraph init no respondió y status seguía Not initialized; se documenta el fallback a lecturas directas. No se tocó Penpot, Inicio, layout, Navbar, hero, footer, manifests ni lockfiles. Antes de composición pública resolver URLs reales y asegurar target del skip link. Tras integrar a dev: HARD STOP; no iniciar NAVBAR-001 automáticamente.

Referencias: [Astro Container](https://docs.astro.build/en/reference/container-reference/), [testing](https://docs.astro.build/en/guides/testing/), [estilos](https://docs.astro.build/en/guides/styling/).
