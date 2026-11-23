---
title: Guía para administradores del CMS
description: Manual operativo por roles para gestionar noticias, municipalidades, proyectos, documentos de transparencia, medios, usuarios y formularios en el CMS WordPress de FEMUCARIBE.
---

## Introducción y alcance

El portal web público de FEMUCARIBE funciona con una arquitectura desacoplada (_headless CMS_):

- La interfaz pública visible para la ciudadanía se ejecuta en **Astro** (`https://femucaribe.go.cr`).
- Los contenidos dinámicos se administran desde **WordPress** en `https://cms.femucaribe.go.cr/wp-admin/`.

Cada vez que publica, actualiza o elimina un registro en WordPress, la página pública correspondiente consulta la API REST del CMS y refleja el cambio en la siguiente carga de la página, sin necesidad de editar código ni volver a compilar el sitio web.

**Alcance de gestión:** desde el CMS se administran **Noticias**, **Municipalidades**, **Proyectos**, **Transparencia (Documentos)**, **Archivos y Fotos** (biblioteca de medios), **Usuarios** y los formularios de **Contacto** y **Contraloría de Servicios – Denuncias** (Contact Form 7), además de los textos configurables de secciones servidos por el endpoint `femucaribe/v1/page-content`. Las páginas estáticas informativas (`/accesibilidad`, `/privacidad`, `/legal`, `/creditos`, este manual) y el diseño estructural pertenecen al código fuente del sitio web.

## Acceso al CMS

Para ingresar al panel administrativo del CMS siga estos pasos:

1. En el menú superior del sitio público, haga clic en el botón **Acceder a la plataforma** (ruta `/acceso`).
2. En la tarjeta **Entrar si eres de FEMUCARIBE**, pulse **Continuar a FEMUCARIBE**.
3. En la sub-tarjeta **Administración de Landing Page**, haga clic en **Iniciar Sesión Administrativa** (se abrirá una nueva pestaña hacia `https://cms.femucaribe.go.cr/wp-admin/`).
4. Ingrese su **nombre de usuario o correo electrónico institucional** y su **contraseña**, luego pulse **Acceder**.
5. Al finalizar su jornada de edición, cierre siempre la sesión desde el menú superior derecho (_Hola, [su nombre]_ → **Cerrar sesión**), especialmente si utiliza un equipo institucional compartido.

> El ingreso al frontend público de WordPress redirige automáticamente a `https://femucaribe.go.cr`. Toda gestión administrativa debe realizarse dentro de `/wp-admin/`.

## Roles y permisos

El CMS de FEMUCARIBE utiliza los **roles estándar de WordPress** y organiza el menú lateral en secciones adaptadas al sitio público: **Escritorio**, **Municipalidades**, **Proyectos**, **Transparencia**, **Noticias**, **Archivos y Fotos**, **Usuarios**, **Ajustes** y, para perfiles administrativos, **Contacto** (formularios). Por diseño, están ocultos los comentarios, los temas de apariencia y las páginas genéricas de blog.

El rol **Administrador** asigna cada cuenta aplicando el **principio de menor privilegio**: cada persona funcionaria debe recibir únicamente el rol mínimo indispensable para cumplir sus labores editoriales o técnicas.

### Matriz de permisos por rol

