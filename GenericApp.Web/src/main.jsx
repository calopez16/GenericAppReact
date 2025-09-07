import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@styles/App.css'
import App from '@views/Index'
import { AppContextProvider } from '@helpers/AppContext'
import { BrowserRouter } from 'react-router-dom'
import '@locales/i18n';


createRoot(document.getElementById('root')).render(
    <AppContextProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </AppContextProvider>
)
