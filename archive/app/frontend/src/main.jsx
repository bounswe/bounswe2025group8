import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/index.js';
import theme from './theme/theme.js';
import './index.css'
import App from './App.jsx'
import { setupApiInterceptors } from './services/apiMiddleware'

// Setup API interceptors for handling auth and errors
setupApiInterceptors();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