| Rol de WordPress  | Noticias                                                              | Municipalidades                                                            | Proyectos                                                                  | Transparencia (Documentos)                                                 | Archivos y Fotos (Medios)                  | Textos institucionales (`page-content`)       | Contacto y Denuncias (CF7)                               | Usuarios y Ajustes                                        |
| :---------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----------------------------------------- | :-------------------------------------------- | :------------------------------------------------------- | :-------------------------------------------------------- |
| **Administrador** | Crear, editar, publicar y eliminar todas                              | Crear, editar, publicar y eliminar todas                                   | Crear, editar, publicar y eliminar todos                                   | Crear, editar, publicar y eliminar todos                                   | Subir, editar y eliminar cualquier archivo | Gestionar textos institucionales de secciones | Configurar formularios, correos y destinatarios          | Crear, editar, asignar roles y configurar ajustes/plugins |
| **Editor**        | Crear, editar, publicar y eliminar todas (propias y de terceros)      | Crear, editar, publicar y eliminar todas                                   | Crear, editar, publicar y eliminar todos                                   | Crear, editar, publicar y eliminar todos                                   | Subir, editar y eliminar archivos          | Sin acceso administrativo                     | Sin acceso de configuración (salvo permisos específicos) | Sin acceso                                                |
| **Autor**         | Crear, editar, publicar y eliminar **solo sus propias** noticias      | Sin acceso a registros ajenos (se recomienda restringir su uso a Noticias) | Sin acceso a registros ajenos (se recomienda restringir su uso a Noticias) | Sin acceso a registros ajenos (se recomienda restringir su uso a Noticias) | Subir y usar archivos propios              | Sin acceso                                    | Sin acceso                                               | Sin acceso                                                |
| **Colaborador**   | Crear y editar **borradores propios**; enviar a revisión (no publica) | Solo borrador si aplica; no publica                                        | Solo borrador si aplica; no publica                                        | Solo borrador si aplica; no publica                                        | **No puede subir archivos**                | Sin acceso                                    | Sin acceso                                               | Sin acceso                                                |
| **Suscriptor**    | Solo lectura de su propio perfil                                      | Sin acceso                                                                 | Sin acceso                                                                 | Sin acceso                                                                 | Sin acceso                                 | Sin acceso                                    | Sin acceso                                               | Solo edita su propio perfil                               |

## Tareas por módulo

### Noticias

**Roles habilitados:** Administrador, Editor, Autor (propias) y Colaborador (solo borrador).
**Dónde se publica en la web:** las **3 noticias más recientes** aparecen en **Inicio** (_Actualidad y Comunicados Oficiales_) y el listado completo en `/noticias` (_Sala de Prensa y Comunicados Oficiales_).

1. En el menú lateral izquierdo, vaya a **Noticias → Añadir Nueva Noticia**.
2. Escriba el **título** de la noticia y redacte el contenido principal en el editor de bloques.
3. En la barra lateral derecha (_Entrada_):
   - Seleccione la **Categoría** correspondiente.
   - Redacte un **Extracto** breve y claro (es el texto resumido que muestran las tarjetas en Inicio y `/noticias`).
   - En **Imagen destacada**, suba o seleccione una fotografía optimizada y complete el campo **Texto alternativo** describiendo la imagen.
4. Desplácese al panel **Datos de la Fuente y Enlace Original** y complete:
   - **Fuente de la Noticia:** medio o institución de origen (ej. `FEMUCARIBE`, `MOPT`, `INDER`). Si se deja vacío, la web muestra `FEMUCARIBE`.
   - **Enlace Original (URL):** dirección web externa si la noticia remite a un comunicado externo; si es propia de la Federación, puede dejarlo vacío.
5. Pulse **Publicar** para mostrarla de inmediato, o ajuste la fecha/hora en el panel de publicación para **Programar** una publicación futura.

### Municipalidades

**Roles habilitados:** Administrador y Editor.
**Dónde se publica en la web:** fichas de cantones y autoridades en `/municipalidades`, además de alimentar dinámicamente la lista de cantones disponibles en el formulario de `/transparencia/denuncias`.

