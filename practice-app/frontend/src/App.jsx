import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ProfilePage from './components/ProfilePage/ProfilePage';
import store from './redux/store';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#5C69FF',
    },
    secondary: {
      main: '#F06292',
    },
    background: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            {/* Add other routes as needed */}
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;