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
import { useTheme } from "../hooks/useTheme";
// import { logout } from "../store/slices/authSlice";
// import { logout as logoutService } from "../services/authService";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, userRole, logout } = useAuth();
  const { colors, theme } = useTheme();

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

  return (
    <div
      className="w-64 h-screen flex flex-col fixed left-0 top-0 z-50 overflow-y-auto"
      style={{
        borderRight: `1px solid ${colors.border.primary}`,
        backgroundColor: colors.background.elevated,
      }}
    >
      {/* Logo */}
      <div
        className="p-4 flex justify-center items-center h-20 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => navigate("/")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate("/");
          }
        }}
        aria-label="Go to home page"
      >
        <img
          src={logo}
          alt="Neighborhood Assistance Board Logo"
          className="max-h-24 max-w-full"
        />
      </div>

      {/* Navigation Menu */}
      <nav
        className="px-4 py-2"
        role="navigation"
        aria-label="Primary navigation"
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div key={item.text} className="mb-2">
              <button
                onClick={() => navigate(item.path)}
                className="w-full flex items-center px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive
                    ? theme === "high-contrast"
                      ? "#1E40AF"
                      : colors.brand.primary
                    : "transparent",
                  color: isActive ? "#FFFFFF" : colors.text.primary,
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                onFocus={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = "none";
                  }
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className="mr-3 min-w-[24px]"
                  style={{
                    color: isActive ? "#FFFFFF" : colors.text.secondary,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontWeight: isActive ? "500" : "400",
                    color: isActive ? "#FFFFFF" : colors.text.primary,
                  }}
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
          className="w-full flex items-center justify-center px-4 py-3 rounded-full transition-colors shadow-md"
          style={{
            backgroundColor:
              theme === "high-contrast" ? "#1E40AF" : colors.brand.primary,
            color: "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              theme === "high-contrast" ? "#1E40AF" : colors.brand.primaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              theme === "high-contrast" ? "#1E40AF" : colors.brand.primary;
          }}
          onFocus={(e) => {
            if (theme === "high-contrast") {
              e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
              e.currentTarget.style.outlineOffset = "2px";
            }
          }}
          onBlur={(e) => {
            if (theme === "high-contrast") {
              e.currentTarget.style.outline = "none";
            }
          }}
          aria-label="Create new request"
        >
          <AddCircleOutlineIcon className="mr-2" />
          Create Request
        </button>
      </div>

      {/* Push content to bottom */}
      <div className="flex-grow" />

      {/* Authentication Buttons for non-authenticated users */}
      {!isAuthenticated && (
        <div
          className="p-4 flex flex-col gap-2"
          style={{ borderTop: `1px solid ${colors.border.primary}` }}
        >
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors"
            style={{
              border: `1px solid ${colors.brand.primary}`,
              color: colors.brand.primary,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.interactive.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onFocus={(e) => {
              if (theme === "high-contrast") {
                e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                e.currentTarget.style.outlineOffset = "2px";
              }
            }}
            onBlur={(e) => {
              if (theme === "high-contrast") {
                e.currentTarget.style.outline = "none";
              }
            }}
            aria-label="Login to your account"
          >
            <LoginIcon className="mr-2" />
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="w-full flex items-center justify-center px-4 py-2 transition-colors"
            style={{
              color: colors.brand.primary,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.interactive.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onFocus={(e) => {
              if (theme === "high-contrast") {
                e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                e.currentTarget.style.outlineOffset = "2px";
              }
            }}
            onBlur={(e) => {
              if (theme === "high-contrast") {
                e.currentTarget.style.outline = "none";
              }
            }}
            aria-label="Sign up for a new account"
          >
            <PersonAddIcon className="mr-2" />
            Sign Up
          </button>
        </div>
      )}

      {/* User Profile section */}
      {isAuthenticated && (
        <div
          className="p-4 flex"
          style={{ borderTop: `1px solid ${colors.border.primary}` }}
        >
          {/* Avatar on the left */}
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/profile/${currentUser?.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/profile/${currentUser?.id}`);
              }
            }}
            onFocus={(e) => {
              if (theme === "high-contrast") {
                e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                e.currentTarget.style.outlineOffset = "2px";
                e.currentTarget.style.borderRadius = "9999px";
              }
            }}
            onBlur={(e) => {
              if (theme === "high-contrast") {
                e.currentTarget.style.outline = "none";
              }
            }}
            aria-label="View your profile"
          >
            <img
              src={
                currentUser?.avatar ||
                currentUser?.profilePicture ||
                "https://randomuser.me/api/portraits/men/32.jpg"
              }
              alt={`${currentUser?.name || "User"}'s avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          {/* Username and buttons on the right */}
          <div className="flex flex-col ml-2 gap-1">
            {/* Username */}
            <h3
              className="font-medium text-sm cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/profile/${currentUser?.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/profile/${currentUser?.id}`);
                }
              }}
              onFocus={(e) => {
                if (theme === "high-contrast") {
                  e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }
              }}
              onBlur={(e) => {
                if (theme === "high-contrast") {
                  e.currentTarget.style.outline = "none";
                }
              }}
              style={{ color: colors.text.primary }}
            >
              {currentUser?.name && currentUser?.surname
                ? `${currentUser.name} ${currentUser.surname}`
                : currentUser?.name || "User"}
            </h3>

            {/* Buttons below username */}
            <div className="flex items-center">
              <button
                title="Notifications"
                className="p-1 mr-2 rounded transition-colors"
                onClick={() => navigate("/notifications")}
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.interactive.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onFocus={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = "none";
                  }
                }}
                aria-label="View notifications"
              >
                <NotificationsIcon fontSize="small" />
              </button>
              <button
                title="Settings"
                className="p-1 mr-2 rounded transition-colors"
                onClick={() => navigate("/settings")}
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.interactive.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onFocus={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = "none";
                  }
                }}
                aria-label="Go to settings"
              >
                <SettingsIcon fontSize="small" />
              </button>
              <button
                title="Logout"
                className="p-1 rounded transition-colors"
                onClick={handleLogout}
                style={{ color: colors.semantic.error }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.semantic.errorBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onFocus={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  if (theme === "high-contrast") {
                    e.currentTarget.style.outline = "none";
                  }
                }}
                aria-label="Logout from your account"
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
