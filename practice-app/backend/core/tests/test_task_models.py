from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, TaskCategory, TaskStatus


class TaskModelTests(TestCase):
    """Test cases for the Task model"""

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
        
        # Create a second user for assignee
        self.assignee = RegisteredUser.objects.create_user(
            email='assignee@example.com',
            name='Assignee',
            surname='User',
            username='assigneeuser',
            phone_number='0987654321',
            password='password456'
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

    def test_task_creation(self):
        """Test task creation with required fields"""
        self.assertEqual(self.task.title, 'Test Task')
        self.assertEqual(self.task.description, 'Task Description')
        self.assertEqual(self.task.category, TaskCategory.GROCERY_SHOPPING)
        self.assertEqual(self.task.location, 'Test Location')
        self.assertEqual(self.task.requirements, 'Test Requirements')
        self.assertEqual(self.task.urgency_level, 3)
        self.assertEqual(self.task.volunteer_number, 1)
        self.assertEqual(self.task.status, TaskStatus.POSTED)
        self.assertEqual(self.task.creator, self.user)
        self.assertIsNone(self.task.assignee)
        self.assertFalse(self.task.is_recurring)

    def test_task_str_representation(self):
        """Test the string representation of a task"""
        self.assertEqual(str(self.task), 'Test Task')

    def test_task_getters(self):
        """Test task getter methods"""
        self.assertEqual(self.task.get_task_id(), self.task.id)
        self.assertEqual(self.task.get_title(), 'Test Task')
        self.assertEqual(self.task.get_description(), 'Task Description')
        self.assertEqual(self.task.get_category(), TaskCategory.GROCERY_SHOPPING)
        self.assertEqual(self.task.get_location(), 'Test Location')
        self.assertEqual(self.task.get_requirements(), 'Test Requirements')
        self.assertEqual(self.task.get_urgency_level(), 3)
        self.assertEqual(self.task.get_volunteer_number(), 1)
        self.assertEqual(self.task.get_status(), TaskStatus.POSTED)
        self.assertEqual(self.task.get_creator(), self.user)
        self.assertIsNone(self.task.get_assignee())
        self.assertFalse(self.task.is_task_recurring())

    def test_task_setters(self):
        """Test task setter methods"""
        # Set new values
        self.task.set_title('Updated Task')
        self.task.set_description('Updated Description')
        self.task.set_category(TaskCategory.TUTORING)
        self.task.set_location('Updated Location')
        new_deadline = timezone.now() + datetime.timedelta(days=5)
        self.task.set_deadline(new_deadline)
        self.task.set_requirements('Updated Requirements')
        self.task.set_urgency_level(5)
        self.task.set_volunteer_number(2)
        self.task.set_status(TaskStatus.ASSIGNED)
        self.task.set_recurring(True)
        self.task.set_assignee(self.assignee)
        
        # Verify changes
        updated_task = Task.objects.get(id=self.task.id)
        self.assertEqual(updated_task.title, 'Updated Task')
        self.assertEqual(updated_task.description, 'Updated Description')
        self.assertEqual(updated_task.category, TaskCategory.TUTORING)
        self.assertEqual(updated_task.location, 'Updated Location')
        # Cannot directly compare datetimes due to microsecond precision differences
        self.assertTrue(abs((updated_task.deadline - new_deadline).total_seconds()) < 1)
        self.assertEqual(updated_task.requirements, 'Updated Requirements')
        self.assertEqual(updated_task.urgency_level, 5)
        self.assertEqual(updated_task.volunteer_number, 2)
        self.assertEqual(updated_task.status, TaskStatus.ASSIGNED)
        self.assertTrue(updated_task.is_recurring)
        self.assertEqual(updated_task.assignee, self.assignee)

    def test_task_business_logic_methods(self):
        """Test task business logic methods"""
        # Test update_task
        self.assertTrue(self.task.update_task())
        
        # Test cancel_task
        self.assertTrue(self.task.cancel_task())
        self.assertEqual(self.task.status, TaskStatus.CANCELLED)
        
        # Create a new task for testing completion
        task2 = Task.objects.create(
            title='Task to Complete',
            description='Description',
            category=TaskCategory.HOME_REPAIR,
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.user,
            assignee=self.assignee
        )
        
        # Set initial completion count
        initial_count = self.assignee.completed_task_count
        
        # Test confirm_completion
        self.assertTrue(task2.confirm_completion())
        self.assertEqual(task2.status, TaskStatus.COMPLETED)
        
        # Check assignee's completed task count increased
        updated_assignee = RegisteredUser.objects.get(id=self.assignee.id)
        self.assertEqual(updated_assignee.completed_task_count, initial_count + 1)

    def test_task_expiry_check(self):
        """Test task expiry checking"""
        # Create a task with deadline in the past
        expired_task = Task.objects.create(
            title='Expired Task',
            description='Description',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Location',
            deadline=timezone.now() - datetime.timedelta(days=1),
            creator=self.user
        )
        
        # Check expiry
        self.assertTrue(expired_task.check_expiry())
        self.assertEqual(expired_task.status, TaskStatus.EXPIRED)
        
        # Future task should not expire
        self.assertFalse(self.task.check_expiry())
        self.assertEqual(self.task.status, TaskStatus.POSTED)


class TaskEnumTests(TestCase):
    """Test cases for the Task related enumerations"""

    def test_task_status_enum(self):
        """Test TaskStatus enumeration"""
        self.assertEqual(TaskStatus.POSTED, 'POSTED')
        self.assertEqual(TaskStatus.ASSIGNED, 'ASSIGNED')
        self.assertEqual(TaskStatus.IN_PROGRESS, 'IN_PROGRESS')
        self.assertEqual(TaskStatus.COMPLETED, 'COMPLETED')
        self.assertEqual(TaskStatus.CANCELLED, 'CANCELLED')
        self.assertEqual(TaskStatus.EXPIRED, 'EXPIRED')
        
        # Test choices format
        choices = TaskStatus.choices
        self.assertTrue(('POSTED', 'Posted') in choices)
        self.assertTrue(('CANCELLED', 'Cancelled') in choices)

    def test_task_category_enum(self):
        """Test TaskCategory enumeration"""
        self.assertEqual(TaskCategory.GROCERY_SHOPPING, 'GROCERY_SHOPPING')
        self.assertEqual(TaskCategory.TUTORING, 'TUTORING')
        self.assertEqual(TaskCategory.HOME_REPAIR, 'HOME_REPAIR')
        self.assertEqual(TaskCategory.MOVING_HELP, 'MOVING_HELP')
        self.assertEqual(TaskCategory.HOUSE_CLEANING, 'HOUSE_CLEANING')
        self.assertEqual(TaskCategory.OTHER, 'OTHER')
        
        # Test choices format
        choices = TaskCategory.choices
        self.assertTrue(('GROCERY_SHOPPING', 'Grocery Shopping') in choices)
        self.assertTrue(('HOME_REPAIR', 'Home Repair') in choices)