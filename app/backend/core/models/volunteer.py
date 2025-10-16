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
    def accept_multiple_volunteers(cls, task, volunteer_ids):
        """Accept multiple volunteers for a task"""
        if not volunteer_ids:
            return False, "No volunteers provided"
        
        # Ensure task has a valid volunteer_number
        if task.volunteer_number <= 0:
            return False, f"Task volunteer_number is invalid: {task.volunteer_number}"
        
        if len(volunteer_ids) > task.volunteer_number:
            return False, f"Cannot accept {len(volunteer_ids)} volunteers. Task only needs {task.volunteer_number}."
        
        # Get pending volunteers for this task
        volunteers = cls.objects.filter(
            task=task,
            id__in=volunteer_ids,
            status=VolunteerStatus.PENDING
        )
        
        if volunteers.count() != len(volunteer_ids):
            return False, "Some volunteers are not available or not pending"
        
        # Check current capacity
        current_accepted = cls.objects.filter(
            task=task,
            status=VolunteerStatus.ACCEPTED
        ).count()
        
        if current_accepted + len(volunteer_ids) > task.volunteer_number:
            return False, f"Adding {len(volunteer_ids)} volunteers would exceed capacity. Current: {current_accepted}, Requested: {len(volunteer_ids)}, Max: {task.volunteer_number}"
        
        # Accept all volunteers
        accepted_volunteers = []
        for volunteer in volunteers:
            if volunteer.accept_volunteer(skip_capacity_check=True):
                accepted_volunteers.append(volunteer)
        
        return True, f"Successfully accepted {len(accepted_volunteers)} volunteers"

    @classmethod
    def volunteer_for_task(cls, user, task):
        """Create a volunteer entry for a task"""
        # Check if task is still open for volunteers
        if task.status != 'POSTED':
            return None

        # Check if user is already volunteering for this task
        existing = cls.objects.filter(user=user, task=task).first()
        if existing:
            # If they previously withdrew or were rejected, reset to PENDING
            if existing.status in [VolunteerStatus.WITHDRAWN, VolunteerStatus.REJECTED]:
                existing.status = VolunteerStatus.PENDING
                existing.save()
            return existing

        volunteer = cls(user=user, task=task)
        volunteer.save()
        return volunteer
    
    def withdraw_volunteer(self):
        """Withdraw volunteer application"""
        if self.status == VolunteerStatus.ACCEPTED:
            # Remove user from task assignees
            task = self.task
            task.remove_assignee(self.user)
            
            # If no more assignees, set task status back to POSTED
            if not task.get_assignees().exists():
                task.set_status('POSTED')
        
        self.status = VolunteerStatus.WITHDRAWN
        self.save()
        return True
    
    def accept_volunteer(self, skip_capacity_check=False):
        """Accept this volunteer for the task"""
        if self.status != VolunteerStatus.PENDING:
            return False
        
        # Check if task still has space for more volunteers (unless skipped for batch operations)
        if not skip_capacity_check:
            task = self.task
            current_accepted = Volunteer.objects.filter(
                task=task, 
                status=VolunteerStatus.ACCEPTED
            ).count()
            
            if current_accepted >= task.volunteer_number:
                return False  # Task is already at capacity
        
        # Update volunteer status
        self.status = VolunteerStatus.ACCEPTED
        self.save()
        
        # Add user to task assignees
        task = self.task
        task.add_assignee(self.user)
        
        # Update task status if this is the first accepted volunteer
        current_accepted = Volunteer.objects.filter(
            task=task, 
            status=VolunteerStatus.ACCEPTED
        ).count()
        if current_accepted == 1:
            task.set_status('ASSIGNED')
        
        return True
    
    def reject_volunteer(self):
        """Reject this volunteer for the task"""
        if self.status != VolunteerStatus.PENDING:
            return False
        
        self.status = VolunteerStatus.REJECTED
        self.save()
        return True