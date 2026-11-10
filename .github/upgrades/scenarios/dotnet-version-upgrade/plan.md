# .NET Version Upgrade Plan

## Overview

**Target**: Actualizar los proyectos .NET de la solución GenericApp a net10.0.
**Scope**: Solución mediana (4 proyectos, ~120k LOC), todos SDK-style y en .NET moderno, con incidencias de API y paquetes por resolver.

### Selected Strategy
**All-At-Once** — All projects upgraded simultaneously in a single operation.
**Rationale**: 4 proyectos, todos en .NET moderno (net6.0+), con estructura de dependencias clara y sin proyectos .NET Framework.

## Upgrade Options

| Option | Selected | Why |
|--------|----------|-----|
| Upgrade Strategy | All-at-Once | Son 4 proyectos modernos con dependencia acotada; una pasada única reduce sobrecarga de coordinación. |
| Package Management | Central Package Management (CPM) | Hay varios proyectos con referencias de paquetes compartidos; centralizar versiones mejora consistencia durante la actualización. |
| Unsupported API Handling | Fix Inline | Se detectaron cambios de API binarios/fuente y conviene resolverlos dentro de la misma tarea para evitar deuda diferida. |
| Windows Native APIs | Windows Compatibility Pack | Se observan dependencias Windows (p. ej. System.Drawing / Microsoft.Win32), por lo que mantener compatibilidad Windows reduce riesgo inmediato. |

## Tasks

### 01-prerequisites-toolchain: Verificar prerrequisitos y SDK para .NET 10

Validar que el entorno de compilación pueda resolver net10.0 en toda la solución, incluyendo compatibilidad del SDK y cualquier configuración de versionado central. Esta tarea prepara el repositorio para que el cambio de TFM sea repetible y no falle por tooling.

También cubre la actualización de configuración base del repositorio para evitar discrepancias de compilación entre proyectos y asegurar que los pasos siguientes no introduzcan errores por entorno.

**Done when**: La solución restaura correctamente con net10.0 disponible y la configuración de SDK/global queda alineada para continuar la migración.

---

### 02-upgrade-projects-and-packages: Actualizar TFMs, paquetes y APIs en toda la solución

Aplicar la actualización a net10.0 en GenericApp.API, GenericApp.BLL, GenericApp.Data y GenericApp.Web, junto con las actualizaciones NuGet recomendadas por assessment (incluyendo paquetes con vulnerabilidades y versiones recomendadas). Esta es la tarea principal atómica del enfoque All-at-Once.

Además, resolver en línea los cambios de API detectados (binarios y de código fuente), con foco en Identity/JWT y dependencias ASP.NET Core/EF Core, manteniendo la compilación íntegra al final de la pasada.

**Done when**: Todos los proyectos relevantes apuntan a net10.0, los paquetes prioritarios quedan actualizados y los errores de compatibilidad de API quedan resueltos en compilación.

---

### 03-final-validation-and-cleanup: Validación final de solución y cierre técnico

Ejecutar validación integral posterior a la migración: compilación completa de la solución y pruebas automatizadas disponibles, asegurando que no queden errores ni advertencias pendientes en los proyectos modificados.

Documentar recomendaciones de cierre post-migración (incluida consolidación de gestión de paquetes si aplica ajuste adicional) y dejar la solución en estado estable para continuidad de desarrollo.

**Done when**: Build de solución exitoso, pruebas relevantes en verde y sin incidencias abiertas bloqueantes de la migración.
