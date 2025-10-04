// Este archivo centraliza todas las variables de configuración de la aplicación.

// Leemos la variable de entorno y la exportamos.
// Usamos el operador || para tener una URL por defecto en caso de que la variable no esté definida.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7087';
//export const APP_NAME = import.meta.env.VITE_APP_NAME || "Mi sistema chido";

// Puedes agregar otras variables globales aquí en el futuro.
// export const ANOTHER_GLOBAL_VAR = 'some_value';