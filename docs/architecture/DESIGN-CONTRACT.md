# Contrato visual inicial

Inspección: 2026-09-30. Fuente principal: **FEMUCARIBE LandingPage Design**, archivo `81f57451-85cc-819d-8008-80dd99536505`, revisión observada 1061. Páginas/boards y enlaces reproducibles: [CONTEXT.md](../penpot/CONTEXT.md). Consultar el archivo vivo antes de cada slice; esta observación no congela el diseño.

**CONFIRMED** = leído mediante MCP o visto en exportación del archivo. **INFERRED** = interpretación/candidato de implementación. **UNKNOWN / TO BE DECIDED** = ausente, no verificado o contradictorio. Alegaciones normativas dentro del prototipo son contenido, no una certificación técnica/legal de esta auditoría.

## Hero implementado: HERO-001

Lectura y exportacion MCP del 2026-10-02, revision 1062; archivo/pagina/board indicados en CONTEXT.md. CONFIRMED: board 1440x460; gradiente blanco, #F7FBFC y #F0F8FA, decoraciones cian y franja de cuatro tramos iguales lima/ambar/cian/azul. Inter; titulo 36/900, cuerpo 15.5/400; contenido izquierdo desde x80 y panel blanco x885/y25 de 475x365 con radio16, borde #BCE4EC y sombra 4/4/4 negro20%. Eyebrow, titulo «Impulsamos el desarrollo integral y sostenible», cuerpo, buscador, «Ver proyectos»/«Contáctenos», seis cantones y tres bloques de gobernanza reproducen el contenido observado. Fills PNG originales de Talamanca, Limón, Matina, Guácimo, Pococí y Parrita conservan transparencia y proporcion; etiquetas cantonales son informativas.

INFERRED: seccion con h1 unico, aside con h2 y lista de h3; escudos decorativos junto al nombre visible, decoraciones fuera del arbol accesible. Contenedor global de 80rem y slot hero sin anidar contenedores. Una columna bajo 75rem y dos desde ese ancho; cantones en dos columnas bajo 30rem, tres hasta 48rem y seis desde 48rem. Buscador/CTA apilados bajo 30rem, texto de lectura mayor en movil, alturas minimas de CTA 44px, foco visible y altura de hero dependiente del contenido. La etiqueta ambar usa #8D5A00 sobre #FEF6E6, contraste calculado 5.435:1 (original #B57406: 3.575:1); ajuste puntual de accesibilidad. Estos controles no certifican conformidad global.

Todos los descendientes observados tienen interactions vacias: Penpot no confirma destinos ni comportamiento de busqueda. El propietario confirma buscador deshabilitado con aviso «Búsqueda no disponible»; input y boton nativos deshabilitados, descripcion asociada y sin JavaScript adicional. El consumidor Inicio proporciona /proyectos y /contacto, rutas ya utilizadas en Navbar, respetando BASE_URL; las paginas de destino siguen pendientes de sus slices. No se inventan destinos cantonales. La linea/Path suelta entre Navbar y hero esta fuera del board solicitado y no se reproduce. Los textos institucionales del prototipo requieren validacion editorial antes de produccion.

Seguimiento visual del propietario, 2026-10-02: las capturas comparadas confirman que el rombo fijo al borde se solapaba con el eyebrow al disminuir el margen fluido. Se reserva un margen local minimo de 5rem por lado desde 75rem, conservando .site-container y su maximo global; el rombo se ancla al inicio de ese contenido menos 3.125rem. Bajo 75rem se omite esta decoracion para preservar el ancho de lectura (INFERRED). En preview a 1366px con scrollbar, contenido x80 y extremo derecho del rombo x68.63: separados y sin overflow (clientWidth=scrollWidth=1351). Tokens globales, cabecera y footer conservan su geometria.

## Estructura CONFIRMED

### Noticias implementadas: NEWS-001

