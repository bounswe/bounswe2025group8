from django.test import TestCase
from core.models import Task, TaskCategory
from core.api.serializers.category_serializers import CategoryWithPopularitySerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
import datetime

class CategorySerializerTestCase(TestCase):
    """Test the CategoryWithPopularitySerializer"""

    def setUp(self):
        """Set up test data for categories"""
        # Create a user for task creation
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create tasks with different categories
        # 3 tasks in TUTORING
        for i in range(3):
            Task.objects.create(
                title=f'Tutoring Task {i}',
                description=f'Description for tutoring task {i}',
                category=TaskCategory.TUTORING,
                location='University',
                deadline=timezone.now() + datetime.timedelta(days=i+1),
                urgency_level=3,
                creator=self.user
            )
        
        # 2 tasks in GROCERY_SHOPPING
        for i in range(2):
            Task.objects.create(
                title=f'Shopping Task {i}',
                description=f'Description for shopping task {i}',
                category=TaskCategory.GROCERY_SHOPPING,
                location='Downtown',
                deadline=timezone.now() + datetime.timedelta(days=i+1),
                urgency_level=2,
                creator=self.user
            )
        
        # 1 task in HOME_REPAIR
        Task.objects.create(
            title='Repair Task',
            description='Description for repair task',
            category=TaskCategory.HOME_REPAIR,
            location='Suburb',
            deadline=timezone.now() + datetime.timedelta(days=5),
            urgency_level=4,
            creator=self.user
        )

    def test_get_categories_with_popularity(self):
        """Test fetching categories with their popularity counts"""
        categories = CategoryWithPopularitySerializer.get_categories_with_popularity()
        
        # Convert to a dict for easier testing
        category_dict = {cat['value']: cat for cat in categories}
        
        # Verify all categories are present (even those without tasks)
        self.assertEqual(len(categories), len(TaskCategory.choices))
        
        # Verify counts for categories with tasks
        self.assertEqual(category_dict[TaskCategory.TUTORING]['task_count'], 3)
        self.assertEqual(category_dict[TaskCategory.GROCERY_SHOPPING]['task_count'], 2)
        self.assertEqual(category_dict[TaskCategory.HOME_REPAIR]['task_count'], 1)
        
        # Verify categories with no tasks have zero count
        self.assertEqual(category_dict[TaskCategory.HOUSE_CLEANING]['task_count'], 0)
        
        # Verify order (should be ordered by popularity)
        self.assertEqual(categories[0]['value'], TaskCategory.TUTORING)
        self.assertEqual(categories[1]['value'], TaskCategory.GROCERY_SHOPPING)
        self.assertEqual(categories[2]['value'], TaskCategory.HOME_REPAIR)
