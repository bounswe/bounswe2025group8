from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
import datetime
from core.models import RegisteredUser, Task, Review


class ReviewModelTests(TestCase):
    """Test cases for the Review model"""

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
        
        self.assignee = RegisteredUser.objects.create_user(
            email='assignee@example.com',
            name='Assignee',
            surname='User',
            username='assigneeuser',
            phone_number='0987654321',
            password='password456'
        )
        
        # Create a completed task
        self.task = Task.objects.create(
            title='Completed Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.creator,
            assignee=self.assignee,
            status='COMPLETED'
        )
        
        # Create a review
        self.review = Review.objects.create(
            score=4.5,
            comment='Great service!',
            reviewer=self.creator,
            reviewee=self.assignee,
            task=self.task
        )

    def test_review_creation(self):
        """Test review creation"""
        self.assertEqual(self.review.score, 4.5)
        self.assertEqual(self.review.comment, 'Great service!')
        self.assertEqual(self.review.reviewer, self.creator)
        self.assertEqual(self.review.reviewee, self.assignee)
        self.assertEqual(self.review.task, self.task)
        
        # Check string representation
        expected_str = f"Review by {self.creator.username} for {self.assignee.username} (4.5/5)"
        self.assertEqual(str(self.review), expected_str)

    def test_review_getters(self):
        """Test review getter methods"""
        self.assertEqual(self.review.get_review_id(), self.review.id)
        self.assertEqual(self.review.get_score(), 4.5)
        self.assertEqual(self.review.get_comment(), 'Great service!')
        self.assertEqual(self.review.get_reviewer(), self.creator)
        self.assertEqual(self.review.get_reviewee(), self.assignee)
        self.assertEqual(self.review.get_task(), self.task)
        # Check timestamp is close to now
        self.assertTrue(
            (timezone.now() - self.review.get_timestamp()).total_seconds() < 60
        )

    def test_review_setters(self):
        """Test review setter methods"""
        self.review.set_score(3.5)
        self.review.set_comment('Average service')
        
        # Verify changes
        updated_review = Review.objects.get(id=self.review.id)
        self.assertEqual(updated_review.score, 3.5)
        self.assertEqual(updated_review.comment, 'Average service')

    def test_score_validation(self):
        """Test review score validation"""
        # Test score too low
        with self.assertRaises(ValidationError):
            self.review.score = 0.5
            self.review.full_clean()  # This triggers validation
        
        # Test score too high
        with self.assertRaises(ValidationError):
            self.review.score = 5.5
            self.review.full_clean()
        
        # Test valid scores
        valid_scores = [1.0, 2.5, 3.0, 4.0, 5.0]
        for score in valid_scores:
            self.review.score = score
            self.review.full_clean()  # Should not raise exception
            self.assertEqual(self.review.score, score)

    def test_submit_review_method(self):
        """Test submit_review class method"""
        # Submit a review from assignee to creator
        new_review = Review.submit_review(
            reviewer=self.assignee,
            reviewee=self.creator,
            task=self.task,
            score=4.0,
            comment='Good experience working with this person'
        )
        
        # Verify review was created
        self.assertIsNotNone(new_review)
        self.assertEqual(new_review.reviewer, self.assignee)
        self.assertEqual(new_review.reviewee, self.creator)
        self.assertEqual(new_review.task, self.task)
        self.assertEqual(new_review.score, 4.0)
        self.assertEqual(new_review.comment, 'Good experience working with this person')

    def test_update_existing_review(self):
        """Test updating an existing review"""
        # Submit a review that will replace the existing one
        updated_review = Review.submit_review(
            reviewer=self.creator,
            reviewee=self.assignee,
            task=self.task,
            score=3.0,
            comment='Updated my review'
        )
        
        # Verify it updated the existing review rather than creating a new one
        self.assertEqual(updated_review.id, self.review.id)
        self.assertEqual(updated_review.score, 3.0)
        self.assertEqual(updated_review.comment, 'Updated my review')
        
        # Verify only one review exists for this combination
        count = Review.objects.filter(
            reviewer=self.creator,
            reviewee=self.assignee,
            task=self.task
        ).count()
        self.assertEqual(count, 1)

    def test_update_user_rating(self):
        """Test updating user rating based on reviews"""
        # Initially rating should be 0
        self.assertEqual(self.assignee.rating, 0.0)
        
        # Create multiple reviews for the assignee
        Review.objects.create(
            score=3.0,
            comment='Average',
            reviewer=RegisteredUser.objects.create_user(
                email='user1@example.com',
                name='User1',
                surname='Test',
                username='user1',
                phone_number='1111111111',
                password='pass1'
            ),
            reviewee=self.assignee,
            task=self.task
        )
        
        # Update the rating
        self.review.update_user_rating()
        
        # Calculate expected average
        expected_avg = (4.5 + 3.0) / 2
        
        # Verify user rating was updated
        updated_assignee = RegisteredUser.objects.get(id=self.assignee.id)
        self.assertAlmostEqual(updated_assignee.rating, expected_avg, places=2)

    def test_review_validation_rules(self):
        """Test the validation rules for reviews"""
        # Create an incomplete task
        incomplete_task = Task.objects.create(
            title='Incomplete Task',
            description='Not done yet',
            category='TUTORING',
            location='Somewhere',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.creator,
            assignee=self.assignee,
            status='IN_PROGRESS'
        )
        
        # Should raise error for non-completed task
        with self.assertRaises(ValueError):
            Review.submit_review(
                reviewer=self.creator,
                reviewee=self.assignee,
                task=incomplete_task,
                score=4.0,
                comment='Cannot review yet'
            )
        
        # Create a third user not involved in the task
        third_user = RegisteredUser.objects.create_user(
            email='third@example.com',
            name='Third',
            surname='User',
            username='thirduser',
            phone_number='5555555555',
            password='password789'
        )
        
        # Should raise error for reviewer not involved in task
        with self.assertRaises(ValueError):
            Review.submit_review(
                reviewer=third_user,
                reviewee=self.assignee,
                task=self.task,
                score=3.0,
                comment='I am not involved'
            )
        
        # Should raise error for reviewee not involved in task
        with self.assertRaises(ValueError):
            Review.submit_review(
                reviewer=self.creator,
                reviewee=third_user,
                task=self.task,
                score=3.0,
                comment='Not a participant'
            )
        
        # Should raise error for self-review
        with self.assertRaises(ValueError):
            Review.submit_review(
                reviewer=self.creator,
                reviewee=self.creator,
                task=self.task,
                score=5.0,
                comment='I am awesome'
            )