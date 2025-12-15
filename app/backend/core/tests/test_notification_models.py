from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, Volunteer, Notification, NotificationType, Comment


class NotificationModelTests(TestCase):
    """Test cases for the Notification model"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.user1 = RegisteredUser.objects.create_user(
            email='user1@example.com',
            name='User',
            surname='One',
            username='userone',
            phone_number='1234567890',
            password='password123'
        )
        
        self.user2 = RegisteredUser.objects.create_user(
            email='user2@example.com',
            name='User',
            surname='Two',
            username='usertwo',
            phone_number='0987654321',
            password='password456'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.user1
        )
        
        # Create a notification
        self.notification = Notification.objects.create(
            content='Test notification content',
            type=NotificationType.TASK_CREATED,
            user=self.user1,
            related_task=self.task,
            is_read=False
        )

    def test_notification_creation(self):
        """Test notification creation"""
        self.assertEqual(self.notification.content, 'Test notification content')
        self.assertEqual(self.notification.type, NotificationType.TASK_CREATED)
        self.assertEqual(self.notification.user, self.user1)
        self.assertEqual(self.notification.related_task, self.task)
        self.assertFalse(self.notification.is_read)
        
        # Check string representation
        expected_str = f"{NotificationType.TASK_CREATED} - {self.notification.timestamp.strftime('%Y-%m-%d %H:%M')}"
        self.assertEqual(str(self.notification), expected_str)

    def test_notification_getters(self):
        """Test notification getter methods"""
        self.assertEqual(self.notification.get_content(), 'Test notification content')
        self.assertEqual(self.notification.get_type(), NotificationType.TASK_CREATED)
        self.assertFalse(self.notification.is_notification_read())
        self.assertEqual(self.notification.get_user(), self.user1)
        self.assertEqual(self.notification.get_related_task(), self.task)
        # Check timestamp is close to now
        self.assertTrue(
            (timezone.now() - self.notification.get_timestamp()).total_seconds() < 60
        )

    def test_notification_setters(self):
        """Test notification setter methods"""
        self.notification.set_content('Updated content')
        self.notification.set_type(NotificationType.TASK_COMPLETED)
        self.notification.set_is_read(True)
        
        # Verify changes
        updated_notification = Notification.objects.get(id=self.notification.id)
        self.assertEqual(updated_notification.content, 'Updated content')
        self.assertEqual(updated_notification.type, NotificationType.TASK_COMPLETED)
        self.assertTrue(updated_notification.is_read)

    def test_mark_as_read(self):
        """Test marking a notification as read"""
        self.assertFalse(self.notification.is_read)
        self.notification.mark_as_read()
        
        # Verify notification is marked as read
        updated_notification = Notification.objects.get(id=self.notification.id)
        self.assertTrue(updated_notification.is_read)

    def test_send_notification_method(self):
        """Test send_notification class method"""
        # Send a notification
        new_notification = Notification.send_notification(
            user=self.user2,
            content='New notification for user2',
            notification_type=NotificationType.VOLUNTEER_APPLIED,
            related_task=self.task
        )
        
        # Verify notification was created
        self.assertIsNotNone(new_notification)
        self.assertEqual(new_notification.content, 'New notification for user2')
        self.assertEqual(new_notification.type, NotificationType.VOLUNTEER_APPLIED)
        self.assertEqual(new_notification.user, self.user2)
        self.assertEqual(new_notification.related_task, self.task)
        self.assertFalse(new_notification.is_read)
    
    def test_volunteer_applied_notification(self):
        """Test volunteer application notification"""
        # Create a volunteer
        volunteer = Volunteer.objects.create(
            user=self.user2,
            task=self.task,
            status='PENDING'
        )
        
        # Send notification
        notification = Notification.send_volunteer_applied_notification(volunteer)
        
        # Verify notification
        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user1)  # Task creator
        self.assertEqual(notification.type, NotificationType.VOLUNTEER_APPLIED)
        self.assertEqual(notification.related_task, self.task)
        self.assertIn(self.user2.username, notification.content)  # Volunteer username in content
    
    def test_task_assigned_notification(self):
        """Test task assigned notification"""
        # Create a volunteer
        volunteer = Volunteer.objects.create(
            user=self.user2,
            task=self.task,
            status='ACCEPTED'
        )
        
        # Update task
        self.task.assignee = self.user2
        self.task.save()
        
        # Send notification
        notification = Notification.send_task_assigned_notification(self.task, volunteer)
        
        # Verify notification
        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user2)  # Assignee
        self.assertEqual(notification.type, NotificationType.TASK_ASSIGNED)
        self.assertEqual(notification.related_task, self.task)
        self.assertIn(self.task.title, notification.content)  # Task title in content
    
    def test_task_completed_notification(self):
        """Test task completed notification"""
        # Set up completed task with assignee
        self.task.assignee = self.user2
        self.task.status = 'COMPLETED'
        self.task.save()
        
        # Send notifications
        Notification.send_task_completed_notification(self.task)
        
        # Verify creator notification
        creator_notification = Notification.objects.filter(
            user=self.user1,
            type=NotificationType.TASK_COMPLETED,
            related_task=self.task
        ).first()
        
        self.assertIsNotNone(creator_notification)
        self.assertIn("completed", creator_notification.content.lower())
        
        # Verify assignee notification
        assignee_notification = Notification.objects.filter(
            user=self.user2,
            type=NotificationType.TASK_COMPLETED,
            related_task=self.task
        ).first()
        
        self.assertIsNotNone(assignee_notification)
        self.assertIn("completed", assignee_notification.content.lower())
    
    def test_task_completed_notification_without_assignee(self):
        """Task completion should still notify creator when no assignee exists"""
        self.task.assignee = None
        self.task.status = 'COMPLETED'
        self.task.save()

        Notification.send_task_completed_notification(self.task)

        creator_notification = Notification.objects.filter(
            user=self.user1,
            type=NotificationType.TASK_COMPLETED,
            related_task=self.task
        ).first()
        self.assertIsNotNone(creator_notification)
        self.assertNotIn('None', creator_notification.content)

    def test_mark_as_read_idempotent(self):
        """Marking a notification as read twice should remain read"""
        self.notification.mark_as_read()
        self.notification.mark_as_read()
        refreshed = Notification.objects.get(id=self.notification.id)
        self.assertTrue(refreshed.is_read)
    
    def test_badge_earned_notification(self):
        """Test badge earned notification"""
        from core.models import Badge, BadgeType
        
        # Create a badge
        badge = Badge.objects.create(
            badge_type=BadgeType.THE_ICEBREAKER,
            name='Icebreaker',
            description='Posted your first comment'
        )
        
        # Send badge notification
        notification = Notification.send_badge_earned_notification(self.user1, badge)
        
        # Verify notification
        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user1)
        self.assertEqual(notification.type, NotificationType.BADGE_EARNED)
        self.assertIsNone(notification.related_task)  # Badge notifications don't have related tasks
        self.assertIn(badge.name, notification.content)
        self.assertIn(badge.description, notification.content)
        self.assertIn('Congratulations', notification.content)
    
    def test_comment_added_notification_to_creator(self):
        """Test comment notification sent to task creator"""
        # user2 comments on user1's task
        comment = Comment.objects.create(
            user=self.user2,
            task=self.task,
            content='This is a test comment on your task!'
        )
        
        # Send notification
        Notification.send_comment_added_notification(comment)
        
        # Verify creator received notification
        creator_notification = Notification.objects.filter(
            user=self.user1,
            type=NotificationType.COMMENT_ADDED,
            related_task=self.task
        ).first()
        
        self.assertIsNotNone(creator_notification)
        self.assertIn(self.user2.username, creator_notification.content)
        self.assertIn(self.task.title, creator_notification.content)
        self.assertIn('commented', creator_notification.content.lower())
    
    def test_comment_added_notification_to_assignee(self):
        """Test comment notification sent to task assignee"""
        # Create a third user as assignee
        user3 = RegisteredUser.objects.create_user(
            email='user3@example.com',
            name='User',
            surname='Three',
            username='userthree',
            phone_number='1111111111',
            password='password789'
        )
        
        # Assign task to user3
        self.task.assignee = user3
        self.task.save()
        
        # user2 comments on the task
        comment = Comment.objects.create(
            user=self.user2,
            task=self.task,
            content='Comment for both creator and assignee'
        )
        
        # Send notification
        Notification.send_comment_added_notification(comment)
        
        # Verify both creator and assignee received notifications
        creator_notification = Notification.objects.filter(
            user=self.user1,  # creator
            type=NotificationType.COMMENT_ADDED,
            related_task=self.task
        ).first()
        
        assignee_notification = Notification.objects.filter(
            user=user3,  # assignee
            type=NotificationType.COMMENT_ADDED,
            related_task=self.task
        ).first()
        
        self.assertIsNotNone(creator_notification)
        self.assertIsNotNone(assignee_notification)
        self.assertIn(self.user2.username, creator_notification.content)
        self.assertIn(self.user2.username, assignee_notification.content)
    
    def test_comment_added_no_self_notification(self):
        """Test that user doesn't receive notification for their own comment"""
        # user1 (creator) comments on their own task
        comment = Comment.objects.create(
            user=self.user1,
            task=self.task,
            content='I am commenting on my own task'
        )
        
        # Send notification
        Notification.send_comment_added_notification(comment)
        
        # Verify no notification was sent to user1
        notifications = Notification.objects.filter(
            user=self.user1,
            type=NotificationType.COMMENT_ADDED,
            related_task=self.task
        )
        
        self.assertEqual(notifications.count(), 0)
    
    def test_comment_added_notification_truncates_long_content(self):
        """Test that long comment content is truncated in notification"""
        # Create a long comment
        long_content = 'A' * 100  # 100 characters
        comment = Comment.objects.create(
            user=self.user2,
            task=self.task,
            content=long_content
        )
        
        # Send notification
        Notification.send_comment_added_notification(comment)
        
        # Verify notification content is truncated
        creator_notification = Notification.objects.filter(
            user=self.user1,
            type=NotificationType.COMMENT_ADDED,
            related_task=self.task
        ).first()
        
        self.assertIsNotNone(creator_notification)
        self.assertIn('...', creator_notification.content)
        # The actual comment preview should be 50 characters
        self.assertTrue(long_content[:50] in creator_notification.content)
    
    def test_admin_warning_notification(self):
        """Test admin warning notification"""
        # Create an admin user
        admin = RegisteredUser.objects.create_user(
            email='admin@example.com',
            name='Admin',
            surname='User',
            username='adminuser',
            phone_number='9999999999',
            password='admin123',
            is_staff=True
        )
        
        # Send warning to user1
        warning_message = "Please follow community guidelines."
        notification = Notification.send_admin_warning(
            user=self.user1,
            message=warning_message,
            admin_user=admin
        )
        
        # Verify notification
        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user1)
        self.assertEqual(notification.type, NotificationType.ADMIN_WARNING)
        self.assertIsNone(notification.related_task)
        self.assertIn(admin.username, notification.content)
        self.assertIn(warning_message, notification.content)
        self.assertIn('⚠️', notification.content)
        self.assertIn('Warning', notification.content)
    
    def test_admin_warning_notification_without_admin_user(self):
        """Test admin warning notification when admin user is not provided"""
        warning_message = "This is a system warning."
        notification = Notification.send_admin_warning(
            user=self.user1,
            message=warning_message,
            admin_user=None
        )
        
        # Verify notification
        self.assertIsNotNone(notification)
        self.assertEqual(notification.user, self.user1)
        self.assertEqual(notification.type, NotificationType.ADMIN_WARNING)
        self.assertIn('Administrator', notification.content)
        self.assertIn(warning_message, notification.content)


