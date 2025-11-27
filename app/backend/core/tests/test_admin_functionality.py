from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import (
    RegisteredUser, Administrator, Task, TaskReport, 
    UserReport, ReportType, ReportStatus
)


class AdminFunctionalityTests(TestCase):
    """Test cases for admin-specific functionality"""

    def setUp(self):
        """Set up test data"""
        # Create admin user
        self.admin_user = RegisteredUser.objects.create_user(
            email='admin@example.com',
            name='Admin',
            surname='User',
            username='admin',
            phone_number='5555555555',
            password='password789',
            is_staff=True
        )
        self.admin = Administrator.objects.create(user=self.admin_user)
        
        # Create regular users
        self.user1 = RegisteredUser.objects.create_user(
            email='user1@example.com',
            name='User1',
            surname='Test',
            username='user1',
            phone_number='1111111111',
            password='password123'
        )
        
        self.user2 = RegisteredUser.objects.create_user(
            email='user2@example.com',
            name='User2',
            surname='Test',
            username='user2',
            phone_number='2222222222',
            password='password456'
        )
        
        # Create tasks
        self.task1 = Task.objects.create(
            title='Task 1',
            description='Description 1',
            category='GROCERY_SHOPPING',
            location='Location 1',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.user1
        )
        
        self.task2 = Task.objects.create(
            title='Task 2',
            description='Description 2',
            category='TUTORING',
            location='Location 2',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.user2
        )

    def test_admin_can_view_all_reports(self):
        """Test that admin can view all reports from all users"""
        # Create reports from different users
        report1 = TaskReport.create_report(
            task=self.task1,
            reporter=self.user2,
            report_type=ReportType.SPAM,
            description='Report 1'
        )
        
        report2 = UserReport.create_report(
            reported_user=self.user1,
            reporter=self.user2,
            report_type=ReportType.HARASSMENT,
            description='Report 2'
        )
        
        # Admin should be able to access all reports
        all_task_reports = TaskReport.objects.all()
        all_user_reports = UserReport.objects.all()
        
        self.assertEqual(all_task_reports.count(), 1)
        self.assertEqual(all_user_reports.count(), 1)
        self.assertIn(report1, all_task_reports)
        self.assertIn(report2, all_user_reports)

    def test_admin_can_update_report_status(self):
        """Test admin can update report status"""
        report = TaskReport.create_report(
            task=self.task1,
            reporter=self.user2,
            report_type=ReportType.FRAUD,
            description='Fraudulent task'
        )
        
        # Admin updates status
        result = report.update_status(
            status=ReportStatus.RESOLVED,
            admin=self.admin,
            notes='Issue resolved'
        )
        
        self.assertTrue(result)
        report.refresh_from_db()
        self.assertEqual(report.status, ReportStatus.RESOLVED)
        self.assertEqual(report.reviewed_by, self.admin)
        self.assertEqual(report.admin_notes, 'Issue resolved')

    def test_admin_can_ban_user(self):
        """Test admin can ban users"""
        # User should be active initially
        self.assertTrue(self.user1.is_active)
        
        # Admin bans user
        result = self.admin.ban_user(self.user1)
        
        self.assertTrue(result)
        
        # Verify user is banned
        self.user1.refresh_from_db()
        self.assertFalse(self.user1.is_active)

    def test_admin_can_delete_tasks(self):
        """Test admin can delete tasks"""
        task_id = self.task1.id
        
        # Verify task exists
        self.assertTrue(Task.objects.filter(id=task_id).exists())
        
        # Admin deletes task
        self.task1.delete()
        
        # Verify task is deleted
        self.assertFalse(Task.objects.filter(id=task_id).exists())

    def test_admin_sees_reported_users_with_count(self):
        """Test admin can see users with report counts"""
        # Create multiple reports on user1
        UserReport.create_report(
            reported_user=self.user1,
            reporter=self.user2,
            report_type=ReportType.HARASSMENT,
            description='Report 1'
        )
        
        user3 = RegisteredUser.objects.create_user(
            email='user3@example.com',
            name='User3',
            surname='Test',
            username='user3',
            phone_number='3333333333',
            password='password789'
        )
        
        UserReport.create_report(
            reported_user=self.user1,
            reporter=user3,
            report_type=ReportType.FRAUD,
            description='Report 2'
        )
        
        # Get report count for user1
        report_count = UserReport.objects.filter(reported_user=self.user1).count()
        
        self.assertEqual(report_count, 2)

    def test_admin_can_filter_reports_by_status(self):
        """Test admin can filter reports by status"""
        # Create reports with different statuses
        report1 = TaskReport.create_report(
            task=self.task1,
            reporter=self.user2,
            report_type=ReportType.SPAM,
            description='Pending report'
        )
        
        report2 = TaskReport.create_report(
            task=self.task2,
            reporter=self.user1,
            report_type=ReportType.FRAUD,
            description='Under review report'
        )
        
        report2.update_status(ReportStatus.UNDER_REVIEW, self.admin, 'Reviewing')
        
        # Filter by PENDING
        pending = TaskReport.objects.filter(status=ReportStatus.PENDING)
        self.assertEqual(pending.count(), 1)
        self.assertIn(report1, pending)
        
        # Filter by UNDER_REVIEW
        under_review = TaskReport.objects.filter(status=ReportStatus.UNDER_REVIEW)
        self.assertEqual(under_review.count(), 1)
        self.assertIn(report2, under_review)

    def test_admin_can_add_notes_to_reports(self):
        """Test admin can add notes to reports"""
        report = UserReport.create_report(
            reported_user=self.user1,
            reporter=self.user2,
            report_type=ReportType.NO_SHOW,
            description='User did not show up'
        )
        
        # Admin adds notes
        notes = 'Contacted both parties. User1 had a valid emergency reason.'
        report.update_status(
            status=ReportStatus.DISMISSED,
            admin=self.admin,
            notes=notes
        )
        
        report.refresh_from_db()
        self.assertEqual(report.admin_notes, notes)

    def test_admin_actions_are_tracked(self):
        """Test that admin actions are properly tracked"""
        report = TaskReport.create_report(
            task=self.task1,
            reporter=self.user2,
            report_type=ReportType.INAPPROPRIATE_CONTENT,
            description='Inappropriate content'
        )
        
        # Initially no admin assigned
        self.assertIsNone(report.reviewed_by)
        
        # Admin takes action
        report.update_status(
            status=ReportStatus.RESOLVED,
            admin=self.admin,
            notes='Content removed'
        )
        
        report.refresh_from_db()
        
        # Admin should be tracked
        self.assertEqual(report.reviewed_by, self.admin)
        self.assertIsNotNone(report.updated_at)

    def test_multiple_admins_can_handle_reports(self):
        """Test that multiple admins can work on different reports"""
        # Create second admin
        admin2_user = RegisteredUser.objects.create_user(
            email='admin2@example.com',
            name='Admin2',
            surname='User',
            username='admin2',
            phone_number='6666666666',
            password='password999',
            is_staff=True
        )
        admin2 = Administrator.objects.create(user=admin2_user)
        
        # Create two reports
        report1 = TaskReport.create_report(
            task=self.task1,
            reporter=self.user2,
            report_type=ReportType.SPAM,
            description='Report 1'
        )
        
        report2 = TaskReport.create_report(
            task=self.task2,
            reporter=self.user1,
            report_type=ReportType.FRAUD,
            description='Report 2'
        )
        
        # First admin handles first report
        report1.update_status(ReportStatus.RESOLVED, self.admin, 'Handled by admin1')
        
        # Second admin handles second report
        report2.update_status(ReportStatus.RESOLVED, admin2, 'Handled by admin2')
        
        # Verify different admins
        report1.refresh_from_db()
        report2.refresh_from_db()
        
        self.assertEqual(report1.reviewed_by, self.admin)
        self.assertEqual(report2.reviewed_by, admin2)

    def test_admin_can_see_task_reports_for_specific_task(self):
        """Test admin can view all reports for a specific task"""
        # Create multiple reports for same task
        report1 = TaskReport.create_report(
            task=self.task1,
            reporter=self.user2,
            report_type=ReportType.SPAM,
            description='Report 1'
        )
        
        user3 = RegisteredUser.objects.create_user(
            email='user3@example.com',
            name='User3',
            surname='Test',
            username='user3',
            phone_number='3333333333',
            password='password789'
        )
        
        # Note: This will update the existing report since same reporter can't report twice
        # So let's use different reporter
        report2 = TaskReport.create_report(
            task=self.task1,
            reporter=user3,
            report_type=ReportType.INAPPROPRIATE_CONTENT,
            description='Report 2'
        )
        
        # Admin queries reports for task1
        task1_reports = TaskReport.objects.filter(task=self.task1)
        
        self.assertEqual(task1_reports.count(), 2)
        self.assertIn(report1, task1_reports)
        self.assertIn(report2, task1_reports)