"""
Selenium Test Suite for Register Page

Test Data:
- Name: "Ayşe Kaya"  
- Email: ayse.kaya@example.com
- Password: S3cure!234
"""

import unittest
import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options


class RegisterPageTest(unittest.TestCase):
    
    BASE_URL = "http://localhost:5173"
    REGISTER_URL = f"{BASE_URL}/register"
    
    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def setUp(self):
        self.driver.get(self.REGISTER_URL)
        time.sleep(1)

    def _find(self, by, value):
        return WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((by, value))
        )
    
    def _click(self, by, value):
        element = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((by, value))
        )
        element.click()
        
    def _fill_form(self, first_name, last_name, username, phone, email, password, confirm_password):
        self._find(By.ID, "firstName").send_keys(first_name)
        self._find(By.ID, "lastName").send_keys(last_name)
        self._find(By.ID, "username").send_keys(username)
        self._find(By.ID, "phone").send_keys(phone)
        self._find(By.ID, "email").send_keys(email)
        self._find(By.ID, "password").send_keys(password)
        self._find(By.ID, "confirmPassword").send_keys(confirm_password)
        
    def _check_terms(self):
        checkbox = self._find(By.CSS_SELECTOR, "input[name='agreeTerms']")
        if not checkbox.is_selected():
            checkbox.click()
    
    def _submit(self):
        self._click(By.XPATH, "//button[@type='submit']")
    
    def _get_error(self):
        try:
            return WebDriverWait(self.driver, 3).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Password') or contains(text(), 'match') or contains(text(), 'already') or contains(text(), 'Terms') or contains(text(), 'phone') or contains(text(), 'email')]"))
            ).text
        except TimeoutException:
            return None
    
    def _random_email(self):
        return f"test_{random.randint(10000, 99999)}@example.com"
    
    def _random_username(self):
        return f"user_{random.randint(10000, 99999)}"

    def test_01_page_loads(self):
        """Verify register page loads with form fields"""
        self.assertIsNotNone(self._find(By.ID, "firstName"))
        self.assertIsNotNone(self._find(By.ID, "lastName"))
        self.assertIsNotNone(self._find(By.ID, "username"))
        self.assertIsNotNone(self._find(By.ID, "phone"))
        self.assertIsNotNone(self._find(By.ID, "email"))
        self.assertIsNotNone(self._find(By.ID, "password"))
        self.assertIsNotNone(self._find(By.ID, "confirmPassword"))
        print("✓ Page loads correctly")

    def test_02_successful_registration(self):
        """Test successful registration with valid data"""
        self._fill_form(
            "Ayşe",
            "Kaya", 
            self._random_username(),
            "5551234567",
            self._random_email(),
            "S3cure!234",
            "S3cure!234"
        )
        self._check_terms()
        self._submit()
        
        WebDriverWait(self.driver, 10).until(EC.url_contains("/login"))
        self.assertIn("/login", self.driver.current_url)
        print("✓ Successful registration")

    def test_03_duplicate_email_error(self):
        """Test duplicate email shows error"""
        self._fill_form(
            "Ayşe",
            "Kaya",
            self._random_username(),
            "5551234567",
            "uveys2@gmail.com",  # Existing email
            "S3cure!234",
            "S3cure!234"
        )
        self._check_terms()
        self._submit()
        time.sleep(2)
        
        error = self._get_error()
        self.assertIsNotNone(error)
        self.assertIn("/register", self.driver.current_url)
        print(f"✓ Duplicate email error: {error}")

    def test_04_weak_password_error(self):
        """Test weak password shows error"""
        self._fill_form(
            "Ayşe",
            "Kaya",
            self._random_username(),
            "5551234567",
            self._random_email(),
            "weak",
            "weak"
        )
        self._check_terms()
        self._submit()
        time.sleep(2)
        
        error = self._get_error()
        self.assertIsNotNone(error)
        print(f"✓ Weak password error: {error}")

    def test_05_password_mismatch_error(self):
        """Test password mismatch shows error"""
        self._fill_form(
            "Ayşe",
            "Kaya",
            self._random_username(),
            "5551234567",
            self._random_email(),
            "S3cure!234",
            "Different!234"
        )
        self._check_terms()
        self._submit()
        time.sleep(2)
        
        error = self._get_error()
        self.assertIsNotNone(error)
        print(f"✓ Password mismatch error: {error}")

    def test_06_terms_not_accepted_error(self):
        """Test not accepting terms shows error"""
        self._fill_form(
            "Ayşe",
            "Kaya",
            self._random_username(),
            "5551234567",
            self._random_email(),
            "S3cure!234",
            "S3cure!234"
        )
        # Don't check terms
        self._submit()
        time.sleep(2)
        
        error = self._get_error()
        self.assertIsNotNone(error)
        print(f"✓ Terms not accepted error: {error}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
