import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#9B6B9E', // 紫水晶色
      light: '#B794BA',
      dark: '#7A4D7D',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF7E45', // 橙色
      light: '#FF9B6B',
      dark: '#E65D24',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2A2A2A',
      secondary: '#666666',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #9B6B9E 0%, #FF7E45 100%)',
      secondary: 'linear-gradient(135deg, #FF7E45 0%, #FFB168 100%)',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 4px 20px rgba(0, 0, 0, 0.05)',
    '0px 8px 25px rgba(0, 0, 0, 0.08)',
    '0px 12px 35px rgba(0, 0, 0, 0.12)',
    // ... rest of the shadows
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '30px',
          padding: '10px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.20)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});
