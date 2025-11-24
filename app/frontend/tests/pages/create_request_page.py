from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains


class CreateRequestPage:
    """Page Object for Create Request form"""

    # Base URL
    BASE_URL = "http://localhost:5173"
    PAGE_URL = f"{BASE_URL}/create-request"

    # Locators - General Information Step
    TITLE_INPUT = (By.XPATH, "//input[@placeholder='Help me to see a doctor']")
    CATEGORY_SELECT = (By.XPATH, "//h3[contains(text(), 'Category')]/following-sibling::select | //h3[contains(text(), 'Category')]/../select")
    DESCRIPTION_TEXTAREA = (By.XPATH, "//textarea[@placeholder='Input text']")
    URGENCY_SELECT = (By.XPATH, "//h3[contains(text(), 'Urgency')]/following-sibling::select | //h3[contains(text(), 'Urgency')]/../select")
    # Find the flex container for required people, then get the buttons
    REQUIRED_PEOPLE_CONTAINER = (By.XPATH, "//h3[contains(text(), 'Required number of people')]/following-sibling::div[contains(@class, 'flex')]")
    DECREMENT_PEOPLE_BTN = (By.XPATH, "//h3[contains(text(), 'Required number of people')]/following-sibling::div//button[1]")
    INCREMENT_PEOPLE_BTN = (By.XPATH, "//h3[contains(text(), 'Required number of people')]/following-sibling::div//button[2]")
    REQUIRED_PEOPLE_DISPLAY = (By.XPATH, "//h3[contains(text(), 'Required number of people')]/following-sibling::div//span[contains(@class, 'font-bold')]")

    # Locators - Upload Photos Step
    SELECT_PHOTOS_BTN = (By.XPATH, "//button[contains(text(), 'Select photos')]")
    FILE_INPUT = (By.XPATH, "//input[@type='file' and @accept='image/*']")
    DRAG_DROP_AREA = (By.XPATH, "//div[contains(@class, 'border-2')]")
    REMOVE_PHOTO_BTN = (By.XPATH, "//button[contains(text(), 'Remove')]")

    # Locators - Determine Deadline Step
    PREV_MONTH_BTN = (By.XPATH, "//button[.//svg[contains(@class, 'ArrowBackIosIcon')]]")
    NEXT_MONTH_BTN = (By.XPATH, "//button[.//svg[contains(@class, 'ArrowForwardIosIcon')]]")
    CALENDAR_MONTH_YEAR = (By.XPATH, "//h2[contains(text(), ' ')]")  # Month and year header
    # MUI TimePicker input - look for the input field with AM/PM value or type=time
    TIME_PICKER_INPUT = (By.XPATH, "//input[contains(@value, 'PM') or contains(@value, 'AM') or @type='time']")

    # Locators - Setup Address Step
    # The selects are nested in divs, so we need to find the parent div with h3 then look for select within
    COUNTRY_SELECT = (By.XPATH, "//div[.//h3[contains(text(), 'Country')]]//select")
    STATE_SELECT = (By.XPATH, "//div[.//h3[contains(text(), 'State')] or .//h3[contains(text(), 'Province')]]//select")
    CITY_SELECT = (By.XPATH, "//div[.//h3[contains(text(), 'City')] or .//h3[contains(text(), 'District')]]//select")
    NEIGHBORHOOD_INPUT = (By.XPATH, "//input[@placeholder='Enter neighborhood']")
    STREET_INPUT = (By.XPATH, "//input[@placeholder='Enter street']")
    BUILDING_NO_INPUT = (By.XPATH, "//input[@placeholder='e.g. 14']")
    DOOR_NO_INPUT = (By.XPATH, "//input[@placeholder='e.g. 5']")
    ADDRESS_DESCRIPTION_TEXTAREA = (By.XPATH, "//textarea[@placeholder='Add any additional details...']")

    # Locators - Navigation
    BACK_BTN = (By.XPATH, "//button[contains(text(), 'Back')]")
    NEXT_BTN = (By.XPATH, "//button[contains(text(), 'Next')]")
    CREATE_REQUEST_BTN = (By.XPATH, "//button[contains(text(), 'Create Request')]")

    # Locators - Stepper
    STEP_INDICATORS = (By.XPATH, "//div[contains(@class, 'rounded-full')]")

    def __init__(self, driver, wait):
        """Initialize page with driver and wait objects"""
        self.driver = driver
        self.wait = wait

    def navigate_to_page(self):
        """Navigate to Create Request page"""
        self.driver.get(self.PAGE_URL)
        self.wait.until(EC.presence_of_element_located(self.TITLE_INPUT))

    def fill_general_information(self, title, category, description, urgency, required_people=1):
        """Fill Step 1: General Information"""
        from selenium.webdriver.common.action_chains import ActionChains

        # Fill title
        title_input = self.wait.until(EC.presence_of_element_located(self.TITLE_INPUT))
        title_input.clear()
        title_input.send_keys(title)

        # Select category by finding the option with matching text
        category_select = self.wait.until(EC.presence_of_element_located(self.CATEGORY_SELECT))
        category_select.click()
        category_option = self.driver.find_element(By.XPATH, f"//option[contains(text(), '{category}')]")
        category_option.click()

        # Fill description
        desc_textarea = self.wait.until(EC.presence_of_element_located(self.DESCRIPTION_TEXTAREA))
        desc_textarea.clear()
        desc_textarea.send_keys(description)

        # Select urgency by finding the option with matching text
        urgency_select = self.wait.until(EC.presence_of_element_located(self.URGENCY_SELECT))
        urgency_select.click()
        urgency_option = self.driver.find_element(By.XPATH, f"//option[contains(text(), '{urgency}')]")
        urgency_option.click()

        # Set required people (default is 1, adjust if needed)
        if required_people > 1:
            increment_btn = self.wait.until(EC.element_to_be_clickable(self.INCREMENT_PEOPLE_BTN))
            for _ in range(required_people - 1):
                increment_btn.click()

    def click_next(self):
        """Click Next button to go to next step"""
        next_btn = self.wait.until(EC.element_to_be_clickable(self.NEXT_BTN))
        next_btn.click()

    def click_back(self):
        """Click Back button to go to previous step"""
        back_btn = self.wait.until(EC.element_to_be_clickable(self.BACK_BTN))
        back_btn.click()

    def upload_photos(self, file_paths):
        """
        Upload photos using file input.
        Args:
            file_paths: List of absolute file paths to upload
        """
        file_input = self.driver.find_element(*self.FILE_INPUT)

        # Convert list to comma-separated string for multiple file upload
        file_string = "\n".join(file_paths)
        file_input.send_keys(file_string)

    def drag_and_drop_photos(self, file_paths):
        """
        Upload photos via drag and drop.
        Args:
            file_paths: List of absolute file paths to upload
        """
        # Note: Drag and drop for file uploads requires special handling
        # For simplicity, we recommend using the file input method above
        file_input = self.driver.find_element(*self.FILE_INPUT)
        file_string = "\n".join(file_paths)
        file_input.send_keys(file_string)

    def remove_photo(self, photo_index=0):
        """Remove a photo from the upload"""
        remove_btns = self.driver.find_elements(*self.REMOVE_PHOTO_BTN)
        if photo_index < len(remove_btns):
            remove_btns[photo_index].click()

    def select_deadline_date(self, day):
        """
        Click on a specific day in the calendar.
        Args:
            day: Day number (1-31)
        """
        # The calendar has dates in <td><div>day</div></td> structure
        # Look for td with a div containing the day number
        date_xpath = (By.XPATH, f"//td[.//div[contains(text(), '{day}')]]")
        date_btn = self.wait.until(EC.element_to_be_clickable(date_xpath))
        date_btn.click()

    def navigate_to_month(self, target_month, target_year):
        """
        Navigate to a specific month and year in the calendar.
        Args:
            target_month: Month name or number
            target_year: Year
        """
        # Get current month/year
        month_year_text = self.driver.find_element(*self.CALENDAR_MONTH_YEAR).text

        # Click next/prev buttons to reach target month
        # This is a simplified version - you may need to enhance based on actual calendar behavior
        while target_month not in month_year_text or str(target_year) not in month_year_text:
            if target_month in month_year_text and int(target_year) > int(month_year_text.split()[-1]):
                next_btn = self.driver.find_element(*self.NEXT_MONTH_BTN)
                next_btn.click()
            else:
                prev_btn = self.driver.find_element(*self.PREV_MONTH_BTN)
                prev_btn.click()
            month_year_text = self.driver.find_element(*self.CALENDAR_MONTH_YEAR).text

    def set_deadline_time(self, time_string):
        """Set deadline time by clicking the clock icon"""
        import time as time_module

        # Find and click the clock icon button instead of the input
        clock_button_locators = [
            (By.XPATH, "//button[./*[name()='svg' and contains(@class, 'Clock')]]"),
            (By.XPATH, "//button[contains(@aria-label, 'time')]"),
            (By.XPATH, "//div[contains(@class, 'MuiPickersInputBase')]//button"),
            (By.CSS_SELECTOR, ".MuiPickersInputBase-root button"),
            (By.XPATH, "//input[contains(@class, 'MuiPickersInputBase-input')]/..//button")
        ]

        for locator in clock_button_locators:
            try:
                clock_btn = self.wait.until(EC.element_to_be_clickable(locator))
                self.driver.execute_script("arguments[0].scrollIntoView(true);", clock_btn)
                time_module.sleep(0.5)
                clock_btn.click()
                print(f"Clicked time picker button with locator: {locator}")
                break
            except:
                continue

        # Now the time picker dialog should be open
        # Handle the dialog based on its type (could be digital or analog)
        time_module.sleep(1)

    def fill_address(self, country=None, state=None, city=None, neighborhood=None,
                     street=None, building_no=None, door_no=None, address_description=None):
        """
        Fill Step 4: Setup Address
        Args:
            country: Country name
            state: State/Province name
            city: City name
            neighborhood: Neighborhood name
            street: Street name
            building_no: Building number
            door_no: Door/Apartment number
            address_description: Additional address details
        """
        import time

        time.sleep(5)

        if country:
            country_select = self.wait.until(EC.presence_of_element_located(self.COUNTRY_SELECT))
            country_select.click()
            time.sleep(1)
            country_option = self.driver.find_element(By.XPATH, f"//option[contains(text(), '{country}')]")
            country_option.click()
            time.sleep(2)  # Wait for API to load state options

        if state:
            state_select = self.wait.until(EC.presence_of_element_located(self.STATE_SELECT))
            state_select.click()
            time.sleep(1)
            state_option = self.driver.find_element(By.XPATH, f"//option[contains(text(), '{state}')]")
            state_option.click()
            time.sleep(2)  # Wait for API to load city options

        if city:
            city_select = self.wait.until(EC.presence_of_element_located(self.CITY_SELECT))
            city_select.click()
            time.sleep(1)
            city_option = self.driver.find_element(By.XPATH, f"//option[contains(text(), '{city}')]")
            city_option.click()
            time.sleep(2)  # Wait for API to enable neighborhood field

        if neighborhood:
            neighborhood_input = self.wait.until(EC.element_to_be_clickable(self.NEIGHBORHOOD_INPUT))
            neighborhood_input.clear()
            neighborhood_input.send_keys(neighborhood)

        if street:
            street_input = self.driver.find_element(*self.STREET_INPUT)
            street_input.clear()
            street_input.send_keys(street)

        if building_no:
            building_input = self.driver.find_element(*self.BUILDING_NO_INPUT)
            building_input.clear()
            building_input.send_keys(building_no)

        if door_no:
            door_input = self.driver.find_element(*self.DOOR_NO_INPUT)
            door_input.clear()
            door_input.send_keys(door_no)

        if address_description:
            desc_textarea = self.driver.find_element(*self.ADDRESS_DESCRIPTION_TEXTAREA)
            desc_textarea.clear()
            desc_textarea.send_keys(address_description)

    def click_create_request(self):
        """Click Create Request button to submit the form"""
        create_btn = self.wait.until(EC.element_to_be_clickable(self.CREATE_REQUEST_BTN))
        create_btn.click()

    def is_on_step(self, step_number):
        """
        Check if currently on a specific step by checking for step-specific elements.
        Args:
            step_number: Step number (1-4)
        Returns:
            True if on the specified step
        """
        try:
            from selenium.webdriver.support.wait import WebDriverWait
            short_wait = WebDriverWait(self.driver, 3)

            if step_number == 1:
                # Step 1: General Information - check for title input
                short_wait.until(EC.presence_of_element_located(self.TITLE_INPUT))
                return True
            elif step_number == 2:
                # Step 2: Upload Photos - check for select photos button
                short_wait.until(EC.presence_of_element_located(self.SELECT_PHOTOS_BTN))
                return True
            elif step_number == 3:
                # Step 3: Determine Deadline - check for calendar month/year
                short_wait.until(EC.presence_of_element_located(self.CALENDAR_MONTH_YEAR))
                return True
            elif step_number == 4:
                # Step 4: Setup Address - check for country select
                short_wait.until(EC.presence_of_element_located(self.COUNTRY_SELECT))
                return True
        except:
            return False
        return False

    def get_validation_error(self):
        """Get validation error message if present"""
        try:
            error_xpath = (By.XPATH, "//div[contains(@class, 'error')] | //span[contains(@class, 'text-red')]")
            error_element = self.driver.find_element(*error_xpath)
            return error_element.text
        except:
            return None

    def capture_screenshot(self, filename):
        """Capture screenshot for debugging"""
        self.driver.save_screenshot(f"tests/screenshots/{filename}.png")
