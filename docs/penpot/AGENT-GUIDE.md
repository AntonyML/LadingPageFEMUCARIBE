# Penpot para agentes

## Inicio rápido

1. Desde la raíz ejecuta `powershell -File scripts/penpot.ps1 doctor`. Si faltan dependencias, ejecuta `powershell -File scripts/penpot.ps1 install`. Usa el Node 22 fijado y pnpm de [TOOLING.md](../agents/TOOLING.md); el SDK conserva workspace/lockfile propios. Selecciona el runtime en PATH al ejecutar doctor/call/bridge.
2. Consulta `docs/penpot/CONTEXT.md`. Verifica el archivo y página activos antes de editar: el MCP sigue la pestaña conectada de Penpot.
3. Ejecuta `powershell -File scripts/penpot.ps1 tools` para obtener nombres, descripciones y esquemas actuales; agrega `-Tool texto` para filtrar. `refresh` actualiza `docs/penpot/tools.json`.
4. Usa las herramientas de `penpot_femucaribe` desde Codex. Como alternativa, guarda los argumentos JSON en un archivo y ejecuta `powershell -File scripts/penpot.ps1 call -Tool NOMBRE -ArgumentsFile ruta.json`. Consulta primero el esquema; una respuesta con `isError` hace fallar el comando.
5. Lee `high_level_overview` antes de usar las otras herramientas (requisito del servidor): `powershell -File scripts/penpot.ps1 call -Tool high_level_overview -ArgumentsFile tools/penpot/empty-arguments.json`. Después consulta `penpot_api_info` para las APIs necesarias. Inspecciona estructura, estilos y tokens; registra IDs comprobados y su correspondencia con el código en CONTEXT.md.
6. Aplica cambios pequeños dentro del alcance solicitado, verifica el resultado en Penpot y ejecuta las verificaciones del proyecto cuando cambie código.

## Conexión y recuperación

La configuración de Codex es local al proyecto, siguiendo la [documentación MCP de Codex](https://developers.openai.com/codex/mcp/). Al cambiar de checkout, actualiza la ruta absoluta del script en `.codex/config.toml`. Reabre el chat o recarga la conexión MCP para cargar la configuración nueva.

El puente stdio usa el SDK MCP y conecta con `https://design.penpot.app/mcp/stream`; recibe el token de `PENPOT_MCP_TOKEN` o de `~/.codex/secrets/femucaribe-penpot.json` (objeto con propiedad `token`). La variable tiene prioridad. Guarda las credenciales únicamente allí, nunca en archivos de contexto, argumentos de shell compartidos ni catálogos. El 2026-09-30 se verificó que la clave incluida en la URL original coincide con el plugin conectado; la segunda clave autentica al servidor pero no accede a esa instancia. La credencial local quedó corregida usando evidencia de lectura del archivo.

`doctor` verifica conexión y descubrimiento de herramientas, no el acceso al archivo de diseño. Para operar sobre diseños abre el archivo en Penpot y selecciona **File → MCP Server → Connect**. Mantén esa pestaña activa. Si el servidor informa que falta el plugin, reconéctalo y repite una inspección de solo lectura. [Guía oficial de Penpot](https://help.penpot.app/mcp/).

El comando `bridge` está reservado al cliente MCP: stdout contiene mensajes del protocolo. Las consultas CLI imprimen JSON; los errores se redactan para ocultar el token. El catálogo es una ayuda de descubrimiento, no reemplaza consultar esquemas actuales cuando cambie el servidor.

El transporte usa HTTP/2 para evitar errores de framing SSE observados con HTTP/1.1 en esta máquina, y prioriza IPv4. Conserva la verificación TLS y usa los certificados del sistema. `PENPOT_DEBUG=1` muestra solamente método y estado HTTP en stderr.

Para verificar el plugin sin editar el diseño: `powershell -File scripts/penpot.ps1 call -Tool execute_code -ArgumentsFile tools/penpot/inspect-context.json`, después de leer la guía del servidor. Revisa el contenido de la respuesta: Penpot puede reportar fallos en texto sin marcar `isError`.

## Coordinación

Claims, responsable y alcance se registran según [COORDINATION.md](../agents/COORDINATION.md). CONTEXT.md es el índice visual; [DESIGN-CONTRACT.md](../architecture/DESIGN-CONTRACT.md) conserva hallazgos confirmados e incógnitas. Asigna un responsable de escritura por página; completa una mutación y su verificación antes de la siguiente. Los demás pueden analizar código o un snapshot. Penpot tiene una sola pestaña MCP activa por usuario; no cambies su página mientras otro agente la modifica.

## Diseño a código

Obtén medidas, tipografía, colores y recursos del diseño observado. Para arquitectura, referencias o impacto en el repositorio, sigue CodeGraph según las instrucciones del proyecto antes de búsquedas amplias. Consulta las guías de Astro pertinentes antes de editar componentes o estilos. Guarda recursos públicos en `public/` cuando corresponda; conserva el diseño como fuente de valores y documenta cualquier adaptación responsive.
