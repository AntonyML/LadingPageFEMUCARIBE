# Despliegue a ICDSoft WebApps

El workflow `.github/workflows/deploy-webapps.yml` compila y valida la aplicación al recibir cambios en `main`, y la publica en `www.femucaribe.go.cr`. También se puede iniciar manualmente desde GitHub Actions, pero solo desde `main` y confirmando el destino de producción.

## Configuración inicial en el panel

Esta configuración se realiza una vez. El workflow no cambia DNS, registros de correo ni la configuración de dominios.

1. En **SSH Access**, habilitar SSH para el usuario principal del panel y agregar una clave pública dedicada a GitHub Actions. Su clave privada debe permitir el acceso no interactivo; guardarla solo como secreto del repositorio y no usar la contraseña principal ni credenciales de MySQL. El workflow no se ejecuta en pull requests.
2. En **WebApps**, crear una app Node.js llamada `femucaribe` y usar una versión Node compatible con `.node-version` (`22.23.3`; el proyecto limita Node a `>=22.23.3 <23`).
   - Si el panel no ofrece una versión dentro de ese rango, no seleccionar otra al azar: confirmar con soporte de ICDSoft cómo habilitar Node 22 para esta cuenta.
3. Crear el directorio privado `/private/femucaribe` si no existe.
4. Configurar la app:
   - Dominio: `www.femucaribe.go.cr`.
   - Ruta web: raíz del dominio, sin una ruta adicional.
   - Directorio de despliegue: `/private/femucaribe`.
   - Comando de inicio: `cd current && HOST=0.0.0.0 node ./dist/server/entry.mjs`.
5. En las variables de entorno de esa app, configurar:
   - `NODE_ENV`: `production`.
   - `ADMIN_PASSWORD`: contraseña de administración.
   - `SESSION_SECRET`: valor aleatorio fuerte para firmar sesiones.
   - `MUNICIPALITIES_DATA_FILE`: `/home/<usuario-del-panel>/private/femucaribe/data/municipalities-data.json`.
   - `DOCUMENTS_MANIFEST_PATH`: `/home/<usuario-del-panel>/private/femucaribe/data/documents-manifest.json`.
6. Guardar y habilitar la app. WebApps sirve el proceso Node y gestiona HTTPS para la ruta configurada. La documentación del hosting describe la selección del dominio, ruta, directorio de despliegue y comando de inicio en su [guía de Node.js](https://www.icdsoft.com/en/kb/319_webapps_node_js).

En el primer despliegue, el workflow copia la semilla `data/municipalities-data.json` y crea un manifiesto inicial `[]` en el directorio persistente solo si cada archivo todavía no existe. Los siguientes despliegues conservan ambos archivos editables.

## Variables y secretos de GitHub

En el repositorio, abrir **Settings → Secrets and variables → Actions**.

Crear estas **variables**:

| Nombre                | Valor                                                           |
| --------------------- | --------------------------------------------------------------- |
| `ICDSOFT_HOST`        | Nombre del servidor indicado en el panel o correo de bienvenida |
| `ICDSOFT_PORT`        | `22`                                                            |
| `ICDSOFT_USER`        | Usuario principal del panel de hosting                          |
| `ICDSOFT_DEPLOY_ROOT` | `/home/<usuario-del-panel>/private/femucaribe`                  |
| `ICDSOFT_WEBAPP`      | Nombre exacto de la app en WebApps, por ejemplo `femucaribe`    |
| `ICDSOFT_SITE_URL`    | `https://www.femucaribe.go.cr`                                  |

Crear estos **secretos**:

| Nombre                    | Valor                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| `ICDSOFT_SSH_PRIVATE_KEY` | Clave privada asociada a la clave pública agregada en SSH Access |
| `ICDSOFT_SSH_KNOWN_HOSTS` | Línea `known_hosts` del servidor, con su clave verificada        |

La transferencia usa SFTP por SSH. ICDSoft requiere SSH habilitado para subir por SFTP y documenta autenticación por clave en su [guía de SFTP](https://www.icdsoft.com/en/kb/view/2035_uploading_files_over_sftp). Mantener activa la verificación `known_hosts`; no sustituirla por `ssh-keyscan` sin verificar la huella con el proveedor.

Configura el panel, las variables y los secretos antes de promover el workflow a `main`. Si falta alguno, las verificaciones de CI pasan, pero la publicación falla antes de transferir la versión.

## Qué hace cada despliegue

1. Instala dependencias con la versión Node y pnpm fijadas en el repositorio.
2. Ejecuta typecheck, lint, pruebas unitarias y el build de Astro.
3. Empaqueta el servidor compilado y sus dependencias de producción.
4. Sube una versión aislada a `private/femucaribe/releases/`.
5. Actualiza el enlace `current`, inicializa los archivos JSON persistentes solo en la primera publicación y reinicia WebApps.
6. Comprueba que `/` y `/municipalidades` respondan correctamente por HTTPS.

El workflow conserva las versiones anteriores bajo `releases/`; no elimina la instalación WordPress ni su base de datos. Mantén el respaldo de WordPress hasta comprobar la aplicación en producción. Astro usa el adaptador Node standalone y arranca con `node ./dist/server/entry.mjs`, como especifica la [documentación oficial de Astro](https://docs.astro.build/en/guides/integrations-guide/node/).
