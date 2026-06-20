Para estructurar esta funcionalidad por etapas y construir los prompts ideales para tu agente de desarrollo (siguiendo estrictamente tu protocolo de alcance, estructura y visualización completa del código), dividiremos la implementación en 4 etapas secuenciales.

Dado que el controlador y las vistas ya existen pero requieren adaptación, cada prompt se enfoca en resolver un bloque específico sin alterar la arquitectura actual.

Aquí tienes la serie de prompts listos para usar:

Etapa 1: Adaptación del Controlador y Query de Paginación (Backend)
Propósito: Adaptar el controlador existente para que consuma el modelo de datos correcto, aplique el método de paginación estándar y ordene de forma descendente.

Prompt:
Actúa como un desarrollador profesional de .NET. Modifica el controlador ContractsController existente para adaptarlo al modelo de datos Contract.

Implementa el método getDataPagination para listar los contratos firmados. La consulta debe incluir la paginación existente y aplicar un ordenamiento de tipo descendente (del más reciente al más antiguo basado en la fecha de creación/firma).

Respeta estrictamente el protocolo de modificación: actúa únicamente sobre este controlador, preserva la estructura, diseño de inyección de dependencias y lógica adyacente. No realices refactorizaciones no solicitadas. Muestra el archivo completo si es menor o igual a 600 líneas; de lo contrario, solo los bloques modificados.



Etapa 2: Vista Principal, Tabla de Contratos y Estado del Cache (Frontend)
Propósito: Configurar la vista index para listar los contratos usando el diseño actual y preparar el estado del modal/wizard junto con la persistencia en caché de las plantillas seleccionadas.

Prompt:
Actúa como un desarrollador experto en React y Material UI (utilizando las versiones del proyecto: @mui/material 7.3.2 y react 19.1.1).

Ajusta la funcionalidad de la vista principal del módulo de contratos. Debe renderizar la tabla con los contratos firmados paginados consumiendo el método getDataPagination.

Añade el estado inicial para controlar la apertura de un modal tipo Wizard para un "Nuevo Firmado". Implementa la lógica para que, al seleccionar los templates de contratos dentro del wizard, estos se guarden en el caché local (localStorage/sessionStorage). Al reabrir el modal, el componente debe inicializarse con los últimos templates seleccionados del caché.

Sigue el protocolo de modificación: mantén el mismo diseño visual existente, la arquitectura de componentes y estilos de indentación. No refactorices. Muestra el código completo si es menor a 600 líneas.

Etapa 3: Flujo del Wizard y Previsualización con Tiptap (Frontend)
Propósito: Construir los pasos del Wizard (Búsqueda de empleado, Selección, Previsualización) integrando el editor Tiptap que ya se usa en la aplicación.

Prompt:
Actúa como un desarrollador experto en React utilizando @tiptap/react. Desarrolla los pasos internos del modal Wizard de "Nuevo Firmado" en la vista de contratos:

Paso 1: Buscador de empleados (reutilizando el diseño y componentes de selección de la app).

Paso 2: Selección de templates (conectado al caché de la etapa anterior). Al avanzar, muestra el botón "Siguiente".

Paso 3: Previsualización de los contratos seleccionados, replicando exactamente la misma lógica de visualización que se utiliza actualmente en el módulo de contracts templates.

Respeta el alcance estricto: no alteres la lógica adyacente de la página ni renombres variables existentes. No incluyas resúmenes ni explicaciones de mejoras. Muestra el código completo si no supera las 600 líneas.

Etapa 4: Firma Digital, Guardado en Base de Datos y Almacenamiento Física (Fullstack)
Propósito: Habilitar el SignaturePad en el último paso del wizard, procesar el guardado en la base de datos y almacenar el documento final en la carpeta física del servidor.

Prompt:
Actúa como un desarrollador Fullstack. Implementa el paso final del flujo de contratos:

Frontend: Al final del Wizard, añade un botón "Firmar" que habilite el componente SignaturePad. Al confirmar la firma, envía los datos del empleado, los templates y la firma digital en Base64 hacia el endpoint de guardado en el backend.

Backend (ContractsController): Crea o adapta la acción HTTP Post para recibir este registro. Debe insertar la información en la base de datos a través del contexto Code First. Además, debe generar el documento firmado y guardarlo físicamente en el servidor dentro de la ruta wwwroot/contratos/.

Sigue estrictamente las reglas de modificación de código: mantén el diseño, nombres de variables y la arquitectura del sistema intactos. Muestra los bloques de código modificados o los archivos completos si tienen menos de 600 líneas, sin explicaciones ni resúmenes.