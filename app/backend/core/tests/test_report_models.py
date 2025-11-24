from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
import datetime
from core.models import (
    RegisteredUser, Task, TaskReport, UserReport, 
    ReportType, ReportStatus, Administrator
)


class TaskReportModelTests(TestCase):
    """Test cases for the TaskReport model"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.reporter = RegisteredUser.objects.create_user(
            email='reporter@example.com',
            name='Reporter',
            surname='User',
            username='reporteruser',
            phone_number='1234567890',
            password='password123'
        )
        
        self.creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='0987654321',
            password='password456'
        )
        
        self.admin_user = RegisteredUser.objects.create_user(
            email='admin@example.com',
            name='Admin',
            surname='User',
            username='adminuser',
            phone_number='5555555555',
            password='password789'
        )
        
        self.admin = Administrator.objects.create(user=self.admin_user)
        
        # Create a task
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.creator
        )

    def test_task_report_creation(self):
        """Test task report creation"""
        report = TaskReport.create_report(
            task=self.task,
            reporter=self.reporter,
            report_type=ReportType.SPAM,
            description='This is a spam task'
        )
        
        self.assertIsNotNone(report)
        self.assertEqual(report.task, self.task)
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.report_type, ReportType.SPAM)
        self.assertEqual(report.description, 'This is a spam task')
        self.assertEqual(report.status, ReportStatus.PENDING)
        
        # Check string representation
        expected_str = f"Report on {self.task.title} by {self.reporter.username}"
        self.assertEqual(str(report), expected_str)

    def test_duplicate_task_report(self):
        """Test that duplicate reports update existing one"""
        # Create first report
        report1 = TaskReport.create_report(
            task=self.task,
            reporter=self.reporter,
            report_type=ReportType.SPAM,
            description='First report'
        )
        
        # Create duplicate report
        report2 = TaskReport.create_report(
            task=self.task,
            reporter=self.reporter,
            report_type=ReportType.INAPPROPRIATE_CONTENT,
            description='Updated report'
        )
        
        # Should be the same report, updated
        self.assertEqual(report1.id, report2.id)
        self.assertEqual(report2.report_type, ReportType.INAPPROPRIATE_CONTENT)
        self.assertEqual(report2.description, 'Updated report')
        
        # Verify only one report exists
        count = TaskReport.objects.filter(task=self.task, reporter=self.reporter).count()
        self.assertEqual(count, 1)

    def test_update_report_status(self):
        """Test updating report status"""
        report = TaskReport.create_report(
            task=self.task,
            reporter=self.reporter,
            report_type=ReportType.FRAUD,
            description='Fraudulent task'
        )
        
        # Update status
        result = report.update_status(
            status=ReportStatus.UNDER_REVIEW,
            admin=self.admin,
            notes='Investigating the claim'
        )
        
        self.assertTrue(result)
        
        # Verify changes
        updated_report = TaskReport.objects.get(id=report.id)
        self.assertEqual(updated_report.status, ReportStatus.UNDER_REVIEW)
        self.assertEqual(updated_report.reviewed_by, self.admin)
        self.assertEqual(updated_report.admin_notes, 'Investigating the claim')

    def test_multiple_users_can_report_same_task(self):
        """Test that multiple users can report the same task"""
        reporter2 = RegisteredUser.objects.create_user(
            email='reporter2@example.com',
            name='Second',
            surname='Reporter',
            username='reporter2',
            phone_number='1111111111',
            password='password111'
        )
        
        # First reporter
        report1 = TaskReport.create_report(
            task=self.task,
            reporter=self.reporter,
            report_type=ReportType.SPAM,
            description='Report 1'
        )
        
        # Second reporter
        report2 = TaskReport.create_report(
            task=self.task,
            reporter=reporter2,
            report_type=ReportType.INAPPROPRIATE_CONTENT,
            description='Report 2'
        )
        
        # Verify both reports exist
        self.assertNotEqual(report1.id, report2.id)
        self.assertEqual(TaskReport.objects.filter(task=self.task).count(), 2)

    def test_report_type_choices(self):
        """Test all report type choices"""
        report_types = [
            ReportType.SPAM,
            ReportType.INAPPROPRIATE_CONTENT,
            ReportType.HARASSMENT,
            ReportType.FRAUD,
            ReportType.FAKE_REQUEST,
            ReportType.NO_SHOW,
            ReportType.SAFETY_CONCERN,
            ReportType.OTHER
        ]
        
        for report_type in report_types:
            report = TaskReport.create_report(
                task=self.task,
                reporter=self.reporter,
                report_type=report_type,
                description=f'Testing {report_type}'
            )
            self.assertEqual(report.report_type, report_type)
            report.delete()  # Clean up for next iteration

    def test_report_status_choices(self):
        """Test all report status choices"""
        report = TaskReport.create_report(
            task=self.task,
            reporter=self.reporter,
            report_type=ReportType.OTHER,
            description='Test'
        )
        
        statuses = [
            ReportStatus.PENDING,
            ReportStatus.UNDER_REVIEW,
            ReportStatus.RESOLVED,
            ReportStatus.DISMISSED
        ]
        
        for status_choice in statuses:
            report.update_status(status_choice, self.admin, f'Status: {status_choice}')
            self.assertEqual(report.status, status_choice)


class UserReportModelTests(TestCase):
    """Test cases for the UserReport model"""

    def setUp(self):
        """Set up test data"""
        # Create users
        self.reporter = RegisteredUser.objects.create_user(
            email='reporter@example.com',
            name='Reporter',
            surname='User',
            username='reporteruser',
            phone_number='1234567890',
            password='password123'
        )
        
        self.reported_user = RegisteredUser.objects.create_user(
            email='reported@example.com',
            name='Reported',
            surname='User',
            username='reporteduser',
            phone_number='0987654321',
            password='password456'
        )
        
        self.admin_user = RegisteredUser.objects.create_user(
            email='admin@example.com',
            name='Admin',
            surname='User',
            username='adminuser',
            phone_number='5555555555',
            password='password789'
        )
        
        self.admin = Administrator.objects.create(user=self.admin_user)
        
        # Create a task for related_task field
        self.task = Task.objects.create(
            title='Related Task',
            description='Task Description',
            category='HOME_REPAIR',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.reported_user
        )

    def test_user_report_creation(self):
        """Test user report creation"""
        report = UserReport.create_report(
            reported_user=self.reported_user,
            reporter=self.reporter,
            report_type=ReportType.HARASSMENT,
            description='User was harassing me',
            related_task=self.task
        )
        
        self.assertIsNotNone(report)
        self.assertEqual(report.reported_user, self.reported_user)
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.report_type, ReportType.HARASSMENT)
        self.assertEqual(report.description, 'User was harassing me')
        self.assertEqual(report.related_task, self.task)
        self.assertEqual(report.status, ReportStatus.PENDING)
        
        # Check string representation
        expected_str = f"Report on {self.reported_user.username} by {self.reporter.username}"
        self.assertEqual(str(report), expected_str)

    def test_user_report_without_related_task(self):
        """Test user report creation without related task"""
        report = UserReport.create_report(
            reported_user=self.reported_user,
            reporter=self.reporter,
            report_type=ReportType.SPAM,
            description='User is spamming'
        )
        
        self.assertIsNotNone(report)
        self.assertIsNone(report.related_task)

    def test_self_report_prevention(self):
        """Test that users cannot report themselves"""
        with self.assertRaises(ValueError) as context:
            UserReport.create_report(
                reported_user=self.reporter,
                reporter=self.reporter,
                report_type=ReportType.OTHER,
                description='Trying to report myself'
            )
        
        self.assertIn("cannot report themselves", str(context.exception))

    def test_duplicate_user_report(self):
        """Test that duplicate reports update existing one"""
        # Create first report
        report1 = UserReport.create_report(
            reported_user=self.reported_user,
            reporter=self.reporter,
            report_type=ReportType.NO_SHOW,
            description='First report'
        )
        
        # Create duplicate report
        report2 = UserReport.create_report(
            reported_user=self.reported_user,
            reporter=self.reporter,
            report_type=ReportType.SAFETY_CONCERN,
            description='Updated report',
            related_task=self.task
        )
        
        # Should be the same report, updated
        self.assertEqual(report1.id, report2.id)
        self.assertEqual(report2.report_type, ReportType.SAFETY_CONCERN)
        self.assertEqual(report2.description, 'Updated report')
        self.assertEqual(report2.related_task, self.task)
        
        # Verify only one report exists
        count = UserReport.objects.filter(
            reported_user=self.reported_user, 
            reporter=self.reporter
        ).count()
        self.assertEqual(count, 1)

    def test_update_user_report_status(self):
        """Test updating user report status"""
        report = UserReport.create_report(
            reported_user=self.reported_user,
            reporter=self.reporter,
            report_type=ReportType.FRAUD,
            description='Fraudulent behavior'
        )
        
        # Update status
        result = report.update_status(
            status=ReportStatus.RESOLVED,
            admin=self.admin,
            notes='User has been warned'
        )
        
        self.assertTrue(result)
        
        # Verify changes
        updated_report = UserReport.objects.get(id=report.id)
        self.assertEqual(updated_report.status, ReportStatus.RESOLVED)
        self.assertEqual(updated_report.reviewed_by, self.admin)
        self.assertEqual(updated_report.admin_notes, 'User has been warned')

    def test_multiple_users_can_report_same_user(self):
        """Test that multiple users can report the same user"""
        reporter2 = RegisteredUser.objects.create_user(
            email='reporter2@example.com',
            name='Second',
            surname='Reporter',
            username='reporter2',
            phone_number='1111111111',
            password='password111'
        )
        
        # First reporter
        report1 = UserReport.create_report(
            reported_user=self.reported_user,
            reporter=self.reporter,
            report_type=ReportType.HARASSMENT,
            description='Report 1'
        )
        
        # Second reporter
        report2 = UserReport.create_report(
            reported_user=self.reported_user,
            reporter=reporter2,
            report_type=ReportType.INAPPROPRIATE_CONTENT,
            description='Report 2'
        )
        
        # Verify both reports exist
        self.assertNotEqual(report1.id, report2.id)
        self.assertEqual(
            UserReport.objects.filter(reported_user=self.reported_user).count(), 
            2
        )


class ReportEnumTests(TestCase):
    """Test cases for Report enumerations"""

    def test_report_type_enum(self):
        """Test ReportType enumeration"""
        self.assertEqual(ReportType.SPAM, 'SPAM')
        self.assertEqual(ReportType.INAPPROPRIATE_CONTENT, 'INAPPROPRIATE_CONTENT')
        self.assertEqual(ReportType.HARASSMENT, 'HARASSMENT')
        self.assertEqual(ReportType.FRAUD, 'FRAUD')
        self.assertEqual(ReportType.FAKE_REQUEST, 'FAKE_REQUEST')
        self.assertEqual(ReportType.NO_SHOW, 'NO_SHOW')
        self.assertEqual(ReportType.SAFETY_CONCERN, 'SAFETY_CONCERN')
        self.assertEqual(ReportType.OTHER, 'OTHER')
        
        # Test choices format
        choices = ReportType.choices
        self.assertTrue(('SPAM', 'Spam') in choices)
        self.assertTrue(('HARASSMENT', 'Harassment') in choices)

    def test_report_status_enum(self):
        """Test ReportStatus enumeration"""
        self.assertEqual(ReportStatus.PENDING, 'PENDING')
        self.assertEqual(ReportStatus.UNDER_REVIEW, 'UNDER_REVIEW')
        self.assertEqual(ReportStatus.RESOLVED, 'RESOLVED')
        self.assertEqual(ReportStatus.DISMISSED, 'DISMISSED')
        
        # Test choices format
        choices = ReportStatus.choices
        self.assertTrue(('PENDING', 'Pending') in choices)
        self.assertTrue(('RESOLVED', 'Resolved') in choices)