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
    def update_task_volunteers(cls, task, volunteer_ids):
        """Update task volunteers - accept new ones and unassign removed ones"""
        if not volunteer_ids:
            volunteer_ids = []
        
        # Ensure task has a valid volunteer_number
        if task.volunteer_number <= 0:
            return False, f"Task volunteer_number is invalid: {task.volunteer_number}"
        
        if len(volunteer_ids) > task.volunteer_number:
            return False, f"Cannot accept {len(volunteer_ids)} volunteers. Task only needs {task.volunteer_number}."
        
        # Get all current volunteers for this task (PENDING, ACCEPTED, and REJECTED)
        all_volunteers = cls.objects.filter(
            task=task,
            status__in=[VolunteerStatus.PENDING, VolunteerStatus.ACCEPTED, VolunteerStatus.REJECTED]
        )
        
        # Get volunteers that should be accepted (from the provided IDs)
        volunteers_to_accept = all_volunteers.filter(id__in=volunteer_ids)
        
        # Get currently accepted volunteers that are NOT in the new selection
        volunteers_to_unassign = all_volunteers.filter(
            status=VolunteerStatus.ACCEPTED
        ).exclude(id__in=volunteer_ids)
        
        # Validate that all requested volunteer IDs exist and are available
        if volunteers_to_accept.count() != len(volunteer_ids):
            missing_count = len(volunteer_ids) - volunteers_to_accept.count()
            return False, f"{missing_count} volunteer(s) not available for assignment"
        
        accepted_volunteers = []
        unassigned_volunteers = []
        
        # First, unassign volunteers that are no longer selected
        for volunteer in volunteers_to_unassign:
            if volunteer.unassign_volunteer():
                unassigned_volunteers.append(volunteer)
        
        # Then, accept the selected volunteers
        for volunteer in volunteers_to_accept:
            if volunteer.status == VolunteerStatus.PENDING or volunteer.status == VolunteerStatus.REJECTED:
                if volunteer.accept_volunteer(skip_capacity_check=True):
                    accepted_volunteers.append(volunteer)
            elif volunteer.status == VolunteerStatus.ACCEPTED:
                # Already accepted, just add to the list
                accepted_volunteers.append(volunteer)
        
        message = f"Successfully updated volunteers. Accepted: {len(accepted_volunteers)}"
        if unassigned_volunteers:
            message += f", Unassigned: {len(unassigned_volunteers)}"
        
        return True, message

    @classmethod
    def volunteer_for_task(cls, user, task):
        """Create a volunteer entry for a task"""
        # Check if task is still open for volunteers (needs more volunteers)
        # Count only ACCEPTED volunteers, not all assignees
        current_accepted = cls.objects.filter(
            task=task, 
            status=VolunteerStatus.ACCEPTED
        ).count()
        
        if current_accepted >= task.volunteer_number:
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
            # Status will be updated automatically by remove_assignee method
        
        self.status = VolunteerStatus.WITHDRAWN
        self.save()
        return True
    
    def unassign_volunteer(self):
        """Unassign volunteer from task (but keep them as volunteer, just change status to PENDING)"""
        if self.status == VolunteerStatus.ACCEPTED:
            # Remove user from task assignees
            task = self.task
            task.remove_assignee(self.user)
            
            # Change status to PENDING so they can be selected again
            self.status = VolunteerStatus.PENDING
            self.save()
            # Task status will be updated automatically by remove_assignee method
            
            return True
        return False
    
    def accept_volunteer(self, skip_capacity_check=False):
        """Accept this volunteer for the task"""
        if self.status not in [VolunteerStatus.PENDING, VolunteerStatus.REJECTED]:
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
        # Task status will be updated automatically by add_assignee method
        
        return True
    
    def reject_volunteer(self):
        """Reject this volunteer for the task"""
        if self.status != VolunteerStatus.PENDING:
            return False
        
        self.status = VolunteerStatus.REJECTED
        self.save()
        return True