import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { Provider } from "react-redux";
import { store } from "./store/index";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Authentication routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Default routes */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
