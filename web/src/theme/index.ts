import { createTheme } from '@mui/material/styles';

// FoodBridge Brand Colors
const brandColors = {
  primary: {
    main: '#2E7D32', // Primary Green - growth, food, hope
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF6F00', // Warm Amber - warmth, urgency
    light: '#FFA726',
    dark: '#E65100',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#D32F2F', // Alert Red - urgency (softened)
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: '#F57C00',
    light: '#FFB74D',
    dark: '#E65100',
  },
  info: {
    main: '#0288D1',
    light: '#03A9F4',
    dark: '#01579B',
  },
  success: {
    main: '#388E3C',
    light: '#66BB6A',
    dark: '#2E7D32',
  },
  background: {
    default: '#FAF8F5', // Cream White - warm off-white
    paper: '#FFFFFF',
    dark: '#3E2723', // Soil Brown
  },
  text: {
    primary: '#3E2723', // Soil Brown - deep, grounded
    secondary: '#5D4037',
    disabled: '#A1887F',
  },
};

const theme = createTheme({
  palette: {
    ...brandColors,
    mode: 'light',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(62, 39, 35, 0.05)',
    '0px 4px 8px rgba(62, 39, 35, 0.08)',
    '0px 8px 16px rgba(62, 39, 35, 0.1)',
    '0px 12px 24px rgba(62, 39, 35, 0.12)',
    '0px 16px 32px rgba(62, 39, 35, 0.14)',
    '0px 20px 40px rgba(62, 39, 35, 0.16)',
    '0px 24px 48px rgba(62, 39, 35, 0.18)',
    '0px 2px 4px rgba(62, 39, 35, 0.05)',
    '0px 4px 8px rgba(62, 39, 35, 0.08)',
    '0px 8px 16px rgba(62, 39, 35, 0.1)',
    '0px 12px 24px rgba(62, 39, 35, 0.12)',
    '0px 16px 32px rgba(62, 39, 35, 0.14)',
    '0px 20px 40px rgba(62, 39, 35, 0.16)',
    '0px 24px 48px rgba(62, 39, 35, 0.18)',
    '0px 2px 4px rgba(62, 39, 35, 0.05)',
    '0px 4px 8px rgba(62, 39, 35, 0.08)',
    '0px 8px 16px rgba(62, 39, 35, 0.1)',
    '0px 12px 24px rgba(62, 39, 35, 0.12)',
    '0px 16px 32px rgba(62, 39, 35, 0.14)',
    '0px 20px 40px rgba(62, 39, 35, 0.16)',
    '0px 24px 48px rgba(62, 39, 35, 0.18)',
    '0px 2px 4px rgba(62, 39, 35, 0.05)',
    '0px 4px 8px rgba(62, 39, 35, 0.08)',
    '0px 8px 16px rgba(62, 39, 35, 0.1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(46, 125, 50, 0.2)',
          },
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1.125rem',
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 16px rgba(62, 39, 35, 0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 24px rgba(62, 39, 35, 0.12)',
          },
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;
