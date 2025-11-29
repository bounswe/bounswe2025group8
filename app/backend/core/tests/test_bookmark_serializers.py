from django.test import TestCase
from rest_framework.test import APIRequestFactory
from core.models import RegisteredUser, Task, Tag, Bookmark
from core.api.serializers.bookmark_serializers import BookmarkCreateSerializer
from django.utils import timezone
import datetime


class BookmarkSerializerTestCase(TestCase):
    """Tests for Bookmark serializer validation and creation"""

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = RegisteredUser.objects.create_user(
            email='serializer@example.com',
            name='Serial',
            surname='User',
            username='serializer',
            phone_number='5554443322',
            password='password123'
        )
        self.task = Task.objects.create(
            title='Serializable Task',
            description='Task for serializer tests',
            category='OTHER',
            location='Nowhere',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.user
        )

    def test_create_bookmark_with_tags(self):
        """BookmarkCreateSerializer should create bookmark and tags"""
        request = self.factory.post('/bookmarks/', {})
        request.user = self.user
        data = {'task_id': self.task.id, 'tag_names': ['Important', 'Chore']}

        serializer = BookmarkCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        bookmark = serializer.save()

        self.assertEqual(bookmark.user, self.user)
        self.assertEqual(bookmark.task, self.task)
        self.assertEqual(bookmark.tags.count(), 2)
        self.assertTrue(Tag.objects.filter(name='important').exists())
        self.assertTrue(Tag.objects.filter(name='chore').exists())

    def test_invalid_task_id_validation(self):
        """Invalid task_id should raise validation error"""
        request = self.factory.post('/bookmarks/', {})
        request.user = self.user
        serializer = BookmarkCreateSerializer(
            data={'task_id': 9999},
            context={'request': request}
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('task_id', serializer.errors)
