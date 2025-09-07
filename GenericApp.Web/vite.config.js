import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@' : path.resolve(__dirname, './src'),
            '@styles' : path.resolve(__dirname, './src/assets/css'),
            '@layout' : path.resolve(__dirname, './src/Views/Layout'),
            '@views' : path.resolve(__dirname, './src/Views'),
            '@helpers' : path.resolve(__dirname, './src/Helpers'),
            '@data' : path.resolve(__dirname, './src/Data'),
            '@config' : path.resolve(__dirname, './src/config.jsx'),
            '@images' : path.resolve(__dirname, './src/assets/img')
        }
    },
    server: {
        port: 60688,
    }
})