import os
import tempfile
import shutil
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory
from django.core.files.uploadedfile import SimpleUploadedFile
import datetime
from core.models import RegisteredUser, Task, Photo
from core.api.serializers.photo_serializers import PhotoCreateSerializer


class PhotoSerializerTestCase(TestCase):
    """Tests for Photo serializer validation and creation"""

    def setUp(self):
        self.factory = APIRequestFactory()
        self.temp_dir = tempfile.mkdtemp()
        self.user = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creator',
            phone_number='5556667777',
            password='password123'
        )
        self.other_user = RegisteredUser.objects.create_user(
            email='other@example.com',
            name='Other',
            surname='User',
            username='otheruser',
            phone_number='1112223333',
            password='password123'
        )
        self.task = Task.objects.create(
            title='Photo Task',
            description='Task with photo',
            category='HOME_REPAIR',
            location='Somewhere',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.user
        )
        self.image_file = SimpleUploadedFile(
            name='upload.gif',
            content=b'GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
            content_type='image/gif'
        )

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_create_photo_as_task_creator(self):
        """Task creator should be allowed to upload a photo"""
        request = self.factory.post('/photos/', {})
        request.user = self.user
        data = {'task_id': self.task.id, 'url': self.image_file}

        with self.settings(MEDIA_ROOT=self.temp_dir):
            serializer = PhotoCreateSerializer(data=data, context={'request': request})
            self.assertTrue(serializer.is_valid(), serializer.errors)
            photo = serializer.save()

        self.assertEqual(photo.task, self.task)
        self.assertTrue(os.path.isfile(photo.url.path))

    def test_non_creator_cannot_upload_photo(self):
        """Serializer should reject uploads from non-creators"""
        request = self.factory.post('/photos/', {})
        request.user = self.other_user
        data = {'task_id': self.task.id, 'url': self.image_file}

        serializer = PhotoCreateSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('task_id', serializer.errors)

    def test_missing_task_validation(self):
        """Serializer should error when task does not exist"""
        request = self.factory.post('/photos/', {})
        request.user = self.user
        serializer = PhotoCreateSerializer(
            data={'task_id': 9999, 'url': self.image_file},
            context={'request': request}
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('task_id', serializer.errors)
