import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { Provider } from "react-redux";
import { store } from "./store/index";
import TaskDetailComponent from "./components/TaskDetailComponent";
import TaskDetailVolunteer from "./components/TaskDetailVolunteer";
import SelectVolunteerPage from "./pages/SelectVolunteerPage";
import RateReviewPage from "./pages/RateReviewPage";
import TaskListPage from "./pages/TaskListPage";
import TaskPage from "./pages/TaskPage";
import TaskPageVolunteer from "./pages/TaskPageVolunteer";
import HomeDashboard from "./pages/HomeDashboard";
import MainLayout from "./layouts/MainLayout";

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
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Main layout routes */}{" "}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomeDashboard />} />{" "}
            <Route path="/tasks" element={<TaskListPage />} />
            <Route
              path="/tasks/volunteer/:taskId"
              element={<TaskPageVolunteer />}
            />
            <Route path="/tasks/:taskId" element={<TaskPage />} />
            <Route
              path="/tasks/:taskId/select-volunteer"
              element={<SelectVolunteerPage />}
            />
            <Route
              path="/tasks/:taskId/rate-review"
              element={<RateReviewPage />}
            />
          </Route>
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
