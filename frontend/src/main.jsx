import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.css'
import App from './App.jsx'
import { RouterProvider } from './router.jsx'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { ThemeProvider } from './state/ThemeContext.jsx'
import { AuthProvider } from './state/AuthState.jsx'
import { AppProvider } from './state/AppState.jsx'

/* AuthProvider sits above AppProvider because app state follows the signed-in
   identity: it refetches progress when the effective user id changes. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <AppProvider>
            <RouterProvider>
              <App />
            </RouterProvider>
          </AppProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
