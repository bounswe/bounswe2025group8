import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../features/authentication/hooks/useAuth";
import logoImage from "../assets/logo.png";
import lockIcon from "../assets/lock.svg";
import mailIcon from "../assets/mail.svg";
import { useTheme } from "../hooks/useTheme";

// Eye icons for password visibility (you may need to replace these with actual SVG icons or use different icons)
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
      clipRule="evenodd"
    />
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
  </svg>
);

const LoginPage = () => {
  const { colors, theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(""); // Renamed to avoid conflict
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // If useAuth exists use it, otherwise provide basic fallbacks so the page still renders
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const success = await login({ email, password });

      if (success) {
        navigate("/"); // Only redirect on successful login
      } else {
        setLoginError(
          "Invalid credentials. Please check your email and password."
        );
      }
    } catch (error) {
      setLoginError(
        "Failed to sign in: " + (error.message || "Invalid credentials")
      );
    }
  };

  // The rest of the component remains the same
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
        aria-labelledby="login-page-title"
        className="w-full max-w-md"
      >
        {/* Logo and Title updated to be side by side */}
        <div className="flex flex-row items-center justify-center mb-1">
          <img src={logoImage} alt="Logo" width="160" height="160" />
          <h1
            className="text-4xl font-bold ml-2"
            style={{ color: colors.text.primary }}
            id="login-page-title"
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
                    backgroundColor: colors.brand.primary,
                    color: colors.text.inverted,
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
                  LOGIN
                </RouterLink>
                <RouterLink
                  to="/register"
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
                  REGISTER
                </RouterLink>
              </div>
            </div>
            <div className="w-full">
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: colors.text.primary }}
              >
                Welcome back
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: colors.text.secondary }}
              >
                Enter your details to sign in to your account
              </p>

              {/* Show registration success message if applicable */}
              {registrationSuccess && (
                <div
                  className="mb-4 w-full p-3 border rounded"
                  style={{
                    backgroundColor: colors.semantic.successBackground,
                    borderColor: colors.semantic.success,
                    color: colors.semantic.success,
                  }}
                  role="alert"
                  aria-live="assertive"
                >
                  Registration successful! You can now log in with your
                  credentials.
                </div>
              )}

              {/* Show either the login error or the Redux error */}
              {(loginError || error) && (
                <p
                  className="mb-4"
                  style={{ color: colors.semantic.error }}
                  role="alert"
                  aria-live="assertive"
                >
                  {loginError || error}
                </p>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="w-full"
                aria-describedby={
                  loginError || error ? "login-error" : undefined
                }
              >
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img
                        src={mailIcon}
                        alt=""
                        aria-hidden="true"
                        width="16"
                        height="16"
                        style={{
                          filter:
                            theme === "light"
                              ? "brightness(0) saturate(100%) invert(0.3) sepia(100%) hue-rotate(0deg)"
                              : "brightness(0) invert(1)",
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
                      autoFocus
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
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img
                        src={lockIcon}
                        alt=""
                        aria-hidden="true"
                        width="16"
                        height="16"
                        style={{
                          filter:
                            theme === "light"
                              ? "brightness(0) saturate(100%) invert(0.3) sepia(100%) hue-rotate(0deg)"
                              : "brightness(0) invert(1)",
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
                      autoComplete="current-password"
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
                      aria-required="true"
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
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{
                        accentColor: colors.brand.primary,
                        borderColor: colors.border.primary,
                      }}
                    />
                    <span
                      className="ml-2 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      Remember me
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 mb-4 py-3 px-4 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: loading
                      ? colors.interactive.disabled
                      : colors.brand.primary,
                    color: colors.text.inverted,
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
                  Login
                </button>

                <div className="text-center mb-4">
                  <RouterLink
                    to="/forgot-password"
                    className="text-sm no-underline"
                    style={{ color: colors.brand.primary }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = colors.brand.secondary)
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = colors.brand.primary)
                    }
                  >
                    Forgot my password
                  </RouterLink>
                </div>
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

export default LoginPage;
