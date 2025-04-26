from django.db import models
from django.utils import timezone


class VolunteerStatus(models.TextChoices):
    """Enumeration for volunteer status"""
    PENDING = 'PENDING', 'Pending'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    REJECTED = 'REJECTED', 'Rejected'
    WITHDRAWN = 'WITHDRAWN', 'Withdrawn'


class Volunteer(models.Model):
    """Model for task volunteers"""
    user = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='volunteered_tasks'
    )
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='volunteers'
    )
    volunteered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=VolunteerStatus.choices,
        default=VolunteerStatus.PENDING
    )
    
    class Meta:
        unique_together = ['user', 'task']
    
    def __str__(self):
        """Return string representation of volunteer"""
        return f"{self.user.username} - {self.task.title} ({self.status})"
    
    # Getters
    def get_user(self):
        """Get the volunteer user"""
        return self.user
    
    def get_task(self):
        """Get the task"""
        return self.task
    
    def get_volunteered_at(self):
        """Get volunteered date"""
        return self.volunteered_at
    
    def get_status(self):
        """Get volunteer status"""
        return self.status
    
    # Setters
    def set_status(self, status):
        """Set volunteer status"""
        self.status = status
        self.save()
    
    # Business logic methods
    @classmethod
    def volunteer_for_task(cls, user, task):
        """Create a volunteer entry for a task"""
        # Check if task is still open for volunteers
        if task.status != 'POSTED':
            return None
        
        # Check if user is already volunteering for this task
        existing = cls.objects.filter(user=user, task=task).first()
        if existing:
            return existing
        
        volunteer = cls(user=user, task=task)
        volunteer.save()
        return volunteer
    
    def withdraw_volunteer(self):
        """Withdraw volunteer application"""
        if self.status == VolunteerStatus.ACCEPTED:
            # If this volunteer was already accepted, update the task status
            task = self.task
            task.set_status('POSTED')
            task.set_assignee(None)
        
        self.status = VolunteerStatus.WITHDRAWN
        self.save()
        return True
    
    def accept_volunteer(self):
        """Accept this volunteer for the task"""
        if self.status != VolunteerStatus.PENDING:
            return False
        
        # Update task status and assignee
        task = self.task
        task.set_status('ASSIGNED')
        task.set_assignee(self.user)
        
        # Update volunteer status
        self.status = VolunteerStatus.ACCEPTED
        self.save()
        
        # Reject all other pending volunteers for this task
        other_volunteers = Volunteer.objects.filter(
            task=task, 
            status=VolunteerStatus.PENDING
        ).exclude(id=self.id)
        
        for volunteer in other_volunteers:
            volunteer.status = VolunteerStatus.REJECTED
            volunteer.save()
        
        return True
    
    def reject_volunteer(self):
        """Reject this volunteer for the task"""
        if self.status != VolunteerStatus.PENDING:
            return False
        
        self.status = VolunteerStatus.REJECTED
        self.save()
        return True