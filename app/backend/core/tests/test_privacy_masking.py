from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory
import datetime
from core.models import RegisteredUser, Task, TaskCategory, TaskStatus
from core.api.serializers.task_serializers import TaskSerializer
from core.utils import mask_address, mask_phone_number


class MaskingUtilityTests(TestCase):
    """Test cases for masking utility functions"""

    def test_mask_address_standard_format(self):
        """Test address masking with standard US format"""
        address = "123 Main St, Apt 4B, New York, NY, 10001"
        masked = mask_address(address)
        self.assertEqual(masked, "New York, NY, 10001")

    def test_mask_address_two_parts(self):
        """Test address masking with two-part address"""
        address = "Los Angeles, CA, 90001"
        masked = mask_address(address)
        self.assertEqual(masked, "Los Angeles, CA, 90001")

    def test_mask_address_multiple_commas(self):
        """Test address masking with complex address"""
        address = "456 Oak Ave, Suite 200, Building B, San Francisco, CA, 94102"
        masked = mask_address(address)
        self.assertEqual(masked, "San Francisco, CA, 94102")

    def test_mask_address_single_part(self):
        """Test address masking with single part (no commas)"""
        address = "SimpleLocation"
        masked = mask_address(address)
        self.assertEqual(masked, "SimpleLocation")

    def test_mask_address_empty(self):
        """Test address masking with empty string"""
        address = ""
        masked = mask_address(address)
        self.assertEqual(masked, "")

    def test_mask_address_none(self):
        """Test address masking with None"""
        address = None
        masked = mask_address(address)
        self.assertIsNone(masked)

    def test_mask_phone_number_with_plus(self):
        """Test phone number masking with + prefix"""
        phone = "+1234567890"
        masked = mask_phone_number(phone)
        self.assertEqual(masked, "****7890")

    def test_mask_phone_number_without_plus(self):
        """Test phone number masking without + prefix"""
        phone = "1234567890"
        masked = mask_phone_number(phone)
        self.assertEqual(masked, "****7890")

    def test_mask_phone_number_with_formatting(self):
        """Test phone number masking with formatting characters"""
        phone = "+1 (234) 567-8900"
        masked = mask_phone_number(phone)
        self.assertEqual(masked, "****8900")

    def test_mask_phone_number_short(self):
        """Test phone number masking with short number"""
        phone = "123"
        masked = mask_phone_number(phone)
        self.assertEqual(masked, "123")

    def test_mask_phone_number_empty(self):
        """Test phone number masking with empty string"""
        phone = ""
        masked = mask_phone_number(phone)
        self.assertEqual(masked, "")

    def test_mask_phone_number_none(self):
        """Test phone number masking with None"""
        phone = None
        masked = mask_phone_number(phone)
        self.assertIsNone(masked)


