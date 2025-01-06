import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { deepPurple, orange } from '@mui/material/colors';

// Custom breakpoints
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true; // Add custom breakpoint
  }
}

// Custom color scheme
const colors = {
  primary: {
    main: deepPurple[500],
    light: deepPurple[300],
    dark: deepPurple[700],
    contrastText: '#ffffff',
  },
  secondary: {
    main: orange[500],
    light: orange[300],
    dark: orange[700],
    contrastText: '#ffffff',
  },
};

// Custom typography
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontWeight: 600,
  },
  h5: {
    fontWeight: 500,
  },
  h6: {
    fontWeight: 500,
  },
  subtitle1: {
    fontWeight: 500,
    letterSpacing: 0,
  },
  subtitle2: {
    fontWeight: 500,
    letterSpacing: 0,
  },
  body1: {
    letterSpacing: 0,
  },
  body2: {
    letterSpacing: 0,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: 0,
  },
};

// Custom shadows
const shadows = [
  'none',
  '0px 2px 4px rgba(0, 0, 0, 0.05)',
  '0px 4px 8px rgba(0, 0, 0, 0.05)',
  '0px 8px 16px rgba(0, 0, 0, 0.05)',
  '0px 16px 24px rgba(0, 0, 0, 0.05)',
  '0px 24px 32px rgba(0, 0, 0, 0.05)',
  '0px 32px 40px rgba(0, 0, 0, 0.05)',
  ...Array(18).fill('none'), // Fill remaining shadows
];

// Custom shape
const shape = {
  borderRadius: 12,
};

// Create base theme
let theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography,
  shadows: shadows as any,
  shape,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
      xxl: 2560,
    },
  },
});

// Add responsive font sizes
theme = responsiveFontSizes(theme);

// Custom component overrides
theme.components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '30px',
        padding: '8px 24px',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
      outlined: {
        borderWidth: '2px',
        '&:hover': {
          borderWidth: '2px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.shadows[1],
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.shape.borderRadius,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: theme.shape.borderRadius * 2,
      },
    },
  },
};

export default theme;
