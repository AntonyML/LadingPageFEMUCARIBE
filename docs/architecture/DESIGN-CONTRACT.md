# Contrato visual inicial

Inspección: 2026-09-30. Fuente principal: **FEMUCARIBE LandingPage Design**, archivo `81f57451-85cc-819d-8008-80dd99536505`, revisión observada 1061. Páginas/boards y enlaces reproducibles: [CONTEXT.md](../penpot/CONTEXT.md). Consultar el archivo vivo antes de cada slice; esta observación no congela el diseño.

**CONFIRMED** = leído mediante MCP o visto en exportación del archivo. **INFERRED** = interpretación/candidato de implementación. **UNKNOWN / TO BE DECIDED** = ausente, no verificado o contradictorio. Alegaciones normativas dentro del prototipo son contenido, no una certificación técnica/legal de esta auditoría.

## Estructura CONFIRMED

Nueve páginas inventariadas: seis públicas principales, Contacto, Componentes y `99 · Respaldo Monolito`. Se recorrieron 1.860 formas de las ocho páginas activas y sus ocho exportaciones PNG. El respaldo contiene el monolito anterior, recursos y `Proyectos-v2`; no reemplaza las pantallas actuales sin decisión del propietario.

| Página | Frame / tamaño observado, px | Estructura y contenido |
| --- | --- | --- |
| 01 · Inicio | `Screen-01-Home`, 1459 × ~3017,22 | Topbar, navegación, Path suelto, hero/buscador/gobernanza, accesos rápidos, noticias, directorio de seis cantones, proyectos, transparencia, FAQ y footer. |
| 02 · Nosotros | `Screen-02-Nosotros`, 1440 × 4561 | Quiénes somos/fotografía, misión/visión, fundamentos legales, estructura orgánica, PICC, objetivos y modelo mancomunado. |
| 03 · Municipalidades | `Screen-03-Municipalidades`, 1440 × 4530 | Seis tarjetas municipales, enlace técnico, alcaldes/autoridades, directorio y fichas cantonales. |
| 04 · Proyectos | `Screen-04-Proyectos`, 1440 × 2740 | Proyectos propios, CTA contacto, destacados, coordinación cantonal y gobernanza técnica. |
| 05 · Transparencia | `Screen-05-Transparencia`, 1440 × 1390 | SICOP, cuatro descargas y contraloría/denuncias. |
| 06 · Noticias | `Screen-06-Noticias`, 1440 × 1550 | Seis tarjetas con placeholders de imagen y CTA de boletines/convocatorias. |
| 07 · Contacto | `contacto`, ~1440 × 720 | Dos columnas: sede/teléfono/correo/mapa y formulario nombre/email/mensaje; sin header/footer en este frame. |
| 00 · Componentes | `Libreria-Componentes-FEMUCARIBE`, 1440 × 2200 | Muestras topbar, navegación, botones, píldoras, tres tarjetas y footer. |

Las seis pantallas principales repiten `L1-TopBar-Gobierno`, `L1-Navigation-Principal` y `L1-Footer-Institucional`. La jerarquía combina títulos/eyebrows, tarjetas, CTA y secciones full-width. Hay 681 layouts flex y ningún layout grid; nombres “Grid” no implican GridLayout Penpot. CSS Grid podrá reproducir el layout donde corresponda.

## Navegación CONFIRMED

Topbar: 48 px, fondo `#1E3A5F`, padding horizontal 80 px; identidad de Costa Rica, salto al contenido, accesibilidad, contraloría y Ley 7600. Son etiquetas visibles: no hay interacciones que confirmen destinos.

Navbar de Inicio: 1440 × 72 px, blanco, stroke `#E2E8F0` de 1 px, flex row/space-between, padding horizontal 40 px y gap entre grupos 40 px. Logo/identidad, seis enlaces **Inicio, Nosotros, Municipalidades, Proyectos, Transparencia, Noticias**, CTA **Contáctenos** y **Acceder a la plataforma**. Enlaces: gap 24 px, Inter 13,5/600, `#435362`; Inicio activo: 13,5/800, `#0470A0`. Otras páginas usan color activo correspondiente, con pesos inconsistentes.

Brand: Inter 36/800; subtítulo observado solo en Inicio, 10,5/700. CTA contacto: 120 × 38, radio 8, azul, texto blanco Inter 12,5/700. CTA plataforma: 171 × 38, radio 8, blanco, stroke azul 3. La muestra de Componentes tiene identidad compacta y carece del CTA plataforma: no es idéntica a la pantalla.

**INFERRED:** layout público reutilizable; Inicio dirige hacia Noticias, Municipalidades, Proyectos y Transparencia; CTA hacia Contacto. **UNKNOWN:** URLs/anclas, búsqueda, destino de plataforma, menú móvil, sticky y hover/focus/disabled/loading/error/success. FAQ muestra respuestas, pero no demuestra un acordeón. El CTA plataforma no autoriza implementar login.

## Valores y tokens observables

Muestras **CONFIRMED**, no una escala universal aprobada:

