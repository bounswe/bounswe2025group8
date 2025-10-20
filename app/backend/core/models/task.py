from django.db import models
from django.utils import timezone


class TaskCategory(models.TextChoices):
    """Enumeration for task categories"""
    GROCERY_SHOPPING = 'GROCERY_SHOPPING', 'Grocery Shopping'
    TUTORING = 'TUTORING', 'Tutoring'
    HOME_REPAIR = 'HOME_REPAIR', 'Home Repair'
    MOVING_HELP = 'MOVING_HELP', 'Moving Help'
    HOUSE_CLEANING = 'HOUSE_CLEANING', 'House Cleaning'
    OTHER = 'OTHER', 'Other'


class TaskStatus(models.TextChoices):
    """Enumeration for task status"""
    POSTED = 'POSTED', 'Posted'
    ASSIGNED = 'ASSIGNED', 'Assigned'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    EXPIRED = 'EXPIRED', 'Expired'


class Task(models.Model):
    """Model for assistance tasks"""
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=TaskCategory.choices,
        default=TaskCategory.OTHER
    )
    location = models.CharField(max_length=255)
    deadline = models.DateTimeField()
    requirements = models.TextField(blank=True)
    urgency_level = models.IntegerField(default=0)
    volunteer_number = models.IntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.POSTED
    )
    is_recurring = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Foreign Keys
    creator = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    assignee = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    # Many-to-many relationship for multiple assignees
    assignees = models.ManyToManyField(
        'RegisteredUser',
        blank=True,
        related_name='assigned_tasks_multiple'
    )
    
    def __str__(self):
        """Return string representation of task"""
        return self.title

    # Getters
    def get_task_id(self):
        """Get task ID"""
        return self.id
    
    def get_title(self):
        """Get task title"""
        return self.title
    
    def get_description(self):
        """Get task description"""
        return self.description
    
    def get_category(self):
        """Get task category"""
        return self.category
    
    def get_location(self):
        """Get task location"""
        return self.location
    
    def get_deadline(self):
        """Get task deadline"""
        return self.deadline
    
    def get_requirements(self):
        """Get task requirements"""
        return self.requirements
    
    def get_urgency_level(self):
        """Get task urgency level"""
        return self.urgency_level
    
    def get_volunteer_number(self):
        """Get required number of volunteers"""
        return self.volunteer_number
    
    def get_status(self):
        """Get task status"""
        return self.status
    
    def is_task_recurring(self):
        """Check if task is recurring"""
        return self.is_recurring
    
    def get_creator(self):
        """Get task creator"""
        return self.creator
    
    def get_assignee(self):
        """Get task assignee (for backward compatibility)"""
        return self.assignee
    
    def get_assignees(self):
        """Get all task assignees"""
        return self.assignees.all()
    
    def get_assigned_volunteers(self):
        """Get all accepted volunteers for this task"""
        from .volunteer import Volunteer, VolunteerStatus
        return Volunteer.objects.filter(task=self, status=VolunteerStatus.ACCEPTED)
    
    def get_photos(self):
        """Get photos attached to this task"""
        return self.photos.all()
    
    def get_tags(self):
        """Get tags associated with this task"""
        return self.tags.all()
    
    # Setters
    def set_title(self, title):
        """Set task title"""
        self.title = title
        self.save()
    
    def set_description(self, description):
        """Set task description"""
        self.description = description
        self.save()
    
    def set_category(self, category):
        """Set task category"""
        self.category = category
        self.save()
    
    def set_location(self, location):
        """Set task location"""
        self.location = location
        self.save()
    
    def set_deadline(self, deadline):
        """Set task deadline"""
        self.deadline = deadline
        self.save()
    
    def set_requirements(self, requirements):
        """Set task requirements"""
        self.requirements = requirements
        self.save()
    
    def set_urgency_level(self, level):
        """Set task urgency level"""
        self.urgency_level = level
        self.save()
    
    def set_volunteer_number(self, number):
        """Set required number of volunteers"""
        self.volunteer_number = number
        self.save()
    
    def set_status(self, status):
        """Set task status"""
        self.status = status
        self.save()
    
    def set_recurring(self, is_recurring):
        """Set whether task is recurring"""
        self.is_recurring = is_recurring
        self.save()
    
    def set_assignee(self, assignee):
        """Set task assignee (for backward compatibility)"""
        self.assignee = assignee
        self.save()
    
    def add_assignee(self, assignee):
        """Add an assignee to the task"""
        self.assignees.add(assignee)
        # Also set the single assignee field for backward compatibility
        if not self.assignee:
            self.assignee = assignee
            self.save()
        
        # Update status based on assignee count
        self.update_status_based_on_assignees()
    
    def remove_assignee(self, assignee):
        """Remove an assignee from the task"""
        self.assignees.remove(assignee)
        # If this was the main assignee, clear it or set to another assignee
        if self.assignee == assignee:
            remaining_assignees = self.assignees.all()
            self.assignee = remaining_assignees.first() if remaining_assignees.exists() else None
            self.save()
        
        # Update status based on assignee count
        self.update_status_based_on_assignees()
    
    def clear_assignees(self):
        """Clear all assignees"""
        self.assignees.clear()
        self.assignee = None
        self.save()
        
        # Update status based on assignee count
        self.update_status_based_on_assignees()
    
    # Business logic methods
    def create_task(self):
        """Create a new task - this is handled by Django model creation"""
        self.save()
        return self
    
    def update_task(self):
        """Update the task"""
        self.updated_at = timezone.now()
        self.save()
        return True
    
    def delete_task(self):
        """Delete the task"""
        self.delete()
        return True
    
    def cancel_task(self):
        """Cancel the task"""
        self.status = TaskStatus.CANCELLED
        self.save()
        return True
    
    def confirm_completion(self):
        """Mark task as completed"""
        self.status = TaskStatus.COMPLETED
        self.save()
        
        # Update all assignees' completed task count
        assignees = self.get_assignees()
        for assignee in assignees:
            assignee.increment_completed_task_count()
        
        # Also update the main assignee if set (backward compatibility)
        if self.assignee and self.assignee not in assignees:
            self.assignee.increment_completed_task_count()
        
        return True
    
    def add_photo(self, photo):
        """Add a photo to the task"""
        # Implemented via reverse relationship in Photo model
        # This will be handled in the views/forms
        return True
    
    def check_expiry(self):
        """Check if task has expired"""
        if self.deadline < timezone.now() and self.status == TaskStatus.POSTED:
            self.status = TaskStatus.EXPIRED
            self.save()
            return True
        return False
    
    def update_status_based_on_assignees(self):
        """Update task status based on assignee count vs volunteer_number requirement"""
        current_assignee_count = self.assignees.count()
        
        # If we have fewer assignees than required, status should be POSTED
        if current_assignee_count < self.volunteer_number:
            if self.status == TaskStatus.ASSIGNED:
                self.status = TaskStatus.POSTED
                self.save()
                return True
        # If we have enough assignees, status should be ASSIGNED
        elif current_assignee_count >= self.volunteer_number:
            if self.status == TaskStatus.POSTED:
                self.status = TaskStatus.ASSIGNED
                self.save()
                return True
        
        return False