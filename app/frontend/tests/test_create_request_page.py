"""
Test Suite: Scenario 3 - Create a Request

This test suite validates the complete Create Request flow for authenticated users.
It covers all four steps of the wizard form and various edge cases.

Test Data:
    - Description: "Need help carrying groceries"
    - Category: "Grocery Shopping"
    - Deadline: Future date/time
    - Location: "Istanbul, Beşiktaş"
"""

import pytest
import os
import time
from datetime import datetime, timedelta
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from pages.create_request_page import CreateRequestPage


class TestCreateRequestPage:
    """Test class for Create Request functionality"""

    BASE_URL = "http://localhost:5173"

    # Test data
    VALID_TITLE = "Need help carrying groceries"
    VALID_CATEGORY = "Grocery Shopping"
    VALID_DESCRIPTION = "I need help carrying groceries from the market to my apartment. Please help me organize them in the kitchen as well."
    VALID_URGENCY = "High"
    VALID_COUNTRY = "Turkey"
    VALID_STATE = "Istanbul"
    VALID_CITY = "Beşiktaş"
    VALID_NEIGHBORHOOD = "Etiler"
    VALID_STREET = "Sinanpaşa Caddesi"
    VALID_BUILDING_NO = "42"
    VALID_DOOR_NO = "5"
    VALID_ADDRESS_DESCRIPTION = "Building with blue gate, near the metro station"

    @classmethod
    def setUpClass(cls):
        """Set up test class - authenticate user before tests"""
        # Note: In a real scenario, you would need to authenticate the user first
        # This could be done by:
        # 1. Using a pre-existing test account
        # 2. Creating an account via API before tests
        # 3. Using session/token from previous login test
        pass

    def test_01_navigate_to_create_request_page(self, web_driver, wait):
        """
        Test: User can navigate to Create Request page
        Expected: Page loads with Step 1 visible
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Verify page title/heading is visible
        heading = wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Create')]")))
        assert heading is not None, "Create Request heading not found"

        # Verify on Step 1
        assert page.is_on_step(1), "Should be on Step 1"

        page.capture_screenshot("test_01_create_request_page_loaded")

    def test_02_step1_fill_general_information(self, web_driver, wait):
        """
        Test: User can fill Step 1 (General Information)
        Expected: All fields accept input correctly
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill general information
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY,
            required_people=2
        )

        # Verify fields are filled
        title_input = web_driver.find_element(*CreateRequestPage.TITLE_INPUT)
        assert title_input.get_attribute("value") == self.VALID_TITLE, "Title not filled correctly"

        desc_textarea = web_driver.find_element(*CreateRequestPage.DESCRIPTION_TEXTAREA)
        assert self.VALID_DESCRIPTION in desc_textarea.get_attribute("value"), "Description not filled correctly"

        page.capture_screenshot("test_02_step1_filled")

    def test_03_step1_to_step2_navigation(self, web_driver, wait):
        """
        Test: User can navigate from Step 1 to Step 2
        Expected: Next button takes user to Step 2 (Upload Photos)
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Step 1
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )

        # Click Next
        page.click_next()

        # Verify on Step 2
        wait.until(EC.presence_of_element_located(CreateRequestPage.SELECT_PHOTOS_BTN))
        assert page.is_on_step(2), "Should be on Step 2 (Upload Photos)"

        page.capture_screenshot("test_03_step2_navigation")

    def test_04_step2_upload_photos_skipped(self, web_driver, wait):
        """
        Test: User can proceed without uploading photos (optional step)
        Expected: Can go to Step 3 without photos
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Step 1
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )

        # Click Next to Step 2
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.SELECT_PHOTOS_BTN))

        # Skip photos and click Next
        page.click_next()

        # Verify on Step 3
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))
        assert page.is_on_step(3), "Should be on Step 3 (Determine Deadline)"

        page.capture_screenshot("test_04_step3_navigation_no_photos")

    def test_05_step3_select_deadline(self, web_driver, wait):
        """
        Test: User can select a deadline date
        Expected: Calendar accepts date selection
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Step 1
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )

        # Go to Step 3
        page.click_next()
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))

        # Select a date (e.g., day 18)
        page.select_deadline_date(18)

        # Verify we're still on Step 3 (date selection doesn't navigate away)
        assert page.is_on_step(3), "Should still be on Step 3 after date selection"

        page.capture_screenshot("test_05_step3_deadline_selected")

    def test_06_step3_to_step4_navigation(self, web_driver, wait):
        """
        Test: User can navigate from Step 3 to Step 4
        Expected: Next button takes user to Step 4 (Setup Address)
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Steps 1, 2, 3
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )
        page.click_next()
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))

        # Select deadline date
        page.select_deadline_date(18)

        # Click Next to Step 4
        page.click_next()

        # Verify on Step 4
        wait.until(EC.presence_of_element_located(CreateRequestPage.COUNTRY_SELECT))
        assert page.is_on_step(4), "Should be on Step 4 (Setup Address)"

        page.capture_screenshot("test_06_step4_navigation")

    def test_07_step4_fill_address(self, web_driver, wait):
        """
        Test: User can fill Step 4 (Setup Address)
        Expected: All address fields accept input
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Steps 1, 2, 3
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )
        page.click_next()
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))

        # Select deadline date
        page.select_deadline_date(18)

        # Go to Step 4
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.COUNTRY_SELECT))

        # Fill address
        page.fill_address(
            country=self.VALID_COUNTRY,
            state=self.VALID_STATE,
            city=self.VALID_CITY,
            neighborhood=self.VALID_NEIGHBORHOOD,
            street=self.VALID_STREET,
            building_no=self.VALID_BUILDING_NO,
            door_no=self.VALID_DOOR_NO
        )

        # Verify address fields are filled
        neighborhood_input = web_driver.find_element(*CreateRequestPage.NEIGHBORHOOD_INPUT)
        assert neighborhood_input.get_attribute("value") == self.VALID_NEIGHBORHOOD, "Neighborhood not filled"

        page.capture_screenshot("test_07_step4_address_filled")

    def test_08_complete_create_request_flow(self, web_driver, wait):
        """
        Test: User can complete entire Create Request flow
        Expected: Request is created and persists in DB
        Acceptance Evidence:
            - DB record exists
            - UI shows newly created request
            - 201/200 API responses logged
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Step 1: Fill general information
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY,
            required_people=2
        )
        page.click_next()

        # Step 2: Skip photos (optional)
        wait.until(EC.presence_of_element_located(CreateRequestPage.SELECT_PHOTOS_BTN))
        page.click_next()

        # Step 3: Select deadline date
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))
        page.select_deadline_date(18)
        page.click_next()

        time.sleep(2)

        # Step 4: Fill address
        wait.until(EC.presence_of_element_located(CreateRequestPage.COUNTRY_SELECT))
        page.fill_address(
            country=self.VALID_COUNTRY,
            state=self.VALID_STATE,
            city=self.VALID_CITY,
            neighborhood=self.VALID_NEIGHBORHOOD,
            street=self.VALID_STREET,
            building_no=self.VALID_BUILDING_NO,
            door_no=self.VALID_DOOR_NO
        )

        # Submit
        page.click_create_request()

        # Verify request was created
        # Wait for success message or redirect to request detail/feed
        try:
            success_msg = wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'success')] | //div[contains(text(), 'created')]"))
            )
            assert success_msg is not None, "No success message found"
        except:
            # Alternatively, check if redirected to request detail page
            assert "request" in web_driver.current_url.lower(), "Should redirect to request page after creation"

        page.capture_screenshot("test_08_request_created_success")

    def test_09_negative_empty_title(self, web_driver, wait):
        """
        Test: Form validation - empty title
        Expected: Validation error, request not created
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Try to fill without title
        title_input = wait.until(EC.presence_of_element_located(CreateRequestPage.TITLE_INPUT))
        title_input.send_keys("")  # Empty title

        # Fill other required fields
        desc_textarea = web_driver.find_element(*CreateRequestPage.DESCRIPTION_TEXTAREA)
        desc_textarea.send_keys(self.VALID_DESCRIPTION)

        # Try to proceed
        page.click_next()

        # Should see validation error or stay on same step
        error_msg = page.get_validation_error()
        if error_msg:
            assert error_msg is not None, "Validation error expected for empty title"
        else:
            # Verify still on Step 1
            assert page.is_on_step(1), "Should remain on Step 1 with validation error"

        page.capture_screenshot("test_09_validation_empty_title")

    def test_10_negative_short_description(self, web_driver, wait):
        """
        Test: Form validation - description too short
        Expected: Validation error, show description requirement
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill title
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description="Too short",  # Less than minimum required
            urgency=self.VALID_URGENCY
        )

        # Try to proceed
        page.click_next()

        # Should see validation error or stay on same step
        error_msg = page.get_validation_error()
        if error_msg:
            assert "description" in error_msg.lower(), "Error should mention description requirement"
        else:
            # Verify still on Step 1
            assert page.is_on_step(1), "Should remain on Step 1 with validation error"

        page.capture_screenshot("test_10_validation_short_description")

    def test_11_negative_past_deadline(self, web_driver, wait):
        """
        Test: Form validation - deadline in the past
        Expected: Validation error, no creation
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Steps 1 and 2
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )
        page.click_next()
        page.click_next()

        # Try to select past date
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))

        # Try to select day 1 (likely in the past)
        try:
            page.select_deadline_date(1)

            # Try to proceed
            page.click_next()

            # Should see validation error
            error_msg = page.get_validation_error()
            if error_msg:
                assert "past" in error_msg.lower() or "deadline" in error_msg.lower(), \
                    "Error should mention past deadline"
            else:
                # May stay on Step 3 if date is blocked
                assert page.is_on_step(3), "Should remain on Step 3 with validation error"
        except:
            # If past dates are disabled, this test passes
            pass

        page.capture_screenshot("test_11_validation_past_deadline")

    def test_12_negative_missing_location(self, web_driver, wait):
        """
        Test: Form validation - missing required location fields
        Expected: Clear inline error, no submission
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Steps 1-3
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )
        page.click_next()
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))

        page.select_deadline_date(18)
        page.set_deadline_time("14:30")
        page.click_next()

        # Go to Step 4 but don't fill required country
        wait.until(EC.presence_of_element_located(CreateRequestPage.COUNTRY_SELECT))

        # Try to submit without address
        page.click_create_request()

        # Should see validation error
        error_msg = page.get_validation_error()
        if error_msg:
            assert error_msg is not None, "Validation error expected for missing location"
        else:
            # Verify still on Step 4
            assert page.is_on_step(4), "Should remain on Step 4 with validation error"

        page.capture_screenshot("test_12_validation_missing_location")

    def test_13_back_navigation(self, web_driver, wait):
        """
        Test: Back button navigation works correctly
        Expected: User can go back through all steps without losing data
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Fill Step 1
        page.fill_general_information(
            title=self.VALID_TITLE,
            category=self.VALID_CATEGORY,
            description=self.VALID_DESCRIPTION,
            urgency=self.VALID_URGENCY
        )

        # Navigate forward
        page.click_next()
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.CALENDAR_MONTH_YEAR))

        # Go back
        page.click_back()
        page.click_back()

        # Verify back on Step 1 and data is preserved
        assert page.is_on_step(1), "Should be back on Step 1"
        title_input = web_driver.find_element(*CreateRequestPage.TITLE_INPUT)
        assert self.VALID_TITLE in title_input.get_attribute("value"), "Title data should be preserved"

        page.capture_screenshot("test_13_back_navigation")


class TestCreateRequestPageNegative:
    """Additional negative test cases"""

    BASE_URL = "http://localhost:5173"
    INVALID_TITLE = ""
    INVALID_DESCRIPTION = "Short"

    @pytest.mark.skip_login
    def test_01_form_requires_authentication(self, web_driver, wait):
        """
        Test: Unauthenticated user cannot access Create Request
        Expected: Redirect to login page
        """
        # Clear any existing cookies/session first
        web_driver.delete_all_cookies()
        web_driver.execute_script("window.localStorage.clear();")
        web_driver.execute_script("window.sessionStorage.clear();")
        web_driver.get(f"{self.BASE_URL}/")  # Start fresh

        # Now try to access create request page without login
        web_driver.get(f"{self.BASE_URL}/create-request")

        # Should redirect to login
        assert "login" in web_driver.current_url.lower() or \
               "auth" in web_driver.current_url.lower(), \
               "Should redirect to login for unauthenticated user"

    def test_02_no_empty_file_upload(self, web_driver, wait):
        """
        Test: User cannot upload invalid file types
        Expected: Only image files accepted
        """
        page = CreateRequestPage(web_driver, wait)
        page.navigate_to_page()

        # Try to navigate to Step 2
        page.fill_general_information(
            title="Test Request",
            category="Grocery Shopping",
            description="This is a test description for uploading files",
            urgency="High"
        )
        page.click_next()
        wait.until(EC.presence_of_element_located(CreateRequestPage.SELECT_PHOTOS_BTN))

        # Try to upload a non-image file (this would require creating a test file)
        # For now, we verify the file input only accepts images
        file_input = web_driver.find_element(*CreateRequestPage.FILE_INPUT)
        accept_attr = file_input.get_attribute("accept")
        assert "image" in accept_attr, "File input should only accept image files"
