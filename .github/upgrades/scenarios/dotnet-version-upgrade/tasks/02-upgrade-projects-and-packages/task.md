# 02-upgrade-projects-and-packages: Actualizar TFMs, paquetes y APIs en toda la solución

Aplicar la actualización a net10.0 en GenericApp.API, GenericApp.BLL, GenericApp.Data y GenericApp.Web, junto con las actualizaciones NuGet recomendadas por assessment (incluyendo paquetes con vulnerabilidades y versiones recomendadas). Esta es la tarea principal atómica del enfoque All-at-Once.

Además, resolver en línea los cambios de API detectados (binarios y de código fuente), con foco en Identity/JWT y dependencias ASP.NET Core/EF Core, manteniendo la compilación íntegra al final de la pasada.

## Scope Inventory
- **Proyectos afectados**: GenericApp.API (AspNetCore), GenericApp.BLL (ClassLibrary), GenericApp.Data (ClassLibrary), GenericApp.Web (esproj frontend).
- **Concerns**:
  1) cambio de TFM en proyectos .csproj,
  2) actualización de paquetes recomendados y con vulnerabilidades,
  3) corrección de incompatibilidades API en AuthController y contexto EF.
- **Señales de cambio (assessment)**:
  - API: 41 incidencias (33 API issues, 7 de paquetes, 1 de framework).
  - Data: 11 incidencias (3 API issues, 7 de paquetes, 1 de framework).
  - BLL: 3 incidencias (2 paquetes/framework).
  - Web.esproj: 1 incidencia de framework (ajuste a net10 sugerido por assessment).

## Findings
- **TFM actual**:
  - GenericApp.API: net9.0 -> net10.0
  - GenericApp.BLL: net6.0 -> net10.0
  - GenericApp.Data: net6.0 -> net10.0
- **Paquetes prioritarios recomendados**:
  - AngleSharp 1.2.0 -> 1.10.1 (vulnerabilidad)
  - AutoMapper 12.0.0 -> 16.3.0 (vulnerabilidad)
  - Microsoft.AspNetCore.Authentication.JwtBearer 6.0.36 -> 10.0.14
  - Microsoft.AspNetCore.Identity.EntityFrameworkCore 6.0.36 -> 10.0.14
  - Microsoft.EntityFrameworkCore* 6.0.36 -> 10.0.14 (Design/SqlServer/Tools/Proxies según proyecto)
- **Paquetes a retirar**:
  - `System.Text.RegularExpressions` (incluido en framework)
- **Puntos de código con incidencias API**:
  - `GenericApp.API/Controllers/AuthController.cs` (JwtSecurityToken/JwtSecurityTokenHandler)
  - `GenericApp.Data/ApplicationDBContext.cs` (IdentityDbContext ctor)
- **Riesgo funcional**:
  - La solución ya presentaba error de compilación en `Startup.cs` por tipos OpenAPI no resueltos; se valida y corrige dentro de esta tarea para dejar build estable.

**Done when**: Todos los proyectos relevantes apuntan a net10.0, los paquetes prioritarios quedan actualizados y los errores de compatibilidad de API quedan resueltos en compilación.
