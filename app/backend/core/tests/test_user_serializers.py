from django.test import TestCase
from rest_framework.exceptions import ValidationError
from core.models import RegisteredUser
from core.api.serializers.user_serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    PasswordChangeSerializer
)


class UserCreateSerializerTests(TestCase):
    """Test cases for UserCreateSerializer"""

    def test_valid_user_creation(self):
        """Test creating a user with valid data"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        # Create the user
        user = serializer.save()
        
        # Verify user was created
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('ValidPass123!'))

    def test_password_mismatch(self):
        """Test that mismatched passwords raise validation error"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'ValidPass123!',
            'confirm_password': 'DifferentPass456!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('confirm_password', serializer.errors)
        self.assertIn('Passwords do not match', str(serializer.errors['confirm_password']))

    def test_weak_password_validation(self):
        """Test that weak passwords are rejected"""
        # Test password without special character
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'Password123',
            'confirm_password': 'Password123'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_short_password_validation(self):
        """Test that passwords shorter than 8 characters are rejected"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'Pass1!',
            'confirm_password': 'Pass1!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_password_without_uppercase(self):
        """Test that password without uppercase is rejected"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'password123!',
            'confirm_password': 'password123!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_password_without_lowercase(self):
        """Test that password without lowercase is rejected"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'PASSWORD123!',
            'confirm_password': 'PASSWORD123!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_password_without_number(self):
        """Test that password without number is rejected"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'Password!',
            'confirm_password': 'Password!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_invalid_phone_number_format(self):
        """Test that invalid phone number format is rejected"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': 'invalid',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone_number', serializer.errors)

    def test_missing_required_fields(self):
        """Test that missing required fields are rejected"""
        data = {
            'email': 'test@example.com',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
        self.assertIn('surname', serializer.errors)
        self.assertIn('username', serializer.errors)
        self.assertIn('phone_number', serializer.errors)

    def test_password_not_stored_in_plain_text(self):
        """Test that password is hashed, not stored in plain text"""
        data = {
            'name': 'Test',
            'surname': 'User',
            'username': 'testuser',
            'email': 'test@example.com',
            'phone_number': '+1234567890',
            'password': 'ValidPass123!',
            'confirm_password': 'ValidPass123!'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        # Password should not be stored as plain text
        self.assertNotEqual(user.password, 'ValidPass123!')
        # But should be verifiable
        self.assertTrue(user.check_password('ValidPass123!'))


class UserSerializerTests(TestCase):
    """Test cases for UserSerializer"""

    def setUp(self):
        """Set up test user"""
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='+1234567890',
            password='password123'
        )

    def test_user_serialization(self):
        """Test serializing a user"""
        serializer = UserSerializer(instance=self.user)
        data = serializer.data
        
        # Verify all expected fields are present
        self.assertEqual(data['email'], 'test@example.com')
        self.assertEqual(data['name'], 'Test')
        self.assertEqual(data['surname'], 'User')
        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(data['phone_number'], '+1234567890')
        self.assertEqual(data['rating'], 0.0)
        self.assertEqual(data['completed_task_count'], 0)
        self.assertTrue(data['is_active'])

    def test_password_not_included_in_serialization(self):
        """Test that password is not included in serialized data"""
        serializer = UserSerializer(instance=self.user)
        data = serializer.data
        
        # Password should not be in serialized data
        self.assertNotIn('password', data)

    def test_read_only_fields(self):
        """Test that read-only fields cannot be updated"""
        data = {
            'rating': 5.0,
            'completed_task_count': 100,
            'is_active': False
        }
        
        serializer = UserSerializer(instance=self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        # These fields should not be updated
        updated_user = serializer.save()
        self.assertEqual(updated_user.rating, 0.0)  # Should remain unchanged
        self.assertEqual(updated_user.completed_task_count, 0)  # Should remain unchanged


class UserUpdateSerializerTests(TestCase):
    """Test cases for UserUpdateSerializer"""

    def setUp(self):
        """Set up test user"""
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='+1234567890',
            password='password123'
        )

    def test_valid_user_update(self):
        """Test updating user with valid data"""
        data = {
            'name': 'Updated',
            'surname': 'Name',
            'username': 'updateduser',
            'phone_number': '+0987654321',
            'location': 'New Location'
        }
        
        serializer = UserUpdateSerializer(instance=self.user, data=data)
        self.assertTrue(serializer.is_valid())
        
        updated_user = serializer.save()
        self.assertEqual(updated_user.name, 'Updated')
        self.assertEqual(updated_user.surname, 'Name')
        self.assertEqual(updated_user.username, 'updateduser')
        self.assertEqual(updated_user.location, 'New Location')

    def test_invalid_phone_number_update(self):
        """Test that invalid phone number is rejected on update"""
        data = {
            'phone_number': 'invalid-phone'
        }
        
        serializer = UserUpdateSerializer(instance=self.user, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone_number', serializer.errors)

    def test_partial_update(self):
        """Test partial update of user fields"""
        data = {
            'name': 'PartialUpdate'
        }
        
        serializer = UserUpdateSerializer(instance=self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_user = serializer.save()
        self.assertEqual(updated_user.name, 'PartialUpdate')
        # Other fields should remain unchanged
        self.assertEqual(updated_user.surname, 'User')
        self.assertEqual(updated_user.username, 'testuser')


class PasswordChangeSerializerTests(TestCase):
    """Test cases for PasswordChangeSerializer"""

    def test_valid_password_change(self):
        """Test password change with valid data"""
        data = {
            'current_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'confirm_password': 'NewPass456!'
        }
        
        serializer = PasswordChangeSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_password_mismatch_on_change(self):
        """Test that mismatched passwords raise validation error"""
        data = {
            'current_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'confirm_password': 'DifferentPass789!'
        }
        
        serializer = PasswordChangeSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('confirm_password', serializer.errors)

    def test_weak_new_password(self):
        """Test that weak new password is rejected"""
        data = {
            'current_password': 'OldPass123!',
            'new_password': 'weak',
            'confirm_password': 'weak'
        }
        
        serializer = PasswordChangeSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('new_password', serializer.errors)

    def test_missing_fields(self):
        """Test that missing fields are rejected"""
        data = {
            'new_password': 'NewPass456!'
        }
        
        serializer = PasswordChangeSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('current_password', serializer.errors)
        self.assertIn('confirm_password', serializer.errors)
