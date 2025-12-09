import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../features/authentication/hooks/useAuth";
import logoImage from "../assets/logo.png";
import { useTheme } from "../hooks/useTheme";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const LoginPage = () => {
  const { colors, theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
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
        setLoginError(t("invalidCredentials"));
      }
    } catch (error) {
      setLoginError(
        t("failedToSignIn") + ": " + (error.message || t("invalidCredentials"))
      );
    }
  };

  // The rest of the component remains the same
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Theme and Language Toggle Buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* Language Selector */}
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="px-3 py-2 rounded-md border text-sm focus:outline-none"
          aria-label={t("changeLanguage")}
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
          <option value="en">{t("english")}</option>
          <option value="tr">{t("turkish")}</option>
        </select>

        {/* Theme Selector */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="px-3 py-2 rounded-md border text-sm focus:outline-none"
          aria-label={t("themeSelection")}
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
          <option value="light">{t("lightMode")}</option>
          <option value="dark">{t("darkMode")}</option>
          <option value="high-contrast">{t("highContrast")}</option>
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
                  {t("login").toUpperCase()}
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
                  {t("register").toUpperCase()}
                </RouterLink>
              </div>
            </div>
            <div className="w-full">
              <h2
                className="text-lg font-bold mb-1"
                style={{ color: colors.text.primary }}
              >
                {t("welcomeBack")}
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: colors.text.secondary }}
              >
                {t("enterDetailsToSignIn")}
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
                  {t("registrationSuccessful")}
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
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t("email")}
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
                      {t("password")}
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder={t("password")}
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
                          showPassword ? t("hidePassword") : t("showPassword")
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
                      {t("rememberMe")}
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
                  {t("login")}
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
                    {t("forgotMyPassword")}
                  </RouterLink>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center my-4">
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            {t("or")}
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
            {t("continueAsGuest")}
          </RouterLink>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
