# Arquitectura

## Base vigente

Astro y TypeScript strictest, HTML semántico, CSS nativo y JavaScript cliente solo cuando una interacción lo necesita. Versiones e instalaciones: package.json, lockfiles y TOOLING.md son las fuentes actuales. No añadir frameworks frontend ni Tailwind; preferir capacidades nativas. La salida actual es estática; DB, autenticación, hosting y adaptador servidor están pendientes.

## Estructura Astro

- src/pages: rutas y composición de páginas; Astro requiere esta carpeta para routing.
- src/layouts: estructura compartida de documentos, metadata y slots.
- src/components: unidades de UI reutilizables, con carpetas locales cuando ayudan a agrupar responsabilidades.
- src/assets: recursos procesados por el build, incluyendo fuentes y medios importados.
- public: archivos servidos sin transformación; las URLs deben respetar BASE_URL.
- tests: contratos y flujos; fixtures aisladas fuera de las rutas públicas.

Astro admite frontmatter, props tipadas, HTML y estilos scoped en un único .astro. Esa es la unidad por defecto y una opción oficial válida, no un incumplimiento de modularidad; Astro tampoco exige una estructura universal de cuatro archivos. Extraer piezas a la carpeta del componente —nunca a directorios globales por tipo— solo cuando exista al menos un disparador real: (a) tipos o validación consumidos por otro componente o módulo; (b) CSS por encima de ~200 líneas o compartido; (c) interactividad con JavaScript real; (d) archivo por encima de ~250 líneas o con dos o más responsabilidades mezcladas. Evitar módulos vacíos, helpers genéricos y capas sin consumidores.

Los <style> internos son scoped por defecto. Los CSS importados son globales: si se extraen estilos, usar .module.css o limitar los selectores a la clase raíz exclusiva y probar la ausencia de fuga. Las fuentes locales se referencian como assets procesados por el build; las rutas absolutas hacia public/ rompen despliegues bajo un base.

## Layout global y responsividad obligatoria

Toda pagina y componente deben adaptarse al ancho disponible en desktop, tablet, mobile y orientacion horizontal, incluyendo viewport reducido por zoom. Es requisito de entrega: contenido/enlaces visibles y operables, texto ampliable y sin scroll horizontal de pagina. Usar reflow, minmax(0, ...) y min-inline-size: 0; resolver overflow en su origen. Los estados y variantes ausentes en Penpot siguen siendo INFERRED.

PublicLayout importa src/styles/global.css una sola vez. Este archivo posee reset minimo (border-box, body sin margen, medios acotados, controles con fuente heredada y hidden preservado), fuente Inter de marca, tokens de contenedor y ayudas de accesibilidad. Los estilos visuales de componentes siguen scoped o en CSS Modules. Las listas, encabezados y parrafos de contenido conservan semantica y espaciado nativo; no se anulan todas sus reglas.

.site-container centra contenido hasta --site-max: 80rem (1280px con fuente raiz 16px), con --site-gutter fluido de 1rem a 3rem. Navbar, contenido de main y footer lo comparten; la topbar consume los mismos tokens con fallback para uso independiente. Fondos y franja del footer ocupan todo el ancho. PublicLayout coloca el slot en .page-content.site-container: las paginas consumidoras no deben anidar otro contenedor para el mismo contenido.

.layout-grid ofrece 1 columna por defecto, 2 desde 48rem y 3 desde 75rem, con gap fluido y columnas minmax(0, 1fr). Para colecciones: colocar layout-grid en la seccion dentro del slot; los hijos son las tarjetas del slice. Una composicion especifica (por ejemplo las cuatro columnas del footer) conserva su grid propio usando el mismo contenedor. .responsive-media mantiene proporcion para imagenes de contenido; los logos preservan dimensiones del componente.

Un header, un main#contenido-principal enfocable y un footer componen los landmarks publicos. El primer enlace GovernmentBar salta a main; foco global visible con colores locales cuando corresponde. .visually-hidden conserva texto accesible y se revela si recibe foco. PublicLayout usa 100svh con fallback 100vh y mantiene una altura minima para main vacio. Meta viewport permite zoom; sin escalas maximas ni bloqueo de zoom.

Antes de entregar UI: ejecutar check y pruebas pertinentes; cubrir desde 320 CSS px, tablet, desktop, anchos grandes, limites de breakpoint, orientacion horizontal, teclado y texto al 200%. Los tests actuales tambien cubren 280px y viewport efectivo de zoom. Registrar motores/anchos realmente verificados, no afirmar prueba fisica de todos los dispositivos. Elementos que requieren desplazamiento bidimensional por su naturaleza se aislan en una region accesible dentro de su slice, nunca mediante ocultar overflow de la pagina.

Referencias: [Astro layout compartido](https://docs.astro.build/en/basics/layouts/) y [estilos globales importados](https://docs.astro.build/en/guides/styling/#import-a-local-stylesheet). Implementacion y pruebas son la fuente de medidas vigentes. Referencias de accesibilidad: [reflow W3C](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) y [texto ampliable W3C](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html); estos controles no certifican por si solos conformidad global.

## Límites de responsabilidad

La UI prepara presentación y valida su contrato; las reglas de negocio pertenecen a casos de uso reales. Cuando se incorpore servidor, usar Astro Actions para operaciones internas, Zod en fronteras y astro:env para configuración. Sessions aporta estado, no autenticación. Estas capacidades no están implementadas hoy.

Si se incorpora persistencia, dominio y aplicación usan contratos propios; infraestructura implementa esos contratos con Kysely, SQL y drivers. Tipos tecnológicos y consultas permanecen en el adaptador. Composición inyecta dependencias. DB, driver y despliegue se deciden al existir un caso real. No crear ahora carpetas ni repositorios ficticios.

## Criterios verificables

Preservar HTML funcional sin JS, teclado, foco visible, enlaces reales, reflow y texto ampliado. El consumidor proporciona contenido y URLs: no inventar destinos. Confirmar diseño desktop e identificar como INFERRED responsive y estados ausentes en Penpot. Ejecutar check y pruebas relevantes; declarar límites de la evidencia. Build no reemplaza typecheck.

Una dependencia nueva necesita problema observable, alternativa nativa evaluada e impacto. Cambios de arquitectura/DB/auth/despliegue requieren decisión del propietario antes de implementación. La tarea termina con evidencia y HARD STOP.

## Fuentes oficiales

[Componentes y props](https://docs.astro.build/en/basics/astro-components/), [estructura](https://docs.astro.build/en/basics/project-structure/), [CSS scoped y externo](https://docs.astro.build/en/guides/styling/), [TypeScript](https://docs.astro.build/en/guides/typescript/), [Actions](https://docs.astro.build/en/guides/actions/), [Sessions](https://docs.astro.build/en/guides/sessions/), [configuración](https://docs.astro.build/en/guides/environment-variables/), [Kysely](https://kysely.dev/docs/intro).

La base aprobada el 2026-09-30 se conserva en estas reglas. Auditorías, claims cerrados y estados de arranque anteriores se consultan en Git; no describen el estado vigente.
