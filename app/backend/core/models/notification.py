from django.db import models


class NotificationType(models.TextChoices):
    """Enumeration for notification types"""
    TASK_CREATED = 'TASK_CREATED', 'Task Created'
    VOLUNTEER_APPLIED = 'VOLUNTEER_APPLIED', 'Volunteer Applied'
    TASK_ASSIGNED = 'TASK_ASSIGNED', 'Task Assigned'
    TASK_COMPLETED = 'TASK_COMPLETED', 'Task Completed'
    TASK_CANCELLED = 'TASK_CANCELLED', 'Task Cancelled'
    NEW_REVIEW = 'NEW_REVIEW', 'New Review'
    SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION', 'System Notification'


class Notification(models.Model):
    """Model for user notifications"""
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM_NOTIFICATION
    )
    is_read = models.BooleanField(default=False)
    
    # Foreign Keys
    user = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    related_task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    def __str__(self):
        """Return string representation of notification"""
        return f"{self.type} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
    # Getters
    def get_content(self):
        """Get notification content"""
        return self.content
    
    def get_timestamp(self):
        """Get notification timestamp"""
        return self.timestamp
    
    def get_type(self):
        """Get notification type"""
        return self.type
    
    def is_notification_read(self):
        """Check if notification is read"""
        return self.is_read
    
    def get_user(self):
        """Get notification recipient"""
        return self.user
    
    def get_related_task(self):
        """Get related task if any"""
        return self.related_task
    
    # Setters
    def set_content(self, content):
        """Set notification content"""
        self.content = content
        self.save()
    
    def set_type(self, notification_type):
        """Set notification type"""
        self.type = notification_type
        self.save()
    
    def set_is_read(self, is_read):
        """Set notification read status"""
        self.is_read = is_read
        self.save()
    
    # Business logic methods
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save()
    
    @classmethod
    def send_notification(cls, user, content, notification_type, related_task=None):
        """Create and send a notification to a user"""
        notification = cls(
            user=user,
            content=content,
            type=notification_type,
            related_task=related_task
        )
        notification.save()
        return notification
    
    @classmethod
    def send_task_created_notification(cls, task):
        """Send notification for task creation to relevant users"""
        # This would typically notify users who might be interested in this task
        # The implementation would depend on business logic
        pass
    
    @classmethod
    def send_volunteer_applied_notification(cls, volunteer):
        """Send notification when someone volunteers for a task"""
        task = volunteer.task
        user = task.creator
        content = f"{volunteer.user.username} has volunteered for your task: {task.title}"
        
        return cls.send_notification(
            user=user,
            content=content,
            notification_type=NotificationType.VOLUNTEER_APPLIED,
            related_task=task
        )
    
    @classmethod
    def send_task_assigned_notification(cls, task, volunteer):
        """Send notification when a task is assigned to a volunteer"""
        content = f"You have been assigned to task: {task.title}"
        
        return cls.send_notification(
            user=volunteer.user,
            content=content,
            notification_type=NotificationType.TASK_ASSIGNED,
            related_task=task
        )
    
    @classmethod
    def send_task_completed_notification(cls, task):
        """Send notification when a task is marked as completed"""
        # Notify task creator
        creator_content = f"Your task '{task.title}' has been marked as completed."
        cls.send_notification(
            user=task.creator,
            content=creator_content,
            notification_type=NotificationType.TASK_COMPLETED,
            related_task=task
        )
        
        # Notify the assignee if exists
        if task.assignee:
            assignee_content = f"Task '{task.title}' has been marked as completed."
            cls.send_notification(
                user=task.assignee,
                content=assignee_content,
                notification_type=NotificationType.TASK_COMPLETED,
                related_task=task
            )