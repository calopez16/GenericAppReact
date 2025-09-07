// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa tus archivos de traducción
import en from '@locales/en.json';
import es from '@locales/es.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es', // Idioma por defecto si el idioma detectado no está disponible
        interpolation: {
            escapeValue: false, // No escapar el HTML en las traducciones
        },
        detection: {
            order: ['localStorage', 'navigator'], // Prioriza la detección por localStorage
            caches: ['localStorage'], // Cacha el idioma en localStorage
        },
    });

export default i18n;