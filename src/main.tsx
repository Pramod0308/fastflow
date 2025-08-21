
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#00897B' },
    background: { default: '#f6faf9' }
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'].join(',') }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
