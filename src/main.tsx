// add at the very top
import { registerSW } from 'virtual:pwa-register';

// register & apply updates instantly
registerSW({ immediate: true });

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
const theme = createTheme({
  palette: { primary: { main: '#00897B' }, secondary: { main: '#FF7043' }, success: { main: '#2E7D32' }, warning: { main: '#FBC02D' }, background: { default: '#f2fbf9', paper: '#ffffff' } },
  shape: { borderRadius: 18 },
  components: { MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, borderRadius: 14 } } }, MuiCard: { styleOverrides: { root: { borderRadius: 22 } } }, MuiChip: { styleOverrides: { root: { fontWeight: 600 } } } },
  typography: { fontFamily: ['Inter','system-ui','Segoe UI','Roboto','Arial'].join(',') }
});
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></React.StrictMode>);
