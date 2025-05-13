import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Link,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth  from "../../hooks/useAuth";
import logoImage from "../../assets/logo.png";
import mailIcon from "../../assets/mail.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { forgotPassword, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setForgotError("");
      setSuccessMessage("");
      const result = await forgotPassword(email);
      setSuccessMessage("Password reset link sent to your email!");
    } catch (error) {
      setForgotError("Failed to reset password: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#ffffff",
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
            mb: 1,
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
              <Typography fontWeight="bold" variant="body1" sx={{ mb: 1.5 }}>
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your email and we'll send you a link to reset your
                password
              </Typography>

              {/* Show either the forgot error or the Redux error */}
              {(forgotError || error) && (
                <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
                  {forgotError || error}
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
                  Send Reset Link
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

export default ForgotPassword;
