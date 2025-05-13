from django.test import TestCase
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
import datetime
import os
import tempfile
from core.models import RegisteredUser, Task, Photo


class PhotoModelTests(TestCase):
    """Test cases for the Photo model"""

    def setUp(self):
        """Set up test data"""
        # Create temporary directory for test media
        self.temp_dir = tempfile.mkdtemp()
        
        # Override MEDIA_ROOT to use temp directory
        self._old_media_root = os.environ.get('MEDIA_ROOT', '')
        os.environ['MEDIA_ROOT'] = self.temp_dir
        
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
            title='Task with Photos',
            description='Task Description',
            category='HOME_REPAIR',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user
        )
        
        # Create a test image file
        image_content = b'GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        self.test_image = SimpleUploadedFile(
            name='test_image.gif',
            content=image_content,
            content_type='image/gif'
        )
        
        # Create a photo
        self.photo = Photo.objects.create(
            task=self.task,
            url=self.test_image
        )

    def tearDown(self):
        """Clean up after tests"""
        # Remove temporary files
        for photo in Photo.objects.all():
            if photo.url and os.path.isfile(photo.url.path):
                os.remove(photo.url.path)
        
        # Restore original MEDIA_ROOT
        os.environ['MEDIA_ROOT'] = self._old_media_root
        
        # Remove temporary directory
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_photo_creation(self):
        """Test photo creation"""
        self.assertEqual(self.photo.task, self.task)
        self.assertIsNotNone(self.photo.url)
        
        # Check string representation
        expected_str = f"Photo for {self.task.title}"
        self.assertEqual(str(self.photo), expected_str)

    def test_photo_getters(self):
        """Test photo getter methods"""
        self.assertEqual(self.photo.get_photo_id(), self.photo.id)
        self.assertEqual(self.photo.get_task(), self.task)
        # URL might vary by environment, so just check it exists
        self.assertIsNotNone(self.photo.get_url())
        # Check uploaded_at is close to now
        self.assertTrue(
            (timezone.now() - self.photo.get_uploaded_at()).total_seconds() < 60
        )

    def test_upload_photo_method(self):
        """Test upload_photo class method"""
        # Create a second test image
        image_content = b'GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        test_image2 = SimpleUploadedFile(
            name='test_image2.gif',
            content=image_content,
            content_type='image/gif'
        )
        
        # Upload photo
        new_photo = Photo.upload_photo(
            task=self.task,
            image_file=test_image2
        )
        
        # Verify photo was created
        self.assertIsNotNone(new_photo)
        self.assertEqual(new_photo.task, self.task)
        self.assertIsNotNone(new_photo.url)
        
        # Verify task has two photos now
        self.assertEqual(self.task.photos.count(), 2)

    def test_delete_photo(self):
        """Test delete_photo method"""
        # Get file path
        file_path = self.photo.url.path
        
        # Verify file exists
        self.assertTrue(os.path.isfile(file_path))
        
        # Delete photo
        result = self.photo.delete_photo()
        
        # Verify result
        self.assertTrue(result)
        
        # Verify file was deleted
        self.assertFalse(os.path.isfile(file_path))
        
        # Verify photo was removed from database
        with self.assertRaises(Photo.DoesNotExist):
            Photo.objects.get(id=self.photo.id)
        
        # Verify task has no photos now
        self.assertEqual(self.task.photos.count(), 0)

    def test_multiple_photos_per_task(self):
        """Test adding multiple photos to a task"""
        # Create several more photos
        for i in range(3):
            image_content = b'GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
            test_image = SimpleUploadedFile(
                name=f'test_image_{i}.gif',
                content=image_content,
                content_type='image/gif'
            )
            
            Photo.upload_photo(
                task=self.task,
                image_file=test_image
            )
        
        # Verify task has correct number of photos
        self.assertEqual(self.task.photos.count(), 4)  # 1 from setUp + 3 new ones
        
        # Verify photos can be accessed from task
        photos = self.task.get_photos()
        self.assertEqual(photos.count(), 4)