class NotificationTypeEnumTests(TestCase):
    """Test cases for the NotificationType enumeration"""

    def test_notification_type_enum(self):
        """Test NotificationType enumeration"""
        self.assertEqual(NotificationType.TASK_CREATED, 'TASK_CREATED')
        self.assertEqual(NotificationType.VOLUNTEER_APPLIED, 'VOLUNTEER_APPLIED')
        self.assertEqual(NotificationType.TASK_ASSIGNED, 'TASK_ASSIGNED')
        self.assertEqual(NotificationType.TASK_COMPLETED, 'TASK_COMPLETED')
        self.assertEqual(NotificationType.TASK_CANCELLED, 'TASK_CANCELLED')
        self.assertEqual(NotificationType.NEW_REVIEW, 'NEW_REVIEW')
        self.assertEqual(NotificationType.BADGE_EARNED, 'BADGE_EARNED')
        self.assertEqual(NotificationType.COMMENT_ADDED, 'COMMENT_ADDED')
        self.assertEqual(NotificationType.ADMIN_WARNING, 'ADMIN_WARNING')
        self.assertEqual(NotificationType.SYSTEM_NOTIFICATION, 'SYSTEM_NOTIFICATION')
        
        # Test choices format
        choices = NotificationType.choices
        self.assertTrue(('TASK_CREATED', 'Task Created') in choices)
        self.assertTrue(('NEW_REVIEW', 'New Review') in choices)
        self.assertTrue(('BADGE_EARNED', 'Badge Earned') in choices)
        self.assertTrue(('COMMENT_ADDED', 'Comment Added') in choices)
        self.assertTrue(('ADMIN_WARNING', 'Admin Warning') in choices)
