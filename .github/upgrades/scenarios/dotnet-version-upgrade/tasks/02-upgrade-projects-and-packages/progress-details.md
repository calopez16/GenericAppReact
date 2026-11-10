# Progreso — 02-upgrade-projects-and-packages

## Cambios realizados
- Se actualizaron TFMs a `net10.0` en:
  - `GenericApp.API/GenericApp.API.csproj`
  - `GenericApp.BLL/GenericApp.BLL.csproj`
  - `GenericApp.Data/GenericApp.Data.csproj`
- Se actualizaron paquetes clave recomendados por assessment:
  - `Microsoft.AspNetCore.Authentication.JwtBearer` -> `10.0.14`
  - `Microsoft.AspNetCore.Identity.EntityFrameworkCore` -> `10.0.14`
  - `Microsoft.EntityFrameworkCore*` -> `10.0.14` (Design/SqlServer/Tools/Proxies según proyecto)
  - `AngleSharp` -> `1.10.1`
  - `AutoMapper` -> `16.3.0`
- Se retiró `System.Text.RegularExpressions` explícito de los `.csproj` donde estaba declarado.
- Se corrigió configuración Swagger/OpenAPI en `GenericApp.API/Startup.cs`:
  - `using Microsoft.OpenApi.Models`
  - Ajuste de `OpenApiSecurityRequirement` con `OpenApiReference`.
- Se enriqueció `tasks/02-upgrade-projects-and-packages/task.md` con inventario y hallazgos.

## Validación
- `run_build` (solución completa): **Compilación correcta**.
- Descubrimiento de pruebas: no se detectaron proyectos de test en la solución actual.

## Incidencias resueltas
- Error previo de compilación por tipos OpenAPI no resueltos en `Startup.cs` quedó corregido.
- Vulnerabilidades advertidas en restore inicial (AngleSharp/AutoMapper) quedaron atendidas con actualización de versión.
