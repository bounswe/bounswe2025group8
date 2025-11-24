import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../features/authentication/hooks/useAuth";
import logoImage from "../assets/logo.png";
import { useTheme } from "../hooks/useTheme";
import EmailIcon from "@mui/icons-material/Email";

const ForgotPassword = () => {
  const { colors, theme, setTheme } = useTheme();
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

      if (result && result.success) {
        setSuccessMessage("Password reset link sent to your email!");

        // In development mode, if token is returned, show it
        if (result.token) {
          console.log("DEV MODE TOKEN:", result.token);
          // You could display the token in the UI for development purposes
        }
      }
    } catch (error) {
      setForgotError(
        "Failed to reset password: " + (error.message || "Request failed")
      );
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
        aria-labelledby="forgot-page-title"
        className="w-full max-w-sm mx-auto"
      >
        {/* Logo and Title updated to be side by side */}
        <div className="flex flex-row items-center justify-center mb-1">
          <img src={logoImage} alt="Logo" width="160" height="160" />
          <h1
            className="text-4xl font-bold ml-2"
            style={{ color: colors.text.primary }}
            id="forgot-page-title"
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
          <div className="flex flex-col items-center p-4">
            <div className="w-full mt-1">
              <p
                className="font-bold text-base mb-1.5"
                style={{ color: colors.text.primary }}
              >
                Forgot Password
              </p>
              <p
                className="text-sm mb-3"
                style={{ color: colors.text.secondary }}
              >
                Enter your email and we'll send you a link to reset your
                password
              </p>

              {/* Show either the forgot error or the Redux error */}
              {(forgotError || error) && (
                <div
                  className="mb-2 w-full p-3 border rounded-md"
                  style={{
                    backgroundColor: colors.semantic.errorBackground,
                    borderColor: colors.semantic.error,
                  }}
                  role="alert"
                  aria-live="assertive"
                >
                  <p
                    className="text-sm"
                    style={{ color: colors.semantic.error }}
                  >
                    {forgotError || error}
                  </p>
                </div>
              )}

              {successMessage && (
                <div
                  className="mb-2 w-full p-3 border rounded-md"
                  style={{
                    backgroundColor: colors.semantic.successBackground,
                    borderColor: colors.semantic.success,
                  }}
                  role="alert"
                  aria-live="polite"
                >
                  <p
                    className="text-sm"
                    style={{ color: colors.semantic.success }}
                  >
                    {successMessage}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="w-full">
                <div className="relative mt-2 mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailIcon style={{ fontSize: 16 }} />
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
                    required
                    className="w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:outline-none"
                    style={{
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      borderColor: colors.border.primary,
                    }}
                    onFocus={(e) =>
                      (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                    }
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                    id="email"
                    placeholder="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-required="true"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-1 mb-2 py-3 font-medium rounded-full transition-colors disabled:opacity-50"
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
                  disabled={loading}
                >
                  Send Reset Link
                </button>

                <div className="text-center mb-2">
                  <RouterLink
                    to="/login"
                    className="text-sm transition-colors"
                    style={{ color: colors.brand.primary }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.color = colors.brand.secondary)
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = colors.brand.primary)
                    }
                  >
                    Back to login
                  </RouterLink>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
