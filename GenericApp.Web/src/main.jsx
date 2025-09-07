import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@styles/App.css'
import App from '@views/Index'
import { AppContextProvider } from '@helpers/AppContext'
import { AlertProvider } from '@helpers/AlertContext'
import { BrowserRouter } from 'react-router-dom'
import '@locales/i18n';


createRoot(document.getElementById('root')).render(
    <AppContextProvider>
        <AlertProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AlertProvider>
    </AppContextProvider>
)
