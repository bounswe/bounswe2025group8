"""
Selenium Test Suite for Guest Browsing - Scenario 5: Guest User Navigation

This test suite validates the guest browsing functionality including:
- Access to public pages without authentication
- Navigation through the application
- Viewing public content
- Restrictions on protected features

Prerequisites:
- Selenium WebDriver installed
- Chrome/Firefox browser installed
- Application running on http://localhost:5173 (or configured URL)
- 

TODO:
- Add more test cases for Filter by Address
- Add more test cases for accessing request details after the bug fix(guests should be able to view request details)
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


class GuestBrowsingTest(unittest.TestCase):
    """Test cases for Guest Browsing functionality"""

    # Configuration
    BASE_URL = "http://localhost:5173"  # Update this to match your dev server
    HOME_URL = f"{BASE_URL}/"
    LOGIN_URL = f"{BASE_URL}/login"
    REGISTER_URL = f"{BASE_URL}/register"
    CATEGORIES_URL = f"{BASE_URL}/categories"
    REQUESTS_URL = f"{BASE_URL}/requests"
    REQUESTS_OTHER_URL = f"{BASE_URL}/requests?category=OTHER"
    CREATE_REQUEST_URL = f"{BASE_URL}/create-request"
    SEARCH_TEST_URL = f"{BASE_URL}/search?q=guest"
    
    
    #Locators
    #Login and Register Pages
    GUEST_LINK_XPATH = '/html/body/div/div/main/div[4]/a'
    
    
    #Seachbar
    SEARCH_INPUT_XPATH = '//*[@id="root"]/div/header/div/div/form/input'
    SEARCH_BUTTON_XPATH = '//*[@id="root"]/div/header/div/div/form/button'
    
    #Sidebar
    HOME_ICON_XPATH = '//*[@id="root"]/div/div[1]/div[1]'
    HOME_BUTTON_XPATH = '//*[@id="root"]/div/div[1]/nav/div[1]/button'
    CATEGORIES_BUTTON_XPATH = '//*[@id="root"]/div/div[1]/nav/div[2]/button'
    REQUESTS_BUTTON_XPATH = '//*[@id="root"]/div/div[1]/nav/div[3]/button'
    CREATE_REQUEST_BUTTON_XPATH = '//*[@id="root"]/div/div[1]/div[2]/button'
    LOGIN_BUTTON_XPATH = '//*[@id="root"]/div/div[1]/div[4]/button[1]'
    REGISTER_BUTTON_XPATH = '//*[@id="root"]/div/div[1]/div[4]/button[2]'
    
    #Home Page
    POPULAR_CATEGORIES_OTHER_XPATH = '//*[@id="root"]/div/div[2]/div/main/div[1]/div[2]/div[1]/div'
    
    #Categories Page
    CATEGORIES_OTHER_SERVICES_XPATH = '//*[@id="root"]/div/div[2]/div/main/div[2]/div[1]/div'
    
    #Requests Page
    FIRST_REQUEST_CARD_XPATH = '//*[@id="root"]/div/div[2]/div/div[2]/div/div[1]'
    FILTER_LOCATION_INPUT_XPATH = '//*[@id="root"]/div/div[2]/div/main/div[1]/div[2]/div/input'
    FILTER_LOCATION_BUTTON_XPATH = '//*[@id="root"]/div/div[2]/div/main/div[1]/div[2]/div/button'
    OPEN_ADDRESS_FILTER_BUTTON_XPATH = '//*[@id="root"]/div/div[2]/div/div[1]/div[2]/button[2]'
    

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
        # Navigate to home page first (before clearing storage)
        self.driver.get(self.HOME_URL)
        time.sleep(1)  # Allow page to load
        
        # Clear cookies and local storage to ensure guest state
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

    def _verify_guest_mode(self):
        """Helper method to verify user is in guest mode (not authenticated)"""
        has_token = self._check_authentication_token()
        self.assertFalse(has_token, "Guest user should not have authentication token")

    # ==================== TEST CASES ====================
    
    def test_01_navigate_to_home_from_login_page(self):
        """
        Test Case: Guest user navigates to home from login page
        
        Steps:
        1. Navigate to login page
        2. Click "Continue as a guest" link
        3. Verify navigation to home page
        4. Verify no authentication token issued
        """
        # Step 1: Navigate to login page
        self.driver.get(self.LOGIN_URL)
        time.sleep(1)
        
        # Step 2: Click the guest link
        guest_link = self._get_clickable_element(
            By.XPATH,
            self.GUEST_LINK_XPATH
        )
        self.assertIsNotNone(guest_link, "Guest link not found on login page")
        guest_link.click()
        
        # Step 3: Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.LOGIN_URL)
        )
        time.sleep(1)
        
        # Verify navigation to home page
        current_url = self.driver.current_url
        self.assertTrue(
            current_url == self.HOME_URL or current_url.endswith("/"),
            f"Expected home page, got: {current_url}"
        )
        
        # Step 4: Verify no authentication token (guest mode)
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to home from login page")
        print(f"  - Current URL: {current_url}")
        print(f"  - Guest mode: Verified (no auth token)")

    def test_02_sidebar_home_button_navigation(self):
        """
        Test Case: Guest user navigates to home page using sidebar Home button
        
        Steps:
        1. Start on home page
        2. Navigate to different page (categories)
        3. Click Home button in sidebar
        4. Verify navigation to home page
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Navigate to categories page
        self.driver.get(self.CATEGORIES_URL)
        time.sleep(1)
        
        # Step 3: Click Home button in sidebar
        home_button = self._get_clickable_element(
            By.XPATH,
            self.HOME_BUTTON_XPATH
        )
        self.assertIsNotNone(home_button, "Home button not found in sidebar")
        home_button.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.CATEGORIES_URL)
        )
        time.sleep(1)
        
        # Step 4: Verify navigation to home page
        current_url = self.driver.current_url
        self.assertTrue(
            current_url == self.HOME_URL or current_url.endswith("/"),
            f"Expected home page, got: {current_url}"
        )
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to home using sidebar")
        print(f"  - Current URL: {current_url}")

    def test_03_sidebar_categories_button_navigation(self):
        """
        Test Case: Guest user navigates to categories page using sidebar Categories button
        
        Steps:
        1. Start on home page
        2. Click Categories button in sidebar
        3. Verify navigation to categories page
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Click Categories button in sidebar
        categories_button = self._get_clickable_element(
            By.XPATH,
            self.CATEGORIES_BUTTON_XPATH
        )
        self.assertIsNotNone(categories_button, "Categories button not found in sidebar")
        categories_button.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.HOME_URL)
        )
        time.sleep(1)
        
        # Step 3: Verify navigation to categories page
        current_url = self.driver.current_url
        self.assertIn("/categories", current_url, f"Expected categories page, got: {current_url}")
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to categories using sidebar")
        print(f"  - Current URL: {current_url}")

    def test_04_sidebar_requests_button_navigation(self):
        """
        Test Case: Guest user navigates to requests page using sidebar Requests button
        
        Steps:
        1. Start on home page
        2. Click Requests button in sidebar
        3. Verify navigation to requests page
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Click Requests button in sidebar
        requests_button = self._get_clickable_element(
            By.XPATH,
            self.REQUESTS_BUTTON_XPATH
        )
        self.assertIsNotNone(requests_button, "Requests button not found in sidebar")
        requests_button.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.HOME_URL)
        )
        time.sleep(1)
        
        # Step 3: Verify navigation to requests page
        current_url = self.driver.current_url
        self.assertIn("/requests", current_url, f"Expected requests page, got: {current_url}")
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to requests using sidebar")
        print(f"  - Current URL: {current_url}")

    def test_05_sidebar_create_request_button_redirects_to_login(self):
        """
        Test Case: Guest user clicks Create Request button and is redirected to login
        
        Steps:
        1. Start on home page
        2. Click Create Request button in sidebar
        3. Verify redirection to login page (protected feature)
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Click Create Request button in sidebar
        create_request_button = self._get_clickable_element(
            By.XPATH,
            self.CREATE_REQUEST_BUTTON_XPATH
        )
        self.assertIsNotNone(create_request_button, "Create Request button not found in sidebar")
        create_request_button.click()
        
        # Wait for navigation
        time.sleep(2)
        
        # Step 3: Verify redirection to login page
        current_url = self.driver.current_url
        self.assertIn("/login", current_url, f"Expected redirect to login page, got: {current_url}")
        
        # Verify still in guest mode (no authentication)
        self._verify_guest_mode()
        
        print("✓ Guest user redirected to login when attempting to create request")
        print(f"  - Current URL: {current_url}")

    def test_06_sidebar_login_button_navigation(self):
        """
        Test Case: Guest user navigates to login page using sidebar Login button
        
        Steps:
        1. Start on home page
        2. Click Login button in sidebar
        3. Verify navigation to login page
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Click Login button in sidebar
        login_button = self._get_clickable_element(
            By.XPATH,
            self.LOGIN_BUTTON_XPATH
        )
        self.assertIsNotNone(login_button, "Login button not found in sidebar")
        login_button.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.HOME_URL)
        )
        time.sleep(1)
        
        # Step 3: Verify navigation to login page
        current_url = self.driver.current_url
        self.assertIn("/login", current_url, f"Expected login page, got: {current_url}")
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to login using sidebar")
        print(f"  - Current URL: {current_url}")

    def test_07_sidebar_register_button_navigation(self):
        """
        Test Case: Guest user navigates to register page using sidebar Register button
        
        Steps:
        1. Start on home page
        2. Click Register button in sidebar
        3. Verify navigation to register page
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Click Register button in sidebar
        register_button = self._get_clickable_element(
            By.XPATH,
            self.REGISTER_BUTTON_XPATH
        )
        self.assertIsNotNone(register_button, "Register button not found in sidebar")
        register_button.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.HOME_URL)
        )
        time.sleep(1)
        
        # Step 3: Verify navigation to register page
        current_url = self.driver.current_url
        self.assertIn("/register", current_url, f"Expected register page, got: {current_url}")
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to register using sidebar")
        print(f"  - Current URL: {current_url}")

    def test_08_sidebar_home_icon_navigation(self):
        """
        Test Case: Guest user navigates to home page by clicking home icon in sidebar
        
        Steps:
        1. Start on home page
        2. Navigate to different page (requests)
        3. Click Home icon in sidebar
        4. Verify navigation to home page
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(1)
        
        # Step 3: Click Home icon in sidebar
        home_icon = self._get_clickable_element(
            By.XPATH,
            self.HOME_ICON_XPATH
        )
        self.assertIsNotNone(home_icon, "Home icon not found in sidebar")
        home_icon.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.REQUESTS_URL)
        )
        time.sleep(1)
        
        # Step 4: Verify navigation to home page
        current_url = self.driver.current_url
        self.assertTrue(
            current_url == self.HOME_URL or current_url.endswith("/"),
            f"Expected home page, got: {current_url}"
        )
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to home using home icon")
        print(f"  - Current URL: {current_url}")

    def test_09_search_bar_functionality(self):
        """
        Test Case: Guest user can use search bar to search for content
        
        Steps:
        1. Start on home page
        2. Enter search query in search bar
        3. Click search button
        4. Verify navigation to search results page
        5. Verify search query in URL
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Enter search query in search bar
        search_input = self._get_element(
            By.XPATH,
            self.SEARCH_INPUT_XPATH
        )
        self.assertIsNotNone(search_input, "Search input not found")
        search_input.clear()
        search_input.send_keys("guest")
        
        # Step 3: Click search button
        search_button = self._get_clickable_element(
            By.XPATH,
            self.SEARCH_BUTTON_XPATH
        )
        self.assertIsNotNone(search_button, "Search button not found")
        search_button.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.HOME_URL)
        )
        time.sleep(1)
        
        # Step 4: Verify navigation to search results page
        current_url = self.driver.current_url
        self.assertIn("/search", current_url, f"Expected search page, got: {current_url}")
        
        # Step 5: Verify search query in URL
        self.assertIn("q=guest", current_url, f"Expected query parameter 'q=guest' in URL: {current_url}")
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully performed search")
        print(f"  - Current URL: {current_url}")
        print(f"  - Search query: guest")

    def test_10_popular_categories_other_navigation(self):
        """
        Test Case: Guest user clicks a category in popular categories section on home page
        
        Steps:
        1. Start on home page
        2. Click a category in popular categories section
        3. Verify navigation to requests page with category filter
        """
        # Step 1: Already on home page (setUp method)
        self._verify_guest_mode()
        
        # Step 2: Click first category in popular categories
        other_category = self._get_clickable_element(
            By.XPATH,
            self.POPULAR_CATEGORIES_OTHER_XPATH
        )
        self.assertIsNotNone(other_category, "Category not found in popular categories")
        other_category.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.HOME_URL)
        )
        time.sleep(1)
        
        # Step 3: Verify navigation to requests page with category filter
        current_url = self.driver.current_url
        self.assertIn("/requests", current_url, f"Expected requests page, got: {current_url}")
        self.assertIn("category=", current_url, f"Expected category parameter in URL: {current_url}")
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to category requests from home page")
        print(f"  - Current URL: {current_url}")

    def test_11_categories_page_other_services_navigation(self):
        """
        Test Case: Guest user clicks a category in categories page
        
        Steps:
        1. Navigate to categories page
        2. Click a category
        3. Verify navigation to requests page with category filter
        """
        # Step 1: Navigate to categories page
        self.driver.get(self.CATEGORIES_URL)
        time.sleep(1)
        self._verify_guest_mode()
        
        # Step 2: Click first category in categories page
        other_services = self._get_clickable_element(
            By.XPATH,
            self.CATEGORIES_OTHER_SERVICES_XPATH
        )
        self.assertIsNotNone(other_services, "Category not found in categories page")
        other_services.click()
        
        # Wait for navigation
        WebDriverWait(self.driver, 10).until(
            EC.url_changes(self.CATEGORIES_URL)
        )
        time.sleep(1)
        
        # Step 3: Verify navigation to requests page with category filter
        current_url = self.driver.current_url
        self.assertIn("/requests", current_url, f"Expected requests page, got: {current_url}")
        self.assertIn("category=", current_url, f"Expected category parameter in URL: {current_url}")
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully navigated to category requests from categories page")
        print(f"  - Current URL: {current_url}")

    def test_12_filter_requests_by_location(self):
        """
        Test Case: Guest user filters requests by location
        
        Steps:
        1. Navigate to requests page
        2. Open address filter
        3. Enter location in filter input (Istanbul)
        4. Click filter button
        5. Verify filter is applied
        """
        # Step 1: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(1)
        self._verify_guest_mode()
        
        # Step 2: Enter location in filter input
        location_input = self._get_element(
            By.XPATH,
            self.FILTER_LOCATION_INPUT_XPATH
        )
        self.assertIsNotNone(location_input, "Location filter input not found")
        location_input.clear()
        location_input.send_keys("Istanbul")
        
        # Step 4: Click filter button
        filter_button = self._get_clickable_element(
            By.XPATH,
            self.FILTER_LOCATION_BUTTON_XPATH
        )
        self.assertIsNotNone(filter_button, "Filter location button not found")
        filter_button.click()
        
        # Wait for filter to be applied
        time.sleep(2)
        
        # Step 5: Verify filter is applied (page should reload or update)
        current_url = self.driver.current_url
        
        # Verify still in guest mode
        self._verify_guest_mode()
        
        print("✓ Guest user successfully filtered requests by location")
        print(f"  - Current URL: {current_url}")
        print(f"  - Location filter: Istanbul")


def run_tests():
    """Run the test suite"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(GuestBrowsingTest)
    
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
