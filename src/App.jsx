import React from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import ChatInterface from './components/ChatInterface'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1a1a1a',
      light: '#333333',
      dark: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    h1: {
      fontWeight: 800,
      color: '#000000',
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 800,
      color: '#000000',
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      color: '#000000',
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 700,
      color: '#000000',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 700,
      color: '#000000',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 700,
      color: '#000000',
      letterSpacing: '-0.01em',
      lineHeight: 1.5,
    },
    body1: {
      color: '#000000',
      lineHeight: 1.7,
      fontSize: '0.9375rem',
      fontWeight: 400,
    },
    body2: {
      color: '#000000',
      lineHeight: 1.6,
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.04)',
    '0 4px 8px rgba(0,0,0,0.06)',
    '0 6px 12px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.1)',
    '0 10px 20px rgba(0,0,0,0.12)',
    '0 12px 24px rgba(0,0,0,0.14)',
    '0 14px 28px rgba(0,0,0,0.16)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 18px 36px rgba(0,0,0,0.2)',
    '0 20px 40px rgba(0,0,0,0.22)',
    '0 22px 44px rgba(0,0,0,0.24)',
    '0 24px 48px rgba(0,0,0,0.26)',
    '0 26px 52px rgba(0,0,0,0.28)',
    '0 28px 56px rgba(0,0,0,0.3)',
    '0 30px 60px rgba(0,0,0,0.32)',
    '0 32px 64px rgba(0,0,0,0.34)',
    '0 34px 68px rgba(0,0,0,0.36)',
    '0 36px 72px rgba(0,0,0,0.38)',
    '0 38px 76px rgba(0,0,0,0.4)',
    '0 40px 80px rgba(0,0,0,0.42)',
    '0 42px 84px rgba(0,0,0,0.44)',
    '0 44px 88px rgba(0,0,0,0.46)',
    '0 46px 92px rgba(0,0,0,0.48)',
    '0 48px 96px rgba(0,0,0,0.5)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatInterface />
    </ThemeProvider>
  )
}

export default App

