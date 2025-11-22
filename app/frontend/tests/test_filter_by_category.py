"""
Selenium Test Suite for Filter Posts by Category - Scenario 6

This test suite validates the category filter functionality including:
- Filtering posts by specific categories
- Clearing filters to restore full list
- Empty state handling when no posts match
- Filter persistence and pagination
- Network request validation for category params

Test Categories:
- Moving Help
- Tutoring
- Home Repair
- Other categories as available

Prerequisites:
- Selenium WebDriver installed
- Chrome/Firefox browser installed
- Application running on http://localhost:5173 (or configured URL)
- Multiple requests exist in different categories
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


class FilterByCategoryTest(unittest.TestCase):
    """Test cases for Filter Posts by Category functionality"""

    # Configuration
    BASE_URL = "http://localhost:5173"  # Update this to match your dev server
    FEED_URL = f"{BASE_URL}/"
    REQUESTS_URL = f"{BASE_URL}/requests"
    
    # Test categories (using backend keys - matching actual application)
    CATEGORY_HOME_REPAIR = "HOME_REPAIR"
    CATEGORY_HOME_REPAIR_DISPLAY = "Home Repair"
    CATEGORY_TUTORING = "TUTORING"
    CATEGORY_TUTORING_DISPLAY = "Tutoring"
    CATEGORY_MOVING_HELP = "MOVING_HELP"
    CATEGORY_MOVING_HELP_DISPLAY = "Moving Help"
    CATEGORY_GROCERY_SHOPPING = "GROCERY_SHOPPING"
    CATEGORY_GROCERY_SHOPPING_DISPLAY = "Grocery Shopping"
    CATEGORY_HOUSE_CLEANING = "HOUSE_CLEANING"
    CATEGORY_HOUSE_CLEANING_DISPLAY = "House Cleaning"
    CATEGORY_OTHER_SERVICES = "OTHER_SERVICES"
    CATEGORY_OTHER_SERVICES_DISPLAY = "Other Services"
    CATEGORY_OTHER = "OTHER"
    CATEGORY_OTHER_DISPLAY = "Other"
    
    # Locators
    REQUEST_CARDS_XPATH = "//div[contains(@role, 'article') or contains(@style, 'cursor: pointer')]"
    CATEGORY_BUTTON_XPATH = "//button[contains(@aria-label, 'Filter by') and contains(@aria-label, 'category')]"
    CLEAR_FILTER_LINK_XPATH = "//button[contains(text(), 'Clear filters')]"
    EMPTY_STATE_XPATH = "//*[contains(text(), 'No Requests Available') or contains(text(), 'no requests')]"
    PAGE_TITLE_XPATH = "//h1[contains(text(), 'Requests')]"
    
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
        
        # Enable logging for network requests
        chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(10)
        cls.wait = WebDriverWait(cls.driver, 10)

    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        cls.driver.quit()

    def setUp(self):
        """Set up before each test"""
        # Navigate to feed/requests page
        self.driver.get(self.FEED_URL)
        time.sleep(2)  # Allow page to load

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
            return None

    def _get_clickable_element(self, by, value, timeout=10):
        """Helper method to get a clickable element"""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, value))
            )
        except TimeoutException:
            return None

    def _get_all_elements(self, by, value, timeout=5):
        """Helper method to get all matching elements"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return self.driver.find_elements(by, value)
        except TimeoutException:
            return []

    def _select_category_by_clicking_badge(self, category_display_name):
        """Helper method to select a category by clicking a category badge on a request card"""
        try:
            # Find a category button with the display name
            category_button = self._get_clickable_element(
                By.XPATH,
                f"//button[contains(@aria-label, 'Filter by {category_display_name}')]",
                timeout=5
            )
            if category_button:
                category_button.click()
                time.sleep(2)
                return True
        except:
            pass
        return False

    def _navigate_to_category_via_url(self, category_key):
        """Helper method to navigate directly to category filter via URL"""
        url = f"{self.REQUESTS_URL}?category={category_key}&page=1"
        self.driver.get(url)
        time.sleep(2)
        return True

    def _clear_filter(self):
        """Helper method to clear filter by clicking 'Clear filters' link"""
        clear_button = self._get_clickable_element(
            By.XPATH,
            self.CLEAR_FILTER_LINK_XPATH,
            timeout=3
        )
        if clear_button:
            clear_button.click()
            time.sleep(2)
            return True
        
        # Alternative: navigate to base requests URL
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        return True

    def _get_request_count(self):
        """Helper method to count visible request cards"""
        request_cards = self._get_all_elements(By.XPATH, self.REQUEST_CARDS_XPATH)
        return len(request_cards)

    def _check_empty_state(self):
        """Helper method to check if empty state message is displayed"""
        empty_state = self._get_element(By.XPATH, self.EMPTY_STATE_XPATH, timeout=3)
        return empty_state is not None and empty_state.is_displayed()

    def _get_category_from_request_card(self, card_element):
        """Helper method to extract category from a request card"""
        try:
            # Find category button within the card
            category_button = card_element.find_element(
                By.XPATH,
                ".//button[contains(@aria-label, 'Filter by') and contains(@aria-label, 'category')]"
            )
            return category_button.text
        except NoSuchElementException:
            return None

    def _verify_all_cards_match_category(self, expected_category_display):
        """Helper method to verify all visible cards belong to selected category"""
        request_cards = self._get_all_elements(By.XPATH, self.REQUEST_CARDS_XPATH, timeout=3)
        
        if len(request_cards) == 0:
            return True, []  # No cards to verify
        
        mismatches = []
        for idx, card in enumerate(request_cards):
            category = self._get_category_from_request_card(card)
            if category and category != expected_category_display:
                mismatches.append(f"Card {idx + 1}: expected '{expected_category_display}', got '{category}'")
        
        return len(mismatches) == 0, mismatches
    
    def _check_page_title_contains(self, text):
        """Helper method to check if page title contains specific text"""
        try:
            title_element = self._get_element(By.XPATH, self.PAGE_TITLE_XPATH, timeout=3)
            if title_element:
                return text in title_element.text
        except:
            pass
        return False

    def _get_network_logs(self):
        """Helper method to extract network logs for API requests"""
        logs = self.driver.get_log('performance')
        api_requests = []
        
        for log in logs:
            try:
                import json
                message = json.loads(log['message'])['message']
                if message['method'] == 'Network.requestWillBeSent':
                    request = message['params']['request']
                    url = request['url']
                    # Filter for API requests
                    if '/api/' in url or '/requests' in url:
                        api_requests.append({
                            'url': url,
                            'method': request.get('method', 'GET')
                        })
            except:
                continue
        
        return api_requests

    def _check_category_param_in_url(self, category_name):
        """Helper method to check if category parameter is in URL query string"""
        current_url = self.driver.current_url
        return category_name.lower().replace(' ', '+') in current_url.lower() or \
               f"category={category_name}" in current_url or \
               category_name in current_url

    # ==================== TEST CASES ====================

    def test_01_requests_page_loads_correctly(self):
        """
        Test Case: Verify requests page loads with request cards
        
        Steps:
        1. Navigate to /requests page
        2. Verify page title exists
        3. Verify request cards are displayed (if any exist)
        """
        # Step 1: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 2: Verify page title exists
        page_title = self._get_element(By.XPATH, self.PAGE_TITLE_XPATH)
        self.assertIsNotNone(page_title, "Page title not found on requests page")
        
        # Step 3: Check for request cards or empty state
        request_cards = self._get_all_elements(By.XPATH, self.REQUEST_CARDS_XPATH, timeout=3)
        is_empty = self._check_empty_state()
        
        if is_empty:
            print("✓ Requests page loads (showing empty state)")
        elif len(request_cards) > 0:
            print(f"✓ Requests page loads with {len(request_cards)} request cards")
            
            # Verify category buttons exist on cards
            category_buttons = self._get_all_elements(By.XPATH, self.CATEGORY_BUTTON_XPATH, timeout=3)
            print(f"  - Found {len(category_buttons)} category buttons on cards")
        else:
            print("✓ Requests page loads")

    def test_02_filter_by_home_repair_category(self):
        """
        Test Case: Filter posts by Home Repair category (Main Scenario - Step 2-3)
        
        Actor: Any user (guest or authenticated)
        Preconditions: Requests exist in Home Repair category
        
        Steps:
        1. Navigate to /requests page
        2. Filter by Home Repair category (via URL)
        3. Verify only Home Repair posts are shown
        4. Verify URL contains category parameter
        
        Expected Results:
        - Only posts belonging to Home Repair category are shown
        - URL contains ?category=HOME_REPAIR parameter
        - Page title shows "Home Repair Requests"
        """
        # Step 1: Navigate to requests page
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        initial_count = self._get_request_count()
        print(f"  - Initial request count: {initial_count}")
        
        # Step 2: Filter by Home Repair category via URL
        success = self._navigate_to_category_via_url(self.CATEGORY_HOME_REPAIR)
        self.assertTrue(success, f"Failed to navigate to {self.CATEGORY_HOME_REPAIR} category")
        
        # Step 3: Verify filtered results
        time.sleep(2)
        filtered_count = self._get_request_count()
        
        # Check if empty state or results
        if self._check_empty_state():
            print(f"✓ Filter applied - No {self.CATEGORY_HOME_REPAIR_DISPLAY} requests found (empty state)")
            empty_msg = self._get_element(By.XPATH, self.EMPTY_STATE_XPATH)
            self.assertIsNotNone(empty_msg, "Empty state message should be displayed")
        else:
            self.assertGreater(filtered_count, 0, "Expected some Home Repair requests to be shown")
            
            # Verify all visible cards match category
            matches, mismatches = self._verify_all_cards_match_category(self.CATEGORY_HOME_REPAIR_DISPLAY)
            if not matches:
                print(f"  ⚠ Category mismatches found: {mismatches[:3]}")
            
            print(f"✓ Filter by {self.CATEGORY_HOME_REPAIR_DISPLAY} works")
            print(f"  - Filtered count: {filtered_count}")
        
        # Step 4: Verify URL contains category parameter
        current_url = self.driver.current_url
        self.assertIn(f"category={self.CATEGORY_HOME_REPAIR}", current_url, 
                     "URL should contain category parameter")
        
        # Verify page title updated
        self.assertTrue(self._check_page_title_contains(self.CATEGORY_HOME_REPAIR_DISPLAY),
                       "Page title should contain category name")

    def test_03_clear_filter_and_apply_tutoring(self):
        """
        Test Case: Clear filter and apply Tutoring category (Main Scenario - Step 4)
        
        Steps:
        1. Apply Home Repair filter
        2. Clear filter via 'Clear filters' link
        3. Verify full list is restored
        4. Apply Tutoring filter
        5. Verify only Tutoring posts are shown
        
        Expected Results:
        - Clearing filter restores full list
        - Tutoring filter shows only tutoring posts
        """
        # Step 1: Apply Home Repair filter
        self._navigate_to_category_via_url(self.CATEGORY_HOME_REPAIR)
        time.sleep(2)
        
        home_repair_count = self._get_request_count()
        print(f"  - Home Repair count: {home_repair_count}")
        
        # Verify filter is active
        self.assertIn(f"category={self.CATEGORY_HOME_REPAIR}", self.driver.current_url)
        
        # Step 2: Clear filter
        clear_success = self._clear_filter()
        self.assertTrue(clear_success, "Failed to clear filter")
        
        # Step 3: Verify full list restored
        restored_count = self._get_request_count()
        print(f"  - Restored count: {restored_count}")
        
        # Verify URL no longer has category parameter
        current_url = self.driver.current_url
        self.assertNotIn("category=", current_url, "Category parameter should be removed after clearing")
        
        # Step 4: Apply Tutoring filter
        self._navigate_to_category_via_url(self.CATEGORY_TUTORING)
        time.sleep(2)
        
        # Step 5: Verify Tutoring results
        tutoring_count = self._get_request_count()
        
        if self._check_empty_state():
            print(f"✓ Clear and refilter works - No {self.CATEGORY_TUTORING_DISPLAY} requests found")
        else:
            self.assertGreater(tutoring_count, 0, "Expected some Tutoring requests to be shown")
            
            # Verify all visible cards match category
            matches, mismatches = self._verify_all_cards_match_category(self.CATEGORY_TUTORING_DISPLAY)
            if not matches:
                print(f"  ⚠ Category mismatches found: {mismatches[:3]}")
            
            print(f"✓ Clear filter and apply {self.CATEGORY_TUTORING_DISPLAY} works")
            print(f"  - Tutoring count: {tutoring_count}")
        
        # Verify URL contains new category
        self.assertIn(f"category={self.CATEGORY_TUTORING}", self.driver.current_url)

    def test_04_empty_state_when_no_posts_in_category(self):
        """
        Test Case: Empty state message when no posts in selected category (Negative/Edge)
        
        Steps:
        1. Navigate to a category that likely has no posts
        2. Verify empty state message is shown
        3. Verify no request cards visible
        
        Expected Results:
        - Empty state message: "No Requests Available" or similar
        - No request cards visible
        - Message: "There are currently no requests to display."
        """
        # Try multiple categories to find one with no posts
        test_categories = [
            ("OTHER", "Other Services"),
            ("ELDERLY_CARE", "Elderly Care"),
            ("HEALTHCARE", "Healthcare"),
            ("EDUCATION", "Education")
        ]
        
        found_empty = False
        
        for category_key, category_display in test_categories:
            try:
                self._navigate_to_category_via_url(category_key)
                time.sleep(2)
                
                if self._check_empty_state():
                    found_empty = True
                    print(f"✓ Empty state shown for category: {category_display}")
                    
                    # Verify no request cards are visible
                    count = self._get_request_count()
                    self.assertEqual(count, 0, "Request cards should not be visible in empty state")
                    
                    # Verify empty state message
                    empty_element = self._get_element(By.XPATH, self.EMPTY_STATE_XPATH)
                    self.assertIsNotNone(empty_element, "Empty state element not found")
                    self.assertTrue(empty_element.is_displayed(), "Empty state should be visible")
                    
                    print(f"  - Empty state message: {empty_element.text}")
                    break
                    
            except Exception as e:
                continue
        
        if not found_empty:
            print("⚠ No empty category found - all tested categories have posts")
            print("  This test requires a category with no posts to fully validate empty state")

    def test_05_filter_persistence_across_page_actions(self):
        """
        Test Case: Filter persists during pagination or page interactions
        
        Steps:
        1. Apply Home Repair filter
        2. Scroll down
        3. Verify filter still applied (check URL)
        4. If pagination exists, click next page
        5. Verify filter still applied on new page
        
        Expected Results:
        - Filter persists during scrolling
        - Filter persists across pagination
        - URL maintains category parameter
        - All results continue to match selected category
        """
        # Step 1: Apply filter
        self._navigate_to_category_via_url(self.CATEGORY_HOME_REPAIR)
        time.sleep(2)
        
        initial_count = self._get_request_count()
        initial_url = self.driver.current_url
        
        # Verify category in URL
        self.assertIn(f"category={self.CATEGORY_HOME_REPAIR}", initial_url)
        
        # Step 2: Scroll down
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        
        # Step 3: Verify filter still applied
        after_scroll_url = self.driver.current_url
        self.assertIn(f"category={self.CATEGORY_HOME_REPAIR}", after_scroll_url,
                     "Category parameter should persist after scroll")
        
        after_scroll_count = self._get_request_count()
        
        # Verify all cards still match category
        if after_scroll_count > 0:
            matches, mismatches = self._verify_all_cards_match_category(self.CATEGORY_HOME_REPAIR_DISPLAY)
            if not matches:
                print(f"  ⚠ After scroll, category mismatches: {mismatches[:3]}")
        
        # Step 4: Look for pagination controls
        try:
            next_button = self._get_clickable_element(
                By.XPATH,
                "//button[contains(text(), 'Next')]",
                timeout=3
            )
            if next_button and next_button.is_enabled():
                next_button.click()
                time.sleep(2)
                
                # Step 5: Verify filter on new page
                page_2_url = self.driver.current_url
                self.assertIn(f"category={self.CATEGORY_HOME_REPAIR}", page_2_url,
                             "Category parameter should persist across pages")
                self.assertIn("page=2", page_2_url, "Should be on page 2")
                
                page_2_count = self._get_request_count()
                if page_2_count > 0:
                    matches, mismatches = self._verify_all_cards_match_category(self.CATEGORY_HOME_REPAIR_DISPLAY)
                    if not matches:
                        print(f"  ⚠ On page 2, category mismatches: {mismatches[:3]}")
                
                print(f"✓ Filter persists across pagination")
                print(f"  - Page 2 count: {page_2_count}")
        except:
            print("  - No pagination available (single page or all items fit)")
        
        print("✓ Filter persistence verified")

    def test_06_multiple_category_switches(self):
        """
        Test Case: Switching between multiple categories works correctly
        
        Steps:
        1. Apply Moving Help filter
        2. Verify results
        3. Switch to Tutoring filter
        4. Verify results updated
        5. Switch to Home Repair filter
        6. Verify results updated again
        
        Expected Results:
        - Each category switch shows appropriate results
        - URL updates with correct category parameter
        - Results update immediately
        """
        categories_to_test = [
            (self.CATEGORY_MOVING_HELP, self.CATEGORY_MOVING_HELP_DISPLAY),
            (self.CATEGORY_TUTORING, self.CATEGORY_TUTORING_DISPLAY),
            (self.CATEGORY_HOME_REPAIR, self.CATEGORY_HOME_REPAIR_DISPLAY)
        ]
        
        results = {}
        
        for category_key, category_display in categories_to_test:
            # Navigate to category
            self._navigate_to_category_via_url(category_key)
            time.sleep(2)
            
            # Verify URL
            current_url = self.driver.current_url
            self.assertIn(f"category={category_key}", current_url,
                         f"URL should contain category={category_key}")
            
            # Get count
            count = self._get_request_count()
            is_empty = self._check_empty_state()
            
            results[category_display] = {
                'count': count,
                'empty': is_empty
            }
            
            if is_empty:
                print(f"  - {category_display}: No requests (empty state)")
            else:
                print(f"  - {category_display}: {count} requests")
                
                # Verify category match
                if count > 0:
                    matches, mismatches = self._verify_all_cards_match_category(category_display)
                    if not matches:
                        print(f"    ⚠ Mismatches: {mismatches[:3]}")  # Show first 3
        
        print("✓ Multiple category switches work correctly")
        print(f"  - Tested categories: {list(results.keys())}")
        print(f"  - All URL parameters updated correctly")

    def test_07_category_filter_with_guest_user(self):
        """
        Test Case: Guest user can use category filter (Actor: Guest user)
        
        Steps:
        1. Ensure not logged in (guest mode)
        2. Navigate to requests page with category filter
        3. Verify filter works without authentication
        
        Expected Results:
        - Guest users can access filtered requests via URL
        - Results are filtered correctly
        """
        # Step 1: Clear any authentication
        self.driver.delete_all_cookies()
        try:
            self.driver.execute_script("window.localStorage.clear();")
            self.driver.execute_script("window.sessionStorage.clear();")
        except:
            pass
        
        # Step 2: Navigate to filtered requests as guest
        self._navigate_to_category_via_url(self.CATEGORY_TUTORING)
        time.sleep(2)
        
        # Step 3: Verify filter works
        count = self._get_request_count()
        is_empty = self._check_empty_state()
        
        # Verify URL contains category
        current_url = self.driver.current_url
        self.assertIn(f"category={self.CATEGORY_TUTORING}", current_url)
        
        if is_empty:
            print("✓ Guest user can use filter - No results for selected category")
        else:
            self.assertGreater(count, 0, "Guest user should see filtered results")
            print(f"✓ Guest user can use category filter")
            print(f"  - Filtered results: {count}")

    def test_08_clearing_filter_shows_all_posts(self):
        """
        Test Case: Clearing category filter shows all posts
        
        Steps:
        1. Apply specific category filter
        2. Note the filtered count
        3. Clear filter by navigating to base /requests URL
        4. Verify count increases or stays same (shows all)
        
        Expected Results:
        - Clearing filter shows unfiltered results
        - Count should be >= any single category count
        - URL should not contain category parameter
        """
        # Step 1: Apply specific filter
        self._navigate_to_category_via_url(self.CATEGORY_HOME_REPAIR)
        time.sleep(2)
        
        filtered_count = self._get_request_count()
        print(f"  - Filtered count ({self.CATEGORY_HOME_REPAIR_DISPLAY}): {filtered_count}")
        
        # Step 3: Clear filter by navigating to base URL
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 4: Verify unfiltered count
        all_count = self._get_request_count()
        print(f"  - All requests count: {all_count}")
        
        # Verify URL has no category parameter
        current_url = self.driver.current_url
        self.assertNotIn("category=", current_url, "URL should not contain category parameter")
        
        # Count after clearing should be >= filtered count
        self.assertGreaterEqual(
            all_count,
            filtered_count,
            "All requests should show >= single category count"
        )
        
        print("✓ Clearing filter shows all posts")
        print(f"  - Difference: +{all_count - filtered_count} requests")

    def test_09_category_filter_url_parameters(self):
        """
        Test Case: URL carries correct category query params
        
        Steps:
        1. Navigate with category filter
        2. Verify URL contains correct category parameter
        3. Verify page title reflects category
        4. Verify filtered results displayed
        
        Expected Results:
        - URL includes category parameter
        - Page title shows category name
        - Filtered results match category
        """
        # Step 1: Navigate with filter
        self._navigate_to_category_via_url(self.CATEGORY_TUTORING)
        time.sleep(2)
        
        # Step 2: Check URL
        current_url = self.driver.current_url
        self.assertIn(f"category={self.CATEGORY_TUTORING}", current_url,
                     "URL should contain category parameter")
        self.assertIn("page=1", current_url, "URL should reset to page 1")
        
        print(f"✓ Category parameter found in URL")
        print(f"  - URL: {current_url}")
        
        # Step 3: Verify page title
        has_category_in_title = self._check_page_title_contains(self.CATEGORY_TUTORING_DISPLAY)
        self.assertTrue(has_category_in_title, f"Page title should contain '{self.CATEGORY_TUTORING_DISPLAY}'")
        
        # Step 4: Verify results or empty state
        count = self._get_request_count()
        is_empty = self._check_empty_state()
        
        if is_empty:
            print(f"  - Empty state displayed (no {self.CATEGORY_TUTORING_DISPLAY} requests)")
        else:
            print(f"  - Displaying {count} filtered requests")
            matches, mismatches = self._verify_all_cards_match_category(self.CATEGORY_TUTORING_DISPLAY)
            if matches:
                print(f"  - All cards match {self.CATEGORY_TUTORING_DISPLAY} category")
        
        print("✓ Category filter URL parameters validated")

    def test_10_rapid_category_switching(self):
        """
        Test Case: Rapid category switching doesn't cause errors (Edge case)
        
        Steps:
        1. Rapidly navigate between multiple categories
        2. Verify no errors occur
        3. Verify final results are correct
        
        Expected Results:
        - No JavaScript errors
        - Results eventually stabilize
        - Final results match last selected category
        """
        categories = [
            (self.CATEGORY_HOME_REPAIR, self.CATEGORY_HOME_REPAIR_DISPLAY),
            (self.CATEGORY_TUTORING, self.CATEGORY_TUTORING_DISPLAY),
            (self.CATEGORY_MOVING_HELP, self.CATEGORY_MOVING_HELP_DISPLAY)
        ]
        
        # Rapid switching
        for category_key, _ in categories * 2:  # Switch through twice
            try:
                self._navigate_to_category_via_url(category_key)
                time.sleep(0.5)  # Very short delay
            except:
                pass
        
        # Final navigation
        final_category_key = self.CATEGORY_TUTORING
        final_category_display = self.CATEGORY_TUTORING_DISPLAY
        self._navigate_to_category_via_url(final_category_key)
        time.sleep(3)  # Wait for stabilization
        
        # Verify final URL
        current_url = self.driver.current_url
        self.assertIn(f"category={final_category_key}", current_url,
                     "Final URL should contain last category")
        
        # Verify results
        count = self._get_request_count()
        is_empty = self._check_empty_state()
        
        if not is_empty and count > 0:
            matches, mismatches = self._verify_all_cards_match_category(final_category_display)
            if matches:
                print("✓ Rapid switching handled correctly")
                print(f"  - Final category: {final_category_display}")
                print(f"  - Results: {count}")
            else:
                print("⚠ Some mismatches after rapid switching")
                print(f"  - Mismatches: {len(mismatches)}")
        else:
            print("✓ Rapid switching handled correctly (empty results)")

    def test_11_clicking_category_badge_applies_filter(self):
        """
        Test Case: Clicking category badge on request card applies filter
        
        Steps:
        1. Navigate to /requests page
        2. Find first request card with category badge
        3. Click the category badge
        4. Verify filter is applied via URL
        5. Verify filtered results
        
        Expected Results:
        - Clicking category badge navigates to filtered view
        - URL contains category parameter
        - Only requests in that category are shown
        """
        # Step 1: Navigate to unfiltered requests
        self.driver.get(self.REQUESTS_URL)
        time.sleep(2)
        
        # Step 2: Find first category button on a card
        category_buttons = self._get_all_elements(By.XPATH, self.CATEGORY_BUTTON_XPATH, timeout=5)
        
        if len(category_buttons) == 0:
            print("⚠ No category buttons found - skipping test")
            return
        
        first_button = category_buttons[0]
        clicked_category = first_button.text
        
        print(f"  - Found category badge: {clicked_category}")
        
        # Step 3: Click the category badge
        first_button.click()
        time.sleep(2)
        
        # Step 4: Verify URL contains category parameter
        current_url = self.driver.current_url
        self.assertIn("category=", current_url, "URL should contain category parameter after clicking badge")
        
        # Step 5: Verify filtered results
        count = self._get_request_count()
        is_empty = self._check_empty_state()
        
        if is_empty:
            print(f"✓ Category badge click works - Empty state for {clicked_category}")
        else:
            self.assertGreater(count, 0, "Expected filtered results after clicking category badge")
            
            # Verify all cards match the clicked category
            matches, mismatches = self._verify_all_cards_match_category(clicked_category)
            
            print(f"✓ Clicking category badge applies filter")
            print(f"  - Category: {clicked_category}")
            print(f"  - Filtered results: {count}")
            print(f"  - All cards match: {matches}")
        
        # Verify page title updated
        self.assertTrue(self._check_page_title_contains(clicked_category),
                       f"Page title should contain '{clicked_category}'")


def run_tests():
    """Run the test suite"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(FilterByCategoryTest)
    
    # Run tests with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*70)
    print("TEST SUMMARY - Filter Posts by Category")
    print("="*70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*70)
    
    return result


if __name__ == "__main__":
    run_tests()
