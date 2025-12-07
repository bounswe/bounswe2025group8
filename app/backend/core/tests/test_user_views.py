from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from core.models import RegisteredUser


class UserViewSetSearchTests(APITestCase):
    """Test cases for UserViewSet search functionality"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test users with different names and surnames
        self.user1 = RegisteredUser.objects.create_user(
            email='john.doe@example.com',
            name='John',
            surname='Doe',
            username='johndoe',
            phone_number='1234567890',
            password='password123'
        )
        
        self.user2 = RegisteredUser.objects.create_user(
            email='jane.smith@example.com',
            name='Jane',
            surname='Smith',
            username='janesmith',
            phone_number='0987654321',
            password='password456'
        )
        
        self.user3 = RegisteredUser.objects.create_user(
            email='alice.johnson@example.com',
            name='Alice',
            surname='Johnson',
            username='alicejohnson',
            phone_number='5551234567',
            password='password789'
        )
        
        self.user4 = RegisteredUser.objects.create_user(
            email='bob.jones@example.com',
            name='Bob',
            surname='Jones',
            username='bobjones',
            phone_number='5559876543',
            password='password000'
        )
        
        # Authenticate with user1 for testing
        self.client.force_authenticate(user=self.user1)

    def test_search_by_name(self):
        """Test searching users by name (case-insensitive)"""
        response = self.client.get('/api/users/', {'search': 'john'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should return user1 (John) and user3 (Alice Johnson)
        self.assertEqual(len(results), 2)
        
        # Verify the correct users are returned
        returned_names = {(user['name'], user['surname']) for user in results}
        self.assertIn(('John', 'Doe'), returned_names)
        self.assertIn(('Alice', 'Johnson'), returned_names)

    def test_search_by_surname(self):
        """Test searching users by surname (case-insensitive)"""
        response = self.client.get('/api/users/', {'search': 'smith'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should return only user2 (Jane Smith)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Jane')
        self.assertEqual(results[0]['surname'], 'Smith')

    def test_search_by_username(self):
        """Test searching users by username (case-insensitive)"""
        response = self.client.get('/api/users/', {'search': 'alice'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should return user3 (Alice Johnson with username alicejohnson)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['username'], 'alicejohnson')

    def test_search_case_insensitive(self):
        """Test that search is case-insensitive"""
        # Test with uppercase
        response_upper = self.client.get('/api/users/', {'search': 'JANE'})
        # Test with lowercase
        response_lower = self.client.get('/api/users/', {'search': 'jane'})
        # Test with mixed case
        response_mixed = self.client.get('/api/users/', {'search': 'JaNe'})
        
        # All should return the same result
        self.assertEqual(response_upper.status_code, status.HTTP_200_OK)
        self.assertEqual(response_lower.status_code, status.HTTP_200_OK)
        self.assertEqual(response_mixed.status_code, status.HTTP_200_OK)
        
        # All should return user2 (Jane Smith)
        for response in [response_upper, response_lower, response_mixed]:
            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['name'], 'Jane')

    def test_search_partial_match(self):
        """Test searching with partial name/surname"""
        response = self.client.get('/api/users/', {'search': 'jo'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should return user1 (John), user3 (Johnson), and user4 (Jones, bobjones)
        self.assertGreaterEqual(len(results), 3)
        
        # Verify at least these users are in the results
        returned_names = {(user['name'], user['surname']) for user in results}
        self.assertIn(('John', 'Doe'), returned_names)
        self.assertIn(('Alice', 'Johnson'), returned_names)
        self.assertIn(('Bob', 'Jones'), returned_names)

    def test_search_no_results(self):
        """Test searching with a query that matches no users"""
        response = self.client.get('/api/users/', {'search': 'nonexistent'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should return empty list
        self.assertEqual(len(results), 0)

    def test_list_all_users_without_search(self):
        """Test that all users are returned when no search parameter is provided"""
        response = self.client.get('/api/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should return all 4 users
        self.assertEqual(len(results), 4)

    def test_list_all_users_with_empty_search(self):
        """Test that all users are returned when search parameter is empty"""
        response = self.client.get('/api/users/', {'search': ''})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results
        self.assertIn('results', response.data)
        results = response.data['results']
        
        # Should return all 4 users
        self.assertEqual(len(results), 4)

    def test_search_requires_authentication(self):
        """Test that search endpoint requires authentication"""
        # Logout the authenticated user
        self.client.force_authenticate(user=None)
        
        response = self.client.get('/api/users/', {'search': 'john'})
        
        # Should return 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