1. Ingrese en **Municipalidades → Todas las Municipalidades** para editar una existente, o en **Añadir Nueva Municipalidad**.
2. Este módulo usa **vista clásica estructurada**: escriba el **nombre oficial** de la municipalidad en el título y la **descripción cantonal** en el editor de texto principal.
3. En el panel derecho **Imagen destacada**, asigne la fotografía representativa del cantón (o bien ingrese la URL manualmente en el metabox).
4. Complete los campos del panel **Datos de Contacto y Autoridades**:
   - **Identificador de Cantón (slug):** debe coincidir exactamente con uno de los cantones configurados en el sitio (`limon`, `pococi`, `parrita`, `talamanca`, `matina`, `guacimo`).
   - **Cabecera de Cantón:** nombre de la ciudad cabecera.
   - **URL Fotografía Cantonal (o usar Imagen Destacada a la derecha):** URL directa de imagen en `Archivos y Fotos` si no usa Imagen destacada.
   - **Nombre del Alcalde / Alcaldesa** y **Cargo Oficial**.
   - **URL Foto del Alcalde:** URL de la fotografía subida previamente a `Archivos y Fotos`.
   - **URL Escudo / Emblema Cantonal:** URL del escudo municipal subido a `Archivos y Fotos`.
   - **Teléfono Oficial**, **Correo Electrónico Oficial**, **Sitio Web Oficial (URL)** y **Dirección Física**.
5. Haga clic en **Publicar** o **Actualizar** para guardar.

### Proyectos

**Roles habilitados:** Administrador y Editor.
**Dónde se publica en la web:** sección `/proyectos` (distribuida según el tipo elegido) y en los proyectos vinculados dentro de `/municipalidades`.

1. Vaya a **Proyectos → Todos los Proyectos** o **Añadir Nuevo Proyecto**.
2. Ingrese el **título del proyecto** y la **descripción detallada** en el editor clásico.
3. En el panel **Configuración del Proyecto**, complete:
   - **Sección en la Web:** seleccione exactamente dónde se mostrará:
     - _Proyectos de la Federación (Tarjetas principales)_ (`federation`)
     - _Proyectos Destacados (Lista detallada con fuentes)_ (`featured`)
     - _Cartera Municipal (solo en Coordinación con Gobiernos Locales)_ (`municipal`)
   - **Etiqueta / Tag:** rótulo corto en mayúsculas (ej. `TALAMANCA`, `INFRAESTRUCTURA DEPORTIVA`).
   - **Categoría:** eje o área temática (ej. `Formulación y Ejecución`, `Movilidad Eléctrica`).
   - **Estado:** situación actual (ej. `En ejecución`, `En operación`, `En formulación`).
   - **Fuente Oficial:** respaldo institucional (ej. `Fuente oficial — Municipalidad de Talamanca`, `SICOP`).
   - **Color de Acento (Hex):** código hexadecimal del color de barra para tarjetas de la Federación (ej. `#10b981`, `#aac651`, `#1dc4da`).
4. En el panel **Municipalidades vinculadas**, marque las municipalidades participantes para que el proyecto aparezca dentro de la cartera de esos cantones.
5. Pulse **Publicar** o **Actualizar**.

### Transparencia (Documentos)

**Roles habilitados:** Administrador y Editor.
**Dónde se publica en la web:** cuadrícula de descargas en `/transparencia` (_Presupuestos Auditados, Liquidaciones y Actas Oficiales_) y los **primeros 4 documentos** (ordenados cronológicamente por ID ascendente) en la columna **Transparencia** del pie de página institucional.

1. Primero suba el archivo PDF en **Archivos y Fotos → Añadir nuevo** y copie su **URL del archivo** (ver sección siguiente).
2. Vaya a **Transparencia → Añadir Nuevo Documento**.
3. Escriba el **título oficial** del documento (ej. `Informe Técnico del Presupuesto Ordinario 2026`).
4. En el panel **Detalles del Archivo / Descarga**, complete:
   - **Enlace de Descarga (URL o archivo de medios):** pegue la URL completa del PDF previamente subido en `Archivos y Fotos`.
   - **Etiqueta:** clasificación y periodo (ej. `PRESUPUESTO · Periodo 2026`).
   - **Descripción corta:** formato y peso del archivo (ej. `PDF Oficial · 806 KB` o `PDF Accesible · 2.4 MB`).
5. Pulse **Publicar** para hacerlo visible en `/transparencia`.

### Archivos y Fotos (Biblioteca de medios)

**Roles habilitados:** Administrador, Editor y Autor.

