import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useAuth from "../features/authentication/hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import logoImage from "../assets/logo.png";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const RegisterPage = () => {
  const { colors, theme, setTheme } = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation before API call
    if (!agreeTerms) {
      return setRegisterError("You must agree to the Terms & Conditions");
    }

    if (password !== confirmPassword) {
      return setRegisterError("Passwords do not match");
    }

    // Password strength validation (matching backend requirements)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      return setRegisterError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setRegisterError("Please enter a valid email address");
    }

    // Phone number validation (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      return setRegisterError("Phone number must be 10-15 digits");
    }

    // Required fields validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      return setRegisterError("All fields are required");
    }

    try {
      setRegisterError("");

      // All frontend validation passed, now call the API
      const result = await register(
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        confirmPassword
      );

      if (result && result.registered) {
        // Show success message and navigate to login
        navigate("/login");
      }
    } catch (error) {
      // Handle backend validation errors
      if (error.data) {
        // Backend returned specific field errors
        const backendErrors = error.data;
        if (backendErrors.email) {
          setRegisterError(backendErrors.email[0]);
        } else if (backendErrors.username) {
          setRegisterError(`Username: ${backendErrors.username[0]}`);
        } else if (backendErrors.phone_number) {
          setRegisterError(`Phone: ${backendErrors.phone_number[0]}`);
        } else if (backendErrors.password) {
          setRegisterError(backendErrors.password[0]);
        } else if (backendErrors.confirm_password) {
          setRegisterError(backendErrors.confirm_password[0]);
        } else {
          setRegisterError(error.message || "Registration failed");
        }
      } else {
        setRegisterError(
          "Failed to create an account: " +
            (error.message || "Registration failed")
        );
      }
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="px-3 py-2 rounded-md border text-sm focus:outline-none"
          aria-label="Theme selection"
          style={{
            backgroundColor: colors.background.secondary,
            color: colors.text.primary,
            borderColor: colors.border.primary,
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        >
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </div>

      <main
        role="main"
        aria-labelledby="register-page-title"
        className="w-full max-w-md"
      >
        {/* Logo and Title updated to be side by side */}
        <div className="flex flex-row items-center justify-center mb-1">
          <img src={logoImage} alt="Logo" width="160" height="160" />
          <h1
            className="text-4xl font-bold ml-2"
            style={{ color: colors.text.primary }}
            id="register-page-title"
          >
            Neighborhood
            <br />
            Assistance Board
          </h1>
        </div>

        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: colors.background.secondary,
            boxShadow: colors.shadow.medium,
          }}
        >
          <div className="flex flex-col items-center p-8">
            {" "}
            {/* Tab buttons - Updated to match the second image design */}
            <div className="w-full mb-6 flex justify-center">
              <div
                className="flex border rounded overflow-hidden w-fit"
                style={{ borderColor: colors.brand.primary }}
              >
                <RouterLink
                  to="/login"
                  className="px-8 py-2 no-underline transition-colors"
                  style={{
                    color: colors.brand.primary,
                    backgroundColor: colors.background.secondary,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.background.tertiary)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.background.secondary)
                  }
                >
                  LOGIN
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="px-8 py-2 no-underline transition-colors"
                  style={{
                    backgroundColor: colors.brand.primary,
                    color: colors.text.inverse,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.brand.secondary)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      colors.brand.primary)
                  }
                >
                  REGISTER
                </RouterLink>
              </div>
            </div>
            <div className="w-full">
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: colors.text.primary }}
              >
                Create an account
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: colors.text.secondary }}
              >
                Enter your details to register for the app
              </p>

              {/* Show either the register error or the Redux error */}
              {(registerError || error) && (
                <p
                  className="mb-4"
                  style={{ color: colors.semantic.error }}
                  role="alert"
                  aria-live="assertive"
                >
                  {registerError || error}
                </p>
              )}

              <form onSubmit={handleSubmit} noValidate className="w-full">
                {/* First Name and Last Name Row */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PersonIcon
                          style={{
                            fontSize: 16,
                          }}
                        />
                      </div>
                      <label
                        htmlFor="firstName"
                        className="sr-only"
                        style={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          padding: 0,
                          margin: -1,
                          overflow: "hidden",
                          clip: "rect(0, 0, 0, 0)",
                          whiteSpace: "nowrap",
                          border: 0,
                        }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="First Name"
                        autoComplete="given-name"
                        autoFocus
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none text-sm"
                        style={{
                          backgroundColor: colors.background.secondary,
                          color: colors.text.primary,
                          borderColor: colors.border.primary,
                        }}
                        onFocus={(e) =>
                          (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                        }
                        onBlur={(e) => (e.target.style.boxShadow = "none")}
                        aria-required="true"
                      />
                    </div>
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PersonIcon
                          style={{
                            fontSize: 16,
                          }}
                        />
                      </div>
                      <label
                        htmlFor="lastName"
                        className="sr-only"
                        style={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          padding: 0,
                          margin: -1,
                          overflow: "hidden",
                          clip: "rect(0, 0, 0, 0)",
                          whiteSpace: "nowrap",
                          border: 0,
                        }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Surname"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none text-sm"
                        style={{
                          backgroundColor: colors.background.secondary,
                          color: colors.text.primary,
                          borderColor: colors.border.primary,
                        }}
                        onFocus={(e) =>
                          (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                        }
                        onBlur={(e) => (e.target.style.boxShadow = "none")}
                        aria-required="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PersonIcon
                        style={{
                          fontSize: 16,
                        }}
                      />
                    </div>
                    <label
                      htmlFor="username"
                      className="sr-only"
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        padding: 0,
                        margin: -1,
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        border: 0,
                      }}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: colors.border.primary,
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon
                        style={{
                          fontSize: 16,
                        }}
                      />
                    </div>
                    <label
                      htmlFor="phone"
                      className="sr-only"
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        padding: 0,
                        margin: -1,
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        border: 0,
                      }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: colors.border.primary,
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EmailIcon
                        style={{
                          fontSize: 16,
                        }}
                      />
                    </div>
                    <label
                      htmlFor="email"
                      className="sr-only"
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        padding: 0,
                        margin: -1,
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        border: 0,
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: colors.border.primary,
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon
                        style={{
                          fontSize: 16,
                        }}
                      />
                    </div>
                    <label
                      htmlFor="password"
                      className="sr-only"
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        padding: 0,
                        margin: -1,
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        border: 0,
                      }}
                    >
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: colors.border.primary,
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        style={{ color: colors.text.tertiary }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = colors.text.secondary)
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = colors.text.tertiary)
                        }
                      >
                        {showPassword ? (
                          <VisibilityOffIcon style={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityIcon style={{ fontSize: 16 }} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon
                        style={{
                          fontSize: 16,
                        }}
                      />
                    </div>
                    <label
                      htmlFor="confirmPassword"
                      className="sr-only"
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        padding: 0,
                        margin: -1,
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        border: 0,
                      }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none text-sm"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: colors.border.primary,
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="focus:outline-none"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        style={{ color: colors.text.tertiary }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = colors.text.secondary)
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = colors.text.tertiary)
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon style={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityIcon style={{ fontSize: 16 }} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 mr-2 flex-shrink-0"
                      style={{
                        accentColor: colors.brand.primary,
                        borderColor: colors.border.primary,
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      I agree with{" "}
                      <button
                        type="button"
                        className="underline"
                        style={{ color: colors.brand.primary }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = colors.brand.secondary)
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = colors.brand.primary)
                        }
                      >
                        Terms & Conditions
                      </button>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 mb-4 py-3 px-4 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: loading
                      ? colors.interactive.disabled
                      : colors.brand.primary,
                    color: colors.text.inverse,
                  }}
                  onMouseOver={(e) =>
                    !loading &&
                    (e.currentTarget.style.backgroundColor =
                      colors.brand.secondary)
                  }
                  onMouseOut={(e) =>
                    !loading &&
                    (e.currentTarget.style.backgroundColor =
                      colors.brand.primary)
                  }
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                >
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center my-4">
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            OR
          </p>
        </div>

        <div className="text-center mb-8">
          <RouterLink
            to="/"
            className="text-sm no-underline"
            style={{ color: colors.brand.primary }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = colors.brand.secondary)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.color = colors.brand.primary)
            }
          >
            Continue as a guest
          </RouterLink>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
