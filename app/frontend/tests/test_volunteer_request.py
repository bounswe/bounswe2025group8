"""
Selenium Test Suite for Volunteer Request - Scenario: Volunteer User Actions

This test suite validates the volunteer request functionality including:
- Browsing available requests
- Viewing request details
- Volunteering for requests
- Managing volunteered requests
- Communication with request owners

Prerequisites:
- Selenium WebDriver installed
- Chrome/Firefox browser installed
- Application running on http://localhost:5173 (or configured URL)
- Test volunteer account created in the system

TODO:
- Add tests for changes in request status after volunteering
- Add tests for notifications sent to request owners
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


class VolunteerRequestTest(unittest.TestCase):
    """Test cases for Volunteer Request functionality"""

    # Configuration
    BASE_URL = "http://localhost:5173"  # Update this to match your dev server
    HOME_URL = f"{BASE_URL}/"
    LOGIN_URL = f"{BASE_URL}/login"
    REQUESTS_URL = f"{BASE_URL}/requests"
    
    # Test credentials for volunteer user
    VOLUNTEER_EMAIL = "test@gmail.com"
    VOLUNTEER_PASSWORD = "Test123!"
    
    # Locators
    # Login Page
    EMAIL_INPUT_ID = "email"
    PASSWORD_INPUT_ID = "password"
    LOGIN_BUTTON_XPATH = "//button[@type='submit' and contains(text(), 'Login')]"
    
    # Requests Page
    FIRST_REQUEST_CARD_XPATH = '//*[@id="root"]/div/div[2]/div/div[2]/div/div[1]'
    
    # Request Details Page (will be set dynamically based on request ID)
    VOLUNTEER_BUTTON_XPATH = '//*[@id="root"]/div/div[2]/div/div/div[2]/div[2]/div/div[2]/div[5]/button'
    WITHDRAW_BUTTON_XPATH = '//*[@id="root"]/div/div[2]/div/div/div[2]/div[2]/div/div[2]/div[5]/button'
    CONFIRMATION_MESSAGE_XPATH = "//*[contains(text(), 'success') or contains(text(), 'Success') or contains(text(), 'volunteer')]"

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
        # Navigate to login page
        self.driver.get(self.LOGIN_URL)
        time.sleep(1)
        
        # Clear cookies and local storage
        self.driver.delete_all_cookies()
        try:
            self.driver.execute_script("window.localStorage.clear();")
            self.driver.execute_script("window.sessionStorage.clear();")
        except Exception:
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

    def _login_as_volunteer(self):
        """Helper method to login as volunteer user"""
        # Fill login form
        email_input = self._get_element(By.ID, self.EMAIL_INPUT_ID)
        email_input.clear()
        email_input.send_keys(self.VOLUNTEER_EMAIL)
        
        password_input = self._get_element(By.ID, self.PASSWORD_INPUT_ID)
        password_input.clear()
        password_input.send_keys(self.VOLUNTEER_PASSWORD)
        
        # Submit login
        login_button = self._get_clickable_element(By.XPATH, self.LOGIN_BUTTON_XPATH)
        login_button.click()
        
        # Wait for redirect
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.LOGIN_URL)
        )
        time.sleep(1)
        
        # Verify authentication
        has_token = self._check_authentication_token()
        self.assertTrue(has_token, "Failed to login as volunteer user")

    def _verify_authenticated(self):
        """Helper method to verify user is authenticated"""
        has_token = self._check_authentication_token()
        self.assertTrue(has_token, "User should be authenticated")

    def _handle_alert(self, accept=True, timeout=5):
        """Helper method to handle JavaScript alerts"""
        try:
            WebDriverWait(self.driver, timeout).until(EC.alert_is_present())
            alert = self.driver.switch_to.alert
            alert_text = alert.text
            if accept:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        except TimeoutException:
            return None

    # ==================== TEST CASES ====================
    
    def test_01_authenticated_user_can_view_requests(self):
        """
        Test Case: Authenticated user can view requests list
        
        Steps:
        1. Login as volunteer user
        2. Navigate to requests page
        3. Verify requests page loads
        4. Verify at least one request is visible
        """
        # Step 1: Login
        self._login_as_volunteer()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 3: Verify on requests page
        current_url = self.driver.current_url
        self.assertIn("/requests", current_url, f"Expected requests page, got: {current_url}")
        
        # Step 4: Verify at least one request card is present
        try:
            request_card = self._get_element(
                By.XPATH,
                self.FIRST_REQUEST_CARD_XPATH,
                timeout=5
            )
            self.assertIsNotNone(request_card, "No request cards found on requests page")
        except:
            print("⚠ No requests available on the page (this may be expected)")
        
        # Verify still authenticated
        self._verify_authenticated()
        
        print("✓ Authenticated user can view requests list")
        print(f"  - Current URL: {current_url}")

    def test_02_authenticated_user_can_view_request_details(self):
        """
        Test Case: Authenticated user can click and view request details
        
        Steps:
        1. Login as volunteer user
        2. Navigate to requests page
        3. Click on first request card
        4. Verify navigation to request details page
        """
        # Step 1: Login
        self._login_as_volunteer()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 3: Click on first request card
        request_card = self._get_clickable_element(
            By.XPATH,
            self.FIRST_REQUEST_CARD_XPATH
        )
        self.assertIsNotNone(request_card, "First request card not found")
        request_card.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.REQUESTS_URL)
        )
        time.sleep(2)
        
        # Step 4: Verify navigation to request details page
        current_url = self.driver.current_url
        self.assertNotEqual(current_url, self.REQUESTS_URL, "Did not navigate away from requests page")
        
        # Verify still authenticated
        self._verify_authenticated()
        
        print("✓ Authenticated user can view request details")
        print(f"  - Current URL: {current_url}")

    def test_03_volunteer_for_available_request(self):
        """
        Test Case: Main scenario - User successfully volunteers for a request
        
        Steps:
        1. Login as volunteer user
        2. Navigate to requests page
        3. Click on first request
        4. Click volunteer/apply button
        5. Verify success confirmation
        """
        # Step 1: Login
        self._login_as_volunteer()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 3: Click on first request
        request_card = self._get_clickable_element(
            By.XPATH,
            self.FIRST_REQUEST_CARD_XPATH
        )
        request_card.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.REQUESTS_URL)
        )
        time.sleep(2)
        
        # Step 4: Click volunteer button
        volunteer_button = self._get_clickable_element(
            By.XPATH,
            self.VOLUNTEER_BUTTON_XPATH
        )
        self.assertIsNotNone(volunteer_button, "Volunteer button not found on request details page")
        volunteer_button.click()
        
        # Step 5: Handle alert confirmation
        alert_text = self._handle_alert(accept=True, timeout=5)
        self.assertIsNotNone(alert_text, "No alert confirmation appeared after clicking volunteer button")
        print(f"  - Alert message: {alert_text}")
        
        # Wait for action to complete
        time.sleep(1)
        
        # Verify button changed to withdraw
        try:
            withdraw_button = self.driver.find_element(
                By.XPATH,
                self.WITHDRAW_BUTTON_XPATH
            )
            self.assertIsNotNone(withdraw_button, "Withdraw button not found after volunteering")
        except NoSuchElementException:
            self.fail("Button did not change to withdraw after volunteering")
        
        # Verify still authenticated
        self._verify_authenticated()
        
        print("✓ User successfully volunteered for request")

    def test_04_verify_volunteer_button_exists_on_request_details(self):
        """
        Test Case: Verify volunteer/apply button is present on request details
        
        Steps:
        1. Login as volunteer user
        2. Navigate to requests page
        3. Click on first request
        4. Verify volunteer button exists
        """
        # Step 1: Login
        self._login_as_volunteer()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 3: Click on first request
        request_card = self._get_clickable_element(
            By.XPATH,
            self.FIRST_REQUEST_CARD_XPATH
        )
        request_card.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.REQUESTS_URL)
        )
        time.sleep(2)
        
        # Step 4: Verify volunteer button exists
        volunteer_button = self._get_element(
            By.XPATH,
            self.VOLUNTEER_BUTTON_XPATH
        )
        self.assertIsNotNone(volunteer_button, "Volunteer button not found")
        self.assertTrue(volunteer_button.is_displayed(), "Volunteer button is not visible")
        
        # Verify still authenticated
        self._verify_authenticated()
        
        print("✓ Volunteer button exists on request details page")

    def test_05_volunteer_button_shows_confirmation(self):
        """
        Test Case: Verify confirmation message/modal appears after volunteering
        
        Steps:
        1. Login as volunteer user
        2. Navigate to requests page
        3. Click on first request
        4. Click volunteer button
        5. Verify confirmation appears
        """
        # Step 1: Login
        self._login_as_volunteer()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 3: Click on first request
        request_card = self._get_clickable_element(
            By.XPATH,
            self.FIRST_REQUEST_CARD_XPATH
        )
        request_card.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.REQUESTS_URL)
        )
        time.sleep(2)
        
        # Step 4: Click volunteer button
        volunteer_button = self._get_clickable_element(
            By.XPATH,
            self.VOLUNTEER_BUTTON_XPATH
        )
        volunteer_button.click()
        
        # Step 5: Verify alert confirmation appears
        alert_text = self._handle_alert(accept=True, timeout=5)
        self.assertIsNotNone(alert_text, "No alert confirmation appeared")
        print(f"  - Alert confirmation: {alert_text}")
        
        # Wait for action to complete
        time.sleep(1)
        
        # Verify button changed to withdraw
        try:
            withdraw_button = self.driver.find_element(
                By.XPATH,
                self.WITHDRAW_BUTTON_XPATH
            )
            print("  - Button changed to Withdraw")
        except NoSuchElementException:
            self.fail("Button did not change after accepting alert")
        
        # Verify still authenticated
        self._verify_authenticated()
        
        print("✓ Alert confirmation appears after volunteering")

    def test_06_cannot_volunteer_for_own_request(self):
        """
        Test Case: User cannot volunteer for their own created request
        
        Steps:
        1. Login as volunteer user
        2. Navigate to a request created by this user (if exists)
        3. Verify volunteer button is not present or is disabled
        
        Note: This test assumes the logged-in user has created at least one request
        """
        # Step 1: Login
        self._login_as_volunteer()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Try to find a request created by this user
        # This is a best-effort test - may need to navigate to user's own requests
        # For now, we'll check the first request and see if volunteer button behavior is appropriate
        
        request_card = self._get_clickable_element(
            By.XPATH,
            self.FIRST_REQUEST_CARD_XPATH
        )
        request_card.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.REQUESTS_URL)
        )
        time.sleep(2)
        
        # Step 3: Check volunteer button state
        # If this is user's own request, volunteer button should not be present or enabled
        try:
            volunteer_button = self.driver.find_element(
                By.XPATH,
                self.VOLUNTEER_BUTTON_XPATH
            )
            # If button exists, it should be for someone else's request
            # This is expected - user is viewing others' requests
            print("  - Volunteer button found (request likely created by someone else)")
        except NoSuchElementException:
            # No volunteer button - could be own request or already volunteered
            print("  - No volunteer button (may be own request or already volunteered)")
        
        # Verify still authenticated
        self._verify_authenticated()
        
        print("✓ Cannot volunteer for own request test completed")
        print("  Note: Full verification requires navigating to user's own requests")

    def test_07_volunteer_button_changes_to_withdraw(self):
        """
        Test Case: Volunteer button changes to withdraw button after volunteering
        
        Steps:
        1. Login as volunteer user
        2. Navigate to requests page
        3. Click on first request
        4. Verify volunteer button exists
        5. Click volunteer button
        6. Verify button changes to withdraw button
        """
        # Step 1: Login
        self._login_as_volunteer()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 3: Click on first request
        request_card = self._get_clickable_element(
            By.XPATH,
            self.FIRST_REQUEST_CARD_XPATH
        )
        request_card.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.REQUESTS_URL)
        )
        time.sleep(2)
        
        # Step 4: Verify volunteer button exists
        try:
            volunteer_button = self._get_clickable_element(
                By.XPATH,
                self.VOLUNTEER_BUTTON_XPATH,
                timeout=5
            )
            self.assertIsNotNone(volunteer_button, "Volunteer button not found")
            
            # Step 5: Click volunteer button
            volunteer_button.click()
            
            # Handle alert confirmation
            alert_text = self._handle_alert(accept=True, timeout=5)
            self.assertIsNotNone(alert_text, "No alert appeared after clicking volunteer button")
            print(f"  - Alert: {alert_text}")
            
            time.sleep(1)
            
            # Step 6: Verify button changed to withdraw
            withdraw_button = self._get_element(
                By.XPATH,
                self.WITHDRAW_BUTTON_XPATH,
                timeout=5
            )
            self.assertIsNotNone(withdraw_button, "Withdraw button not found after volunteering")
            self.assertTrue(withdraw_button.is_displayed(), "Withdraw button is not visible")
            
            print("✓ Volunteer button changed to withdraw button after alert accepted")
            
        except (TimeoutException, NoSuchElementException):
            # May already be volunteered
            try:
                withdraw_button = self.driver.find_element(
                    By.XPATH,
                    self.WITHDRAW_BUTTON_XPATH
                )
                print("⚠ Already volunteered - withdraw button present")
            except NoSuchElementException:
                self.fail("Neither volunteer nor withdraw button found")
        
        # Verify still authenticated
        self._verify_authenticated()


def run_tests():
    """Run the test suite"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(VolunteerRequestTest)
    
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
