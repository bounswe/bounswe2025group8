import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  ListAlt as ListAltIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logoImage from "../../assets/logo.png";

const Layout = ({ children, userType = "requester" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomValue, setBottomValue] = useState(0);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Configure navigation items based on user type
  let navItems = [];
  let bottomNavItems = [];

  if (userType === "requester") {
    navItems = [
      {
        text: "My Requests",
        path: "/requester/dashboard",
        icon: <ListAltIcon />,
      },
      { text: "Create Request", path: "/requester/create", icon: <AddIcon /> },
      { text: "Settings", path: "/requester/settings", icon: <SettingsIcon /> },
    ];

    bottomNavItems = [
      {
        label: "Requests",
        path: "/requester/dashboard",
        icon: <ListAltIcon />,
      },
      { label: "Create", path: "/requester/create", icon: <AddIcon /> },
      {
        label: "Profile",
        path: "/requester/profile",
        icon: <AccountCircleIcon />,
      },
    ];
  } else if (userType === "volunteer") {
    navItems = [
      {
        text: "Available Tasks",
        path: "/volunteer/available",
        icon: <ListAltIcon />,
      },
      {
        text: "My Tasks",
        path: "/volunteer/my-tasks",
        icon: <PersonAddIcon />,
      },
      { text: "Settings", path: "/volunteer/settings", icon: <SettingsIcon /> },
    ];

    bottomNavItems = [
      {
        label: "Available",
        path: "/volunteer/available",
        icon: <ListAltIcon />,
      },
      {
        label: "My Tasks",
        path: "/volunteer/my-tasks",
        icon: <PersonAddIcon />,
      },
      {
        label: "Profile",
        path: "/volunteer/profile",
        icon: <AccountCircleIcon />,
      },
    ];
  }

  // Find current active bottom nav item based on path
  const getCurrentNavIndex = () => {
    const currentPath = location.pathname;
    const index = bottomNavItems.findIndex((item) =>
      currentPath.includes(item.path)
    );
    return index >= 0 ? index : 0;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="static"
        color="default"
        elevation={1}
        sx={{ backgroundColor: "white" }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              color: "#6C63FF",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() =>
              navigate(
                userType === "requester"
                  ? "/requester/dashboard"
                  : "/volunteer/available"
              )
            }
          >
            <Box
              component="img"
              src={logoImage}
              alt="Logo"
              sx={{ height: 28, mr: 1 }}
            />
            Neighbor Help
          </Typography>

          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {navItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                sx={{
                  mx: 1,
                  color: location.pathname.includes(item.path)
                    ? "#6C63FF"
                    : "inherit",
                  "&:hover": { color: "#6C63FF" },
                }}
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              src={
                currentUser?.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentUser?.fullName || currentUser?.name || "User"
                )}`
              }
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer for Mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              src={
                currentUser?.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentUser?.fullName || currentUser?.name || "User"
                )}`
              }
              sx={{ width: 80, height: 80, mb: 1 }}
            />
            <Typography variant="h6" align="center">
              {currentUser?.fullName || currentUser?.name || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {currentUser?.email || ""}
            </Typography>
          </Box>

          <Divider />

          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname.includes(item.path)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "rgba(108, 99, 255, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(108, 99, 255, 0.2)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname.includes(item.path)
                      ? "#6C63FF"
                      : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: location.pathname.includes(item.path)
                      ? "#6C63FF"
                      : "inherit",
                  }}
                />
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate(`/${userType}/profile`);
          }}
        >
          <AccountCircleIcon sx={{ mr: 1 }} /> My Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate(`/${userType}/settings`);
          }}
        >
          <SettingsIcon sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Container
        component="main"
        maxWidth="md"
        sx={{
          flexGrow: 1,
          py: { xs: 2, sm: 3 },
          mb: { xs: 7, sm: 0 }, // Add bottom margin for mobile to account for bottom navigation
        }}
      >
        {children}
      </Container>

      {/* Bottom Navigation for Mobile */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "block", sm: "none" },
          zIndex: 1000,
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={getCurrentNavIndex()}
          onChange={(_, newValue) => {
            setBottomValue(newValue);
            navigate(bottomNavItems[newValue].path);
          }}
        >
          {bottomNavItems.map((item, index) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              sx={{
                "&.Mui-selected": {
                  color: "#6C63FF",
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default Layout;
