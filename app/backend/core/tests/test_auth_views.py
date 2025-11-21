from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from core.models import RegisteredUser


class RegisterViewTests(TestCase):
    """Test cases for the registration endpoint"""

    def setUp(self):
        """Set up test client"""
        self.client = APIClient()
        self.register_url = '/api/auth/register/'

    def test_successful_registration(self):
        """Test successful user registration"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        # Check status code
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check response structure
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        self.assertIn('user_id', response.data['data'])
        self.assertIn('email', response.data['data'])
        
        # Verify user was created in database
        user_exists = RegisteredUser.objects.filter(email='test@example.com').exists()
        self.assertTrue(user_exists)

    def test_registration_with_duplicate_email(self):
        """Test registration with already existing email"""
        # Create existing user
        RegisteredUser.objects.create_user(
            email='existing@example.com',
            name='Existing',
            surname='User',
            username='existinguser',
            phone_number='+1234567890',
            password='password123'
        )
        
        # Try to register with same email
        data = {
            'name': 'New',
            'surname': 'User',
            'username': 'newuser',
            'email': 'existing@example.com',  # Duplicate email
            'phone_number': '+0987654321',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')

    def test_registration_with_duplicate_username(self):
        """Test registration with already existing username"""
        # Create existing user
        RegisteredUser.objects.create_user(
            email='existing@example.com',
            name='Existing',
            surname='User',
            username='duplicateusername',
            phone_number='+1234567890',
            password='password123'
        )
        
        # Try to register with same username
        data = {
            'name': 'New',
            'surname': 'User',
            'username': 'duplicateusername',  # Duplicate username
            'email': 'new@example.com',
            'phone_number': '+0987654321',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')

    def test_registration_with_mismatched_passwords(self):
        """Test registration with password != confirm_password"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'ValidPass123!',
            'confirm_password': 'DifferentPass456!'  # Different password
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('confirm_password', response.data['data'])

    def test_registration_with_weak_password(self):
        """Test registration with weak password"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'weak',
            'confirm_password': 'weak'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('password', response.data['data'])

    def test_registration_with_invalid_phone_number(self):
        """Test registration with invalid phone number"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': 'invalid',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('phone_number', response.data['data'])

    def test_registration_with_missing_fields(self):
        """Test registration with missing required fields"""
        data = {
            'email': 'test@example.com',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        # Check that missing fields are reported
        self.assertIn('name', response.data['data'])
        self.assertIn('surname', response.data['data'])
        self.assertIn('username', response.data['data'])


class LoginViewTests(TestCase):
    """Test cases for the login endpoint"""

    def setUp(self):
        """Set up test client and user"""
        self.client = APIClient()
        self.login_url = '/api/auth/login/'
        
        # Create test user
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='+1234567890',
            password='ValidPass123!'
        )

    def test_successful_login(self):
        """Test successful login with valid credentials"""
        data = {
            'email': 'test@example.com',
            'password': 'ValidPass123!'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Check status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response structure
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        self.assertIn('token', response.data['data'])
        self.assertIn('user_id', response.data['data'])
        
        # Verify token was created
        token_exists = Token.objects.filter(user=self.user).exists()
        self.assertTrue(token_exists)

    def test_login_with_wrong_password(self):
        """Test login with incorrect password"""
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword!'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('Invalid credentials', response.data['message'])

    def test_login_with_nonexistent_email(self):
        """Test login with email that doesn't exist"""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'ValidPass123!'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('Invalid credentials', response.data['message'])

    def test_login_with_missing_email(self):
        """Test login without providing email"""
        data = {
            'password': 'ValidPass123!'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')

    def test_login_with_missing_password(self):
        """Test login without providing password"""
        data = {
            'email': 'test@example.com'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')

    def test_login_with_inactive_user(self):
        """Test login with deactivated user account"""
        # Deactivate user
        self.user.is_active = False
        self.user.save()
        
        data = {
            'email': 'test@example.com',
            'password': 'ValidPass123!'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return error (Django's authenticate returns None for inactive users)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
        # The message will be "Invalid credentials" since authenticate() returns None
        self.assertIn('Invalid credentials', response.data['message'])

    def test_login_returns_consistent_token(self):
        """Test that logging in multiple times returns the same token"""
        data = {
            'email': 'test@example.com',
            'password': 'ValidPass123!'
        }
        
        # First login
        response1 = self.client.post(self.login_url, data, format='json')
        token1 = response1.data['data']['token']
        
        # Second login
        response2 = self.client.post(self.login_url, data, format='json')
        token2 = response2.data['data']['token']
        
        # Tokens should be the same (get_or_create)
        self.assertEqual(token1, token2)

    def test_login_with_empty_credentials(self):
        """Test login with empty email and password"""
        data = {
            'email': '',
            'password': ''
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Should return error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')


class LogoutViewTests(TestCase):
    """Test cases for the logout endpoint"""

    def setUp(self):
        """Set up test client and user"""
        self.client = APIClient()
        self.logout_url = '/api/auth/logout/'
        
        # Create test user
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='+1234567890',
            password='ValidPass123!'
        )
        
        # Create token for user
        self.token = Token.objects.create(user=self.user)

    def test_successful_logout(self):
        """Test successful logout"""
        # Authenticate with token
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        response = self.client.post(self.logout_url, format='json')
        
        # Check status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        
        # Verify token was deleted
        token_exists = Token.objects.filter(user=self.user).exists()
        self.assertFalse(token_exists)

    def test_logout_without_authentication(self):
        """Test logout without being authenticated"""
        # Don't set credentials
        response = self.client.post(self.logout_url, format='json')
        
        # Should return unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_with_invalid_token(self):
        """Test logout with invalid token"""
        # Use invalid token
        self.client.credentials(HTTP_AUTHORIZATION='Token invalid_token_here')
        
        response = self.client.post(self.logout_url, format='json')
        
        # Should return unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CheckAvailabilityViewTests(TestCase):
    """Test cases for the check availability endpoint"""

    def setUp(self):
        """Set up test client and user"""
        self.client = APIClient()
        self.check_url = '/api/auth/check-availability/'
        
        # Create existing user
        self.user = RegisteredUser.objects.create_user(
            email='existing@example.com',
            name='Existing',
            surname='User',
            username='existinguser',
            phone_number='+1234567890',
            password='password123'
        )

    def test_check_available_email(self):
        """Test checking an available email"""
        response = self.client.get(
            self.check_url,
            {'email': 'available@example.com'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertTrue(response.data['data']['available'])

    def test_check_unavailable_email(self):
        """Test checking an email that's already taken"""
        response = self.client.get(
            self.check_url,
            {'email': 'existing@example.com'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'error')
        self.assertFalse(response.data['data']['available'])

    def test_check_available_phone_number(self):
        """Test checking an available phone number"""
        response = self.client.get(
            self.check_url,
            {'phone_number': '+0987654321'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertTrue(response.data['data']['available'])

    def test_check_unavailable_phone_number(self):
        """Test checking a phone number that's already taken"""
        response = self.client.get(
            self.check_url,
            {'phone_number': '+1234567890'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'error')
        self.assertFalse(response.data['data']['available'])

    def test_check_without_parameters(self):
        """Test checking availability without providing email or phone"""
        response = self.client.get(self.check_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
