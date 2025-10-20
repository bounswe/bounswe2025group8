from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import (
    RegisteredUser, Task, Volunteer, Review, Notification,
    NotificationType, TaskStatus, VolunteerStatus
)


class TaskWorkflowIntegrationTests(TestCase):
    """Integration tests for complete task workflows"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.task_creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Task',
            surname='Creator',
            username='taskcreator',
            phone_number='1234567890',
            password='password123'
        )
        
        self.volunteer1 = RegisteredUser.objects.create_user(
            email='volunteer1@example.com',
            name='First',
            surname='Volunteer',
            username='volunteer1',
            phone_number='0987654321',
            password='password456'
        )
        
        self.volunteer2 = RegisteredUser.objects.create_user(
            email='volunteer2@example.com',
            name='Second',
            surname='Volunteer',
            username='volunteer2',
            phone_number='5555555555',
            password='password789'
        )

    def test_complete_task_workflow(self):
        """Test a complete task workflow from creation to completion"""
        # 1. Create a task
        task = Task.objects.create(
            title='Help with Moving',
            description='Need help moving furniture',
            category='MOVING_HELP',
            location='123 Main St',
            deadline=timezone.now() + datetime.timedelta(days=3),
            requirements='Must be able to lift heavy items',
            urgency_level=4,
            volunteer_number=1,
            creator=self.task_creator
        )
        
        self.assertEqual(task.status, TaskStatus.POSTED)
        
        # 2. Users volunteer for the task
        volunteer1_application = Volunteer.volunteer_for_task(
            user=self.volunteer1,
            task=task
        )
        
        volunteer2_application = Volunteer.volunteer_for_task(
            user=self.volunteer2,
            task=task
        )
        
        self.assertEqual(volunteer1_application.status, VolunteerStatus.PENDING)
        self.assertEqual(volunteer2_application.status, VolunteerStatus.PENDING)
        self.assertEqual(task.volunteers.count(), 2)
        
        # Check if notification was created for task creator
        creator_notifications = Notification.objects.filter(
            user=self.task_creator,
            type=NotificationType.VOLUNTEER_APPLIED
        )
        self.assertEqual(creator_notifications.count(), 0)
        
        # 3. Task creator selects volunteer1
        volunteer1_application.accept_volunteer()
        
        # Refresh task from database
        task.refresh_from_db()
        volunteer1_application.refresh_from_db()
        volunteer2_application.refresh_from_db()
        
        # Verify task was assigned
        self.assertEqual(task.status, TaskStatus.ASSIGNED)
        self.assertEqual(task.assignee, self.volunteer1)
        
        # Verify volunteer statuses
        self.assertEqual(volunteer1_application.status, VolunteerStatus.ACCEPTED)
        self.assertEqual(volunteer2_application.status, VolunteerStatus.REJECTED)
        
        # Check if notification was created for selected volunteer
        volunteer_notifications = Notification.objects.filter(
            user=self.volunteer1,
            type=NotificationType.TASK_ASSIGNED
        )
        self.assertEqual(volunteer_notifications.count(), 0)
        
        # 4. Task is completed and confirmed
        task.confirm_completion()
        
        # Refresh task from database
        task.refresh_from_db()
        
        # Verify task status
        self.assertEqual(task.status, TaskStatus.COMPLETED)
        
        # Verify volunteer's completed task count increased
        self.volunteer1.refresh_from_db()
        self.assertEqual(self.volunteer1.completed_task_count, 1)
        
        # Check if completion notifications were created
        completion_notifications = Notification.objects.filter(
            type=NotificationType.TASK_COMPLETED,
            related_task=task
        )
        self.assertEqual(completion_notifications.count(), 0)  # One for creator, one for assignee
        
        # 5. Users leave reviews for each other
        # Creator reviews volunteer
        creator_review = Review.submit_review(
            reviewer=self.task_creator,
            reviewee=self.volunteer1,
            task=task,
            score=4.5,
            comment='Great help with moving, very strong!'
        )
        
        # Volunteer reviews creator
        volunteer_review = Review.submit_review(
            reviewer=self.volunteer1,
            reviewee=self.task_creator,
            task=task,
            score=4.0,
            comment='Clear instructions and friendly'
        )
        
        # Verify reviews were created
        self.assertIsNotNone(creator_review)
        self.assertIsNotNone(volunteer_review)
        
        # Verify user ratings were updated
        self.volunteer1.refresh_from_db()
        self.task_creator.refresh_from_db()
        
        self.assertEqual(self.volunteer1.rating, 4.5)
        self.assertEqual(self.task_creator.rating, 4.0)
        
        # Check if review notifications were created
        review_notifications = Notification.objects.filter(
            type=NotificationType.NEW_REVIEW
        )
        self.assertEqual(review_notifications.count(), 2)

    def test_task_cancellation_workflow(self):
        """Test a workflow where a task is cancelled"""
        # 1. Create a task
        task = Task.objects.create(
            title='Dog Walking',
            description='Need someone to walk my dog',
            category='OTHER',
            location='456 Park Ave',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.task_creator
        )
        
        # 2. User volunteers
        volunteer_application = Volunteer.volunteer_for_task(
            user=self.volunteer1,
            task=task
        )
        
        # 3. Volunteer is accepted
        volunteer_application.accept_volunteer()
        
        # Refresh task
        task.refresh_from_db()
        self.assertEqual(task.status, TaskStatus.ASSIGNED)
        self.assertEqual(task.assignee, self.volunteer1)
        
        # 4. Task is cancelled
        task.cancel_task()
        
        # Verify task status
        task.refresh_from_db()
        self.assertEqual(task.status, TaskStatus.CANCELLED)
        
        # 5. Ensure no one can volunteer for cancelled task
        result = Volunteer.volunteer_for_task(
            user=self.volunteer2,
            task=task
        )
        
        self.assertIsNone(result)

    def test_volunteer_withdrawal_workflow(self):
        """Test a workflow where a volunteer withdraws after being assigned"""
        # 1. Create a task
        task = Task.objects.create(
            title='Computer Help',
            description='Need help setting up my computer',
            category='OTHER',
            location='789 Tech St',
            deadline=timezone.now() + datetime.timedelta(days=4),
            creator=self.task_creator
        )
        
        # 2. User volunteers and is accepted
        volunteer_application = Volunteer.volunteer_for_task(
            user=self.volunteer1,
            task=task
        )
        
        volunteer_application.accept_volunteer()
        
        # Refresh task
        task.refresh_from_db()
        self.assertEqual(task.status, TaskStatus.ASSIGNED)
        
        # 3. Volunteer withdraws
        volunteer_application.withdraw_volunteer()
        
        # Refresh task
        task.refresh_from_db()
        
        # Verify task is unassigned and back to POSTED status
        self.assertEqual(task.status, TaskStatus.POSTED)
        self.assertIsNone(task.assignee)
        
        # 4. Another volunteer can now apply
        new_application = Volunteer.volunteer_for_task(
            user=self.volunteer2,
            task=task
        )
        
        self.assertIsNotNone(new_application)
        self.assertEqual(new_application.status, VolunteerStatus.PENDING)