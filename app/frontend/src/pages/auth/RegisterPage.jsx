import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Link,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Paper,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Updated import path
import logoImage from "../../assets/logo.png";
import userIcon from "../../assets/user.svg";
import keyIcon from "../../assets/key_for_register.svg";
import phoneIcon from "../../assets/phone.svg";
import mailIcon from "../../assets/mail.svg";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const { register, loading, error } = useAuth(); // Now using Redux state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      return setRegisterError("You must agree to the Terms & Conditions");
    }
    try {
      setRegisterError("");
      await register(email, password, fullName, username, phone);
      navigate("/"); // Redirect to home dashboard after registration
    } catch (error) {
      setRegisterError("Failed to create an account: " + error.message);
    }
  };

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
                  variant="text"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: "#6366f1",
                    bgcolor: "white",
                    px: 4,
                    py: 1,
                    borderRadius: 0,
                  }}
                >
                  LOGIN
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  component={RouterLink}
                  to="/register"
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
                  REGISTER
                </Button>
              </Box>
            </Box>

            <Box sx={{ width: "100%" }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 0.5 }}
              >
                Create an account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your details to register for the app
              </Typography>

              {/* Show either the register error or the Redux error */}
              {(registerError || error) && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {registerError || error}
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
                  id="fullName"
                  placeholder="Full Name"
                  name="fullName"
                  autoComplete="name"
                  autoFocus
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img src={userIcon} alt="Name" width="16" height="16" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  placeholder="Username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={userIcon}
                          alt="Username"
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
                  id="phone"
                  placeholder="Phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={phoneIcon}
                          alt="Phone"
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
                  id="email"
                  placeholder="Email"
                  name="email"
                  autoComplete="email"
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={keyIcon}
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

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      name="agreeTerms"
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree with{" "}
                      <Link
                        component="button"
                        variant="body2"
                        sx={{ color: "#6366f1" }}
                      >
                        Terms & Conditions
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 2 }}
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
                  Sign Up
                </Button>
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

export default RegisterPage;
