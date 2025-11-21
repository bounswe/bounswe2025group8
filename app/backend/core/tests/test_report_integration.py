from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import (
    RegisteredUser, Administrator, Task, TaskReport, 
    UserReport, ReportType, ReportStatus, Notification, NotificationType
)


class ReportWorkflowIntegrationTests(TestCase):
    """Integration tests for complete report workflows"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.reporter = RegisteredUser.objects.create_user(
            email='reporter@example.com',
            name='Reporter',
            surname='User',
            username='reporter',
            phone_number='1234567890',
            password='password123'
        )
        
        self.task_creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creator',
            phone_number='0987654321',
            password='password456'
        )
        
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

    def test_complete_task_report_workflow(self):
        """Test complete workflow of task reporting"""
        # 1. Create a task
        task = Task.objects.create(
            title='Suspicious Task',
            description='This might be spam',
            category='OTHER',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.task_creator
        )
        
        # 2. User reports the task
        report = TaskReport.create_report(
            task=task,
            reporter=self.reporter,
            report_type=ReportType.SPAM,
            description='This task looks like spam to me'
        )
        
        self.assertEqual(report.status, ReportStatus.PENDING)
        self.assertIsNone(report.reviewed_by)
        
        # 3. Admin reviews the report
        report.update_status(
            status=ReportStatus.UNDER_REVIEW,
            admin=self.admin,
            notes='Investigating the reported task'
        )
        
        report.refresh_from_db()
        self.assertEqual(report.status, ReportStatus.UNDER_REVIEW)
        self.assertEqual(report.reviewed_by, self.admin)
        
        # 4. Admin resolves the report and takes action
        report.update_status(
            status=ReportStatus.RESOLVED,
            admin=self.admin,
            notes='Task was spam and has been removed'
        )
        
        # Delete the task (admin action)
        task.delete()
        
        # Verify report status
        report.refresh_from_db()
        self.assertEqual(report.status, ReportStatus.RESOLVED)

    def test_complete_user_report_workflow(self):
        """Test complete workflow of user reporting"""
        # 1. Create a task where users interacted
        task = Task.objects.create(
            title='Task with Interaction',
            description='Users interacted here',
            category='GROCERY_SHOPPING',
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=self.task_creator,
            status='COMPLETED'
        )
        
        # 2. Reporter reports task creator for inappropriate behavior
        report = UserReport.create_report(
            reported_user=self.task_creator,
            reporter=self.reporter,
            report_type=ReportType.HARASSMENT,
            description='User was rude and harassing during task completion',
            related_task=task
        )
        
        self.assertEqual(report.status, ReportStatus.PENDING)
        self.assertIsNone(report.reviewed_by)
        self.assertEqual(report.related_task, task)
        
        # 3. Admin reviews the report
        report.update_status(
            status=ReportStatus.UNDER_REVIEW,
            admin=self.admin,
            notes='Reviewing the harassment claim'
        )
        
        report.refresh_from_db()
        self.assertEqual(report.status, ReportStatus.UNDER_REVIEW)
        self.assertEqual(report.reviewed_by, self.admin)
        
        # 4. Admin decides to ban the user
        self.assertTrue(self.task_creator.is_active)
        
        # Ban the user
        self.admin.ban_user(self.task_creator)
        
        self.task_creator.refresh_from_db()
        self.assertFalse(self.task_creator.is_active)
        
        # 5. Admin resolves the report
        report.update_status(
            status=ReportStatus.RESOLVED,
            admin=self.admin,
            notes='User has been banned for harassment'
        )
        
        report.refresh_from_db()
        self.assertEqual(report.status, ReportStatus.RESOLVED)

    def test_multiple_reports_on_same_user(self):
        """Test handling multiple reports on the same user"""
        reporter2 = RegisteredUser.objects.create_user(
            email='reporter2@example.com',
            name='Reporter2',
            surname='User',
            username='reporter2',
            phone_number='1111111111',
            password='password111'
        )
        
        reporter3 = RegisteredUser.objects.create_user(
            email='reporter3@example.com',
            name='Reporter3',
            surname='User',
            username='reporter3',
            phone_number='2222222222',
            password='password222'
        )
        
        # Create multiple reports on the same user
        report1 = UserReport.create_report(
            reported_user=self.task_creator,
            reporter=self.reporter,
            report_type=ReportType.HARASSMENT,
            description='Report 1'
        )
        
        report2 = UserReport.create_report(
            reported_user=self.task_creator,
            reporter=reporter2,
            report_type=ReportType.INAPPROPRIATE_CONTENT,
            description='Report 2'
        )
        
        report3 = UserReport.create_report(
            reported_user=self.task_creator,
            reporter=reporter3,
            report_type=ReportType.FRAUD,
            description='Report 3'
        )
        
        # Verify all reports exist
        total_reports = UserReport.objects.filter(reported_user=self.task_creator).count()
        self.assertEqual(total_reports, 3)
        
        # Admin reviews all reports
        for report in [report1, report2, report3]:
            report.update_status(
                status=ReportStatus.UNDER_REVIEW,
                admin=self.admin,
                notes='Reviewing multiple reports'
            )
        
        # Admin decides to ban after multiple reports
        self.admin.ban_user(self.task_creator)
        
        # Resolve all reports
        for report in [report1, report2, report3]:
            report.update_status(
                status=ReportStatus.RESOLVED,
                admin=self.admin,
                notes='User banned due to multiple reports'
            )
        
        # Verify all resolved
        resolved_count = UserReport.objects.filter(
            reported_user=self.task_creator,
            status=ReportStatus.RESOLVED
        ).count()
        self.assertEqual(resolved_count, 3)

    def test_dismissed_report_workflow(self):
        """Test workflow where report is dismissed"""
        task = Task.objects.create(
            title='Legitimate Task',
            description='This is a legitimate task',
            category='TUTORING',
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.task_creator
        )
        
        # User reports task (falsely)
        report = TaskReport.create_report(
            task=task,
            reporter=self.reporter,
            report_type=ReportType.FAKE_REQUEST,
            description='I think this is fake'
        )
        
        # Admin reviews and finds report is invalid
        report.update_status(
            status=ReportStatus.UNDER_REVIEW,
            admin=self.admin,
            notes='Investigating claim'
        )
        
        # Admin dismisses the report
        report.update_status(
            status=ReportStatus.DISMISSED,
            admin=self.admin,
            notes='Report was unfounded, task is legitimate'
        )
        
        report.refresh_from_db()
        self.assertEqual(report.status, ReportStatus.DISMISSED)
        
        # Task should still exist and be active
        task.refresh_from_db()
        self.assertEqual(task.status, 'POSTED')

    def test_report_prevents_duplicate_from_same_user(self):
        """Test that duplicate reports update existing ones"""
        task = Task.objects.create(
            title='Task',
            description='Description',
            category='HOME_REPAIR',
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.task_creator
        )
        
        # Create first report
        report1 = TaskReport.create_report(
            task=task,
            reporter=self.reporter,
            report_type=ReportType.SPAM,
            description='First report'
        )
        
        initial_id = report1.id
        
        # Try to create duplicate - should update existing
        report2 = TaskReport.create_report(
            task=task,
            reporter=self.reporter,
            report_type=ReportType.INAPPROPRIATE_CONTENT,
            description='Updated report with more details'
        )
        
        # Should be same report
        self.assertEqual(report2.id, initial_id)
        self.assertEqual(report2.report_type, ReportType.INAPPROPRIATE_CONTENT)
        self.assertEqual(report2.description, 'Updated report with more details')
        
        # Status should reset to PENDING
        self.assertEqual(report2.status, ReportStatus.PENDING)