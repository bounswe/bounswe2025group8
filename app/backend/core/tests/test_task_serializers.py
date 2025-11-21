from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory
import datetime
from core.models import RegisteredUser, Task, TaskCategory, TaskStatus
from core.api.serializers.task_serializers import (
    TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer, TaskStatusUpdateSerializer
)


class TaskSerializerTests(TestCase):
    """Test cases for TaskSerializer"""

    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()
        
        # Create a user
        self.user = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            requirements='Test Requirements',
            urgency_level=3,
            volunteer_number=1,
            creator=self.user
        )

    def test_task_serializer_contains_expected_fields(self):
        """Test that TaskSerializer contains all expected fields"""
        serializer = TaskSerializer(instance=self.task)
        data = serializer.data
        
        expected_fields = {
            'id', 'title', 'description', 'category', 'category_display',
            'location', 'deadline', 'requirements', 'urgency_level',
            'volunteer_number', 'status', 'status_display', 'is_recurring',
            'creator', 'assignee', 'created_at', 'updated_at', 'primary_photo_url'
        }
        
        self.assertEqual(set(data.keys()), expected_fields)

    def test_task_serializer_status_display(self):
        """Test that status_display returns the correct human-readable status"""
        serializer = TaskSerializer(instance=self.task)
        data = serializer.data
        
        self.assertEqual(data['status'], TaskStatus.POSTED)
        self.assertEqual(data['status_display'], 'Posted')

    def test_task_serializer_category_display(self):
        """Test that category_display returns the correct human-readable category"""
        serializer = TaskSerializer(instance=self.task)
        data = serializer.data
        
        self.assertEqual(data['category'], TaskCategory.GROCERY_SHOPPING)
        self.assertEqual(data['category_display'], 'Grocery Shopping')


