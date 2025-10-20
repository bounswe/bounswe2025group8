import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../features/authentication/hooks/useAuth";
import logoImage from "../assets/logo.png";
import mailIcon from "../assets/mail.svg";

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
    <div className="flex min-h-screen bg-white items-center justify-center">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo and Title updated to be side by side */}
        <div className="flex flex-row items-center justify-center mb-1">
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
              <p className="font-bold text-base mb-1.5">Forgot Password</p>
              <p className="text-sm text-gray-600 mb-3">
                Enter your email and we'll send you a link to reset your
                password
              </p>

              {/* Show either the forgot error or the Redux error */}
              {(forgotError || error) && (
                <div className="mb-2 w-full p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{forgotError || error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-2 w-full p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="w-full">
                <div className="relative mt-2 mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src={mailIcon} alt="Email" width="16" height="16" />
                  </div>
                  <input
                    required
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    id="email"
                    placeholder="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-1 mb-2 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-full transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Send Reset Link
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

export default ForgotPassword;