| Valor | Uso / fuente |
| --- | --- |
| `#0470A0` | Brand, enlaces/CTA; navbar y muestras de botones. |
| `#0B2538`, `#435362` | Títulos y texto secundario; hero/cards de Inicio. |
| `#FFFFFF`, `#F8FAFC` | Superficies de tarjetas/subbloques. |
| `#F0F7FA` | Fondo del hero de Inicio. |
| `#071A28` | Footer de pantallas. |
| `#1DC4DA`, `#AAC651`, `#FBBA34` | Acentos cian/lima/ámbar y bandas. |
| `#DCFCE7` / `#166534` | Píldora “En ejecución”, fondo/texto de Componentes. |
| `#EBF7EE` / `#2B6620` | Píldora “En operación”. |
| `#FEF9E7` / `#8D6B0D` | Píldora “En gestión”. |
| `#F3F4F6` / `#6B7280` | Píldora de formulación de cartera técnica. |
| 1280 px | Contenido repetido en pantallas de 1440; margen típico 80 px. |
| 6, 8, 10, 12, 16, 24 px | Gaps/paddings repetidos; existen otros valores, no escala exclusiva. |
| 8 / 12 / 14 px | Radios frecuentes; botones radio 8 y cards de muestra radio 14. |
| 150 × 44 px | Botones primario/secundario de Componentes; diferentes al navbar. |
| 110 × 26 px, radio 13 | Píldoras cortas de Componentes. |
| 410 × 330 px | Cards proyecto/noticia/municipalidad de Componentes. |
| `(0,2,4,0)`, negro 20% | Sombra en píldoras cantonales de Inicio. |
| `(4,4,4,0)`, negro 20% | Sombra del panel de gobernanza de Inicio; no sombra global. |

**INFERRED:** futuros nombres `--color-brand`, `--color-text`, `--color-text-muted`, `--color-surface`, `--color-topbar`, `--color-footer`, `--space-*`, `--radius-*`, `--font-body`. Agrupación/nombres definitivos: TO BE DECIDED. Hoy no se escribió CSS ni se crearon tokens.

### Tipografía y biblioteca CONFIRMED

Inter predomina en pantallas/muestras. Inicio: hero 36/900, títulos de noticias/proyectos 22/800, FAQ 20/800; cuerpos frecuentes 11,5/400 con line-height 1,45. Otras páginas: títulos 28/900, 32/800 y 36/800. Metadata/etiquetas incluyen 9,5–13 px. `sourcesanspro` aparece en glifos de documento, no como cuerpo general.

Biblioteca: `h1` Poppins 64/900, `h2` Poppins 40/700, `h3` Inter 24/600, `section` Inter 14/500, `default` Inter 16/400 y `caption` Inter 12/400; line-height null. No coincide con las pantallas: no aplicar Poppins/64 al hero por el nombre del estilo.

Veinte colores guardados incluyen `primary #05495B`, `blue #245685` y dos `secondary` (`#A26936`, `#B5753C`). Navbar/hero usan valores adicionales sin referencia de biblioteca. `tokenOverview()` devuelve `{}`. No hay componentes registrados en la biblioteca local ni instancias/variant containers en las ocho páginas: Componentes contiene muestras visuales, no un sistema formal ya configurado.

## Mapa conceptual INFERRED

Posibles elementos Astro, solo bajo sus slices: PublicLayout, GovernmentBar, PublicNavbar, SectionHeading, ButtonLink, StatusBadge, NewsCard, ProjectCard, MunicipalityCard, InstitutionalFooter y ContactForm. Autoridades/documentos/FAQ podrán tener composición propia cuando exista tarea. No crear archivos ni un Card universal hoy.

Portal institucional público para seis cantones: Limón, Talamanca, Matina, Guácimo, Pococí y Parrita. Esa estructura visual no define DB, CMS, workflow administrativo ni permisos.

## Responsive, accesibilidad e incógnitas

**CONFIRMED:** un frame desktop por sección activa; sin boards mobile/tablet, variants, flows o interacciones. Flex/constraints no especifican breakpoints. **UNKNOWN:** widths mínimas/máximas de producción, colapso de nav/grillas y estados por viewport. Resolver adaptación dentro del slice, registrar diferencias justificadas y validar teclado/zoom/contenido. Fidelidad no exige copiar medidas que causen overflow o inaccesibilidad.

| Hallazgo confirmado | Resolución pendiente |
| --- | --- |
| Inicio: `Path` suelto ~172 × 138,22 entre navbar/hero; exportación muestra línea y hueco. | Intención UNKNOWN; confirmar antes de reproducir/corregir. |
| Footer de 1459 en páginas de 1440, x = -9,5; grupo de marca excede altura 72 del navbar. | Verificar overflow/clipping; no copiar ciegamente. |
| Noticias resalta Inicio y Noticias; muestras y pantallas difieren. | Confirmar estado activo único y fuente del slice. |
| Footer de muestra cita Guácimo/info/XXXX; pantallas Siquirres/contacto/2768-2000. | Validación editorial; datos de muestra no son datos reales aprobados. |
| Autoridades con placeholders, noticias con imágenes vacías y documentos/contactos normativos como contenido. | Verificar nombres, cargos, fotos, fechas, archivos y destinos antes de publicar. |
| Etiquetas “contraste AA”/accesibilidad en diseño. | Medir contraste, foco, targets y semántica; no demuestran conformidad. |
| Formulario y CTA sin estados/interacciones. | Validación, feedback, envío y privacidad: TO BE DECIDED en sus tareas. |

Fidelidad futura: registrar página/board/shape y revisión, leer valores reales del área, comparar visualmente y documentar adaptaciones responsive/accesibilidad. Ante contradicción indispensable para la tarea, HARD STOP de esa parte antes de inventar.
