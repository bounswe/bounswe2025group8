import datetime
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from django.test import TestCase
from core.models import RegisteredUser, Task, Bookmark
from core.api.views.bookmark_views import BookmarkViewSet


class BookmarkViewSetTests(TestCase):
    """Basic API tests for bookmark list and create endpoints"""

    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = RegisteredUser.objects.create_user(
            email='viewer@example.com',
            name='Viewer',
            surname='User',
            username='viewer',
            phone_number='1010101010',
            password='password123'
        )
        self.other_user = RegisteredUser.objects.create_user(
            email='otherviewer@example.com',
            name='Other',
            surname='User',
            username='otherviewer',
            phone_number='2020202020',
            password='password123'
        )
        self.task = Task.objects.create(
            title='Listable Task',
            description='Task for list endpoint',
            category='OTHER',
            location='Somewhere',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.user
        )
        self.other_task = Task.objects.create(
            title='Other Task',
            description='Task by other user',
            category='TUTORING',
            location='Elsewhere',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.other_user
        )
        Bookmark.add_bookmark(user=self.user, task=self.task)
        Bookmark.add_bookmark(user=self.other_user, task=self.other_task)

    def test_list_returns_only_user_bookmarks(self):
        """List endpoint should be restricted to the requesting user's bookmarks"""
        request = self.factory.get('/bookmarks/')
        force_authenticate(request, user=self.user)
        view = BookmarkViewSet.as_view({'get': 'list'})

        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        bookmarks = response.data['data']['bookmarks']
        self.assertEqual(len(bookmarks), 1)
        self.assertEqual(bookmarks[0]['task']['title'], 'Listable Task')

    def test_create_bookmark(self):
        """Create endpoint should allow bookmarking a task"""
        request = self.factory.post('/bookmarks/', {'task_id': self.other_task.id})
        force_authenticate(request, user=self.user)
        view = BookmarkViewSet.as_view({'post': 'create'})

        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertTrue(
            Bookmark.objects.filter(user=self.user, task=self.other_task).exists()
        )
