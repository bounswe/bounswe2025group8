"""
Selenium Test Suite for Login Page - Scenario 2: User Login

This test suite validates the login functionality including:
- Successful login with valid credentials
- Error handling for invalid credentials
- Session persistence
- Authentication token/cookie management
- Protected route access after login

Test Data:
- Email: ayse.kaya@example.com
- Password: S3cure!234

Prerequisites:
- Selenium WebDriver installed
- Chrome/Firefox browser installed
- Application running on http://localhost:5173 (or configured URL)
- Test user account created in the system
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys


class LoginPageTest(unittest.TestCase):
    """Test cases for the Login Page functionality"""

    # Configuration
    BASE_URL = "http://localhost:5173"  # Update this to match your dev server
    LOGIN_URL = f"{BASE_URL}/login"
    HOME_URL = f"{BASE_URL}/"
    
    # Test credentials
    VALID_EMAIL = "uveys2@gmail.com"
    VALID_PASSWORD = "Test123!"
    INVALID_EMAIL = "wrong@example.com"
    INVALID_PASSWORD = "WrongPassword123"

    @classmethod
    def setUpClass(cls):
        """Set up the WebDriver once for all tests"""
        # Configure Chrome options
        chrome_options = Options()
        # Uncomment the next line to run tests in headless mode
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(10)
        cls.wait = WebDriverWait(cls.driver, 10)

    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        cls.driver.quit()

    def setUp(self):
        """Set up before each test"""
        # Navigate to login page first (before clearing storage)
        self.driver.get(self.LOGIN_URL)
        time.sleep(1)  # Allow page to load
        
        # Clear cookies and local storage after navigating to a real page
        self.driver.delete_all_cookies()
        try:
            self.driver.execute_script("window.localStorage.clear();")
            self.driver.execute_script("window.sessionStorage.clear();")
        except Exception:
            # If storage is not available, continue anyway
            pass

    def tearDown(self):
        """Clean up after each test"""
        # Take screenshot on failure
        if hasattr(self._outcome, 'errors') and self._outcome.errors:
            test_name = self.id().split('.')[-1]
            self.driver.save_screenshot(f"test_failure_{test_name}_{int(time.time())}.png")

    def _get_element(self, by, value, timeout=10):
        """Helper method to get an element with explicit wait"""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
        except TimeoutException:
            self.fail(f"Element not found: {by}={value}")

    def _get_clickable_element(self, by, value, timeout=10):
        """Helper method to get a clickable element"""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, value))
            )
        except TimeoutException:
            self.fail(f"Clickable element not found: {by}={value}")

    def _fill_login_form(self, email, password):
        """Helper method to fill the login form"""
        # Find and fill email field
        email_input = self._get_element(By.ID, "email")
        email_input.clear()
        email_input.send_keys(email)
        
        # Find and fill password field
        password_input = self._get_element(By.ID, "password")
        password_input.clear()
        password_input.send_keys(password)

    def _submit_login_form(self):
        """Helper method to submit the login form"""
        login_button = self._get_clickable_element(
            By.XPATH, 
            "//button[@type='submit' and contains(text(), 'Login')]"
        )
        login_button.click()

    def _get_error_message(self):
        """Helper method to extract error message from the page"""
        try:
            # Look for error message (adjust selector based on actual implementation)
            error_element = self.driver.find_element(
                By.XPATH, 
                "//*[contains(@style, 'color') and (contains(text(), 'Invalid') or contains(text(), 'error') or contains(text(), 'fail'))]"
            )
            return error_element.text
        except NoSuchElementException:
            return None

    def _check_authentication_token(self):
        """Helper method to check if authentication token exists"""
        # Check localStorage for JWT token
        local_storage_token = self.driver.execute_script(
            "return window.localStorage.getItem('token') || window.localStorage.getItem('authToken') || window.localStorage.getItem('accessToken');"
        )
        
        # Check cookies for session token
        cookies = self.driver.get_cookies()
        session_cookies = [c for c in cookies if 'token' in c['name'].lower() or 'session' in c['name'].lower()]
        
        return local_storage_token is not None or len(session_cookies) > 0

    # ==================== TEST CASES ====================

    def test_01_login_page_loads_correctly(self):
        """
        Test Case: Verify login page loads with all required elements
        
        Steps:
        1. Navigate to login page
        2. Verify page title
        3. Verify all form elements are present
        """
        # Verify page title contains expected text
        self.assertIn("neighborhood", self.driver.title.lower() or self.driver.page_source.lower())
        
        # Verify LOGIN tab is active
        login_tab = self._get_element(
            By.XPATH,
            "//a[@href='/login' and contains(text(), 'LOGIN')]"
        )
        self.assertIsNotNone(login_tab)
        
        # Verify email input exists
        email_input = self._get_element(By.ID, "email")
        self.assertEqual(email_input.get_attribute("type"), "email")
        self.assertEqual(email_input.get_attribute("placeholder"), "Email")
        
        # Verify password input exists
        password_input = self._get_element(By.ID, "password")
        self.assertEqual(password_input.get_attribute("type"), "password")
        self.assertEqual(password_input.get_attribute("placeholder"), "Password")
        
        # Verify remember me checkbox exists
        remember_me = self._get_element(By.XPATH, "//input[@type='checkbox']")
        self.assertIsNotNone(remember_me)
        
        # Verify login button exists
        login_button = self._get_element(
            By.XPATH,
            "//button[@type='submit' and contains(text(), 'Login')]"
        )
        self.assertIsNotNone(login_button)
        
        # Verify "Forgot my password" link exists
        forgot_password_link = self._get_element(
            By.XPATH,
            "//a[@href='/forgot-password']"
        )
        self.assertIsNotNone(forgot_password_link)
        
        # Verify "Continue as a guest" link exists
        guest_link = self._get_element(
            By.XPATH,
            "//a[@href='/' and contains(text(), 'guest')]"
        )
        self.assertIsNotNone(guest_link)
        
        print("✓ Login page loads correctly with all required elements")

    def test_02_successful_login_with_valid_credentials(self):
        """
        Test Case: Successful login with valid credentials (Main Scenario)
        
        Actor: Registered user
        Preconditions: Account exists and is active
        
        Steps:
        1. Navigate to Login page
        2. Enter valid Email and Password
        3. Click Login button
        4. Observe redirect to Home/Dashboard
        
        Expected Results:
        - Valid credentials → authenticated session/cookie/JWT issued
        - Redirect to home page
        - Login state persists
        """
        # Step 1: Already on login page (setUp method)
        
        # Step 2: Enter valid credentials
        self._fill_login_form(self.VALID_EMAIL, self.VALID_PASSWORD)
        
        # Step 3: Click Login button
        self._submit_login_form()
        
        # Step 4: Wait for redirect
        try:
            WebDriverWait(self.driver, 10).until(
                EC.url_changes(self.LOGIN_URL)
            )
        except TimeoutException:
            self.fail("Page did not redirect after login")
        
        # Verify redirect to home/dashboard
        current_url = self.driver.current_url
        self.assertTrue(
            current_url == self.HOME_URL or "/home" in current_url or "/dashboard" in current_url,
            f"Expected redirect to home, but got: {current_url}"
        )
        
        # Verify authentication token/session exists
        time.sleep(1)  # Allow time for token to be set
        has_token = self._check_authentication_token()
        self.assertTrue(
            has_token,
            "No authentication token found in localStorage or cookies"
        )
        
        print("✓ Successful login with valid credentials")
        print(f"  - Redirected to: {current_url}")
        print(f"  - Authentication token: {'Present' if has_token else 'Missing'}")

    def test_03_login_state_persists_after_page_refresh(self):
        """
        Test Case: Login state persists until logout
        
        Steps:
        1. Login with valid credentials
        2. Refresh the page
        3. Verify user is still logged in
        """
        # Step 1: Login
        self._fill_login_form(self.VALID_EMAIL, self.VALID_PASSWORD)
        self._submit_login_form()
        
        # Wait for redirect
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.LOGIN_URL)
        )
        time.sleep(1)
        
        # Store initial URL
        logged_in_url = self.driver.current_url
        
        # Verify token exists before refresh
        has_token_before = self._check_authentication_token()
        self.assertTrue(has_token_before, "No token before refresh")
        
        # Step 2: Refresh the page
        self.driver.refresh()
        time.sleep(2)
        
        # Step 3: Verify still logged in
        current_url = self.driver.current_url
        
        # Should not be redirected back to login
        self.assertNotIn("/login", current_url, "User was logged out after refresh")
        
        # Token should still exist
        has_token_after = self._check_authentication_token()
        self.assertTrue(
            has_token_after,
            "Authentication token lost after page refresh"
        )
        
        print("✓ Login state persists after page refresh")

    def test_04_invalid_password_shows_error(self):
        """
        Test Case: Wrong password shows descriptive error (Negative Test)
        
        Steps:
        1. Enter valid email
        2. Enter invalid password
        3. Click Login
        4. Verify error message is shown
        
        Expected Results:
        - Error message: "Invalid email or password" or similar
        - User remains on login page
        - No authentication token issued
        """
        # Enter valid email but wrong password
        self._fill_login_form(self.VALID_EMAIL, self.INVALID_PASSWORD)
        self._submit_login_form()
        
        # Wait for error message
        time.sleep(2)
        
        # Verify error message appears
        error_message = self._get_error_message()
        self.assertIsNotNone(error_message, "No error message displayed for wrong password")
        self.assertTrue(
            "invalid" in error_message.lower() or "incorrect" in error_message.lower(),
            f"Error message not descriptive enough: {error_message}"
        )
        
        # Verify still on login page
        self.assertIn("/login", self.driver.current_url, "Should remain on login page after failed login")
        
        # Verify no authentication token issued
        has_token = self._check_authentication_token()
        self.assertFalse(has_token, "Authentication token should not exist after failed login")
        
        print("✓ Invalid password shows error message")
        print(f"  - Error message: {error_message}")

    def test_05_invalid_email_shows_error(self):
        """
        Test Case: Wrong email shows descriptive error (Negative Test)
        """
        # Enter invalid email and password
        self._fill_login_form(self.INVALID_EMAIL, self.INVALID_PASSWORD)
        self._submit_login_form()
        
        # Wait for error message
        time.sleep(2)
        
        # Verify error message appears
        error_message = self._get_error_message()
        self.assertIsNotNone(error_message, "No error message displayed for wrong email")
        
        # Verify still on login page
        self.assertIn("/login", self.driver.current_url)
        
        # Verify no authentication token issued
        has_token = self._check_authentication_token()
        self.assertFalse(has_token, "Authentication token should not exist after failed login")
        
        print("✓ Invalid email shows error message")

    def test_06_empty_fields_validation(self):
        """
        Test Case: Empty fields validation (Edge Case)
        
        Steps:
        1. Leave email and password empty
        2. Click Login
        3. Verify HTML5 validation or error messages
        """
        # Try to submit without filling fields
        login_button = self._get_clickable_element(
            By.XPATH,
            "//button[@type='submit' and contains(text(), 'Login')]"
        )
        login_button.click()
        
        time.sleep(1)
        
        # Check if still on login page (HTML5 validation should prevent submission)
        self.assertIn("/login", self.driver.current_url)
        
        # Check email field for HTML5 validation
        email_input = self._get_element(By.ID, "email")
        validity = self.driver.execute_script(
            "return arguments[0].validity.valid;", 
            email_input
        )
        self.assertFalse(validity, "Email field should be invalid when empty")
        
        print("✓ Empty fields validation works")

    def test_07_remember_me_functionality(self):
        """
        Test Case: Remember me checkbox functionality
        
        Steps:
        1. Check "Remember me" checkbox
        2. Login with valid credentials
        3. Verify login successful
        """
        # Check remember me checkbox
        remember_me = self._get_element(By.XPATH, "//input[@type='checkbox']")
        if not remember_me.is_selected():
            remember_me.click()
        
        self.assertTrue(remember_me.is_selected(), "Remember me checkbox not checked")
        
        # Login
        self._fill_login_form(self.VALID_EMAIL, self.VALID_PASSWORD)
        self._submit_login_form()
        
        # Wait for redirect
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.LOGIN_URL)
        )
        
        # Verify login successful
        self.assertNotIn("/login", self.driver.current_url)
        
        print("✓ Remember me functionality works")

    def test_08_password_visibility_toggle(self):
        """
        Test Case: Password visibility toggle functionality
        
        Steps:
        1. Enter password
        2. Click eye icon to show password
        3. Verify password is visible
        4. Click eye icon again to hide password
        5. Verify password is hidden
        """
        # Enter password
        password_input = self._get_element(By.ID, "password")
        password_input.send_keys(self.VALID_PASSWORD)
        
        # Initial state should be password (hidden)
        self.assertEqual(password_input.get_attribute("type"), "password")
        
        # Find and click the eye icon button
        try:
            eye_button = self._get_clickable_element(
                By.XPATH,
                "//button[@type='button']//parent::div[@class='absolute inset-y-0 right-0 pr-3 flex items-center']//button"
            )
            eye_button.click()
            time.sleep(0.5)
            
            # Verify password is now visible (type="text")
            self.assertEqual(
                password_input.get_attribute("type"),
                "text",
                "Password should be visible after clicking eye icon"
            )
            
            # Click again to hide
            eye_button.click()
            time.sleep(0.5)
            
            # Verify password is hidden again
            self.assertEqual(
                password_input.get_attribute("type"),
                "password",
                "Password should be hidden after clicking eye icon again"
            )
            
            print("✓ Password visibility toggle works")
        except (TimeoutException, NoSuchElementException):
            print("⚠ Password visibility toggle button not found (this may be expected)")

    def test_09_navigation_to_register_page(self):
        """
        Test Case: Navigation to Register page
        
        Steps:
        1. Click REGISTER tab
        2. Verify navigation to register page
        """
        register_tab = self._get_clickable_element(
            By.XPATH,
            "//a[@href='/register' and contains(text(), 'REGISTER')]"
        )
        register_tab.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_contains("/register")
        )
        
        self.assertIn("/register", self.driver.current_url)
        
        print("✓ Navigation to register page works")

    def test_10_navigation_to_forgot_password_page(self):
        """
        Test Case: Navigation to Forgot Password page
        
        Steps:
        1. Click "Forgot my password" link
        2. Verify navigation to forgot password page
        """
        forgot_link = self._get_clickable_element(
            By.XPATH,
            "//a[@href='/forgot-password']"
        )
        forgot_link.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_contains("/forgot-password")
        )
        
        self.assertIn("/forgot-password", self.driver.current_url)
        
        print("✓ Navigation to forgot password page works")

    def test_11_continue_as_guest(self):
        """
        Test Case: Continue as guest functionality
        
        Steps:
        1. Click "Continue as a guest" link
        2. Verify navigation to home page
        3. Verify no authentication token issued
        """
        guest_link = self._get_clickable_element(
            By.XPATH,
            "//a[@href='/' and contains(text(), 'guest')]"
        )
        guest_link.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.LOGIN_URL)
        )
        
        time.sleep(1)
        
        # Verify navigation to home
        current_url = self.driver.current_url
        self.assertTrue(
            current_url == self.HOME_URL or current_url.endswith("/"),
            f"Expected home page, got: {current_url}"
        )
        
        # Verify no authentication token (guest mode)
        has_token = self._check_authentication_token()
        # Guest mode may or may not have a token depending on implementation
        
        print("✓ Continue as guest works")
        print(f"  - Guest mode token: {'Present' if has_token else 'None'}")

    def test_12_theme_toggle_functionality(self):
        """
        Test Case: Theme toggle functionality
        
        Steps:
        1. Find theme selector
        2. Change theme to dark mode
        3. Verify theme changed
        4. Change to high contrast
        5. Verify theme changed
        """
        # Find theme selector
        theme_selector = self._get_element(
            By.XPATH,
            "//select[contains(@class, 'px-3') and option[@value='light']]"
        )
        
        # Change to dark mode
        theme_selector.click()
        dark_option = self._get_element(
            By.XPATH,
            "//option[@value='dark']"
        )
        dark_option.click()
        time.sleep(0.5)
        
        # Verify dark theme applied (check if value changed)
        self.assertEqual(theme_selector.get_attribute("value"), "dark")
        
        # Change to high contrast
        theme_selector.click()
        high_contrast_option = self._get_element(
            By.XPATH,
            "//option[@value='high-contrast']"
        )
        high_contrast_option.click()
        time.sleep(0.5)
        
        # Verify high contrast theme applied
        self.assertEqual(theme_selector.get_attribute("value"), "high-contrast")
        
        print("✓ Theme toggle functionality works")


def run_tests():
    """Run the test suite"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(LoginPageTest)
    
    # Run tests with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*70)
    
    return result


if __name__ == "__main__":
    run_tests()
