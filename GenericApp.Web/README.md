# React + Vite

## URL del API

La aplicación carga `config.json` antes de iniciar. Para configurar el API sin recompilar, edite el archivo publicado junto a `index.html`:

```json
{
  "apiBaseUrl": "https://servidor/contratos/api"
}
```

También se admite una ruta desde la raíz del servidor, por ejemplo `/contratos/api`. Después de editar el archivo, recargue la aplicación; no es necesario recompilar. No incluya credenciales ni secretos: este archivo es público. Si la web usa HTTPS, use HTTPS para el API; configure CORS cuando estén en distintos orígenes.

En desarrollo, el archivo está en `public/config.json`. Por defecto, `apiBaseUrl` está vacío y se utiliza `VITE_API_BASE_URL` del `.env` correspondiente al compilar. Un valor no vacío en `config.json` tiene prioridad sobre el `.env`. El archivo debe existir y contener JSON válido; ante errores la aplicación muestra un aviso y no inicia. Al volver a publicar, conserve o restaure la configuración del servidor, ya que el despliegue puede sobrescribirla.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