class TaskSerializerPrivacyTests(TestCase):
    """Test cases for privacy masking in TaskSerializer"""

    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()
        
        # Create task creator
        self.creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='+1234567890',
            password='Password123!'
        )
        
        # Create assignee
        self.assignee = RegisteredUser.objects.create_user(
            email='assignee@example.com',
            name='Assignee',
            surname='User',
            username='assigneeuser',
            phone_number='+9876543210',
            password='Password123!'
        )
        
        # Create unrelated user
        self.unrelated_user = RegisteredUser.objects.create_user(
            email='unrelated@example.com',
            name='Unrelated',
            surname='User',
            username='unrelateduser',
            phone_number='+1111111111',
            password='Password123!'
        )
        
        # Create a task with detailed address
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category=TaskCategory.GROCERY_SHOPPING,
            location='123 Main St, Apt 4B, New York, NY, 10001',
            deadline=timezone.now() + datetime.timedelta(days=3),
            requirements='Test Requirements',
            urgency_level=3,
            volunteer_number=1,
            creator=self.creator
        )

    def test_creator_sees_full_address(self):
        """Test that task creator sees full address"""
        request = self.factory.get('/api/tasks/')
        request.user = self.creator
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['location'], '123 Main St, Apt 4B, New York, NY, 10001')

    def test_creator_sees_full_phone_number(self):
        """Test that task creator sees their own full phone number"""
        request = self.factory.get('/api/tasks/')
        request.user = self.creator
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['creator']['phone_number'], '+1234567890')

    def test_assignee_sees_full_address(self):
        """Test that assigned volunteer sees full address"""
        self.task.assignee = self.assignee
        self.task.save()
        
        request = self.factory.get('/api/tasks/')
        request.user = self.assignee
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['location'], '123 Main St, Apt 4B, New York, NY, 10001')

    def test_assignee_sees_creator_full_phone_number(self):
        """Test that assigned volunteer sees creator's full phone number"""
        self.task.assignee = self.assignee
        self.task.save()
        
        request = self.factory.get('/api/tasks/')
        request.user = self.assignee
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['creator']['phone_number'], '+1234567890')

    def test_unrelated_user_sees_masked_address(self):
        """Test that unrelated user sees masked address"""
        request = self.factory.get('/api/tasks/')
        request.user = self.unrelated_user
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['location'], 'New York, NY, 10001')
        self.assertNotIn('123 Main St', data['location'])
        self.assertNotIn('Apt 4B', data['location'])

    def test_unrelated_user_sees_masked_creator_phone(self):
        """Test that unrelated user sees masked creator phone number"""
        request = self.factory.get('/api/tasks/')
        request.user = self.unrelated_user
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['creator']['phone_number'], '****7890')
        self.assertNotIn('+1234567890', data['creator']['phone_number'])

    def test_unrelated_user_sees_masked_assignee_phone(self):
        """Test that unrelated user sees masked assignee phone number"""
        self.task.assignee = self.assignee
        self.task.save()
        
        request = self.factory.get('/api/tasks/')
        request.user = self.unrelated_user
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['assignee']['phone_number'], '****3210')
        self.assertNotIn('+9876543210', data['assignee']['phone_number'])

    def test_unauthenticated_user_sees_masked_data(self):
        """Test that unauthenticated user sees masked data"""
        from django.contrib.auth.models import AnonymousUser
        
        request = self.factory.get('/api/tasks/')
        request.user = AnonymousUser()
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['location'], 'New York, NY, 10001')
        self.assertEqual(data['creator']['phone_number'], '****7890')

    def test_multiple_assignees_see_full_data(self):
        """Test that users in assignees list see full data"""
        # Add unrelated_user to assignees
        self.task.assignees.add(self.unrelated_user)
        self.task.save()
        
        request = self.factory.get('/api/tasks/')
        request.user = self.unrelated_user
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['location'], '123 Main St, Apt 4B, New York, NY, 10001')
        self.assertEqual(data['creator']['phone_number'], '+1234567890')

    def test_assignee_none_doesnt_crash(self):
        """Test that serializer handles None assignee gracefully"""
        request = self.factory.get('/api/tasks/')
        request.user = self.unrelated_user
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertIsNone(data['assignee'])

    def test_serializer_without_request_context(self):
        """Test that serializer handles missing request context"""
        serializer = TaskSerializer(instance=self.task)
        data = serializer.data
        
        # Without request context, should mask data
        self.assertEqual(data['location'], 'New York, NY, 10001')
        self.assertEqual(data['creator']['phone_number'], '****7890')

    def test_other_creator_fields_not_masked(self):
        """Test that other creator fields are not affected by masking"""
        request = self.factory.get('/api/tasks/')
        request.user = self.unrelated_user
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        # These fields should remain unchanged
        self.assertEqual(data['creator']['name'], 'Creator')
        self.assertEqual(data['creator']['surname'], 'User')
        self.assertEqual(data['creator']['username'], 'creatoruser')
        self.assertEqual(data['creator']['email'], 'creator@example.com')

    def test_task_with_assigned_status(self):
        """Test masking behavior with assigned task"""
        self.task.status = TaskStatus.ASSIGNED
        self.task.assignee = self.assignee
        self.task.save()
        
        # Unrelated user should still see masked data
        request = self.factory.get('/api/tasks/')
        request.user = self.unrelated_user
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['location'], 'New York, NY, 10001')
        self.assertEqual(data['creator']['phone_number'], '****7890')
        self.assertEqual(data['assignee']['phone_number'], '****3210')

    def test_creator_sees_assignee_full_phone(self):
        """Test that creator sees assignee's full phone number"""
        self.task.assignee = self.assignee
        self.task.save()
        
        request = self.factory.get('/api/tasks/')
        request.user = self.creator
        
        serializer = TaskSerializer(instance=self.task, context={'request': request})
        data = serializer.data
        
        self.assertEqual(data['assignee']['phone_number'], '+9876543210')
