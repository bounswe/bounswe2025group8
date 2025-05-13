import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth"; // Updated import path
import logoImage from "../../assets/logo.png";
import lockIcon from "../../assets/lock.svg";
import mailIcon from "../../assets/mail.svg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(""); // Renamed to avoid conflict
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { login, loading, error } = useAuth(); // Now getting loading and error from Redux
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user just registered
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("registered") === "true") {
      setRegistrationSuccess(true);
    }
  }, [location]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoginError("");
      await login({ email, password });
      navigate("/"); // Redirect to home dashboard after login
    } catch (error) {
      setLoginError(
        "Failed to sign in: " + (error.message || "Invalid credentials")
      );
    }
  };

  // The rest of the component remains the same
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#ffffff", // Changed from #f8fafc to white
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        {/* Logo and Title updated to be side by side */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            mb: 1, // Reduced from mb: 6 to mb: 3
          }}
        >
          <img src={logoImage} alt="Logo" width="160" height="160" />
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ ml: 2 }}
          >
            Neighborhood
            <br />
            Assistance Board
          </Typography>
        </Box>
        <Paper
          elevation={3}
          sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "white" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
            }}
          >
            {/* Tab buttons - Updated to match the second image design */}
            <Box
              sx={{
                width: "100%",
                mb: 3,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  border: "1px solid #6366f1",
                  borderRadius: "4px",
                  overflow: "hidden",
                  width: "fit-content",
                }}
              >
                <Button
                  variant="contained"
                  disableElevation
                  component={RouterLink}
                  to="/login"
                  sx={{
                    bgcolor: "#6366f1",
                    color: "#fff",
                    px: 4,
                    py: 1,
                    borderRadius: 0,
                    "&:hover": {
                      bgcolor: "#4f46e5",
                    },
                  }}
                >
                  LOGIN
                </Button>
                <Button
                  variant="text"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: "#6366f1",
                    bgcolor: "white",
                    px: 4,
                    py: 1,
                    borderRadius: 0,
                  }}
                >
                  REGISTER
                </Button>
              </Box>
            </Box>

            <Box sx={{ width: "100%" }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 0.5 }}
                fontWeight="bold"
              >
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your details to sign in to your account
              </Typography>

              {/* Show registration success message if applicable */}
              {registrationSuccess && (
                <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
                  Registration successful! You can now log in with your
                  credentials.
                </Alert>
              )}

              {/* Show either the login error or the Redux error */}
              {(loginError || error) && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {loginError || error}
                </Typography>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  placeholder="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={mailIcon}
                          alt="Email"
                          width="16"
                          height="16"
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={lockIcon}
                          alt="Password"
                          width="16"
                          height="16"
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="remember"
                        color="primary"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Remember me</Typography>}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.2,
                    bgcolor: "#6366f1",
                    borderRadius: "50px",
                    "&:hover": {
                      bgcolor: "#4f46e5",
                    },
                  }}
                  disabled={loading}
                >
                  Login
                </Button>

                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{ color: "#6366f1" }}
                  >
                    Forgot my password
                  </Link>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
        <Box sx={{ textAlign: "center", my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Box>{" "}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Link
            component={RouterLink}
            to="/"
            variant="body2"
            sx={{ color: "#6366f1", textDecoration: "none" }}
          >
            Continue as a guest
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
