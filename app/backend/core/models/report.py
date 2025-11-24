from django.db import models
from django.utils import timezone


class ReportType(models.TextChoices):
    """Enumeration for report types"""
    SPAM = 'SPAM', 'Spam'
    INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT', 'Inappropriate Content'
    HARASSMENT = 'HARASSMENT', 'Harassment'
    FRAUD = 'FRAUD', 'Fraud'
    FAKE_REQUEST = 'FAKE_REQUEST', 'Fake Request'
    NO_SHOW = 'NO_SHOW', 'No Show'
    SAFETY_CONCERN = 'SAFETY_CONCERN', 'Safety Concern'
    OTHER = 'OTHER', 'Other'


class ReportStatus(models.TextChoices):
    """Enumeration for report status"""
    PENDING = 'PENDING', 'Pending'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    RESOLVED = 'RESOLVED', 'Resolved'
    DISMISSED = 'DISMISSED', 'Dismissed'


class TaskReport(models.Model):
    """Model for reporting tasks/requests"""
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='reports'
    )
    reporter = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='task_reports_made'
    )
    report_type = models.CharField(
        max_length=50,
        choices=ReportType.choices,
        default=ReportType.OTHER
    )
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=ReportStatus.choices,
        default=ReportStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(
        'Administrator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_reports_reviewed'
    )
    admin_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        # Prevent duplicate reports from same user for same task
        unique_together = ['task', 'reporter']
    
    def __str__(self):
        return f"Report on {self.task.title} by {self.reporter.username}"
    
    @classmethod
    def create_report(cls, task, reporter, report_type, description):
        """Create a new task report"""
        # Check if reporter already reported this task
        existing = cls.objects.filter(task=task, reporter=reporter).first()
        if existing:
            # Update existing report
            existing.report_type = report_type
            existing.description = description
            existing.status = ReportStatus.PENDING
            existing.save()
            return existing
        
        # Create new report
        report = cls.objects.create(
            task=task,
            reporter=reporter,
            report_type=report_type,
            description=description
        )
        
        # Send notification to admins
        from .notification import Notification, NotificationType
        from .user import Administrator
        
        admins = Administrator.objects.all()
        for admin in admins:
            Notification.send_notification(
                user=admin.user,
                content=f"New task report: {task.title} reported for {dict(ReportType.choices)[report_type]}",
                notification_type=NotificationType.SYSTEM_NOTIFICATION,
                related_task=task
            )
        
        return report
    
    def update_status(self, status, admin, notes=''):
        """Update report status"""
        self.status = status
        self.reviewed_by = admin
        self.admin_notes = notes
        self.save()
        return True


class UserReport(models.Model):
    """Model for reporting users"""
    reported_user = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='reports_received'
    )
    reporter = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='user_reports_made'
    )
    report_type = models.CharField(
        max_length=50,
        choices=ReportType.choices,
        default=ReportType.OTHER
    )
    description = models.TextField()
    related_task = models.ForeignKey(
        'Task',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_reports'
    )
    status = models.CharField(
        max_length=20,
        choices=ReportStatus.choices,
        default=ReportStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(
        'Administrator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_reports_reviewed'
    )
    admin_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        # Prevent duplicate reports from same user for same reported user
        unique_together = ['reported_user', 'reporter']
    
    def __str__(self):
        return f"Report on {self.reported_user.username} by {self.reporter.username}"
    
    @classmethod
    def create_report(cls, reported_user, reporter, report_type, description, related_task=None):
        """Create a new user report"""
        # Prevent self-reporting
        if reported_user == reporter:
            raise ValueError("Users cannot report themselves")
        
        # Check if reporter already reported this user
        existing = cls.objects.filter(reported_user=reported_user, reporter=reporter).first()
        if existing:
            # Update existing report
            existing.report_type = report_type
            existing.description = description
            existing.related_task = related_task
            existing.status = ReportStatus.PENDING
            existing.save()
            return existing
        
        # Create new report
        report = cls.objects.create(
            reported_user=reported_user,
            reporter=reporter,
            report_type=report_type,
            description=description,
            related_task=related_task
        )
        
        # Send notification to admins
        from .notification import Notification, NotificationType
        from .user import Administrator
        
        admins = Administrator.objects.all()
        for admin in admins:
            Notification.send_notification(
                user=admin.user,
                content=f"New user report: {reported_user.username} reported for {dict(ReportType.choices)[report_type]}",
                notification_type=NotificationType.SYSTEM_NOTIFICATION
            )
        
        return report
    
    def update_status(self, status, admin, notes=''):
        """Update report status"""
        self.status = status
        self.reviewed_by = admin
        self.admin_notes = notes
        self.save()
        return True