# Gestión de Firmas de Contratos

## Descripción
Se ha implementado un módulo completo para gestionar las firmas que se pueden utilizar en los contratos. Esta funcionalidad es independiente de las plantillas de contratos y permite a los usuarios crear, editar y eliminar firmas que posteriormente podrán ser utilizadas en los documentos contractuales.

## Características Implementadas

### 1. Módulo de Gestión de Firmas (`/contract-signs`)
- **Vista principal** con lista paginada de firmas
- **Búsqueda en tiempo real** con debounce de 500ms
- **Vista responsiva** con tabla para desktop y cards para móvil
- **Paginación** configurable (5, 10, 25 registros por página)

### 2. CRUD Completo
- ? **Crear firma**: Modal con formulario para agregar nueva firma
- ? **Editar firma**: Modificar nombre y/o imagen de firma existente
- ? **Eliminar firma**: Con confirmación previa
- ? **Activar/Desactivar**: Switch para habilitar o deshabilitar firmas

### 3. Opciones de Carga de Firma
Los usuarios pueden agregar firmas de dos formas:
1. **Subir imagen**: Permite cargar archivos de imagen (PNG, JPG, etc.)
2. **Dibujar firma**: Utiliza el SignaturePad existente para crear firmas digitales

### 4. Integración con ContractTemplates
- Se agregó un **botón con icono de firma** en la cabecera del módulo de Plantillas de Contratos
- El botón redirige a la nueva pantalla de gestión de firmas (`/contract-signs`)
- Tooltip informativo: "Gestionar firmas"

## Archivos Creados

### Servicios de Datos
- `GenericApp.Web/src/Data/ContractSigns/Data.jsx` - Servicio API para firmas

### Componentes de Vista
- `GenericApp.Web/src/Views/ContractSigns/Index.jsx` - Componente principal
- `GenericApp.Web/src/Views/ContractSigns/ContractSignFormModal.jsx` - Modal de formulario
- `GenericApp.Web/src/Views/ContractSigns/ContractSignTableList.jsx` - Vista de tabla (desktop)
- `GenericApp.Web/src/Views/ContractSigns/ContractSignCardList.jsx` - Vista de cards (móvil)

## Archivos Modificados

### Rutas
- `GenericApp.Web/src/Views/Index.jsx` - Agregada ruta `/contract-signs`

### Vista de Plantillas
- `GenericApp.Web/src/Views/ContractTemplates/Index.jsx`
  - Importado `useNavigate` de react-router-dom
  - Importado icono `DrawIcon`
  - Agregado botón de navegación a gestión de firmas

### Traducciones
- `GenericApp.Web/src/locales/es.json` - Claves en español
- `GenericApp.Web/src/locales/en.json` - Claves en inglés

#### Nuevas Claves de Traducción
```json
{
  "contractSigns": "Firmas de Contratos / Contract Signatures",
  "contractSigns_description": "Gestiona las firmas disponibles para los contratos",
  "contractSign_add": "Agregar firma / Add signature",
  "contractSign_edit": "Editar firma / Edit signature",
  "contractSign_delete": "Eliminar firma / Delete signature",
  "question_areYouSureDeleteContractSign": "¿Seguro(a) de eliminar la firma {{signName}}?",
  "signature": "Firma / Signature",
  "signatureRequired": "La firma es requerida / Signature is required",
  "uploadImage": "Subir imagen / Upload image",
  "drawSignature": "Dibujar firma / Draw signature",
  "onlyImagesAllowed": "Solo se permiten imágenes / Only images are allowed",
  "manageSignatures": "Gestionar firmas / Manage signatures",
  "saving": "Guardando / Saving",
  "noRecordsFound": "No se encontraron registros / No records found",
  "state": "Estado / State",
  "recordAdded": "Registro agregado con éxito / Record added successfully",
  "fieldRequired": "Campo requerido / Field required"
}
```

## API Backend (Ya existente)
El módulo utiliza el controlador `ContractSignsController.cs` que ya estaba implementado en:
- `GenericApp.API/Controllers/ContractSignsController.cs`

### Endpoints Utilizados
- `GET /contracts-signs/pagination` - Obtener firmas paginadas
- `GET /contracts-signs/{id}` - Obtener firma por ID
- `POST /contracts-signs` - Crear nueva firma
- `PUT /contracts-signs` - Actualizar firma
- `PUT /contracts-signs/disable/{id}` - Deshabilitar firma
- `PUT /contracts-signs/enable/{id}` - Habilitar firma
- `DELETE /contracts-signs/{id}` - Eliminar firma

## Flujo de Usuario

1. **Acceso**: Desde el módulo de Plantillas de Contratos, click en el botón de firma (icono DrawIcon)
2. **Vista Principal**: Se muestra la lista de firmas existentes con opciones de búsqueda y paginación
3. **Agregar Firma**:
   - Click en botón "Agregar"
   - Ingresar nombre de la firma
   - Elegir entre:
     - Subir imagen desde computadora
     - Dibujar firma con SignaturePad
   - Guardar
4. **Editar Firma**:
   - Click en botón de edición
   - Modificar nombre y/o imagen
   - Guardar cambios
5. **Gestionar Estado**:
   - Usar switch para activar/desactivar firmas
   - Las firmas inactivas no estarán disponibles para uso
6. **Eliminar**:
   - Click en botón de eliminar
   - Confirmar acción en modal

## Características Técnicas

### Responsive Design
- Desktop: Vista de tabla con todas las columnas
- Móvil: Vista de cards compactas con información esencial

### Optimizaciones
- Búsqueda con debounce (500ms)
- Lazy loading de componentes
- Animaciones suaves en eliminación
- Loading states en todas las operaciones

### Validaciones
- Nombre de firma obligatorio
- Imagen obligatoria al crear (opcional al editar)
- Solo acepta archivos de imagen
- Validación de conflictos en backend

## Próximos Pasos (Sugeridos)

1. **Integración con Plantillas**: Agregar selector de firmas en el editor de plantillas
2. **Previsualización**: Agregar opción para ver firma en tamaño completo
3. **Firmas Múltiples**: Permitir asociar múltiples firmas a un contrato
4. **Posicionamiento**: Permitir definir posición de firma en el documento
5. **Historial**: Registrar cambios en las firmas

## Notas de Desarrollo

- La funcionalidad utiliza el contexto `AppContext` para obtener la compañía seleccionada
- Las imágenes se almacenan en `/Signs/{idCompany}/` en el servidor
- El componente `SignaturePadModal` ya existía y se reutilizó
- Se siguió el mismo patrón de diseño de los demás módulos del sistema
