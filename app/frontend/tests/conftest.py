import os
import pytest
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


# Test credentials
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "passWord123."
TEST_USER_USERNAME = "testuser"

# API endpoints
BACKEND_BASE_URL = "http://localhost:8000"
FRONTEND_BASE_URL = "http://localhost:5173"


@pytest.fixture(scope="session")
def driver():
    """
    Create and yield WebDriver instance for the entire test session.
    Browser can be controlled via BROWSER environment variable.

    Usage:
        pytest tests/                    # Default: Firefox
        BROWSER=chrome pytest tests/     # Use Chrome
    """
    browser = os.getenv("BROWSER", "firefox").lower()

    if browser == "chrome":
        options = ChromeOptions()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        # Uncomment for headless mode
        # options.add_argument("--headless")
        driver = webdriver.Chrome(options=options)
    else:  # Default to Firefox
        options = FirefoxOptions()
        options.add_argument("--width=1920")
        options.add_argument("--height=1080")
        # Uncomment for headless mode
        # options.add_argument("--headless")
        driver = webdriver.Firefox(options=options)

    driver.implicitly_wait(10)
    yield driver
    driver.quit()


@pytest.fixture(scope="session")
def test_user():
    """
    Create or get test user via API.
    This runs once per test session to set up the test user.
    """
    try:
        # Try to register test user
        register_response = requests.post(
            f"{BACKEND_BASE_URL}/api/auth/register/",
            json={
                "email": TEST_USER_EMAIL,
                "username": TEST_USER_USERNAME,
                "password": TEST_USER_PASSWORD,
                "name": "Test",
                "surname": "User",
                "phone_number": "+90555555555"
            },
            timeout=10
        )

        # If user already exists (409), that's fine
        if register_response.status_code not in [201, 400]:
            print(f"Warning: Register returned {register_response.status_code}: {register_response.text}")
    except Exception as e:
        print(f"Warning: Could not create test user via API: {e}")
        print("Proceeding with test - make sure user exists or auto-registration is enabled")

    yield {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "username": TEST_USER_USERNAME
    }


@pytest.fixture
def web_driver(driver, test_user, request):
    """
    Provide driver for individual tests and log in the test user.
    This ensures test isolation and authentication.
    Skips login if test has @pytest.mark.skip_login marker.
    """
    # Check if test has skip_login marker
    skip_login = request.node.get_closest_marker("skip_login") is not None

    # Navigate to home page first
    driver.get(FRONTEND_BASE_URL)

    # Clear cookies and storage
    driver.delete_all_cookies()
    driver.execute_script("window.localStorage.clear();")
    driver.execute_script("window.sessionStorage.clear();")

    wait = WebDriverWait(driver, 10)

    # Only log in if not marked with skip_login
    if not skip_login:
        try:
            # Wait a moment for page to load
            import time
            time.sleep(1)

            # Navigate to login page
            login_url = f"{FRONTEND_BASE_URL}/login"
            driver.get(login_url)

            print(f"Navigating to login page: {login_url}")
            print(f"Current URL: {driver.current_url}")

            # Fill email using ID selector
            email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
            email_input.clear()
            email_input.send_keys(test_user["email"])
            print(f"Email filled: {test_user['email']}")

            # Fill password using ID selector
            password_input = wait.until(EC.presence_of_element_located((By.ID, "password")))
            password_input.clear()
            password_input.send_keys(test_user["password"])
            print(f"Password filled")

            # Click login button
            login_btn = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Login') and @type='submit']"))
            )
            print(f"Login button found, clicking...")
            login_btn.click()

            # Wait for redirect after login
            print(f"Waiting for redirect after login...")
            wait.until(lambda d: "login" not in d.current_url.lower())
            print(f"Logged in successfully. Current URL: {driver.current_url}")

        except Exception as e:
            print(f"ERROR: Could not log in automatically: {e}")
            print(f"Current URL: {driver.current_url}")
            print(f"Page title: {driver.title}")

            try:
                page_source = driver.page_source[:500]
                print(f"Page source preview: {page_source}")
            except:
                pass
    else:
        print("Skipping login for this test (marked with @pytest.mark.skip_login)")

    yield driver


@pytest.fixture
def wait(web_driver):
    """WebDriverWait with 10 second timeout for explicit waits"""
    return WebDriverWait(web_driver, 10)