Lectura y exportación MCP del 2026-10-02; archivo/página/board registrados en CONTEXT.md. CONFIRMED: L1-Vistazo-Noticias 1280×420, transparente; cabecera1280×44, separación16 y tres tarjetas410×330 con hueco observado25 (gap24 y space-between). Fondo blanco, borde1 #E2E8F0, radio14, padding16 vertical/18 horizontal, sin sombra. Placeholder374×145 #F1F5F9, radio8, sin imágenes reales. Inter: h2 «Actualidad y Comunicados Oficiales»22/800/1.2 #0B2538; CTA13/700 #0470A0; categoría10/700 azul; fecha10/500 #64748B; título15.5/800/1.3 #0B2538; resumen11.5/400/1.45 #435362. Único CTA observado: «Ir a Sala de Prensa (06 · Noticias) →». Las tarjetas no contienen «Leer noticia» ni «Leer más». Todos los interactions están vacíos; destinos UNKNOWN.

El propietario confirma que todavía no existen noticias ni destinos y solicita preparar los estados vacío y con noticias. Inicio consume HomeNews sin items ni newsroomUrl: «Aún no hay noticias publicadas.» y «Aquí encontrarás los comunicados oficiales y las novedades de FEMUCARIBE.», con «Sala de Prensa pendiente» en cabecera. No se publican los tres textos institucionales de muestra como hechos ni se añaden enlaces sin destino.

INFERRED: empty state centrado en una superficie con borde/radio de las tarjetas; h2 único en la sección, lista de artículos con h3 y time cuando existan datos. Contrato NewsItem: category/title/summary, publishedOn ISO YYYY-MM-DD válido, URL e imagen opcionales. El consumidor entrega las noticias en el orden editorial deseado y solo proporciona newsroomUrl cuando exista Sala de Prensa. Título enlazado únicamente si existe URL; placeholders decorativos cuando falta imagen, sin anunciar carga ni skeleton. CSS Module local, contenedor ordinario de PublicLayout sin anidarlo y layout-grid global1/2/3; gap24 local. Tamaños de lectura mayores bajo75rem, alturas crecen con contenido, CTA/títulos enlazados con mínimo44px y foco global. Recursos/destinos internos respetan BASE_URL; externos deben ser HTTP(S). Se omite «(06 · Noticias)», referencia interna del prototipo, del CTA público futuro. Responsive y empty state no tienen variante Penpot. El populated state se verifica con fixtures y destinos reales de prueba; no se crea la página pública Noticias ni sus artículos en este slice.

### Accesos directos implementados: QUICK-ACCESS-001

Lectura y exportacion MCP del 2026-10-02; archivo/pagina Inicio verificados. Board `1158a0fe-c558-80da-8008-94095e26d77f` (L1-AccesosRapidos): CONFIRMED 1280x110, transparente, padding vertical10, cuatro tarjetas305x90, gap20, fondo #F8FAFC, borde1 #E2E8F0, radio10, sin sombra. Contenido alineado a izquierda, centrado verticalmente, padding horizontal18 y gap4. Inter: titulo13.5/700/1.2 #0B2538; descripcion11.5/400/1.2 #64748B. Emojis originales y contenido: «📜 Acuerdos del Consejo» / «Actas oficiales y resoluciones»; «🏗 Cartera UGP» / «Inversión pública en territorio»; «🏛 Directorio Municipal» / «Autoridades y 6 cantones»; «📊 Compras en SICOP» / «Transparencia y licitaciones». Board a3px del hero y del siguiente bloque; margen desktop observado80. Interacciones vacias, destinos UNKNOWN.

El propietario confirma que las rutas no estan definidas y deben quedar pendientes hasta disponer de los recursos. Se implementan cuatro tarjetas informativas con aviso visible «Recurso pendiente», sin enlaces, botones ni focos falsos. El aviso es una adaptacion solicitada; no aparece en Penpot. No se reutilizan rutas de Navbar ni se crean paginas/documentos ficticios.

