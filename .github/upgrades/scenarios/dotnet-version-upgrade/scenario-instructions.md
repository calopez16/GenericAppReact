# .NET Version Upgrade

## Preferences
- **Flow Mode**: Automatic
- **Target Framework**: net10.0

## Source Control
- **Source Branch**: Contratos
- **Working Branch**: upgrade-dotnet-10
- **Commit Strategy**: After Each Task
- **Branch Sync**: Auto (Merge)

## Upgrade Options

### Strategy
- Upgrade Strategy: All-at-Once

### Project Structure
- Package Management: Central Package Management (CPM)

### Compatibility
- Unsupported API Handling: Fix Inline
- Windows Native APIs: Windows Compatibility Pack

## Strategy
**Selected**: All-At-Once
**Rationale**: La solución tiene 4 proyectos SDK-style en .NET moderno (net6/net9), con profundidad de dependencias manejable y sin proyectos .NET Framework.

### Execution Constraints
- Actualizar todos los proyectos en una sola pasada atómica (sin fases por capas).
- Secuencia interna obligatoria: TFM de proyectos → paquetes NuGet → restaurar → compilar y corregir errores.
- Validar la solución completa al finalizar (build y pruebas) antes de cerrar tareas.
- No introducir multi-targeting ni tareas de conversión SDK-style.

## Key Decisions Log
- Confirmado iniciar actualización a .NET 10 en modo Automatic.
- Confirmadas opciones de actualización para continuar con el plan.
- Git CLI no disponible en terminal; verificación de cambios pendientes no automatizada.
