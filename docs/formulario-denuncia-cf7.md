# Formulario de denuncia — configuración en Contact Form 7

## Opción recomendada: script automático

Desde `C:\DEV\ServerFemucaribe` (PowerShell 7):

```powershell
# 1. Simulación: muestra remitente, destinatario y si crearía o actualizaría
pwsh scripts/New-FormularioDenuncia.ps1 -DryRun

# 2. Crear el formulario, guardar el ID en .env y en GitHub Actions
pwsh scripts/New-FormularioDenuncia.ps1 -To contraloria@femucaribe.go.cr -UpdateLandingEnv -SetGitHubVariable
```

Termina con `FORMULARIO OK — ID <n>`. Es idempotente: se puede volver a correr para
aplicar cambios (no duplica el formulario) y nunca modifica el formulario 55.
Luego, redesplegar la landing (el workflow `deploy.yml` lee la variable
`PUBLIC_CF7_DENUNCIA_FORM_ID`).

Los avisos `esperado: ... Reply-To` y `mail_2.recipient` son normales: el correo es
opcional por las gestiones anónimas. Si aparece el aviso del tamaño de archivo, el
`upload_max_filesize` de PHP del servidor es menor de 5 MB y conviene subirlo.

## Opción manual

La página `/transparencia/denuncias` envía a un formulario **propio** de Contact Form 7
(distinto del formulario 55 de `/contacto`). Para activarlo:

### 1. Crear el formulario en WordPress (cms.femucaribe.go.cr)

*Contacto → Añadir nuevo*, título **"Contraloría de Servicios – Denuncias"**.

### Pestaña «Formulario»

```
[select* tipo-gestion "Denuncia" "Inconformidad" "Sugerencia"]
[select* ambito "Prestación de servicios" "Ejecución de proyectos federativos" "Contratación administrativa" "Conducta de personal o representantes" "Otro"]
[text canton]
[date fecha-hechos]
[text proyecto maxlength:200]
[textarea* descripcion minlength:30 maxlength:5000]
[textarea pruebas maxlength:2000]
[file archivo limit:5mb filetypes:pdf|jpg|jpeg|png|docx]
[radio modalidad default:1 "Identificada" "Anónima"]
[text nombre maxlength:160]
[text identificacion maxlength:30]
[tel telefono maxlength:30]
[email correo]
[text consentimiento]
[text referencia]
```

> `nombre` y `correo` no se marcan como obligatorios (`*`) porque la gestión puede ser anónima;
> el frontend los exige cuando la modalidad es «Identificada».

### Pestaña «Correo» (aviso a la Contraloría de Servicios)

- **Para:** correo de la Contraloría de Servicios (p. ej. `contraloria@femucaribe.go.cr`)
- **De:** `FEMUCARIBE <wordpress@femucaribe.go.cr>`
- **Asunto:** `[referencia] [tipo-gestion] – [ambito]`
- **Encabezados adicionales:** `Reply-To: [correo]`
- **Archivos adjuntos:** `[archivo]`
- **Cuerpo:**

```
Referencia: [referencia]
Tipo de gestión: [tipo-gestion]
Ámbito: [ambito]
Cantón: [canton]
Fecha aproximada de los hechos: [fecha-hechos]
Proyecto / servicio: [proyecto]

Descripción de los hechos:
[descripcion]

Pruebas:
[pruebas]

Modalidad: [modalidad]
Nombre: [nombre]
Identificación: [identificacion]
Teléfono: [telefono]
Correo: [correo]
Consentimiento Ley 8968: [consentimiento]

Plazo de respuesta: 10 días hábiles.
```

### Correo (2) — acuse al denunciante (opcional, recomendado)

Activar «Usar Correo (2)»: **Para** `[correo]`, asunto `Acuse de recibo [referencia] – FEMUCARIBE`,
indicando el número de referencia y el plazo de 10 días hábiles. (Si la gestión es anónima, `[correo]`
llega vacío y CF7 no envía este acuse.)

### Privacidad

- No guardar los envíos en plugins de registro (Flamingo, etc.) salvo que la Contraloría lo requiera y
  con acceso restringido, en cumplimiento de la Ley N.° 8968.
- Mantener el endpoint REST de CF7 con CORS permitido para `https://femucaribe.go.cr`
  (igual que el formulario 55).

### 2. Configurar el frontend

Anotar el ID numérico del formulario creado y definirlo en el entorno del sitio:

```
PUBLIC_CF7_DENUNCIA_FORM_ID=123
```

Es una variable `PUBLIC_*` y se resuelve en el build; reconstruir y redesplegar después de cambiarla.
Sin esta variable la página se muestra, pero al enviar indica que se escriba a `info@femucaribe.go.cr`.
