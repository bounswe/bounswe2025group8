from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
import datetime
from core.models import RegisteredUser, Task, Review, Volunteer, VolunteerStatus


class EnhancedReviewModelTests(TestCase):
    """Test cases for enhanced Review model with detailed ratings"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.requester = RegisteredUser.objects.create_user(
            email='requester@example.com',
            name='Requester',
            surname='User',
            username='requester',
            phone_number='1234567890',
            password='password123'
        )
        
        self.volunteer = RegisteredUser.objects.create_user(
            email='volunteer@example.com',
            name='Volunteer',
            surname='User',
            username='volunteer',
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
            creator=self.requester,
            assignee=self.volunteer,
            status='COMPLETED'
        )
        
        # Add volunteer to assignees
        self.task.assignees.add(self.volunteer)

    def test_volunteer_to_requester_review(self):
        """Test volunteer reviewing requester with detailed ratings"""
        review = Review.submit_review(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            comment='Great requester, very clear instructions',
            accuracy_of_request=4.5,
            communication_volunteer_to_requester=5.0,
            safety_and_preparedness=4.0
        )
        
        self.assertIsNotNone(review)
        self.assertEqual(review.reviewer, self.volunteer)
        self.assertEqual(review.reviewee, self.requester)
        self.assertEqual(review.task, self.task)
        self.assertEqual(review.accuracy_of_request, 4.5)
        self.assertEqual(review.communication_volunteer_to_requester, 5.0)
        self.assertEqual(review.safety_and_preparedness, 4.0)
        self.assertEqual(review.comment, 'Great requester, very clear instructions')
        
        # Check auto-calculated score (average of 3 ratings)
        expected_score = (4.5 + 5.0 + 4.0) / 3
        self.assertAlmostEqual(review.score, expected_score, places=2)
        
        # Check helper methods
        self.assertTrue(review.is_volunteer_to_requester_review())
        self.assertFalse(review.is_requester_to_volunteer_review())

    def test_requester_to_volunteer_review(self):
        """Test requester reviewing volunteer with detailed ratings"""
        review = Review.submit_review(
            reviewer=self.requester,
            reviewee=self.volunteer,
            task=self.task,
            comment='Excellent volunteer, very reliable',
            reliability=5.0,
            task_completion=4.5,
            communication_requester_to_volunteer=5.0,
            safety_and_respect=5.0
        )
        
        self.assertIsNotNone(review)
        self.assertEqual(review.reviewer, self.requester)
        self.assertEqual(review.reviewee, self.volunteer)
        self.assertEqual(review.task, self.task)
        self.assertEqual(review.reliability, 5.0)
        self.assertEqual(review.task_completion, 4.5)
        self.assertEqual(review.communication_requester_to_volunteer, 5.0)
        self.assertEqual(review.safety_and_respect, 5.0)
        self.assertEqual(review.comment, 'Excellent volunteer, very reliable')
        
        # Check auto-calculated score (average of 4 ratings)
        expected_score = (5.0 + 4.5 + 5.0 + 5.0) / 4
        self.assertAlmostEqual(review.score, expected_score, places=2)
        
        # Check helper methods
        self.assertFalse(review.is_volunteer_to_requester_review())
        self.assertTrue(review.is_requester_to_volunteer_review())

    def test_partial_ratings_volunteer_to_requester(self):
        """Test volunteer review with partial ratings"""
        review = Review.submit_review(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            accuracy_of_request=4.0,
            communication_volunteer_to_requester=5.0
            # safety_and_preparedness omitted
        )
        
        self.assertIsNotNone(review)
        self.assertEqual(review.accuracy_of_request, 4.0)
        self.assertEqual(review.communication_volunteer_to_requester, 5.0)
        self.assertIsNone(review.safety_and_preparedness)
        
        # Score should be average of non-null values
        expected_score = (4.0 + 5.0) / 2
        self.assertAlmostEqual(review.score, expected_score, places=2)

    def test_update_existing_review_with_new_ratings(self):
        """Test updating an existing review with new detailed ratings"""
        # Create initial review
        review1 = Review.submit_review(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            comment='Initial review',
            accuracy_of_request=3.0,
            communication_volunteer_to_requester=3.5,
            safety_and_preparedness=3.0
        )
        
        # Update with new ratings
        review2 = Review.submit_review(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            comment='Updated review',
            accuracy_of_request=5.0,
            communication_volunteer_to_requester=4.5,
            safety_and_preparedness=5.0
        )
        
        # Should be same review
        self.assertEqual(review1.id, review2.id)
        
        # Check updated values
        self.assertEqual(review2.accuracy_of_request, 5.0)
        self.assertEqual(review2.communication_volunteer_to_requester, 4.5)
        self.assertEqual(review2.safety_and_preparedness, 5.0)
        self.assertEqual(review2.comment, 'Updated review')
        
        # Check updated score
        expected_score = (5.0 + 4.5 + 5.0) / 3
        self.assertAlmostEqual(review2.score, expected_score, places=2)

    def test_rating_field_validation(self):
        """Test that rating fields validate min/max values"""
        # Test values outside 1.0-5.0 range
        with self.assertRaises(ValidationError):
            review = Review(
                reviewer=self.volunteer,
                reviewee=self.requester,
                task=self.task,
                accuracy_of_request=0.5,  # Too low
                communication_volunteer_to_requester=3.0,
                safety_and_preparedness=4.0
            )
            review.full_clean()
        
        with self.assertRaises(ValidationError):
            review = Review(
                reviewer=self.volunteer,
                reviewee=self.requester,
                task=self.task,
                accuracy_of_request=5.5,  # Too high
                communication_volunteer_to_requester=3.0,
                safety_and_preparedness=4.0
            )
            review.full_clean()

    def test_user_rating_update_with_detailed_reviews(self):
        """Test that user's overall rating is updated correctly"""
        # Create another volunteer to give multiple reviews
        volunteer2 = RegisteredUser.objects.create_user(
            email='volunteer2@example.com',
            name='Volunteer2',
            surname='User',
            username='volunteer2',
            phone_number='1111111111',
            password='password789'
        )
        
        # Create another completed task
        task2 = Task.objects.create(
            title='Second Task',
            description='Task Description',
            category='TUTORING',
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.requester,
            assignee=volunteer2,
            status='COMPLETED'
        )
        task2.assignees.add(volunteer2)
        
        # Initial rating should be 0
        self.assertEqual(self.requester.rating, 0.0)
        
        # First volunteer reviews requester
        review1 = Review.submit_review(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            accuracy_of_request=4.0,
            communication_volunteer_to_requester=4.0,
            safety_and_preparedness=4.0
        )
        
        # Check rating updated
        self.requester.refresh_from_db()
        self.assertEqual(self.requester.rating, 4.0)
        
        # Second volunteer reviews requester
        review2 = Review.submit_review(
            reviewer=volunteer2,
            reviewee=self.requester,
            task=task2,
            accuracy_of_request=5.0,
            communication_volunteer_to_requester=5.0,
            safety_and_preparedness=5.0
        )
        
        # Check rating is average of both reviews
        self.requester.refresh_from_db()
        expected_rating = (4.0 + 5.0) / 2
        self.assertAlmostEqual(self.requester.rating, expected_rating, places=2)

    def test_review_with_only_comment_no_ratings(self):
        """Test that review requires at least some ratings"""
        # This should still work as long as submit_review is called correctly
        # The save() method will calculate score as 0 if no ratings provided
        review = Review(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            comment='Just a comment, no ratings'
        )
        review.save()
        
        # Score should be 0 if no ratings provided
        self.assertEqual(review.score, 0.0)

    def test_multiple_volunteers_review_same_requester(self):
        """Test multiple volunteers can review the same requester on same task"""
        # Create second volunteer
        volunteer2 = RegisteredUser.objects.create_user(
            email='volunteer2@example.com',
            name='Volunteer2',
            surname='User',
            username='volunteer2',
            phone_number='2222222222',
            password='password222'
        )
        
        # Add second volunteer to task
        self.task.assignees.add(volunteer2)
        self.task.volunteer_number = 2
        self.task.save()
        
        # First volunteer reviews
        review1 = Review.submit_review(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            accuracy_of_request=4.0,
            communication_volunteer_to_requester=4.0,
            safety_and_preparedness=4.0
        )
        
        # Second volunteer reviews
        review2 = Review.submit_review(
            reviewer=volunteer2,
            reviewee=self.requester,
            task=self.task,
            accuracy_of_request=5.0,
            communication_volunteer_to_requester=5.0,
            safety_and_preparedness=5.0
        )
        
        # Both reviews should exist
        self.assertNotEqual(review1.id, review2.id)
        self.assertEqual(Review.objects.filter(reviewee=self.requester, task=self.task).count(), 2)

    def test_backward_compatibility_with_old_review_format(self):
        """Test that old-style reviews (without detailed ratings) still work"""
        # Create review the old way (this tests backward compatibility)
        review = Review.objects.create(
            reviewer=self.volunteer,
            reviewee=self.requester,
            task=self.task,
            score=4.5,
            comment='Old style review'
        )
        
        # Should work fine
        self.assertEqual(review.score, 4.5)
        self.assertEqual(review.comment, 'Old style review')
        self.assertIsNone(review.accuracy_of_request)
        self.assertIsNone(review.reliability)