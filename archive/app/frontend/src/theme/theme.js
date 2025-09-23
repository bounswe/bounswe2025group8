import { createTheme } from '@mui/material/styles';

// Create a theme instance based on Tailwind config
const theme = createTheme({
  palette: {
    common: {
      black: '#000000',
      white: '#FFFFFF',
    },
    primary: {
      main: '#636AE8', // primary.DEFAULT
      light: '#999df0', // primary.350
      dark: '#1b22b1', // primary.700
      contrastText: '#FFFFFF',
      100: '#f2f2fd',
      200: '#ced0f8',
      300: '#abaef2',
      400: '#878ced',
      500: '#636AE8',
      600: '#2c35e0',
      700: '#1b22b1',
      800: '#12177a',
      900: '#0a0d42',
    },
    secondary: {
      main: '#E8618C', // secondary.DEFAULT
      light: '#f098b4', // secondary.350
      dark: '#ac1947', // secondary.700
      contrastText: '#FFFFFF',
      100: '#fdf1f5',
      200: '#f8cedb',
      300: '#f3aac1',
      400: '#ee86a7',
      500: '#E8618C',
      600: '#e02862',
      700: '#ac1947',
      800: '#71102f',
      900: '#360816',
    },
    error: {
      main: '#de3b40', // danger.DEFAULT
      light: '#e97f83', // danger.350
      dark: '#93191d', // danger.700
      contrastText: '#FFFFFF',
      100: '#fdf2f2',
      200: '#f5c4c6',
      300: '#ed9699',
      400: '#e5696d',
      500: '#de3b40',
      600: '#c12126',
      700: '#93191d',
      800: '#641114',
      900: '#36090b',
    },
    warning: {
      main: '#efb034', // warning.DEFAULT
      light: '#f4cb7a', // warning.350
      dark: '#98690c', // warning.700
      contrastText: '#000000',
      100: '#fef9ee',
      200: '#fae7c0',
      300: '#f6d491',
      400: '#f2c263',
      500: '#efb034',
      600: '#d29211',
      700: '#98690c',
      800: '#5d4108',
      900: '#221803',
    },
    info: {
      main: '#379ae6', // info.DEFAULT
      light: '#7dbeef', // info.350
      dark: '#125d95', // info.700
      contrastText: '#FFFFFF',
      100: '#f1f8fd',
      200: '#c3e1f8',
      300: '#94c9f2',
      400: '#66b2ec',
      500: '#379ae6',
      600: '#197dca',
      700: '#125d95',
      800: '#0c3c61',
      900: '#061c2d',
    },
    success: {
      main: '#1dd75b', // success.DEFAULT
      light: '#67ea93', // success.350
      dark: '#117b34', // success.700
      contrastText: '#FFFFFF',
      100: '#eefdf3',
      200: '#b8f5cd',
      300: '#82eea6',
      400: '#4ce77f',
      500: '#1dd75b',
      600: '#17a948',
      700: '#117b34',
      800: '#0a4d20',
      900: '#041e0d',
    },
    // Additional custom colors
    teal: {
      main: '#22CCB2', // color-3.DEFAULT
      light: '#69e6d3', // color-3.350
      dark: '#147567', // color-3.700
      contrastText: '#FFFFFF',
      100: '#effcfa',
      200: '#baf3eb',
      300: '#84eadb',
      400: '#4ee1cb',
      500: '#22CCB2',
      600: '#1ba18d',
      700: '#147567',
      800: '#0c4940',
      900: '#051d1a',
    },
    purple: {
      main: '#7F55E0', // color-4.DEFAULT
      light: '#ac91eb', // color-4.350
      dark: '#461ea4', // color-4.700
      contrastText: '#FFFFFF',
      100: '#f5f2fd',
      200: '#d8cbf5',
      300: '#bba4ee',
      400: '#9d7ee7',
      500: '#7F55E0',
      600: '#5b27d5',
      700: '#461ea4',
      800: '#311572',
      900: '#1c0c40',
    },
    orange: {
      main: '#EA916E', // color-5.DEFAULT
      light: '#f1b59e', // color-5.350
      dark: '#ac4219', // color-5.700
      contrastText: '#FFFFFF',
      100: '#fdf5f1',
      200: '#f8dbd0',
      300: '#f4c2af',
      400: '#efa98d',
      500: '#EA916E',
      600: '#e1602c',
      700: '#ac4219',
      800: '#6d2a10',
      900: '#2d1206',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Archivo", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '3rem',
      lineHeight: '4.25rem',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Archivo", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '2.5rem',
      lineHeight: '3.5rem',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Archivo", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '2rem',
      lineHeight: '3rem',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Archivo", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.5rem',
      lineHeight: '2.25rem',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Archivo", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.25rem',
      lineHeight: '1.875rem',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Archivo", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.125rem',
      lineHeight: '1.75rem',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      lineHeight: '1.625rem',
    },
    body2: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.875rem',
      lineHeight: '1.375rem',
    },
    button: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: '1.375rem',
      textTransform: 'none',
    },
    caption: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.75rem',
      lineHeight: '1.25rem',
    },
    overline: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.6875rem',
      lineHeight: '1.125rem',
      textTransform: 'uppercase',
      fontWeight: 500,
    },
  },

  spacing: (factor) => {
    const spacingMap = {
      0: '0',
      0.5: '0.125rem', // s0
      1: '0.25rem', // s1
      1.5: '0.375rem', // s2
      2: '0.5rem', // s3
      3: '0.75rem', // s4
      4: '1rem', // s5
      5: '1.25rem', // s6
      6: '1.5rem', // s7
      7: '1.75rem', // s8
      8: '2rem', // s9
      9: '2.25rem', // s10
      10: '2.5rem', // s11
      11: '2.75rem', // s12
      12: '3rem', // s13
      14: '3.5rem', // s14
      16: '4rem', // s15
      24: '6rem', // s16
      32: '8rem', // s17
      48: '12rem', // s18
      64: '16rem', // s19
      96: '24rem', // s20
    };
    
    return spacingMap[factor] || `${0.25 * factor}rem`;
  },
  
  shape: {
    borderRadius: 4,
    borderRadiusXS: 3, // xs: 0.1875rem
    borderRadiusS: 4, // s: 0.25rem
    borderRadiusM: 6, // m: 0.375rem
    borderRadiusL: 8, // l: 0.5rem
    borderRadiusXL: 12, // xl: 0.75rem
  },
  
  shadows: [
    'none',
    '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)', // xs
    '0px 2px 5px rgba(23, 26, 31, 0.09), 0px 0px 2px rgba(23, 26, 31, 0.12)', // s
    '0px 4px 9px rgba(23, 26, 31, 0.11), 0px 0px 2px rgba(23, 26, 31, 0.12)', // m
    '0px 4px 9px rgba(23, 26, 31, 0.11), 0px 0px 2px rgba(23, 26, 31, 0.12)', // Duplicate for MUI's 24 shadows
    '0px 8px 17px rgba(23, 26, 31, 0.15), 0px 0px 2px rgba(23, 26, 31, 0.12)', // l
    '0px 8px 17px rgba(23, 26, 31, 0.15), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 8px 17px rgba(23, 26, 31, 0.15), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)', // xl
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
    '0px 17px 35px rgba(23, 26, 31, 0.24), 0px 0px 2px rgba(23, 26, 31, 0.12)',
  ],
  
  // Custom properties to match Tailwind sizing
  customSizing: {
    width: {
      NONE: '0rem',
      Sz0: '0.125rem',
      Sz1: '0.25rem',
      Sz2: '0.375rem',
      Sz3: '0.5rem',
      Sz4: '0.75rem',
      Sz5: '1rem',
      Sz6: '1.25rem',
      Sz7: '1.5rem',
      Sz8: '1.75rem',
      Sz9: '2rem',
      Sz10: '2.25rem',
      Sz11: '2.5rem',
      Sz12: '2.75rem',
      Sz13: '3rem',
      Sz14: '3.25rem',
      Sz15: '3.5rem',
      Sz16: '3.75rem',
      Sz17: '4rem',
      Sz18: '6rem',
      Sz19: '8rem',
      Sz20: '12rem',
      Sz21: '16rem',
      Sz22: '24rem',
      Sz23: '32rem',
      Sz24: '40rem',
      Sz25: '48rem',
      Sz26: '56rem',
      Sz27: '64rem'
    },
    height: {
      NONE: '0rem',
      Sz0: '0.125rem',
      Sz1: '0.25rem',
      Sz2: '0.375rem',
      Sz3: '0.5rem',
      Sz4: '0.75rem',
      Sz5: '1rem',
      Sz6: '1.25rem',
      Sz7: '1.5rem',
      Sz8: '1.75rem',
      Sz9: '2rem',
      Sz10: '2.25rem',
      Sz11: '2.5rem',
      Sz12: '2.75rem',
      Sz13: '3rem',
      Sz14: '3.25rem',
      Sz15: '3.5rem',
      Sz16: '3.75rem',
      Sz17: '4rem',
      Sz18: '6rem',
      Sz19: '8rem',
      Sz20: '12rem',
      Sz21: '16rem',
      Sz22: '24rem',
      Sz23: '32rem',
      Sz24: '40rem',
      Sz25: '48rem',
      Sz26: '56rem',
      Sz27: '64rem'
    },
    fontSize: {
      t1: ['0.6875rem', '1.125rem'],
      t2: ['0.75rem', '1.25rem'],
      t3: ['0.875rem', '1.375rem'],
      t4: ['1rem', '1.625rem'],
      t5: ['1.125rem', '1.75rem'],
      t6: ['1.25rem', '1.875rem'],
      t7: ['1.5rem', '2.25rem'],
      t8: ['2rem', '3rem'],
      t9: ['2.5rem', '3.5rem'],
      t10: ['3rem', '4.25rem'],
      't10-1': ['4rem', '5.25rem'],
      't10-2': ['5rem', '6.5rem'],
      t11: ['6.25rem', '8.125rem'],
      t12: ['12.5rem', '15rem'],
      t13: ['18.75rem', '22.5rem'],
      t14: ['31.25rem', '37.5rem']
    }
  },
  
  // Component overrides
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@import': "url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap')",
          html: {
            boxSizing: 'border-box',
          },
          '*, *::before, *::after': {
            boxSizing: 'inherit',
          },
          body: {
            margin: 0,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          },
          'h1, h2, h3, h4, h5, h6': {
            fontFamily: '"Archivo", "Roboto", "Helvetica", "Arial", sans-serif',
            margin: 0,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem', // m
          textTransform: 'none',
          fontWeight: 500,
        },
        sizeMedium: {
          padding: '0.5rem 1rem', // s3, s5
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // l
          boxShadow: '0px 4px 9px rgba(23, 26, 31, 0.11), 0px 0px 2px rgba(23, 26, 31, 0.12)', // m
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '0.5rem', // l
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem', // m
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.5rem', // l
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem', // m
        },
      },
    },
  },
});

export default theme;