class TaskCreateSerializerTests(TestCase):
    """Test cases for TaskCreateSerializer"""

    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()
        
        # Create a user
        self.user = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='1234567890',
            password='password123'
        )

    def test_create_task_with_valid_data(self):
        """Test creating a task with valid data"""
        request = self.factory.post('/api/tasks/')
        request.user = self.user
        
        valid_data = {
            'title': 'New Task',
            'description': 'New Description',
            'category': TaskCategory.HOME_REPAIR,
            'location': 'New Location',
            'deadline': timezone.now() + datetime.timedelta(days=5),
            'requirements': 'New Requirements',
            'urgency_level': 4,
            'volunteer_number': 2,
            'is_recurring': False
        }
        
        serializer = TaskCreateSerializer(data=valid_data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        
        task = serializer.save()
        self.assertEqual(task.title, 'New Task')
        self.assertEqual(task.creator, self.user)
        self.assertEqual(task.status, TaskStatus.POSTED)

    def test_create_task_with_past_deadline(self):
        """Test that creating a task with past deadline fails"""
        request = self.factory.post('/api/tasks/')
        request.user = self.user
        
        invalid_data = {
            'title': 'Invalid Task',
            'description': 'Description',
            'category': TaskCategory.OTHER,
            'location': 'Location',
            'deadline': timezone.now() - datetime.timedelta(days=1),  # Past deadline
            'urgency_level': 3,
            'volunteer_number': 1
        }
        
        serializer = TaskCreateSerializer(data=invalid_data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('deadline', serializer.errors)
        self.assertEqual(
            str(serializer.errors['deadline'][0]),
            'Deadline must be in the future.'
        )

    def test_create_task_with_zero_volunteer_number(self):
        """Test that creating a task with zero volunteer_number fails"""
        request = self.factory.post('/api/tasks/')
        request.user = self.user
        
        invalid_data = {
            'title': 'Invalid Task',
            'description': 'Description',
            'category': TaskCategory.OTHER,
            'location': 'Location',
            'deadline': timezone.now() + datetime.timedelta(days=1),
            'urgency_level': 3,
            'volunteer_number': 0  # Invalid: must be positive
        }
        
        serializer = TaskCreateSerializer(data=invalid_data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('volunteer_number', serializer.errors)
        self.assertEqual(
            str(serializer.errors['volunteer_number'][0]),
            'Volunteer number must be positive.'
        )

    def test_create_task_with_negative_volunteer_number(self):
        """Test that creating a task with negative volunteer_number fails"""
        request = self.factory.post('/api/tasks/')
        request.user = self.user
        
        invalid_data = {
            'title': 'Invalid Task',
            'description': 'Description',
            'category': TaskCategory.OTHER,
            'location': 'Location',
            'deadline': timezone.now() + datetime.timedelta(days=1),
            'urgency_level': 3,
            'volunteer_number': -1  # Invalid: must be positive
        }
        
        serializer = TaskCreateSerializer(data=invalid_data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('volunteer_number', serializer.errors)

    def test_create_task_with_missing_required_fields(self):
        """Test that creating a task without required fields fails"""
        request = self.factory.post('/api/tasks/')
        request.user = self.user
        
        # Missing title, description, etc.
        invalid_data = {
            'category': TaskCategory.OTHER
        }
        
        serializer = TaskCreateSerializer(data=invalid_data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        
        # Check that required fields are in errors
        self.assertIn('title', serializer.errors)
        self.assertIn('description', serializer.errors)
        self.assertIn('location', serializer.errors)
        self.assertIn('deadline', serializer.errors)

    def test_create_task_with_invalid_category(self):
        """Test that creating a task with invalid category fails"""
        request = self.factory.post('/api/tasks/')
        request.user = self.user
        
        invalid_data = {
            'title': 'Invalid Task',
            'description': 'Description',
            'category': 'INVALID_CATEGORY',  # Invalid category
            'location': 'Location',
            'deadline': timezone.now() + datetime.timedelta(days=1),
            'urgency_level': 3,
            'volunteer_number': 1
        }
        
        serializer = TaskCreateSerializer(data=invalid_data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('category', serializer.errors)


class TaskUpdateSerializerTests(TestCase):
    """Test cases for TaskUpdateSerializer"""

    def setUp(self):
        """Set up test data"""
        # Create a user
        self.user = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user
        )

    def test_update_task_with_valid_data(self):
        """Test updating a task with valid data"""
        valid_data = {
            'title': 'Updated Task',
            'description': 'Updated Description'
        }
        
        serializer = TaskUpdateSerializer(instance=self.task, data=valid_data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        updated_task = serializer.save()
        self.assertEqual(updated_task.title, 'Updated Task')
        self.assertEqual(updated_task.description, 'Updated Description')

    def test_update_task_with_past_deadline(self):
        """Test that updating a task with past deadline fails"""
        invalid_data = {
            'deadline': timezone.now() - datetime.timedelta(days=1)
        }
        
        serializer = TaskUpdateSerializer(instance=self.task, data=invalid_data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('deadline', serializer.errors)

    def test_cannot_update_completed_task(self):
        """Test that a completed task cannot be updated"""
        # Mark task as completed
        self.task.status = TaskStatus.COMPLETED
        self.task.save()
        
        update_data = {
            'title': 'Try to Update'
        }
        
        serializer = TaskUpdateSerializer(instance=self.task, data=update_data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
        self.assertIn('Cannot update task with status', str(serializer.errors))

    def test_cannot_update_cancelled_task(self):
        """Test that a cancelled task cannot be updated"""
        # Mark task as cancelled
        self.task.status = TaskStatus.CANCELLED
        self.task.save()
        
        update_data = {
            'title': 'Try to Update'
        }
        
        serializer = TaskUpdateSerializer(instance=self.task, data=update_data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_cannot_update_expired_task(self):
        """Test that an expired task cannot be updated"""
        # Mark task as expired
        self.task.status = TaskStatus.EXPIRED
        self.task.save()
        
        update_data = {
            'title': 'Try to Update'
        }
        
        serializer = TaskUpdateSerializer(instance=self.task, data=update_data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class TaskStatusUpdateSerializerTests(TestCase):
    """Test cases for TaskStatusUpdateSerializer"""

    def setUp(self):
        """Set up test data"""
        # Create a user
        self.user = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user
        )

    def test_valid_status_transition_posted_to_assigned(self):
        """Test valid status transition from POSTED to ASSIGNED"""
        data = {'status': TaskStatus.ASSIGNED}
        
        serializer = TaskStatusUpdateSerializer(instance=self.task, data=data)
        self.assertTrue(serializer.is_valid())

    def test_valid_status_transition_posted_to_cancelled(self):
        """Test valid status transition from POSTED to CANCELLED"""
        data = {'status': TaskStatus.CANCELLED}
        
        serializer = TaskStatusUpdateSerializer(instance=self.task, data=data)
        self.assertTrue(serializer.is_valid())

    def test_invalid_status_transition_posted_to_completed(self):
        """Test invalid status transition from POSTED to COMPLETED"""
        data = {'status': TaskStatus.COMPLETED}
        
        serializer = TaskStatusUpdateSerializer(instance=self.task, data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)
        self.assertIn('Cannot transition', str(serializer.errors['status'][0]))

    def test_valid_status_transition_assigned_to_in_progress(self):
        """Test valid status transition from ASSIGNED to IN_PROGRESS"""
        self.task.status = TaskStatus.ASSIGNED
        self.task.save()
        
        data = {'status': TaskStatus.IN_PROGRESS}
        
        serializer = TaskStatusUpdateSerializer(instance=self.task, data=data)
        self.assertTrue(serializer.is_valid())

    def test_invalid_status_transition_from_completed(self):
        """Test that completed tasks cannot transition to any other status"""
        self.task.status = TaskStatus.COMPLETED
        self.task.save()
        
        # Try to change to POSTED
        data = {'status': TaskStatus.POSTED}
        
        serializer = TaskStatusUpdateSerializer(instance=self.task, data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)

    def test_invalid_status_transition_from_cancelled(self):
        """Test that cancelled tasks cannot transition to any other status"""
        self.task.status = TaskStatus.CANCELLED
        self.task.save()
        
        # Try to change to ASSIGNED
        data = {'status': TaskStatus.ASSIGNED}
        
        serializer = TaskStatusUpdateSerializer(instance=self.task, data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)
