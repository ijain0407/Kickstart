import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.css'
import App from './App.jsx'
import { RouterProvider } from './router.jsx'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { ThemeProvider } from './state/ThemeContext.jsx'
import { AppProvider } from './state/AppState.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AppProvider>
          <RouterProvider>
            <App />
          </RouterProvider>
        </AppProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
