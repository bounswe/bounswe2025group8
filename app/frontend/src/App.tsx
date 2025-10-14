import './App.css'
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Test from "./pages/Test.tsx";
import MainLayout from "./layouts/MainLayout.jsx";
import CreateRequestPage from "./pages/CreateRequestPage.jsx";
import AllRequests from "./pages/AllRequests.jsx";
import Categories from "./pages/Categories.jsx";
import RequestDetail from "./pages/RequestDetail.jsx";
import SelectVolunteer from "./pages/SelectVolunteer.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* All other routes use MainLayout which renders an <Outlet /> */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/create-request" element={<CreateRequestPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/requests" element={<AllRequests />} />
          <Route path="/requests/:requestId" element={<RequestDetail />} />
          <Route path="/requests/:requestId/select-volunteer" element={<SelectVolunteer />} />

          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
