from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
import datetime

from core.models import RegisteredUser, Notification, NotificationType


class AdminWarningAPITests(TestCase):
    """Test cases for admin warning API endpoint"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create regular user
        self.regular_user = RegisteredUser.objects.create_user(
            email='regular@example.com',
            name='Regular',
            surname='User',
            username='regularuser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create admin user
        self.admin_user = RegisteredUser.objects.create_user(
            email='admin@example.com',
            name='Admin',
            surname='User',
            username='adminuser',
            phone_number='0987654321',
            password='admin123',
            is_staff=True
        )
        
        # Create another regular user to receive warnings
        self.target_user = RegisteredUser.objects.create_user(
            email='target@example.com',
            name='Target',
            surname='User',
            username='targetuser',
            phone_number='1111111111',
            password='target123'
        )
    
    def test_admin_can_send_warning(self):
        """Test that admin can send warning to user"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = '/api/notifications/send-warning/'
        data = {
            'user_id': self.target_user.id,
            'message': 'Please follow community guidelines.'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('Warning sent', response.data['message'])
        
        # Verify notification was created
        notification = Notification.objects.filter(
            user=self.target_user,
            type=NotificationType.ADMIN_WARNING
        ).first()
        
        self.assertIsNotNone(notification)
        self.assertIn(self.admin_user.username, notification.content)
        self.assertIn('Please follow community guidelines', notification.content)
    
    def test_regular_user_cannot_send_warning(self):
        """Test that regular user cannot send warnings"""
        self.client.force_authenticate(user=self.regular_user)
        
        url = '/api/notifications/send-warning/'
        data = {
            'user_id': self.target_user.id,
            'message': 'This should not work.'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('Only administrators', response.data['message'])
        
        # Verify no notification was created
        notification_count = Notification.objects.filter(
            user=self.target_user,
            type=NotificationType.ADMIN_WARNING
        ).count()
        
        self.assertEqual(notification_count, 0)
    
    def test_unauthenticated_user_cannot_send_warning(self):
        """Test that unauthenticated user cannot send warnings"""
        url = '/api/notifications/send-warning/'
        data = {
            'user_id': self.target_user.id,
            'message': 'This should not work.'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_send_warning_invalid_user_id(self):
        """Test sending warning to non-existent user"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = '/api/notifications/send-warning/'
        data = {
            'user_id': 99999,
            'message': 'This should fail.'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_send_warning_empty_message(self):
        """Test sending warning with empty message"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = '/api/notifications/send-warning/'
        data = {
            'user_id': self.target_user.id,
            'message': '   '
        }
        
        response = self.client.post(url, data, format='json')
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_send_warning_missing_fields(self):
        """Test sending warning with missing required fields"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = '/api/notifications/send-warning/'
        
        # Missing message
        data = {'user_id': self.target_user.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Missing user_id
        data = {'message': 'Some message'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_send_warning_long_message(self):
        """Test sending warning with valid long message"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = '/api/notifications/send-warning/'
        long_message = 'A' * 400  # 400 characters, within 500 limit
        data = {
            'user_id': self.target_user.id,
            'message': long_message
        }
        
        response = self.client.post(url, data, format='json')
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify notification contains the message
        notification = Notification.objects.filter(
            user=self.target_user,
            type=NotificationType.ADMIN_WARNING
        ).first()
        
        self.assertIsNotNone(notification)
        self.assertIn(long_message, notification.content)
    
    def test_admin_can_send_multiple_warnings(self):
        """Test that admin can send multiple warnings to different users"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Create another target user
        target_user2 = RegisteredUser.objects.create_user(
            email='target2@example.com',
            name='Target2',
            surname='User',
            username='targetuser2',
            phone_number='2222222222',
            password='target456'
        )
        
        url = '/api/notifications/send-warning/'
        
        # Send first warning
        data1 = {
            'user_id': self.target_user.id,
            'message': 'First warning message'
        }
        response1 = self.client.post(url, data1, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Send second warning to different user
        data2 = {
            'user_id': target_user2.id,
            'message': 'Second warning message'
        }
        response2 = self.client.post(url, data2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        
        # Verify both notifications were created
        notification1 = Notification.objects.filter(
            user=self.target_user,
            type=NotificationType.ADMIN_WARNING
        ).first()
        
        notification2 = Notification.objects.filter(
            user=target_user2,
            type=NotificationType.ADMIN_WARNING
        ).first()
        
        self.assertIsNotNone(notification1)
        self.assertIsNotNone(notification2)
        self.assertIn('First warning message', notification1.content)
        self.assertIn('Second warning message', notification2.content)
