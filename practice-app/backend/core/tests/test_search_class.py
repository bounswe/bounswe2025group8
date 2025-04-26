from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, TaskCategory, Search, Tag


class SearchClassTests(TestCase):
    """Test cases for the Search utility class"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.user1 = RegisteredUser.objects.create_user(
            email='user1@example.com',
            name='First',
            surname='User',
            username='firstuser',
            phone_number='1234567890',
            password='password123'
        )
        self.user1.rating = 4.5  # Set rating after creation
        self.user1.save()
        
        self.user2 = RegisteredUser.objects.create_user(
            email='user2@example.com',
            name='Second',
            surname='User',
            username='seconduser',
            phone_number='0987654321',
            password='password456',
        )
        self.user2.rating = 3.9  # Set rating after creation
        self.user2.save()
        
        self.user3 = RegisteredUser.objects.create_user(
            email='user3@example.com',
            name='Third',
            surname='Person',
            username='thirdperson',
            phone_number='5555555555',
            password='password789',
        )
        self.user3.rating = 4.8  # Set rating after creation
        self.user3.save()
        
        # Create tasks
        self.task1 = Task.objects.create(
            title='Grocery Shopping Help Needed',
            description='Need someone to help with grocery shopping',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Downtown NYC',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user1
        )
        
        self.task2 = Task.objects.create(
            title='Math Tutoring for College Student',
            description='Looking for help with calculus',
            category=TaskCategory.TUTORING,
            location='Boston University',
            deadline=timezone.now() + datetime.timedelta(days=5),
            creator=self.user2
        )
        
        self.task3 = Task.objects.create(
            title='Fix Leaky Bathroom Faucet',
            description='Need someone with plumbing experience to fix a leaky faucet',
            category=TaskCategory.HOME_REPAIR,
            location='Queens, NYC',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.user3
        )
        
        self.task4 = Task.objects.create(
            title='Grocery Pickup from Whole Foods',
            description='Need someone to pick up my grocery order',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Brooklyn, NYC',
            deadline=timezone.now() - datetime.timedelta(days=1),  # Expired
            creator=self.user2
        )
        
        # Create and add tags
        self.tag1 = Tag.objects.create(name='weekend')
        self.tag2 = Tag.objects.create(name='urgent')
        self.tag3 = Tag.objects.create(name='needs_tools')
        
        self.tag1.add_to_task(self.task1)
        self.tag1.add_to_task(self.task2)
        self.tag2.add_to_task(self.task3)
        self.tag3.add_to_task(self.task3)

    def test_search_by_keyword(self):
        """Test searching tasks by keyword"""
        # Search in title
        results = Search.search_by_keyword('Grocery')
        self.assertEqual(results.count(), 1)  # task1 only (task4 is expired)
        self.assertEqual(results.first(), self.task1)
        
        # Search in description
        results = Search.search_by_keyword('calculus')
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.task2)
        
        # Search in title and description
        results = Search.search_by_keyword('help')
        self.assertEqual(results.count(), 2)
        self.assertIn(self.task1, results)
        self.assertIn(self.task2, results)
        
        # Search with no results
        results = Search.search_by_keyword('nonexistent')
        self.assertEqual(results.count(), 0)
        
        # Empty search term
        results = Search.search_by_keyword('')
        self.assertEqual(results.count(), 0)

    def test_search_by_location(self):
        """Test searching tasks by location"""
        # Exact match
        results = Search.search_by_location('Downtown NYC')
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.task1)
        
        # Partial match
        results = Search.search_by_location('NYC')
        self.assertEqual(results.count(), 2)  # task1 and task3 (not task4 - expired)
        self.assertIn(self.task1, results)
        self.assertIn(self.task3, results)
        
        # No match
        results = Search.search_by_location('Chicago')
        self.assertEqual(results.count(), 0)
        
        # Empty search term
        results = Search.search_by_location('')
        self.assertEqual(results.count(), 0)

    def test_search_by_category(self):
        """Test searching tasks by category"""
        # Valid category
        results = Search.search_by_category(TaskCategory.GROCERY_SHOPPING)
        self.assertEqual(results.count(), 1)  # task1 only (task4 is expired)
        self.assertEqual(results.first(), self.task1)
        
        results = Search.search_by_category(TaskCategory.TUTORING)
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.task2)
        
        # Invalid category
        results = Search.search_by_category('INVALID_CATEGORY')
        self.assertEqual(results.count(), 0)
        
        # Empty category
        results = Search.search_by_category('')
        self.assertEqual(results.count(), 0)

    def test_search_by_tags(self):
        """Test searching tasks by tags"""
        # Single tag
        results = Search.search_by_tags(['weekend'])
        self.assertEqual(results.count(), 2)
        self.assertIn(self.task1, results)
        self.assertIn(self.task2, results)
        
        # Multiple tags (AND logic)
        results = Search.search_by_tags(['urgent', 'needs_tools'])
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.task3)
        
        # Tag with no matches
        results = Search.search_by_tags(['nonexistent'])
        self.assertEqual(results.count(), 0)
        
        # Empty tag list
        results = Search.search_by_tags([])
        self.assertEqual(results.count(), 0)

    def test_search_users(self):
        """Test searching users"""
        # Search by name
        results = Search.search_users('First')
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.user1)
        
        # Search by surname
        results = Search.search_users('User')
        self.assertEqual(results.count(), 2)
        self.assertIn(self.user1, results)
        self.assertIn(self.user2, results)
        
        # Search by username
        results = Search.search_users('third')
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.user3)
        
        # No matches
        results = Search.search_users('nonexistent')
        self.assertEqual(results.count(), 0)
        
        # Empty search term
        results = Search.search_users('')
        self.assertEqual(results.count(), 0)

    def test_filter_by_rating(self):
        """Test filtering users by rating"""
        # Filter by minimum rating
        results = Search.filter_by_rating(4.0)
        self.assertEqual(results.count(), 2)
        self.assertIn(self.user1, results)
        self.assertIn(self.user3, results)
        
        # Higher minimum rating
        results = Search.filter_by_rating(4.7)
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.user3)
        
        # No results
        results = Search.filter_by_rating(5.0)
        self.assertEqual(results.count(), 0)
        
        # Invalid rating (too low)
        results = Search.filter_by_rating(0.5)
        self.assertEqual(results.count(), 0)
        
        # Invalid rating (too high)
        results = Search.filter_by_rating(5.5)
        self.assertEqual(results.count(), 0)

    def test_sort_by_deadline(self):
        """Test sorting tasks by deadline"""
        # Ascending order (earliest first)
        results = Search.sort_by_deadline(ascending=True)
        self.assertEqual(results.count(), 3)  # Excludes expired task4
        self.assertEqual(results[0], self.task3)
        self.assertEqual(results[1], self.task1)
        self.assertEqual(results[2], self.task2)
        
        # Descending order (latest first)
        results = Search.sort_by_deadline(ascending=False)
        self.assertEqual(results.count(), 3)
        self.assertEqual(results[0], self.task2)
        self.assertEqual(results[1], self.task1)
        self.assertEqual(results[2], self.task3)

    def test_sort_by_proximity(self):
        """Test sorting tasks by proximity to location"""
        # This is a simplified test since real geo-sorting would require more complex setup
        results = Search.sort_by_proximity('NYC')
        self.assertEqual(results.count(), 2)
        self.assertIn(self.task1, results)
        self.assertIn(self.task3, results)

    def test_complex_search(self):
        """Test combined search with multiple criteria"""
        # Search with multiple criteria
        results = Search.complex_search(
            keywords='grocery',
            location='NYC',
            category=TaskCategory.GROCERY_SHOPPING,
            tags=['weekend'],
            min_rating=4.0,
            sort_by='deadline'
        )
        
        # Should match task1 only
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.task1)
        
        # Search with fewer criteria
        results = Search.complex_search(
            category=TaskCategory.HOME_REPAIR,
            tags=['urgent']
        )
        
        # Should match task3
        self.assertEqual(results.count(), 1)
        self.assertEqual(results.first(), self.task3)
        
        # Search with no matches
        results = Search.complex_search(
            keywords='nonexistent',
            category=TaskCategory.TUTORING
        )
        
        self.assertEqual(results.count(), 0)