import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import ThemeDemo from './components/ThemeDemo';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Categories from './pages/Categories.jsx';
import Requests from './pages/Requests.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import SearchResults from './pages/SearchResults.jsx';
import DevUserPanel from './components/DevUserPanel.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import './App.css';

function App() {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          {/* Protected/Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<Categories />} />            <Route path="/requests" element={<Requests />} />
            <Route path="/requests/:requestId" element={<RequestDetail />} />
            <Route path="/requests/filter/urgency/:urgency" element={<Requests />} />
            <Route path="/create-request" element={<div>Create Request Form</div>} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/theme" element={<ThemeDemo />} />
          </Route>
          
          {/* Auth Routes (without sidebar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        
        {/* Dev User Panel - Only shown in development mode */}
        {isDevelopment && <DevUserPanel />}
      </Box>
    </Router>
  );
}

export default App;