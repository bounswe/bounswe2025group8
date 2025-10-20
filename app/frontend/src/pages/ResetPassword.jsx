import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import useAuth from "../features/authentication/hooks/useAuth"; // Updated import path
import logoImage from "../assets/logo.png";

// Custom icons to replace Material-UI icons
const VisibilityIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L7.05 7.05m4.242 4.242L12 12l-1.414-1.414m0 0L9.172 9.172"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.25 17.25L6.75 6.75"
    />
  </svg>
);

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
    <div className="flex min-h-screen bg-white items-center justify-center">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo and Title updated to be side by side */}
        <div className="flex flex-row items-center justify-center mb-3">
          <img src={logoImage} alt="Logo" width="160" height="160" />
          <h1 className="text-4xl font-bold ml-2">
            Neighborhood
            <br />
            Assistance Board
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col items-center p-4">
            <div className="w-full mt-1">
              <p className="text-base mb-1.5">Reset Password</p>
              <p className="text-sm text-gray-600 mb-3">
                Enter your new password
              </p>

              {/* Show either the reset error or the Redux error */}
              {(resetError || error) && (
                <div className="mb-2 w-full p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{resetError || error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-2 w-full p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="w-full">
                <div className="relative mt-2 mb-2">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    name="password"
                    placeholder="New Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>

                <div className="relative mt-2 mb-2">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full mt-1 mb-2 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-md transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Reset Password
                </button>

                <div className="text-center mb-2">
                  <RouterLink
                    to="/login"
                    className="text-sm text-indigo-500 hover:text-indigo-600 transition-colors"
                  >
                    Back to login
                  </RouterLink>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
