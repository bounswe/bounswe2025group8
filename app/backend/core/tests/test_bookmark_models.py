from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, Bookmark, Tag, BookmarkTag


class BookmarkModelTests(TestCase):
    """Test cases for the Bookmark model"""

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
        
        # Create a task creator
        self.creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='0987654321',
            password='password456'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Bookmarkable Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.creator
        )
        
        # Create tags
        self.tag1 = Tag.objects.create(name='important')
        self.tag2 = Tag.objects.create(name='weekend')
        
        # Create a bookmark
        self.bookmark = Bookmark.objects.create(
            user=self.user,
            task=self.task
        )

    def test_bookmark_creation(self):
        """Test bookmark creation"""
        self.assertEqual(self.bookmark.user, self.user)
        self.assertEqual(self.bookmark.task, self.task)
        
        # Check string representation
        expected_str = f"{self.user.username} bookmarked {self.task.title}"
        self.assertEqual(str(self.bookmark), expected_str)

    def test_bookmark_getters(self):
        """Test bookmark getter methods"""
        self.assertEqual(self.bookmark.get_bookmark_id(), self.bookmark.id)
        self.assertEqual(self.bookmark.get_user(), self.user)
        self.assertEqual(self.bookmark.get_task(), self.task)
        # Check timestamp is close to now
        self.assertTrue(
            (timezone.now() - self.bookmark.get_timestamp()).total_seconds() < 60
        )
        
        # Initially no tags
        self.assertEqual(self.bookmark.get_tags().count(), 0)

    def test_add_bookmark_method(self):
        """Test add_bookmark class method"""
        # Create a second task
        task2 = Task.objects.create(
            title='Second Task',
            description='Another task',
            category='TUTORING',
            location='Another Location',
            deadline=timezone.now() + datetime.timedelta(days=5),
            creator=self.creator
        )
        
        # Add bookmark
        new_bookmark = Bookmark.add_bookmark(
            user=self.user,
            task=task2
        )
        
        # Verify bookmark was created
        self.assertIsNotNone(new_bookmark)
        self.assertEqual(new_bookmark.user, self.user)
        self.assertEqual(new_bookmark.task, task2)
        
        # Try to add duplicate bookmark
        duplicate = Bookmark.add_bookmark(
            user=self.user,
            task=task2
        )
        
        # Should return existing bookmark
        self.assertEqual(duplicate.id, new_bookmark.id)

    def test_remove_bookmark(self):
        """Test remove_bookmark method"""
        # Get initial count
        initial_count = Bookmark.objects.filter(user=self.user).count()
        
        # Remove bookmark
        result = self.bookmark.remove_bookmark()
        
        # Verify result
        self.assertTrue(result)
        
        # Verify bookmark was removed
        new_count = Bookmark.objects.filter(user=self.user).count()
        self.assertEqual(new_count, initial_count - 1)
        
        # Verify this specific bookmark is gone
        with self.assertRaises(Bookmark.DoesNotExist):
            Bookmark.objects.get(id=self.bookmark.id)

    def test_bookmark_tags(self):
        """Test adding tags to bookmarks"""
        # Add tags to the bookmark
        self.bookmark.add_tag(self.tag1)
        self.bookmark.add_tag(self.tag2)
        
        # Check if tags were added
        tags = self.bookmark.get_tags()
        self.assertEqual(tags.count(), 2)
        self.assertTrue(self.tag1 in tags)
        self.assertTrue(self.tag2 in tags)


class BookmarkTagModelTests(TestCase):
    """Test cases for the BookmarkTag model"""

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
        
        # Create a task
        self.task = Task.objects.create(
            title='Task',
            description='Description',
            category='HOME_REPAIR',
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.user
        )
        
        # Create a bookmark
        self.bookmark = Bookmark.objects.create(
            user=self.user,
            task=self.task
        )
        
        # Create a tag
        self.tag = Tag.objects.create(name='urgent')
        
        # Create a bookmark tag
        self.bookmark_tag = BookmarkTag.objects.create(
            bookmark=self.bookmark,
            tag=self.tag
        )

    def test_bookmark_tag_creation(self):
        """Test bookmark tag creation"""
        self.assertEqual(self.bookmark_tag.bookmark, self.bookmark)
        self.assertEqual(self.bookmark_tag.tag, self.tag)
        
        # Check string representation
        expected_str = f"{self.bookmark} - {self.tag.name}"
        self.assertEqual(str(self.bookmark_tag), expected_str)

    def test_bookmark_tag_uniqueness(self):
        """Test bookmark tag uniqueness constraint"""
        # Try to create duplicate bookmark tag
        with self.assertRaises(Exception):  # Could be IntegrityError or ValidationError
            BookmarkTag.objects.create(
                bookmark=self.bookmark,
                tag=self.tag
            )