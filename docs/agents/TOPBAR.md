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

TOPBAR-001 está entregado. NAVBAR-001 implementa exclusivamente marca FEMUCARIBE, seis enlaces y dos CTA; forma Penpot 1158a0fe-c558-80da-8008-94095cbb1269. Desktop confirmado; responsive y estados no dibujados inferidos. Destino de plataforma pendiente: no inventar URL ni implementar login.

Topbar pertenece a PublicLayout para todas las paginas publicas que lo consuman. Navbar se incorpora al mismo header e InstitutionalFooter despues del main en el layout. Inicio mantiene el contenido vacio para visualizar topbar, navbar y footer. Hero, busqueda y contenido quedan para sus tareas. Cada entrega termina con HARD STOP.

Referencias: [componentes](https://docs.astro.build/en/basics/astro-components/), [CSS externo](https://docs.astro.build/en/guides/styling/#external-styles), [Astro Container](https://docs.astro.build/en/reference/container-reference/).

Destinos aprobados por propietario: accesibilidadUrl = /accesibilidad; contraloriaServiciosUrl = https://www.mideplan.go.cr/contralorias-de-servicios; ley7600Url = https://sinalevi.go.cr/ResultadosNormativa/Informacion?param1=23261&param2=96047&param3=1&param4=. Se configuran una sola vez en PublicLayout y se pasan al contrato existente de GovernmentBar; sin cambiar el componente ni abrir enlaces en otra pestana.

## PublicNavbar

NAVBAR-001 usa src/components/PublicNavbar.astro, independiente de GovernmentBar y compuesto despues de ella en el header de PublicLayout. Prop currentPath selecciona un unico aria-current=page (por defecto Astro.url.pathname); platformUrl permite solo HTTP(S). Si no existe destino, el CTA es texto no interactivo con aria-disabled, sin href ficticio. Enlaces publicos inferidos: /, /nosotros, /municipalidades, /proyectos, /transparencia, /noticias y /contacto; las paginas aun no estan implementadas salvo Inicio.

Lectura Penpot 2026-10-01: archivo/pagina y forma de Navbar confirmados mediante MCP. CONFIRMED: 1440x72, blanco/borde #E2E8F0, padding 40, gap entre grupos 40 minimo; Inter 36/800 con letter-spacing 4.5 en marca, subtitulo 10.5/700 (-0.5), enlaces 13.5/600 y activo 800, gaps 24; CTA 120x38 y 171x38, radio 8, outline azul 3. Logo exportado del board 3085c5ee-e915-80fd-8008-9540c70ff832 a PNG 2x en src/assets/brand/femucaribe.png. Inter variable latin se obtiene de Google Fonts (100..900) y se sirve desde src/assets/brand con licencia OFL; sin paquetes nuevos.

INFERRED: logo contenido dentro de la navbar para corregir el desborde de 88 en frame 72; min-height, foco visible, underline y targets. La distribucion vigente depende del ancho util del contenedor, descrita en NAVBAR-REFLOW-FIX-001 al final de este documento. Navegacion siempre visible sin menu colapsado ni JavaScript; Penpot no define menu mobile. No sticky, drawer, autenticacion ni efectos inventados. Un nav nombrado separado del institucional; sin header adicional.

Pruebas: activos de las seis paginas, ausencia de activo falso, rechazo de destinos invalidos; teclado/foco, logo cargado, targets, 320/375/768/1024/1440/1920, reflow y texto ampliado sin JS. Desktop comparado visualmente contra exportacion Penpot; no se declara identidad pixel a pixel.

## InstitutionalFooter

FOOTER-001: componente independiente en src/components/institutional-footer/InstitutionalFooter.astro, incorporado despues del main en PublicLayout. CSS Module local styles.module.css: la plantilla y sus estilos superan juntos el umbral de ~250 lineas; sin capas ni helpers globales. Reutiliza logo e Inter variable existentes. Sin scripts cliente.

CONFIRMED mediante MCP y exportacion del board 3085c5ee-e915-80fd-8008-954fde88927f en Inicio: fondo #071A28, franja verde/ambar/cian/azul, cuatro columnas, titulos de color, tarjetas de contacto y textos visibles. Contacto observado: (+506) 2768-2000, contacto@femucaribe.go.cr, Siquirres/Barrio El Mangal y horario 8:00-16:00. El prototipo no certifica datos, referencias legales ni sello en tramite: requieren revision editorial antes de produccion.

INFERRED: enlaces institucionales a las rutas generales ya usadas por Navbar, sin inventar anclas de secciones; tel/mailto a partir del contenido observado. Columnas fluidas, dos bajo 1250px y una bajo 600px, objetivos de 44px, foco/underline y reflow del texto en vez del clipping observado. El logo reutilizado mantiene su proporcion; no se declara identidad pixel a pixel. Desktop observado CONFIRMED, responsive/estados INFERRED.

Contrato: accessibilityUrl obligatorio (PublicLayout reutiliza /accesibilidad aprobado por propietario); privacyUrl y documentUrls opcionales. Documentos: statutes, budgets, minutes, reports, organicRegime, accountability. Sin URL, cada etiqueta queda como texto normal, sin href ficticio ni apariencia de boton deshabilitado. Los destinos configurados admiten rutas locales o HTTP(S), se validan y respetan BASE_URL. Las paginas publicas salvo Inicio aun no existen; no se crean en este slice. Copyright 2026 reproduce el texto editorial de Penpot, sin sugerir una fecha verificada.

Fuentes oficiales: [Astro componentes](https://docs.astro.build/en/basics/astro-components/) y [CSS Modules](https://docs.astro.build/en/guides/styling/#css-modules).

RESPONSIVE-FIX-001: franja del footer de borde a borde sin max-width ni inset; columnas proporcionales minmax(0, fr), box-sizing border-box y ancho maximo compartido de 1262px para columnas/base. Navbar agrupa CTA con gap 12px, evita bases rigidas de enlaces y coloca navegacion en fila propia bajo 1400px; acciones hacen wrap bajo 600px. Ajustes responsive INFERRED solicitados por propietario, sin modificar Penpot ni destinos. Verificacion adicional en 320/683/853/1093/1249/1250/1399/1400/1440/1536/1920 CSS px: overflow, franja, columnas y distancia entre CTA. Los anchos reducidos cubren viewport efectivo por zoom; no equivalen a una prueba manual de zoom del navegador.

GLOBAL-LAYOUT-001: PublicLayout importa global.css y coloca el slot en .page-content.site-container. Navbar y contenido de footer usan el mismo contenedor; GovernmentBar consume los tokens globales con fallback standalone. La fuente Inter variable de marca se declara solo en global.css. Las medidas anteriores describen sus slices historicos; contenedor/reset/grid/accesibilidad vigentes y obligatorios: ARCHITECTURE.md.

NAVBAR-REFLOW-FIX-001: la regla anterior de viewport <1400px forzaba la navegacion a ocupar una fila completa aun cuando habia espacio y alteraba el orden visual con order. PublicNavbar conserva .site-container en un wrapper de consulta y usa grid: desde 1200px utiles, marca → enlaces → CTA en una fila; de 700 a 1199px, marca arriba y navegacion/CTA alineados en la segunda fila; debajo de 700px, marca, enlaces y CTA en filas sucesivas con reflow. El gap de CTA sigue en 12px. Los umbrales miden el contenedor real, incluyendo cambios del maximo en rem; no el ancho de la ventana. Orden visual y de teclado coinciden, sin JS ni cambios de destinos. Responsive INFERRED. Referencia: [CSS container queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).
