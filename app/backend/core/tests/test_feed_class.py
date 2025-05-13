from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, TaskCategory, Feed, Bookmark, Tag


class FeedClassTests(TestCase):
    """Test cases for the Feed utility class"""

    def setUp(self):
        """Set up test data"""
        # Create a user whose feed we'll test
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
        
        # Create multiple tasks with different attributes
        # Task 1 - Grocery shopping with urgent deadline
        self.task1 = Task.objects.create(
            title='Grocery Shopping Help',
            description='Need help with groceries',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Downtown',
            deadline=timezone.now() + datetime.timedelta(days=1),
            urgency_level=5,
            creator=self.creator
        )
        
        # Task 2 - Tutoring with less urgent deadline
        self.task2 = Task.objects.create(
            title='Math Tutoring',
            description='Need help with calculus',
            category=TaskCategory.TUTORING,
            location='University',
            deadline=timezone.now() + datetime.timedelta(days=5),
            urgency_level=3,
            creator=self.creator
        )
        
        # Task 3 - Home repair with far deadline
        self.task3 = Task.objects.create(
            title='Leaky Faucet Fix',
            description='Need help fixing a leaky faucet',
            category=TaskCategory.HOME_REPAIR,
            location='Suburb',
            deadline=timezone.now() + datetime.timedelta(days=10),
            urgency_level=2,
            creator=self.creator
        )
        
        # Task 4 - Created by the user themselves (should be excluded from feed)
        self.task4 = Task.objects.create(
            title='My Own Task',
            description='Task created by the user',
            category=TaskCategory.OTHER,
            location='Home',
            deadline=timezone.now() + datetime.timedelta(days=3),
            urgency_level=4,
            creator=self.user
        )
        
        # Task 5 - Expired task (should be excluded from feed)
        self.task5 = Task.objects.create(
            title='Expired Task',
            description='This task is already expired',
            category=TaskCategory.MOVING_HELP,
            location='Old Place',
            deadline=timezone.now() - datetime.timedelta(days=1),
            urgency_level=5,
            creator=self.creator
        )
        
        # Create tags for tasks
        self.tag1 = Tag.objects.create(name='urgent')
        self.tag2 = Tag.objects.create(name='weekend')
        
        # Add tags to tasks
        self.tag1.add_to_task(self.task1)
        self.tag2.add_to_task(self.task2)
        self.tag2.add_to_task(self.task3)
        
        # Bookmark task3
        self.bookmark = Bookmark.add_bookmark(user=self.user, task=self.task3)
        
        # Create feed for user
        self.feed = Feed(self.user)

    def test_feed_initialization(self):
        """Test feed initialization"""
        self.assertEqual(self.feed.get_user(), self.user)

    def test_load_feed(self):
        """Test loading the feed"""
        tasks = self.feed.load_feed()
        
        # Should include task1, task2, task3, but not task4 (user's own) or task5 (expired)
        self.assertEqual(tasks.count(), 3)
        self.assertIn(self.task1, tasks)
        self.assertIn(self.task2, tasks)
        self.assertIn(self.task3, tasks)
        self.assertNotIn(self.task4, tasks)
        self.assertNotIn(self.task5, tasks)
        
        # Should be sorted by deadline (earliest first)
        self.assertEqual(tasks.first(), self.task1)

    def test_filter_feed(self):
        """Test filtering the feed"""
        # Filter by category
        filtered = self.feed.filter_feed({'category': TaskCategory.TUTORING})
        self.assertEqual(filtered.count(), 1)
        self.assertEqual(filtered.first(), self.task2)
        
        # Filter by location
        filtered = self.feed.filter_feed({'location': 'Downtown'})
        self.assertEqual(filtered.count(), 1)
        self.assertEqual(filtered.first(), self.task1)
        
        # Filter by tag
        filtered = self.feed.filter_feed({'tags': ['weekend']})
        self.assertEqual(filtered.count(), 2)
        self.assertIn(self.task2, filtered)
        self.assertIn(self.task3, filtered)
        
        # Filter by urgency
        filtered = self.feed.filter_feed({'urgency': 4})
        self.assertEqual(filtered.count(), 1)
        self.assertEqual(filtered.first(), self.task1)
        
        # Filter by deadline
        tomorrow = timezone.now() + datetime.timedelta(days=2)
        filtered = self.feed.filter_feed({'deadline_before': tomorrow})
        self.assertEqual(filtered.count(), 1)
        self.assertEqual(filtered.first(), self.task1)
        
        # Multiple filters
        filtered = self.feed.filter_feed({
            'tags': ['weekend'],
            'deadline_after': timezone.now() + datetime.timedelta(days=7)
        })
        self.assertEqual(filtered.count(), 1)
        self.assertEqual(filtered.first(), self.task3)
        
        # Sort by urgency
        filtered = self.feed.filter_feed({'sort_by': 'urgency'})
        self.assertEqual(filtered.first(), self.task1)  # Highest urgency

    def test_refresh_feed(self):
        """Test refreshing the feed"""
        refreshed = self.feed.refresh_feed()
        self.assertEqual(refreshed.count(), 3)
        
        # Create a new task that should appear in refreshed feed
        new_task = Task.objects.create(
            title='New Task',
            description='This task was just created',
            category=TaskCategory.HOUSE_CLEANING,
            location='Apartment',
            deadline=timezone.now() + datetime.timedelta(days=2),
            urgency_level=4,
            creator=self.creator
        )
        
        # Refresh again and verify new task appears
        refreshed = self.feed.refresh_feed()
        self.assertEqual(refreshed.count(), 4)
        self.assertIn(new_task, refreshed)

    def test_get_bookmarked_tasks(self):
        """Test getting bookmarked tasks"""
        bookmarked = self.feed.get_bookmarked_tasks()
        self.assertEqual(len(bookmarked), 1)
        self.assertEqual(bookmarked[0], self.task3)
        
        # Bookmark another task
        Bookmark.add_bookmark(user=self.user, task=self.task1)
        
        # Get bookmarked tasks again
        bookmarked = self.feed.get_bookmarked_tasks()
        self.assertEqual(len(bookmarked), 2)
        self.assertIn(self.task1, bookmarked)
        self.assertIn(self.task3, bookmarked)