INFERRED: section con h2 oculto visualmente, lista de cuatro h3, emojis decorativos y sin JavaScript; consumo del contenedor ordinario de PublicLayout, sin contenedor anidado. Grid global: una columna bajo48rem, dos desde48rem, composicion especifica de cuatro desde75rem. Altura minima90px y crecimiento con contenido/texto ampliado. Texto mayor bajo75rem: titulo16 y descripcion/aviso14; desktop conserva las medidas leidas, redondeadas al limite de precision CSS del proyecto. Responsive y estado pendiente no tienen variantes dibujadas. Penpot permanece intacto; no se implementa el siguiente slice.

Nueve páginas inventariadas: seis públicas principales, Contacto, Componentes y `99 · Respaldo Monolito`. Se recorrieron 1.860 formas de las ocho páginas activas y sus ocho exportaciones PNG. El respaldo contiene el monolito anterior, recursos y `Proyectos-v2`; no reemplaza las pantallas actuales sin decisión del propietario.

| Página               | Frame / tamaño observado, px                   | Estructura y contenido                                                                                                                                     |
| -------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 · Inicio          | `Screen-01-Home`, 1459 × ~3017,22              | Topbar, navegación, Path suelto, hero/buscador/gobernanza, accesos rápidos, noticias, directorio de seis cantones, proyectos, transparencia, FAQ y footer. |
| 02 · Nosotros        | `Screen-02-Nosotros`, 1440 × 4561              | Quiénes somos/fotografía, misión/visión, fundamentos legales, estructura orgánica, PICC, objetivos y modelo mancomunado.                                   |
| 03 · Municipalidades | `Screen-03-Municipalidades`, 1440 × 4530       | Seis tarjetas municipales, enlace técnico, alcaldes/autoridades, directorio y fichas cantonales.                                                           |
| 04 · Proyectos       | `Screen-04-Proyectos`, 1440 × 2740             | Proyectos propios, CTA contacto, destacados, coordinación cantonal y gobernanza técnica.                                                                   |
| 05 · Transparencia   | `Screen-05-Transparencia`, 1440 × 1390         | SICOP, cuatro descargas y contraloría/denuncias.                                                                                                           |
| 06 · Noticias        | `Screen-06-Noticias`, 1440 × 1550              | Seis tarjetas con placeholders de imagen y CTA de boletines/convocatorias.                                                                                 |
| 07 · Contacto        | `contacto`, ~1440 × 720                        | Dos columnas: sede/teléfono/correo/mapa y formulario nombre/email/mensaje; sin header/footer en este frame.                                                |
| 00 · Componentes     | `Libreria-Componentes-FEMUCARIBE`, 1440 × 2200 | Muestras topbar, navegación, botones, píldoras, tres tarjetas y footer.                                                                                    |

Las seis pantallas principales repiten `L1-TopBar-Gobierno`, `L1-Navigation-Principal` y `L1-Footer-Institucional`. La jerarquía combina títulos/eyebrows, tarjetas, CTA y secciones full-width. Hay 681 layouts flex y ningún layout grid; nombres “Grid” no implican GridLayout Penpot. CSS Grid podrá reproducir el layout donde corresponda.

## Navegación CONFIRMED

Para implementar la cabecera de Inicio, seguir [TOPBAR.md](../agents/TOPBAR.md): **TOPBAR-001** y **NAVBAR-001** son slices independientes, con componentes y paths propios. La composición conjunta se serializa posteriormente; NAVBAR-001 no incluye la topbar. Esto delimita tareas, no certifica implementación.

Topbar: 48 px, fondo `#1E3A5F`, padding horizontal 80 px; identidad de Costa Rica, salto al contenido, accesibilidad, contraloría y Ley 7600. Son etiquetas visibles: no hay interacciones que confirmen destinos.

