import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.css'
import App from './App.jsx'
import { RouterProvider } from './router.jsx'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { ThemeProvider } from './state/ThemeContext.jsx'
import { AppProvider } from './state/AppState.jsx'
import { AuthProvider } from './state/AuthState.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        {/* Auth sits outside AppState: signing in changes which user id the
            progress calls are made as. */}
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
