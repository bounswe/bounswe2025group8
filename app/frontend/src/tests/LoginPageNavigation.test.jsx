import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";

// Mock dependencies
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth hook
vi.mock("../hooks/useAuth", () => ({
  default: () => ({
    login: mockLogin,
    loading: false,
    error: null,
  }),
}));

// Create mock functions
const mockNavigate = vi.fn();
const mockLogin = vi.fn();

describe("LoginPage Navigation", () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  it("has correct href on register button", () => {
    renderWithRouter();
    const registerButton = screen.getByText("REGISTER");
    expect(registerButton.closest("a")).toHaveAttribute("href", "/register");
  });

  it('has correct href on "Forgot my password" link', () => {
    renderWithRouter();
    const forgotPasswordLink = screen.getByText("Forgot my password");
    expect(forgotPasswordLink.closest("a")).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it('has correct href on "Continue as a guest" link', () => {
    renderWithRouter();
    const guestLink = screen.getByText("Continue as a guest");
    expect(guestLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("navigates to home page after successful login", async () => {
    // Set up mock login to resolve successfully
    mockLogin.mockResolvedValue(true);

    renderWithRouter();

    // Fill in login form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    // Wait for login to complete and check navigation
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("supports form submission with Enter key", () => {
    renderWithRouter();

    // Fill in login form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit form with Enter key on password field
    fireEvent.keyPress(screen.getByPlaceholderText("Password"), {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    // Check login was called
    expect(mockLogin).toHaveBeenCalled();
  });
});
