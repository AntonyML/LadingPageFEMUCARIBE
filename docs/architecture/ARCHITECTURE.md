# Arquitectura inicial

Estado: límites aprobados, sin implementación; 2026-09-30. Stack: [STACK.md](STACK.md). Fuente visual: [DESIGN-CONTRACT.md](DESIGN-CONTRACT.md). Procedimiento de trabajo: [COORDINATION.md](../agents/COORDINATION.md).

## Astro-first y server-first

Astro organiza routing basado en archivos, layouts, componentes y rendering. Las páginas componen UI y datos preparados; los componentes `.astro` expresan HTML semántico con estilos scoped. No incluir lógica importante de negocio dentro del template.

Preferir contenido público prerenderizado cuando sea adecuado. Un formulario HTML con Action y resultado de servidor necesita rendering bajo demanda y un adaptador de despliegue compatible; no prometer operaciones de servidor en una publicación puramente estática. Escoger proveedor/adaptador solo cuando una tarea requiera servidor. Middleware se reserva para responsabilidades del request, no para concentrar casos de uso. [Routing](https://docs.astro.build/en/guides/routing/), [componentes](https://docs.astro.build/en/basics/astro-components/), [Actions](https://docs.astro.build/en/guides/actions/).

HTML, enlaces y formularios dan el comportamiento base. Agregar scripts nativos pequeños para mejorar UX cuando esté justificado. Funcionalidades importantes deben conservar navegación/formulario sin JS cuando sea razonable. No usar SPA, hidratación o `fetch` como requisitos predeterminados.

## Responsabilidades y dirección de dependencias

```text
Astro pages / Actions / middleware       SQL y servicios externos
             |                           | implementan contratos
             v                           v
          Application ---- depende de --> ports propios
             |
             v
            Domain
```

| Zona conceptual | Puede conocer | Mantiene fuera |
| --- | --- | --- |
| Dominio | Reglas, valores e invariantes propios | Astro, Kysely, DB, drivers, SDK externos, navegador |
| Aplicación | Dominio y contratos que necesita el caso de uso | Queries SQL, tipos del ORM/query builder, requests Astro |
| Adaptadores de entrada | Astro, validación y llamadas al caso de uso | Reglas duplicadas y SQL directo en la UI |
| Infraestructura | Drivers, Kysely, SDK y contratos propios | Filtración de tipos tecnológicos hacia el núcleo |
| Composición de servidor | Construcción e inyección de dependencias | Estado global mutable y dependencias servidor en bundles cliente |

Son límites de responsabilidad, no una orden de crear carpetas vacías. La UI inicial utiliza la estructura existente `src/pages`, `src/layouts` y `src/components`; crear módulos de dominio/aplicación/infraestructura solo al existir un caso de uso. La auditoría no define login, CMS, dashboard ni entidades de negocio hipotéticas.

## Persistencia desacoplada

Un contrato de repositorio es un port: no hacen falta una interfaz Repository y otra Port idénticas. El contrato pertenece al núcleo que lo consume y devuelve valores propios; debe expresar semántica de resultados ausentes, orden, errores, atomicidad y paginación cuando el caso real lo requiera. Preferir contratos pequeños específicos, no un CRUD universal.

La implementación SQL satisface ese contrato mediante Kysely y mapea filas a valores del núcleo. `Kysely`, `Selectable`, `Insertable`, dialectos, builders, columnas y errores de driver quedan en infraestructura. Migraciones y esquemas físicos pertenecen a ese adaptador. La composición inyecta la implementación; los casos de uso no crean conexiones ni importan el repositorio concreto.

Un cambio de DB o de Kysely modifica infraestructura, composición y migración de datos, manteniendo dominio/casos de uso. No asumir semánticas iguales de transacción, orden o unicidad: probar las invariantes de contrato en cada implementación. Si una transacción real abarca varios repositorios, resolver su contrato en ese slice; no crear hoy una abstracción hipotética de Unit of Work. [Kysely](https://kysely.dev/docs/intro).

## Fronteras de entrada, sesiones y errores

Actions son el adaptador preferido para operaciones internas. Validar input con Zod antes de ejecutar el caso de uso y traducir sus resultados a errores/respuestas de Astro. Son accesibles por HTTP: su tipado no reemplaza autorización. Endpoints HTTP se justifican por un consumidor independiente, webhook o integración externa.

Astro Sessions puede aportar estado de sesión con driver apropiado al despliegue, pero no autentica por sí sola. Autenticación, autorización, ciclo de cookies y política de acceso siguen TO BE DECIDED. Configuración de aplicación mediante `astro:env`; los secretos solo son consumidos desde servidor. El token MCP del tooling permanece fuera de ese contrato y fuera de archivos versionados. [Sessions](https://docs.astro.build/en/guides/sessions/), [environment variables](https://docs.astro.build/en/guides/environment-variables/).

Entradas y payloads externos se tratan como no confiables. Los adaptadores traducen errores tecnológicos; el núcleo no debe exponer detalles SQL ni credenciales. Definir fallos esperados de manera explícita y evitar side effects ocultos.

## SOLID y pruebas

SRP: responsabilidad clara; OCP: extender variación real sin reescribir código estable; LSP: adapters respetan resultados/invariantes; ISP: contratos pequeños; DIP: tecnologías externas dependen de contratos propios. Preferir composición, nombres descriptivos, funciones enfocadas y comentarios que expliquen el porqué. Evitar mega archivos, código muerto, constantes mágicas y helpers universales.

Vitest prueba reglas y casos de uso con dependencias inyectadas, sin Astro, navegador, DB real ni red. Pruebas de contrato verifican que adaptadores distintos ofrecen igual comportamiento; integración del adaptador SQL utiliza datos aislados y el motor que realmente se seleccione. Playwright verifica el slice completo, teclado y tamaños de pantalla. Medir comportamiento y errores, no replicar implementación en tests.

Build y typecheck son controles distintos: `astro build` no valida todos los tipos; el gate futuro debe incluir `astro check`. Lint, formato, pruebas y fidelidad visual aplican según scope y herramientas configuradas. Un control ausente se declara pendiente, no se reporta como aprobado. [TypeScript y typecheck](https://docs.astro.build/en/guides/typescript/).

No introducir CQRS, Event Sourcing, brokers, microservicios, caches distribuidas, Kubernetes ni observabilidad compleja. Un nuevo patrón/capa necesita un problema observable y consumidor real. Implementar solo el slice autorizado y hacer HARD STOP al terminarlo.
