import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUserFromStorage } from "./store/slices/authSlice";
import ThemeDemo from "./components/ThemeDemo";
// Home pages
import Home from "./pages/Home.jsx";
import HomeDashboard from "./pages/HomeDashboard.jsx";
// Categories and Search
import Categories from "./pages/Categories.jsx";
import SearchResults from "./pages/SearchResults.jsx";
// Request related pages
import Requests from "./pages/Requests.jsx";
import RequestDetail from "./pages/RequestDetail.jsx";
// Task related pages
import TaskPage from "./pages/TaskPage.jsx";
import TaskPageVolunteer from "./pages/TaskPageVolunteer.jsx";
import TaskListPage from "./pages/TaskListPage.jsx";
import SelectVolunteerPage from "./pages/SelectVolunteerPage.jsx";
// Review related
import RateReviewPage from "./pages/RateReviewPage.jsx";
// Auth pages
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
// Layout components
import MainLayout from "./layouts/MainLayout.jsx";
// Dev components
import DevUserPanel from "./components/DevUserPanel.jsx";
import ProfilePage from "./components/ProfilePage/ProfilePage.jsx";
import CreateRequestPage from "./components/CreateRequest/CreateRequestPage.jsx";
// API Testing component
import ApiTester from "./components/ApiTester.jsx";

import "./App.css";

function App() {
  // Check if we're in development mode
  const _isDevelopment = import.meta.env.DEV;
  const dispatch = useDispatch();
  
  // Load user data from localStorage when the app starts
  useEffect(() => {
    // Check if user data exists in localStorage but userId is missing
    const fixUserDataIfNeeded = () => {
      const userData = localStorage.getItem('user');
      const userId = localStorage.getItem('userId');
      
      if (userData && !userId) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id) {
            console.log('Found user ID in user object, setting userId in localStorage:', parsedUser.id);
            localStorage.setItem('userId', parsedUser.id);
          } else {
            console.warn('User object exists but has no ID:', parsedUser);
          }
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
        }
      }
    };
    
    fixUserDataIfNeeded();
    dispatch(loadUserFromStorage());
    
    // Log authentication state after loading
    console.log('Auth state initialized with:', {
      userId: localStorage.getItem('userId'),
      user: localStorage.getItem('user'),
      isAuthenticated: !!localStorage.getItem('token')
    });
  }, [dispatch]);

  return (
    <Router>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {" "}
        <Routes>
          {/* Protected/Layout Routes */}
          <Route element={<MainLayout />}>
            {/* Home Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<HomeDashboard />} />

            {/* Categories Routes */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<Categories />} />

            {/* Request Routes */}
            <Route path="/requests" element={<Requests />} />
            <Route path="/requests/:requestId" element={<RequestDetail />} />
            <Route
              path="/requests/filter/urgency/:urgency"
              element={<Requests />}
            />
            <Route
              path="/create-request"
              element={<div>Create Request Form</div>}
            />

            {/* Task Routes */}
            <Route path="/tasks" element={<TaskListPage />} />
            <Route path="/tasks/:taskId" element={<TaskPage />} />
            <Route
              path="/volunteer/tasks/:taskId"
              element={<TaskPageVolunteer />}
            />
            <Route
              path="/tasks/:taskId/select-volunteer"
              element={<SelectVolunteerPage />}
            />

            {/* Review Routes */}
            <Route path="/rate-review/:taskId" element={<RateReviewPage />} />

            {/* Search Routes */}
            <Route path="/search" element={<SearchResults />} />

            {/* Theme Demo */}
            <Route path="/theme" element={<ThemeDemo />} />

            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/create-request" element={<CreateRequestPage />} />
          </Route>
          {/* Auth Routes (without sidebar) */}{" "}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* API Tester - remove in production */}
          <Route path="/api-test" element={<ApiTester />} />
        </Routes>
        {/* Dev User Panel - Only shown in development mode */}
        {/*isDevelopment && <DevUserPanel />*/}
      </Box>
    </Router>
  );
}

export default App;
