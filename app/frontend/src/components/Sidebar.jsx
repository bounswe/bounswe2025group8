import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoginIcon from "@mui/icons-material/Login";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DataObjectIcon from "@mui/icons-material/DataObject";
// import UserAvatar from "./UserAvatar.jsx";
import logo from "../assets/logo.png";
import useAuth from "../features/authentication/hooks/useAuth";
// import { logout } from "../store/slices/authSlice";
// import { logout as logoutService } from "../services/authService";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Categories", icon: <CategoryIcon />, path: "/categories" },
    { text: "Requests", icon: <AssignmentIcon />, path: "/requests" },
  ];
  // Add role-based menu items
  if (userRole === "admin") {
    menuItems.push({
      text: "Admin Panel",
      icon: <AdminPanelSettingsIcon />,
      path: "/admin",
    });
  }

  // Add MockDataDemo menu item in development mode
  if (import.meta.env.DEV) {
    menuItems.push({
      text: "Mock Data Demo",
      icon: <DataObjectIcon />,
      path: "/mock-data",
    });
  }

  return (
    <div className="w-64 h-screen flex flex-col border-r border-gray-200 bg-white fixed left-0 top-0 z-50 overflow-y-auto">
      {/* Logo */}
      <div
        className="p-4 flex justify-center items-center h-20 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="Logo" className="max-h-24 max-w-full" />
      </div>

      {/* Navigation Menu */}
      <nav className="px-4 py-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div key={item.text} className="mb-2">
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`mr-3 min-w-[24px] ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`${
                    isActive ? "font-medium text-white" : "font-normal"
                  }`}
                >
                  {item.text}
                </span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Create Request Button */}
      <div className="p-4">
        <button
          onClick={() => {
            // If not logged in, redirect to login
            if (!isAuthenticated) {
              navigate("/login", { state: { from: "/create-request" } });
            } else {
              navigate("/create-request");
            }
          }}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
        >
          <AddCircleOutlineIcon className="mr-2" />
          Create Request
        </button>
      </div>

      {/* Push content to bottom */}
      <div className="flex-grow" />

      {/* Authentication Buttons for non-authenticated users */}
      {!isAuthenticated && (
        <div className="p-4 flex flex-col gap-2 border-t border-gray-200">
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <LoginIcon className="mr-2" />
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="w-full flex items-center justify-center px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <PersonAddIcon className="mr-2" />
            Sign Up
          </button>
        </div>
      )}

      {/* User Profile section */}
      {isAuthenticated && (
        <div className="p-4 border-t border-gray-200 flex">
          {/* Avatar on the left */}
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/profile/${currentUser?.id}`)}
          >
            <img
              src={
                currentUser?.avatar ||
                currentUser?.profilePicture ||
                "https://randomuser.me/api/portraits/men/32.jpg"
              }
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          {/* Username and buttons on the right */}
          <div className="flex flex-col ml-2 gap-1">
            {/* Username */}
            <h3
              className="font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/profile/${currentUser?.id}`)}
            >
              {currentUser?.name || "User"}
            </h3>

            {/* Buttons below username */}
            <div className="flex items-center">
              <button
                title="Notifications"
                className="p-1 mr-2 hover:bg-gray-100 rounded transition-colors"
                onClick={() => navigate("/notifications")}
              >
                <NotificationsIcon fontSize="small" />
              </button>
              <button
                title="Settings"
                className="p-1 mr-2 hover:bg-gray-100 rounded transition-colors"
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon fontSize="small" />
              </button>
              <button
                title="Logout"
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                onClick={handleLogout}
              >
                <LogoutIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
