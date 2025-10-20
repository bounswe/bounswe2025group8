import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

// Eye icons for password visibility
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
import useAuth from "../features/authentication/hooks/useAuth";



import logoImage from "../assets/logo.png";
import userIcon from "../assets/user.svg";
import keyIcon from "../assets/key_for_register.svg";
import phoneIcon from "../assets/phone.svg";
import mailIcon from "../assets/mail.svg";

const RegisterPage = () => {
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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
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
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return setRegisterError("Phone number must be 10-15 digits");
    }

    // Required fields validation
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !phone.trim()) {
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
                  className="text-indigo-500 bg-white px-8 py-2 no-underline hover:bg-gray-50 transition-colors"
                >
                  LOGIN
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="bg-indigo-500 text-white px-8 py-2 no-underline hover:bg-indigo-600 transition-colors"
                >
                  REGISTER
                </RouterLink>
              </div>
            </div>

            <div className="w-full">
              <h2 className="text-lg font-bold mb-1">Create an account</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your details to register for the app
              </p>

              {/* Show either the register error or the Redux error */}
              {(registerError || error) && (
                <p className="text-red-500 mb-4">{registerError || error}</p>
              )}

              <form onSubmit={handleSubmit} noValidate className="w-full">
                {/* First Name and Last Name Row */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <img src={userIcon} alt="Name" width="16" height="16" />
                      </div>
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <img src={userIcon} alt="Name" width="16" height="16" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Surname"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img
                        src={userIcon}
                        alt="Username"
                        width="16"
                        height="16"
                      />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src={phoneIcon} alt="Phone" width="16" height="16" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
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
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img
                        src={keyIcon}
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
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img
                        src={keyIcon}
                        alt="Confirm Password"
                        width="16"
                        height="16"
                      />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
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
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5 mr-2 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700">
                      I agree with{" "}
                      <button
                        type="button"
                        className="text-indigo-500 hover:text-indigo-600 underline"
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
                  className="w-full mt-2 mb-4 py-3 px-4 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sign Up
                </button>
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

export default RegisterPage;