1. Ingrese en **Archivos y Fotos → Añadir nuevo**.
2. Arrastre el archivo o pulse **Seleccionar archivos** para subir imágenes (`.jpg`, `.png`, `.webp`) o documentos oficiales (`.pdf`).
3. Haga clic sobre el archivo recién subido para abrir sus detalles:
   - Si es una imagen, redacte un **Texto alternativo** descriptivo para accesibilidad web.
   - Copie el valor del campo **URL del archivo** cuando deba pegarlo en metaboxes de **Transparencia**, **Municipalidades** o **Proyectos**.

### Textos institucionales de secciones

**Rol habilitado:** Administrador.

Los textos institucionales configurables de las secciones públicas (`Inicio`, `Nosotros`, `Municipalidades`, `Proyectos`, `Transparencia` y `Noticias`, tales como subtítulos de cabecera, títulos e introducciones servidos por el endpoint `femucaribe/v1/page-content`) son gestionados exclusivamente por el rol **Administrador**. Si algún texto configurable queda vacío en el CMS, el sitio público conserva automáticamente su texto institucional predeterminado.

### Gestión de usuarios

**Rol habilitado:** exclusivamente **Administrador**.

1. En el menú lateral, seleccione **Usuarios → Añadir nuevo usuario** (o **Todos los usuarios** para modificar una cuenta existente).
2. Complete **Nombre de usuario**, **Correo electrónico** institucional, **Nombre y Apellidos**.
3. Genere una **contraseña robusta** utilizando el generador seguro de WordPress.
4. En el selector **Perfil**, asigne el rol mínimo necesario (**Suscriptor**, **Colaborador**, **Autor**, **Editor** o **Administrador**).
5. Pulse **Añadir nuevo usuario**. Cuando una persona deje la institución o cambie de funciones, edite su perfil para ajustar el rol o elimine/revoque la cuenta reasignando sus contenidos a otro usuario responsable.

### Formulario de denuncias y contacto

**Rol habilitado:** exclusivamente **Administrador**.
**Dónde se utiliza en la web:** formulario general en `/contacto` y formulario de Contraloría de Servicios en `/transparencia/denuncias`.

1. Ingrese en el menú **Contacto → Formularios de contacto** (Contact Form 7).
2. Verifique los formularios institucionales:
   - Formulario general de contacto (utilizado por `/contacto`).
   - Formulario **Contraloría de Servicios – Denuncias** (utilizado por `/transparencia/denuncias`).
3. Dentro de cada formulario, revise únicamente lo necesario sin alterar los nombres de campos requeridos por el sitio (`tipo-gestion`, `ambito`, `canton`, `fecha-hechos`, `proyecto`, `descripcion`, `pruebas`, `archivo`, `modalidad`, `nombre`, `identificacion`, `telefono`, `correo`, `consentimiento`, `referencia` en denuncias):
   - **Pestaña «Correo»:** compruebe el correo destinatario **Para** (por ejemplo, `contraloria@femucaribe.go.cr`), el remitente **De** y el adjunto `[archivo]`.
   - **Pestaña «Correo (2)»:** confirma el acuse automático cuando la persona denunciante proporciona correo electrónico (en gestiones anónimas no se envía acuse).
4. En cumplimiento de la **Ley N.° 8968**, evite habilitar plugins de almacenamiento masivo de envíos como _Flamingo_ salvo autorización formal de la Contraloría de Servicios con acceso restringido.
5. Si se crea un formulario nuevo de denuncias que cambie el ID numérico en Contact Form 7, notifique al equipo técnico para actualizar la variable de entorno `PUBLIC_CF7_DENUNCIA_FORM_ID` y redesplegar el sitio público.

## Flujo de revisión editorial

Cuando participan personas redactoras con rol **Colaborador** y supervisoras con rol **Editor** o **Administrador**, aplique el siguiente circuito de publicación:

