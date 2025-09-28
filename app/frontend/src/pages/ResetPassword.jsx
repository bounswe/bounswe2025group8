import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth"; // Updated import path
import logoImage from "../assets/logo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  const { resetPassword, verifyToken, loading, error } = useAuth(); // Now using Redux state
  const navigate = useNavigate();
  const { token } = useParams(); // Get the token from the URL

  // Verify token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        try {
          const result = await verifyToken(token);
          setIsTokenValid(true);
          setTokenChecked(true);
        } catch (error) {
          setIsTokenValid(false);
          setTokenChecked(true);
          setResetError(
            "Invalid or expired token. Please request a new password reset link."
          );
        }
      } else {
        setIsTokenValid(false);
        setTokenChecked(true);
        setResetError(
          "No reset token provided. Please request a password reset from the login page."
        );
      }
    };

    checkToken();
  }, [token, verifyToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setResetError("Passwords don't match");
    }

    if (!isTokenValid) {
      return setResetError(
        "Invalid or expired token. Please request a new password reset."
      );
    }

    try {
      setResetError("");
      setSuccessMessage("");
      const result = await resetPassword(password, token);

      if (result && result.success) {
        setSuccessMessage("Password has been reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setResetError(
        "Failed to reset password: " + (error.message || "Reset failed")
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
            mb: 3, // Reduced from mb: 6 to mb: 3
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

        <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
            }}
          >
            <Box sx={{ width: "100%", mt: 1 }}>
              <Typography variant="body1" sx={{ mb: 1.5 }}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your new password
              </Typography>

              {/* Show either the reset error or the Redux error */}
              {(resetError || error) && (
                <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                  {resetError || error}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
                  {successMessage}
                </Alert>
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
                  name="password"
                  placeholder="New Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
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

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1,
                    bgcolor: "#6366f1",
                    "&:hover": {
                      bgcolor: "#4f46e5",
                    },
                  }}
                  disabled={loading}
                >
                  Reset Password
                </Button>

                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    sx={{ color: "#6366f1" }}
                  >
                    Back to login
                  </Link>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
