import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/800.css'
import './index.css'
import App from './App.jsx'
import { ReportProvider } from './context/ReportContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import theme from './theme.js'

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ToastProvider>
      <ReportProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ReportProvider>
    </ToastProvider>
  </ThemeProvider>,
)
