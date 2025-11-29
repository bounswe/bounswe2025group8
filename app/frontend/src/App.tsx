import './App.css'
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Home from "./pages/Home.jsx";
import Test from "./pages/Test.tsx";
import Settings from "./pages/Settings";
import MainLayout from "./layouts/MainLayout.jsx";
import CreateRequestPage from "./pages/CreateRequestPage.jsx";
import AllRequests from "./pages/AllRequests.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Categories from "./pages/Categories.jsx";
import RequestDetail from "./pages/RequestDetail.jsx";
import SelectVolunteer from "./pages/SelectVolunteer.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminAllRequests from "./pages/Admin/AdminAllRequests.jsx";
import AdminTaskReports from "./pages/Admin/AdminTaskReports.jsx";
import AdminUserReports from "./pages/Admin/AdminUserReports.jsx";
import AdminReportedUsers from "./pages/Admin/AdminReportedUsers.jsx";
import Notifications from './pages/Notifications.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import RouteFocusHandler from './components/RouteFocusHandler'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <RouteFocusHandler />
        <Routes>
          {/* Public/auth routes (outside main layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* All other routes use MainLayout which renders an <Outlet /> */}
          <Route path="/" element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/create-request" element={<CreateRequestPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/requests" element={<AllRequests />} />
            <Route path="/requests/:requestId" element={<RequestDetail />} />
            <Route path="/requests/:requestId/select-volunteer" element={<SelectVolunteer />} />

            <Route path="/profile/:userId" element={<ProfilePage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/requests" element={<AdminAllRequests />} />
            <Route path="/admin/task-reports" element={<AdminTaskReports />} />
            <Route path="/admin/user-reports" element={<AdminUserReports />} />
            <Route path="/admin/reported-users" element={<AdminReportedUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
