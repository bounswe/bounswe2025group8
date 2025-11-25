from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, Comment


class CommentModelTests(TestCase):
    """Test cases for the Comment model"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='1234567890',
            password='password123'
        )
        
        self.commenter = RegisteredUser.objects.create_user(
            email='commenter@example.com',
            name='Commenter',
            surname='User',
            username='commenteruser',
            phone_number='0987654321',
            password='password456'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Task with Comments',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.creator
        )
        
        # Create a comment
        self.comment = Comment.objects.create(
            content='This is a test comment',
            user=self.commenter,
            task=self.task
        )

    def test_comment_creation(self):
        """Test comment creation"""
        self.assertEqual(self.comment.content, 'This is a test comment')
        self.assertEqual(self.comment.user, self.commenter)
        self.assertEqual(self.comment.task, self.task)
        
        # Check string representation
        expected_str = f"Comment by {self.commenter.username} on {self.task.title}"
        self.assertEqual(str(self.comment), expected_str)

    def test_comment_getters(self):
        """Test comment getter methods"""
        self.assertEqual(self.comment.get_comment_id(), self.comment.id)
        self.assertEqual(self.comment.get_content(), 'This is a test comment')
        self.assertEqual(self.comment.get_user(), self.commenter)
        self.assertEqual(self.comment.get_task(), self.task)
        # Check timestamp is close to now
        self.assertTrue(
            (timezone.now() - self.comment.get_timestamp()).total_seconds() < 60
        )

    def test_comment_setters(self):
        """Test comment setter methods"""
        self.comment.set_content('Updated comment content')
        
        # Verify changes
        updated_comment = Comment.objects.get(id=self.comment.id)
        self.assertEqual(updated_comment.content, 'Updated comment content')
        self.assertEqual(updated_comment.get_content(), 'Updated comment content')

    def test_add_comment_method(self):
        """Test add_comment class method"""
        # Add a new comment
        new_comment = Comment.add_comment(
            user=self.creator,
            task=self.task,
            content='Reply from the task creator'
        )
        
        # Verify comment was created
        self.assertIsNotNone(new_comment)
        self.assertEqual(new_comment.user, self.creator)
        self.assertEqual(new_comment.task, self.task)
        self.assertEqual(new_comment.content, 'Reply from the task creator')
        
        # Verify task has two comments now
        self.assertEqual(self.task.comments.count(), 2)

    def test_delete_comment(self):
        """Test delete_comment method"""
        # Get initial count
        initial_count = Comment.objects.filter(task=self.task).count()
        
        # Delete comment
        result = self.comment.delete_comment()
        
        # Verify result
        self.assertTrue(result)
        
        # Verify comment was removed
        new_count = Comment.objects.filter(task=self.task).count()
        self.assertEqual(new_count, initial_count - 1)
        
        # Verify this specific comment is gone
        with self.assertRaises(Comment.DoesNotExist):
            Comment.objects.get(id=self.comment.id)

    def test_edit_comment(self):
        """Test edit_comment method"""
        # Edit comment
        result = self.comment.edit_comment('Edited comment content')
        
        # Verify result
        self.assertTrue(result)
        
        # Verify comment was updated
        updated_comment = Comment.objects.get(id=self.comment.id)
        self.assertEqual(updated_comment.content, 'Edited comment content')

    def test_multiple_comments_on_task(self):
        """Test adding multiple comments to a task"""
        # Create several more comments
        for i in range(5):
            Comment.add_comment(
                user=self.commenter if i % 2 == 0 else self.creator,
                task=self.task,
                content=f'Comment number {i+1}'
            )
        
        # Verify task has correct number of comments
        self.assertEqual(self.task.comments.count(), 6)  # 1 from setUp + 5 new ones
        
        # Verify comments can be ordered by timestamp
        comments = self.task.comments.order_by('timestamp')
        self.assertEqual(comments.first(), self.comment)  # First comment is the one from setUp

    def test_comment_with_empty_content(self):
        """Test creating comment with empty content"""
        # Create comment with empty string
        empty_comment = Comment.add_comment(
            user=self.commenter,
            task=self.task,
            content=''
        )
        
        # Verify comment was created (no validation in model)
        self.assertIsNotNone(empty_comment)
        self.assertEqual(empty_comment.content, '')
        
        # Verify it's stored in database
        retrieved = Comment.objects.get(id=empty_comment.id)
        self.assertEqual(retrieved.content, '')

    def test_comment_with_very_long_content(self):
        """Test creating comment with very long content"""
        # Create a very long content string
        long_content = 'x' * 5000  # 5000 characters
        
        # Create comment with long content
        long_comment = Comment.add_comment(
            user=self.commenter,
            task=self.task,
            content=long_content
        )
        
        # Verify comment was created
        self.assertIsNotNone(long_comment)
        self.assertEqual(len(long_comment.content), 5000)
        self.assertEqual(long_comment.content, long_content)

    def test_comment_timestamp_auto_generation(self):
        """Test that comment timestamp is automatically set"""
        import time
        
        # Record time before creating comment
        before = timezone.now()
        time.sleep(0.01)  # Small delay
        
        # Create comment
        comment = Comment.add_comment(
            user=self.commenter,
            task=self.task,
            content='Timestamp test'
        )
        
        time.sleep(0.01)  # Small delay
        after = timezone.now()
        
        # Verify timestamp is between before and after
        self.assertGreater(comment.timestamp, before)
        self.assertLess(comment.timestamp, after)

    def test_comment_without_user(self):
        """Test that comment requires a user"""
        # Attempting to create comment without user should fail
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Comment.objects.create(
                content='Comment without user',
                task=self.task,
                user=None
            )

    def test_comment_without_task(self):
        """Test that comment requires a task"""
        # Attempting to create comment without task should fail
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Comment.objects.create(
                content='Comment without task',
                user=self.commenter,
                task=None
            )

    def test_delete_nonexistent_comment(self):
        """Test deleting a comment that's already been deleted"""
        # Delete comment first time
        comment_id = self.comment.id
        self.comment.delete_comment()
        
        # Verify it's gone
        with self.assertRaises(Comment.DoesNotExist):
            Comment.objects.get(id=comment_id)