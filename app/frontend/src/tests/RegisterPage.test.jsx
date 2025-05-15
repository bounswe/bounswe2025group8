import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import RegisterPage from "../pages/auth/RegisterPage";
import { authAPI } from "../utils/api";

// Mock MUI icons to avoid loading issues
vi.mock("@mui/icons-material/Visibility", () => ({
  default: () => <div data-testid="visibility-icon">Visibility</div>,
}));

vi.mock("@mui/icons-material/VisibilityOff", () => ({
  default: () => <div data-testid="visibility-off-icon">VisibilityOff</div>,
}));

// Mock the useAuth hook
vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(() => ({
    register: vi.fn(),
    loading: false,
    error: null,
  })),
}));

// Mock the authAPI
vi.mock("../utils/api", () => ({
  authAPI: {
    checkEmailAvailability: vi.fn(),
    checkPhoneAvailability: vi.fn(),
  },
}));

// Mock the react-router-dom useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Create mock navigate function
const mockNavigate = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();

  // Default mock implementations
  authAPI.checkEmailAvailability.mockResolvedValue({
    data: { available: true },
  });
  authAPI.checkPhoneAvailability.mockResolvedValue({
    data: { available: true },
  });
});

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = initialState) => state,
    },
    preloadedState: {
      auth: initialState,
    },
  });
};

describe("RegisterPage Component", () => {
  it("renders the register page with form elements", () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Check if important elements are rendered
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Surname")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByText(/I agree with/)).toBeInTheDocument();
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Continue as a guest")).toBeInTheDocument();
  });

  it("handles form input changes", () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Get form inputs
    const firstNameInput = screen.getByPlaceholderText("First Name");
    const lastNameInput = screen.getByPlaceholderText("Surname");
    const usernameInput = screen.getByPlaceholderText("Username");
    const phoneInput = screen.getByPlaceholderText("Phone");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");
    const termsCheckbox = screen.getByRole("checkbox", {
      name: /I agree with/,
    });

    // Simulate user typing
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(usernameInput, { target: { value: "johndoe" } });
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.change(emailInput, { target: { value: "john.doe@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(termsCheckbox);

    // Check if input values are updated
    expect(firstNameInput.value).toBe("John");
    expect(lastNameInput.value).toBe("Doe");
    expect(usernameInput.value).toBe("johndoe");
    expect(phoneInput.value).toBe("1234567890");
    expect(emailInput.value).toBe("john.doe@example.com");
    expect(passwordInput.value).toBe("password123");
    expect(confirmPasswordInput.value).toBe("password123");
    expect(termsCheckbox).toBeChecked();
  });

  it("toggles password visibility when icon is clicked", () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Get password input and toggle button
    const passwordInput = screen.getByPlaceholderText("Password");
    const visibilityToggleButton = screen.getByLabelText(
      "toggle password visibility"
    );

    // Password should be hidden initially
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click visibility toggle button
    fireEvent.click(visibilityToggleButton);

    // Password should be visible now
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click again to hide password
    fireEvent.click(visibilityToggleButton);

    // Password should be hidden again
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("toggles confirm password visibility when icon is clicked", () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Get confirm password input and toggle button
    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm Password");
    const visibilityToggleButton = screen.getByLabelText(
      "toggle confirm password visibility"
    );

    // Password should be hidden initially
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    // Click visibility toggle button
    fireEvent.click(visibilityToggleButton);

    // Password should be visible now
    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    // Click again to hide password
    fireEvent.click(visibilityToggleButton);

    // Password should be hidden again
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("shows error when passwords do not match", async () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data except mismatched passwords
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Check if error message is displayed
    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
  });

  it("shows error for short passwords", async () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data but a short password
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Check if error message is displayed
    expect(
      await screen.findByText("Password must be at least 8 characters long")
    ).toBeInTheDocument();
  });

  it("shows error when terms are not accepted", async () => {
    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data but don't check the terms
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });

    // Submit the form without checking terms
    fireEvent.click(screen.getByText("Sign Up"));

    // Check if error message is displayed
    expect(
      await screen.findByText("You must agree to the Terms & Conditions")
    ).toBeInTheDocument();
  });

  it("shows error when email is already in use", async () => {
    // Mock the email availability check to return false
    authAPI.checkEmailAvailability.mockResolvedValue({
      data: { available: false },
    });

    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Check if error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(
          "This email is already in use. Please use a different email."
        )
      ).toBeInTheDocument();
    });
  });

  it("shows error when phone is already in use", async () => {
    // Mock the phone availability check to return false
    authAPI.checkPhoneAvailability.mockResolvedValue({
      data: { available: false },
    });

    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Check if error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(
          "This phone number is already in use. Please use a different number."
        )
      ).toBeInTheDocument();
    });
  });

  it("submits the form with correct values when all validations pass", async () => {
    // Import useAuth and get mock implementation
    const useAuth = require("../hooks/useAuth").default;
    const mockRegister = vi.fn().mockResolvedValue({ registered: true });
    useAuth.mockReturnValue({
      register: mockRegister,
      loading: false,
      error: null,
    });

    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Verify register was called with correct parameters
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "John",
        "Doe",
        "johndoe",
        "john.doe@example.com",
        "1234567890",
        "password123",
        "password123"
      );
    });

    // Verify navigation to login page with registered=true
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login?registered=true");
    });
  });

  it("navigates to home page if registration returns without registered flag", async () => {
    // Import useAuth and get mock implementation
    const useAuth = require("../hooks/useAuth").default;
    const mockRegister = vi.fn().mockResolvedValue({ registered: false }); // No registered flag
    useAuth.mockReturnValue({
      register: mockRegister,
      loading: false,
      error: null,
    });

    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Verify navigation to home page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("displays error message when registration fails", async () => {
    // Import useAuth and get mock implementation
    const useAuth = require("../hooks/useAuth").default;
    const mockRegister = vi
      .fn()
      .mockRejectedValue(new Error("Registration failed"));
    useAuth.mockReturnValue({
      register: mockRegister,
      loading: false,
      error: null,
    });

    render(
      <Provider store={createMockStore()}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Check if error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText("Failed to create an account: Registration failed")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state during registration", async () => {
    // Import useAuth and get mock implementation
    const useAuth = require("../hooks/useAuth").default;
    const mockRegister = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => {})); // Never resolves
    useAuth.mockReturnValue({
      register: mockRegister,
      loading: true,
      error: null,
    });

    render(
      <Provider store={createMockStore({ loading: true })}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );

    // Fill the form with valid data
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree with/ }));

    // Submit the form
    fireEvent.click(screen.getByText("Sign Up"));

    // Check that Sign Up button is disabled
    expect(screen.getByText("Sign Up")).toBeDisabled();
  });
});
