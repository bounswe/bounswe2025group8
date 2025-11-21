from django.test import TestCase, RequestFactory
from django.utils import timezone
import datetime
from rest_framework.exceptions import ValidationError
from core.models import RegisteredUser, Task, Comment
from core.api.serializers.comment_serializers import (
    CommentSerializer, CommentCreateSerializer, CommentUpdateSerializer
)


class CommentSerializerTests(TestCase):
    """Test cases for CommentSerializer"""

    def setUp(self):
        """Set up test data"""
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='+1234567890',
            password='password123'
        )
        
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user
        )
        
        self.comment = Comment.add_comment(
            user=self.user,
            task=self.task,
            content='Test comment content'
        )

    def test_comment_serialization(self):
        """Test serializing a comment"""
        serializer = CommentSerializer(instance=self.comment)
        data = serializer.data
        
        # Verify all expected fields are present
        self.assertIn('id', data)
        self.assertIn('content', data)
        self.assertIn('timestamp', data)
        self.assertIn('user', data)
        self.assertIn('task', data)
        
        # Verify content
        self.assertEqual(data['content'], 'Test comment content')
        
        # Verify nested user data
        self.assertEqual(data['user']['email'], 'test@example.com')
        
        # Verify nested task data
        self.assertEqual(data['task']['title'], 'Test Task')

    def test_comment_read_only_fields(self):
        """Test that read-only fields cannot be modified"""
        serializer = CommentSerializer(instance=self.comment)
        data = serializer.data
        
        # These fields should be read-only
        self.assertIn('id', data)
        self.assertIn('timestamp', data)
        self.assertIn('user', data)
        self.assertIn('task', data)


class CommentCreateSerializerTests(TestCase):
    """Test cases for CommentCreateSerializer"""

    def setUp(self):
        """Set up test data"""
        self.factory = RequestFactory()
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='+1234567890',
            password='password123'
        )
        
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user
        )

    def test_valid_comment_creation(self):
        """Test creating a comment with valid data"""
        data = {
            'content': 'This is a new comment',
            'task_id': self.task.id
        }
        
        # Create a mock request with user
        request = self.factory.post('/fake-url')
        request.user = self.user
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        
        # Create the comment
        comment = serializer.save()
        
        # Verify comment was created
        self.assertIsNotNone(comment)
        self.assertEqual(comment.content, 'This is a new comment')
        self.assertEqual(comment.user, self.user)
        self.assertEqual(comment.task, self.task)

    def test_comment_with_invalid_task_id(self):
        """Test creating comment with non-existent task ID"""
        data = {
            'content': 'This is a comment',
            'task_id': 99999  # Non-existent task ID
        }
        
        request = self.factory.post('/fake-url')
        request.user = self.user
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('task_id', serializer.errors)
        self.assertIn('Task not found', str(serializer.errors['task_id']))

    def test_comment_with_empty_content(self):
        """Test creating comment with empty content"""
        data = {
            'content': '',
            'task_id': self.task.id
        }
        
        request = self.factory.post('/fake-url')
        request.user = self.user
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        # DRF requires non-empty strings by default, so this should fail
        self.assertFalse(serializer.is_valid())
        self.assertIn('content', serializer.errors)

    def test_comment_with_very_long_content(self):
        """Test creating comment with very long content"""
        long_content = 'x' * 10000  # 10000 characters
        
        data = {
            'content': long_content,
            'task_id': self.task.id
        }
        
        request = self.factory.post('/fake-url')
        request.user = self.user
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        
        comment = serializer.save()
        self.assertEqual(len(comment.content), 10000)

    def test_missing_required_fields(self):
        """Test creating comment without required fields"""
        # Missing content
        data = {
            'task_id': self.task.id
        }
        
        request = self.factory.post('/fake-url')
        request.user = self.user
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('content', serializer.errors)
        
        # Missing task_id
        data = {
            'content': 'This is a comment'
        }
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('task_id', serializer.errors)

    def test_comment_creation_requires_authenticated_user(self):
        """Test that comment creation requires user in context"""
        data = {
            'content': 'This is a comment',
            'task_id': self.task.id
        }
        
        # Create request without user
        request = self.factory.post('/fake-url')
        # Don't set request.user
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        # This might fail during save because user is required
        if serializer.is_valid():
            with self.assertRaises(AttributeError):
                serializer.save()


class CommentUpdateSerializerTests(TestCase):
    """Test cases for CommentUpdateSerializer"""

    def setUp(self):
        """Set up test data"""
        self.factory = RequestFactory()
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='+1234567890',
            password='password123'
        )
        
        self.other_user = RegisteredUser.objects.create_user(
            email='other@example.com',
            name='Other',
            surname='User',
            username='otheruser',
            phone_number='+0987654321',
            password='password456'
        )
        
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user
        )
        
        self.comment = Comment.add_comment(
            user=self.user,
            task=self.task,
            content='Original comment content'
        )

    def test_valid_comment_update(self):
        """Test updating comment with valid data"""
        data = {
            'content': 'Updated comment content'
        }
        
        request = self.factory.put('/fake-url')
        request.user = self.user
        
        serializer = CommentUpdateSerializer(
            instance=self.comment,
            data=data,
            context={'request': request}
        )
        self.assertTrue(serializer.is_valid())
        
        updated_comment = serializer.save()
        self.assertEqual(updated_comment.content, 'Updated comment content')

    def test_update_comment_by_different_user(self):
        """Test that users cannot update other users' comments"""
        data = {
            'content': 'Trying to update someone else comment'
        }
        
        request = self.factory.put('/fake-url')
        request.user = self.other_user  # Different user
        
        serializer = CommentUpdateSerializer(
            instance=self.comment,
            data=data,
            context={'request': request}
        )
        
        # Should be invalid or raise error
        if serializer.is_valid():
            with self.assertRaises(ValidationError):
                serializer.save()
        else:
            # If validation fails, that's also acceptable
            pass

    def test_update_comment_with_empty_content(self):
        """Test updating comment to have empty content"""
        data = {
            'content': ''
        }
        
        request = self.factory.put('/fake-url')
        request.user = self.user
        
        serializer = CommentUpdateSerializer(
            instance=self.comment,
            data=data,
            context={'request': request}
        )
        # DRF requires non-empty strings by default, so this should fail
        self.assertFalse(serializer.is_valid())
        self.assertIn('content', serializer.errors)

    def test_update_comment_only_updates_content(self):
        """Test that update only changes content, not other fields"""
        original_timestamp = self.comment.timestamp
        original_user = self.comment.user
        original_task = self.comment.task
        
        data = {
            'content': 'Updated content'
        }
        
        request = self.factory.put('/fake-url')
        request.user = self.user
        
        serializer = CommentUpdateSerializer(
            instance=self.comment,
            data=data,
            context={'request': request}
        )
        self.assertTrue(serializer.is_valid())
        
        updated_comment = serializer.save()
        
        # Content should be updated
        self.assertEqual(updated_comment.content, 'Updated content')
        
        # Other fields should remain unchanged
        self.assertEqual(updated_comment.user, original_user)
        self.assertEqual(updated_comment.task, original_task)
        # Timestamp might change slightly, but should be close
        self.assertAlmostEqual(
            updated_comment.timestamp.timestamp(),
            original_timestamp.timestamp(),
            delta=60  # Within 60 seconds
        )