Navbar de Inicio: 1440 × 72 px, blanco, stroke `#E2E8F0` de 1 px, flex row/space-between, padding horizontal 40 px y gap entre grupos 40 px. Logo/identidad, seis enlaces **Inicio, Nosotros, Municipalidades, Proyectos, Transparencia, Noticias**, CTA **Contáctenos** y **Acceder a la plataforma**. Enlaces: gap 24 px, Inter 13,5/600, `#435362`; Inicio activo: 13,5/800, `#0470A0`. Otras páginas usan color activo correspondiente, con pesos inconsistentes.

Brand: Inter 36/800; subtítulo observado solo en Inicio, 10,5/700. CTA contacto: 120 × 38, radio 8, azul, texto blanco Inter 12,5/700. CTA plataforma: 171 × 38, radio 8, blanco, stroke azul 3. La muestra de Componentes tiene identidad compacta y carece del CTA plataforma: no es idéntica a la pantalla.

**INFERRED:** layout público reutilizable; Inicio dirige hacia Noticias, Municipalidades, Proyectos y Transparencia; CTA hacia Contacto. **UNKNOWN:** URLs/anclas, búsqueda, destino de plataforma, menú móvil, sticky y hover/focus/disabled/loading/error/success. FAQ muestra respuestas, pero no demuestra un acordeón. El CTA plataforma no autoriza implementar login.

## Valores y tokens observables

Muestras **CONFIRMED**, no una escala universal aprobada:

| Valor                           | Uso / fuente                                                         |
| ------------------------------- | -------------------------------------------------------------------- |
| `#0470A0`                       | Brand, enlaces/CTA; navbar y muestras de botones.                    |
| `#0B2538`, `#435362`            | Títulos y texto secundario; hero/cards de Inicio.                    |
| `#FFFFFF`, `#F8FAFC`            | Superficies de tarjetas/subbloques.                                  |
| `#F0F7FA`                       | Fondo del hero de Inicio.                                            |
| `#071A28`                       | Footer de pantallas.                                                 |
| `#1DC4DA`, `#AAC651`, `#FBBA34` | Acentos cian/lima/ámbar y bandas.                                    |
| `#DCFCE7` / `#166534`           | Píldora “En ejecución”, fondo/texto de Componentes.                  |
| `#EBF7EE` / `#2B6620`           | Píldora “En operación”.                                              |
| `#FEF9E7` / `#8D6B0D`           | Píldora “En gestión”.                                                |
| `#F3F4F6` / `#6B7280`           | Píldora de formulación de cartera técnica.                           |
| 1280 px                         | Contenido repetido en pantallas de 1440; margen típico 80 px.        |
| 6, 8, 10, 12, 16, 24 px         | Gaps/paddings repetidos; existen otros valores, no escala exclusiva. |
| 8 / 12 / 14 px                  | Radios frecuentes; botones radio 8 y cards de muestra radio 14.      |
| 150 × 44 px                     | Botones primario/secundario de Componentes; diferentes al navbar.    |
| 110 × 26 px, radio 13           | Píldoras cortas de Componentes.                                      |
| 410 × 330 px                    | Cards proyecto/noticia/municipalidad de Componentes.                 |
| `(0,2,4,0)`, negro 20%          | Sombra en píldoras cantonales de Inicio.                             |
| `(4,4,4,0)`, negro 20%          | Sombra del panel de gobernanza de Inicio; no sombra global.          |

**INFERRED:** futuros nombres `--color-brand`, `--color-text`, `--color-text-muted`, `--color-surface`, `--color-topbar`, `--color-footer`, `--space-*`, `--radius-*`, `--font-body`. Agrupación/nombres definitivos: TO BE DECIDED. Estos valores son evidencia de la auditoría inicial; no representan un sistema de tokens aprobado.

### Tipografía y biblioteca CONFIRMED

Inter predomina en pantallas/muestras. Inicio: hero 36/900, títulos de noticias/proyectos 22/800, FAQ 20/800; cuerpos frecuentes 11,5/400 con line-height 1,45. Otras páginas: títulos 28/900, 32/800 y 36/800. Metadata/etiquetas incluyen 9,5–13 px. `sourcesanspro` aparece en glifos de documento, no como cuerpo general.

