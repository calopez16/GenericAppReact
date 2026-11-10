# 01-prerequisites-toolchain: Verificar prerrequisitos y SDK para .NET 10

Validar que el entorno de compilación pueda resolver net10.0 en toda la solución, incluyendo compatibilidad del SDK y cualquier configuración de versionado central. Esta tarea prepara el repositorio para que el cambio de TFM sea repetible y no falle por tooling.

También cubre la actualización de configuración base del repositorio para evitar discrepancias de compilación entre proyectos y asegurar que los pasos siguientes no introduzcan errores por entorno.

## Scope Inventory
- **Proyectos afectados**: GenericApp.API, GenericApp.BLL, GenericApp.Data, GenericApp.Web (validación de prerrequisitos; sin cambios de código en esta tarea).
- **Preocupaciones técnicas**: disponibilidad de SDK net10.0, compatibilidad de global.json, restauración de paquetes de solución.
- **Señales de cambio**: assessment confirma migración net6/net9 -> net10.0 y actualizaciones NuGet recomendadas.

## Findings
- SDK compatible para **net10.0** está instalado en el entorno.
- No existe `global.json` en la solución; no hay restricciones de SDK que bloquear.
- `dotnet restore GenericApp.sln` finaliza correctamente.
- Se detectan advertencias de vulnerabilidad NuGet en GenericApp.API (AngleSharp 1.2.0 y AutoMapper 12.0.0), a tratar en la tarea de actualización de paquetes.

**Done when**: La solución restaura correctamente con net10.0 disponible y la configuración de SDK/global queda alineada para continuar la migración.
