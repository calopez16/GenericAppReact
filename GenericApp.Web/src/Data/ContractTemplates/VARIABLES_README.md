# Variables Disponibles para Plantillas de Contratos

Este documento describe todas las variables que pueden ser utilizadas en las plantillas de contratos. Las variables deben escribirse entre dobles llaves: `{{nombreVariable}}`

## Variables de Empleado

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{employeeName}}` | Nombre completo del empleado | Juan Pérez García |
| `{{employeeId}}` | ID del empleado en el sistema | 12345 |
| `{{position}}` | Cargo o posición del empleado | Desarrollador Senior |
| `{{rfc}}` | RFC del empleado | PEGJ800101XXX |
| `{{curp}}` | CURP del empleado | PEGJ800101HDFRNN09 |
| `{{imss}}` | Número de seguro social (IMSS) | 12345678901 |
| `{{address}}` | Dirección del empleado | Calle Principal #123, Col. Centro |
| `{{birthDate}}` | Fecha de nacimiento | 01/01/1980 |
| `{{genre}}` | Género del empleado | Masculino/Femenino |
| `{{civilStatus}}` | Estado civil | Casado/Soltero |

## Variables de Empresa

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{companyName}}` | Nombre de la empresa | Mi Empresa S.A. de C.V. |
| `{{companyRFC}}` | RFC de la empresa | EMP850101XXX |
| `{{companyAddress}}` | Dirección de la empresa | Av. Reforma #456, CDMX |
| `{{razonSocial}}` | Razón social completa | Mi Empresa Sociedad Anónima de Capital Variable |

## Variables de Fecha

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{currentDate}}` | Fecha actual | 15/01/2025 |
| `{{currentYear}}` | Año actual | 2025 |

## Uso

Para usar una variable en tu plantilla, simplemente escríbela entre dobles llaves:

```
CONTRATO DE TRABAJO

Entre {{companyName}}, con RFC {{companyRFC}}, y el trabajador {{employeeName}}, 
con RFC {{rfc}}, se celebra el presente contrato de trabajo en la fecha {{currentDate}}.

DATOS DEL TRABAJADOR:
- Nombre completo: {{employeeName}}
- RFC: {{rfc}}
- CURP: {{curp}}
- IMSS: {{imss}}
- Dirección: {{address}}
- Fecha de nacimiento: {{birthDate}}
- Cargo: {{position}}
```

## Notas Importantes

1. Las variables son **case-insensitive** (no distinguen mayúsculas/minúsculas)
2. Los espacios dentro de las llaves son opcionales: `{{ employeeName }}` es igual a `{{employeeName}}`
3. Si una variable no tiene valor, se reemplazará con una cadena vacía
4. En el paso de "Preview" del wizard, verás los datos reales del empleado seleccionado
5. Las variables se reemplazan tanto en el PDF final como en el preview

## Implementación Técnica

- **Frontend**: Las variables están definidas en `GenericApp.Web/src/Data/ContractTemplates/Variables.jsx`
- **Backend**: La sustitución se realiza en `GenericApp.API/Controllers/ContractsController.cs` en el método `ReplaceVariables`
- El reemplazo se hace usando expresiones regulares que buscan el patrón `{{variable}}`