Biblioteca: `h1` Poppins 64/900, `h2` Poppins 40/700, `h3` Inter 24/600, `section` Inter 14/500, `default` Inter 16/400 y `caption` Inter 12/400; line-height null. No coincide con las pantallas: no aplicar Poppins/64 al hero por el nombre del estilo.

Veinte colores guardados incluyen `primary #05495B`, `blue #245685` y dos `secondary` (`#A26936`, `#B5753C`). Navbar/hero usan valores adicionales sin referencia de biblioteca. `tokenOverview()` devuelve `{}`. No hay componentes registrados en la biblioteca local ni instancias/variant containers en las ocho páginas: Componentes contiene muestras visuales, no un sistema formal ya configurado.

## Mapa conceptual INFERRED

Posibles elementos Astro, solo bajo sus slices: PublicLayout, GovernmentBar, PublicNavbar, SectionHeading, ButtonLink, StatusBadge, NewsCard, ProjectCard, MunicipalityCard, InstitutionalFooter y ContactForm. Autoridades/documentos/FAQ podrán tener composición propia cuando exista tarea. No crear archivos ni un Card universal hoy.

Portal institucional público para seis cantones: Limón, Talamanca, Matina, Guácimo, Pococí y Parrita. Esa estructura visual no define DB, CMS, workflow administrativo ni permisos.

## Responsive, accesibilidad e incógnitas

**CONFIRMED:** un frame desktop por sección activa; sin boards mobile/tablet, variants, flows o interacciones. Flex/constraints no especifican breakpoints. **UNKNOWN:** widths mínimas/máximas de producción, colapso de nav/grillas y estados por viewport. Resolver adaptación dentro del slice, registrar diferencias justificadas y validar teclado/zoom/contenido. Fidelidad no exige copiar medidas que causen overflow o inaccesibilidad.

Para el futuro Navbar, desktop observado se reportará como **CONFIRMED**. Las decisiones responsive y los estados interactivos que no estén dibujados se reportarán como **INFERRED**, aplicando buenas prácticas y registrando su justificación; no atribuirlos a Penpot ni afirmar fidelidad visual de una variante inexistente. Esto es una regla de evidencia para una tarea futura, no autorización para implementarla.

| Hallazgo confirmado                                                                                          | Resolución pendiente                                                             |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Inicio: `Path` suelto ~172 × 138,22 entre navbar/hero; exportación muestra línea y hueco.                    | Intención UNKNOWN; confirmar antes de reproducir/corregir.                       |
| Footer de 1459 en páginas de 1440, x = -9,5; grupo de marca excede altura 72 del navbar.                     | Verificar overflow/clipping; no copiar ciegamente.                               |
| Noticias resalta Inicio y Noticias; muestras y pantallas difieren.                                           | Confirmar estado activo único y fuente del slice.                                |
| Footer de muestra cita Guácimo/info/XXXX; pantallas Siquirres/contacto/2768-2000.                            | Validación editorial; datos de muestra no son datos reales aprobados.            |
| Autoridades con placeholders, noticias con imágenes vacías y documentos/contactos normativos como contenido. | Verificar nombres, cargos, fotos, fechas, archivos y destinos antes de publicar. |
| Etiquetas “contraste AA”/accesibilidad en diseño.                                                            | Medir contraste, foco, targets y semántica; no demuestran conformidad.           |
| Formulario y CTA sin estados/interacciones.                                                                  | Validación, feedback, envío y privacidad: TO BE DECIDED en sus tareas.           |

Fidelidad futura: registrar página/board/shape y revisión, leer valores reales del área, comparar visualmente y documentar adaptaciones responsive/accesibilidad. Ante contradicción indispensable para la tarea, HARD STOP de esa parte antes de inventar.
