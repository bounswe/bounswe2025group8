import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../features/authentication/hooks/useAuth"; 
import logoImage from "../assets/logo.png";
import lockIcon from "../assets/lock.svg";
import mailIcon from "../assets/mail.svg";

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
        setLoginError("Invalid credentials. Please check your email and password.");
      }
    } catch (error) {
      setLoginError(
        "Failed to sign in: " + (error.message || "Invalid credentials")
      );
    }
  };

  // The rest of the component remains the same
  return (
    <div className="flex min-h-screen bg-white items-center justify-center">
      <div className="w-full max-w-md">
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
          <div className="flex flex-col items-center p-8">
            {/* Tab buttons - Updated to match the second image design */}
            <div className="w-full mb-6 flex justify-center">
              <div className="flex border border-indigo-500 rounded overflow-hidden w-fit">
                <RouterLink
                  to="/login"
                  className="bg-indigo-500 text-white px-8 py-2 no-underline hover:bg-indigo-600 transition-colors"
                >
                  LOGIN
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="text-indigo-500 bg-white px-8 py-2 no-underline hover:bg-gray-50 transition-colors"
                >
                  REGISTER
                </RouterLink>
              </div>
            </div>

            <div className="w-full">
              <h2 className="text-lg font-bold mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your details to sign in to your account
              </p>

              {/* Show registration success message if applicable */}
              {registrationSuccess && (
                <div className="mb-4 w-full p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  Registration successful! You can now log in with your
                  credentials.
                </div>
              )}

              {/* Show either the login error or the Redux error */}
              {(loginError || error) && (
                <p className="text-red-500 mb-4">{loginError || error}</p>
              )}

              <form onSubmit={handleSubmit} noValidate className="w-full">
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={mailIcon} alt="Email" width="16" height="16" />
                    </div>
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img
                        src={lockIcon}
                        alt="Password"
                        width="16"
                        height="16"
                      />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
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
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Remember me
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 mb-4 py-3 px-4 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Login
                </button>

                <div className="text-center mb-4">
                  <RouterLink
                    to="/forgot-password"
                    className="text-sm text-indigo-500 hover:text-indigo-600 no-underline"
                  >
                    Forgot my password
                  </RouterLink>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center my-4">
          <p className="text-sm text-gray-500">OR</p>
        </div>

        <div className="text-center mb-8">
          <RouterLink
            to="/"
            className="text-sm text-indigo-500 no-underline hover:text-indigo-600"
          >
            Continue as a guest
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
