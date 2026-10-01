# GovernmentBar y cabecera

## Consumo

GovernmentBar es independiente de PublicNavbar. Archivo: src/components/GovernmentBar.astro; props, validación, plantilla y estilos scoped en un único archivo. PublicLayout lo incluye en la cabecera compartida; Inicio consume ese layout con el slot de contenido vacio.

```astro
---
import GovernmentBar from '../components/GovernmentBar.astro';
const { institutionalDestinations } = Astro.props;
---

<GovernmentBar
  contentId="contenido-principal"
  destinations={institutionalDestinations}
/>
<main id="contenido-principal" tabindex="-1">
  <slot />
</main>
```

Props obligatorias aprobadas por propietario: contentId y destinations.accessibility/serviceComptroller/law7600. El consumidor suministra URLs reales HTTP(S), rutas relativas o anclas y un target único enfocable. Se rechazan destinos vacíos, whitespace periférico, # sin target y protocolos ajenos a HTTP(S). contentId empieza con letra ASCII y continúa con letras/dígitos/guion/underscore. El componente no verifica la existencia del destino ni certifica su contenido.

El root es div con nav nombrada Enlaces institucionales. Enlaces nativos en la misma pestaña; bandera decorativa; cero scripts cliente. PublicLayout crea un unico header y un main enfocable con id contenido-principal.

## Evidencia y adaptación

Archivo Penpot 81f57451-85cc-819d-8008-80dd99536505, página f279c6b1-74d9-80c4-8008-9409133a2ea9, topbar 1158a0fe-c558-80da-8008-94095c63a028. Inspección 2026-10-01.

CONFIRMED desktop: referencia 1440px, altura 48px, padding horizontal 80px, fondo #1E3A5F, bandera 35x21, Inter 11px/1.2 y etiquetas institucionales. Bandera exportada de Penpot; fuente local con licencia OFL en src/assets/government. No se declara equivalencia pixel a pixel con Penpot.

INFERRED: min-height para reflow; foco visible, underline y targets; debajo de 1100px wrap, texto 13px y targets de 44px; debajo de 600px columna. No existen diseños mobile/tablet ni estados interactivos confirmados. Contrastes de las combinaciones usadas: 6.84:1 a 11.50:1; no constituye certificación global.

Pruebas: contrato y errores con Astro Container; teclado/skip/enlaces sin JS, tamaños 320/375/768/1024/1440/1920, bandera, targets, ausencia de overflow, texto largo/ampliado y estilos scoped del componente. Fixture fuera de src/pages. PUBLIC-SHELL-001 conecta los destinos aprobados y la composicion publica; /accesibilidad esta configurada como enlace pero su pagina todavia no esta implementada.

## Slices

TOPBAR-001 está entregado. NAVBAR-001 implementará exclusivamente marca FEMUCARIBE, seis enlaces y dos CTA; forma Penpot 1158a0fe-c558-80da-8008-94095cbb1269. Desktop confirmado; responsive y estados no dibujados inferidos. Destino de plataforma pendiente: no inventar URL ni implementar login.

Topbar pertenece a PublicLayout para todas las paginas publicas que lo consuman. Navbar se incorporara al mismo header cuando termine su slice y Footer al layout cuando exista. Inicio mantiene el contenido vacio para visualizar la topbar. Hero, busqueda y contenido quedan para sus tareas. Cada entrega termina con HARD STOP.

Referencias: [componentes](https://docs.astro.build/en/basics/astro-components/), [CSS externo](https://docs.astro.build/en/guides/styling/#external-styles), [Astro Container](https://docs.astro.build/en/reference/container-reference/).

Destinos aprobados por propietario: accesibilidadUrl = /accesibilidad; contraloriaServiciosUrl = https://www.mideplan.go.cr/contralorias-de-servicios; ley7600Url = https://sinalevi.go.cr/ResultadosNormativa/Informacion?param1=23261&param2=96047&param3=1&param4=. Se configuran una sola vez en PublicLayout y se pasan al contrato existente de GovernmentBar; sin cambiar el componente ni abrir enlaces en otra pestana.
