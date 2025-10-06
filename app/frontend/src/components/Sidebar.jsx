import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
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
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip, IconButton } from "@mui/material";
// import UserAvatar from "./UserAvatar.jsx";
import logo from "../assets/logo.png";
import useAuth from "../features/authentication/hooks/useAuth";
// import { logout } from "../store/slices/authSlice";
// import { logout as logoutService } from "../services/authService";

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
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
    <Box
      sx={{
        width: 260,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 80,
          cursor: "pointer",
          "&:hover": {
            opacity: 0.9,
          },
        }}
        onClick={() => navigate("/")}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            maxHeight: "100px",
            maxWidth: "100%",
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: theme.shape.borderRadius,
                  mb: 1,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main, // Changed to primary.main for a stronger color
                    color: "#FFFFFF", // White text for selected items
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "40px",
                    color: isActive ? "#FFFFFF" : "inherit", // White icon when active
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#FFFFFF" : "inherit", // White text when active
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Create Request Button */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => {
            // If not logged in, redirect to login
            if (!isAuthenticated) {
              navigate("/login", { state: { from: "/create-request" } });
            } else {
              navigate("/create-request");
            }
          }}
          fullWidth
          sx={{
            textTransform: "none",
            borderRadius: "24px",
            py: 1.2,
            boxShadow: theme.shadows[3],
          }}
        >
          Create Request
        </Button>
      </Box>

      {/* Push content to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Authentication Buttons for non-authenticated users */}
      {!isAuthenticated && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<LoginIcon />}
            onClick={() => navigate("/login")}
            fullWidth
            sx={{ textTransform: "none" }}
          >
            Login
          </Button>
          <Button
            variant="text"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/register")}
            fullWidth
            sx={{ textTransform: "none" }}
          >
            Sign Up
          </Button>
        </Box>
      )}

      {/* User Profile section */}
      {isAuthenticated && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
          }}
        >
          {/* Avatar on the left */}
          <Box
            sx={{
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
            }}
            onClick={() => navigate(`/profile/${currentUser?.id}`)}
          >
            <Box
              component="img"
              src={currentUser?.avatar || currentUser?.profilePicture || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt="User"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </Box>

          {/* Username and buttons on the right */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              ml: 1,
              gap: 0.5,
            }}
          >
            {/* Username */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "medium",
                fontSize: "0.9rem",
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
              onClick={() => navigate(`/profile/${currentUser?.id}`)}
            >
              {currentUser?.name || "User"}
            </Typography>

            {/* Buttons below username */}            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Tooltip title="Notifications">
                <IconButton
                  size="small"
                  sx={{ p: 0.5, mr: 1 }}
                  onClick={() => navigate("/notifications")}
                >
                  <NotificationsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton
                  size="small"
                  sx={{ p: 0.5, mr: 1 }}
                  onClick={() => navigate("/settings")}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton
                  size="small"
                  sx={{ p: 0.5, color: theme.palette.error.main }}
                  onClick={handleLogout}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
