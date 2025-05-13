from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, Tag


class TagModelTests(TestCase):
    """Test cases for the Tag model"""

    def setUp(self):
        """Set up test data"""
        # Create a user
        self.user = RegisteredUser.objects.create_user(
            email='user@example.com',
            name='Regular',
            surname='User',
            username='regularuser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create tasks
        self.task1 = Task.objects.create(
            title='First Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user
        )
        
        self.task2 = Task.objects.create(
            title='Second Task',
            description='Another task',
            category='TUTORING',
            location='Another Location',
            deadline=timezone.now() + datetime.timedelta(days=5),
            creator=self.user
        )
        
        # Create a tag
        self.tag = Tag.objects.create(name='urgent')

    def test_tag_creation(self):
        """Test tag creation"""
        self.assertEqual(self.tag.name, 'urgent')
        
        # Check string representation
        self.assertEqual(str(self.tag), 'urgent')

    def test_tag_getters(self):
        """Test tag getter methods"""
        self.assertEqual(self.tag.get_tag_id(), self.tag.id)
        self.assertEqual(self.tag.get_name(), 'urgent')
        
        # Initially no tasks
        self.assertEqual(self.tag.get_tasks().count(), 0)

    def test_tag_setters(self):
        """Test tag setter methods"""
        self.tag.set_name('critical')
        
        # Verify changes
        updated_tag = Tag.objects.get(id=self.tag.id)
        self.assertEqual(updated_tag.name, 'critical')
        self.assertEqual(updated_tag.get_name(), 'critical')

    def test_create_tag_method(self):
        """Test create_tag class method"""
        # Create a new tag
        new_tag = Tag.create_tag('important')
        
        # Verify tag was created
        self.assertIsNotNone(new_tag)
        self.assertEqual(new_tag.name, 'important')
        
        # Try to create duplicate tag (case insensitive)
        duplicate = Tag.create_tag('Important')
        
        # Should return existing tag, converted to lowercase
        self.assertEqual(duplicate.id, new_tag.id)
        self.assertEqual(duplicate.name, 'important')

    def test_add_to_task(self):
        """Test adding a tag to a task"""
        # Add tag to tasks
        self.tag.add_to_task(self.task1)
        self.tag.add_to_task(self.task2)
        
        # Verify task-tag relationship
        tasks = self.tag.get_tasks()
        self.assertEqual(tasks.count(), 2)
        self.assertTrue(self.task1 in tasks)
        self.assertTrue(self.task2 in tasks)
        
        # Verify from task's perspective
        self.assertTrue(self.tag in self.task1.tags.all())
        self.assertTrue(self.tag in self.task2.tags.all())

    def test_remove_from_task(self):
        """Test removing a tag from a task"""
        # First add tag to tasks
        self.tag.add_to_task(self.task1)
        self.tag.add_to_task(self.task2)
        
        # Remove from one task
        self.tag.remove_from_task(self.task1)
        
        # Verify tag was removed
        self.assertFalse(self.tag in self.task1.tags.all())
        self.assertTrue(self.tag in self.task2.tags.all())
        
        # Verify from tag's perspective
        tasks = self.tag.get_tasks()
        self.assertEqual(tasks.count(), 1)
        self.assertFalse(self.task1 in tasks)
        self.assertTrue(self.task2 in tasks)

    def test_case_sensitivity(self):
        """Test case handling in tag names"""
        # Create tags with different cases
        tag1 = Tag.create_tag('Weekend')
        tag2 = Tag.create_tag('weekend')
        
        # Should be the same tag
        self.assertEqual(tag1.id, tag2.id)
        self.assertEqual(tag1.name, 'weekend')  # Should be lowercase
        
        # Create a new tag with mixed case
        tag3 = Tag.create_tag('highPriority')
        self.assertEqual(tag3.name, 'highpriority')  # Should be lowercase