1. **Redacción (Colaborador):**
   - Crea la entrada en **Noticias → Añadir Nueva Noticia**, redacta título, cuerpo, extracto, **Fuente de la Noticia** y **Enlace Original (URL)**.
   - Si necesita incluir fotografía, la envía al Editor o Administrador por el canal interno institucional, ya que el Colaborador no sube archivos.
   - Pulsa **Enviar para revisión** en lugar de publicar directamente (el estado pasa a _Pendiente de revisión_).
2. **Revisión y enriquecimiento (Editor o Administrador):**
   - Abre la entrada en estado _Pendiente_ desde **Noticias → Todas las Noticias**.
   - Verifica ortografía, veracidad de fuentes, categoría, extracto e incorpora la **Imagen destacada** con su texto alternativo.
3. **Aprobación y publicación (Editor o Administrador):**
   - Pulsa **Publicar** (o **Programar**).
4. **Verificación pública:**
   - Visita `/noticias` y la portada `/` en el sitio público para confirmar que la tarjeta, imagen, fecha y enlace cargan correctamente.

## Buenas prácticas de seguridad y accesibilidad

- **Sin cuentas compartidas:** cada funcionario debe acceder con su usuario nominativo para mantener trazabilidad en las publicaciones y auditorías.
- **Contraseñas robustas:** utilice contraseñas largas y únicas; no las reutilice en servicios externos ni las comparta por mensajería no cifrada.
- **Cierre de sesión obligatorio:** cierre siempre la sesión de `wp-admin` al terminar su trabajo.
- **Revisión periódica de accesos:** el **Administrador** debe auditar periódicamente la lista en **Usuarios** y desactivar cuentas inactivas.
- **Accesibilidad digital (Ley N.° 7600):** añada **Texto alternativo (`alt`)** descriptivo a todas las imágenes subidas y utilice títulos claros para los documentos PDF de Transparencia.
- **Optimización de archivos:** comprima imágenes antes de subirlas (preferiblemente WebP o JPG optimizado) y procure que los documentos PDF sean livianos y con texto seleccionable (_PDF accesible_), indicando su peso correcto en el campo **Descripción corta**.
- **Protección de datos (Ley N.° 8968):** no publique documentos con datos personales sensibles sin anonimizar ni exponga información privada de personas denunciantes.

## Solución de problemas

- **Publiqué o edité un elemento, pero no se ve en el sitio público:**
  - Verifique que el registro esté en estado **Publicado** y no en **Borrador** o **Pendiente de revisión**.
  - Recargue la página pública omitiendo la caché del navegador (`Ctrl + F5` o `Cmd + Shift + R`).
- **La imagen o el PDF de Transparencia no carga o abre un enlace roto (`#`):**
  - Confirme que pegó la **URL completa** iniciada en `https://cms.femucaribe.go.cr/wp-content/uploads/...` en los campos de URL (`Enlace de Descarga`, `URL Fotografía Cantonal`, `URL Foto del Alcalde` o `URL Escudo`).
  - Para **Municipalidades**, verifique que el campo **Identificador de Cantón (slug)** corresponda exactamente a `limon`, `pococi`, `parrita`, `talamanca`, `matina` o `guacimo`.
- **Un proyecto no aparece en el lugar esperado de `/proyectos`:**
  - Revise el selector **Sección en la Web** dentro de **Configuración del Proyecto** (`federation`, `featured` o `municipal`) y compruebe que las **Municipalidades vinculadas** estén marcadas.
- **El formulario de contacto o de denuncias muestra error al enviar:**
  - Con rol **Administrador**, revise en **Contacto → Formularios de contacto** que el formulario correspondiente siga activo, con los campos esperados y que el correo remitente (`wordpress@femucaribe.go.cr`) y destinatario estén bien configurados.
  - Si el archivo adjunto en denuncias falla al subirse, confirme que no exceda **5 MB** ni el límite `upload_max_filesize` de PHP en el servidor.
- **No veo un menú o botón descrito en este manual:**
  - Su cuenta tiene un rol con permisos restringidos (por ejemplo, **Colaborador** o **Autor**). Si sus funciones requieren otro nivel de acceso, solicite la revisión al **Administrador** del CMS.
