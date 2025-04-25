from django.db import models


class Tag(models.Model):
    """Model for tags/labels used for tasks"""
    name = models.CharField(max_length=50, unique=True)
    tasks = models.ManyToManyField('Task', related_name='tags')
    
    def __str__(self):
        """Return string representation of tag"""
        return self.name
    
    # Getters
    def get_tag_id(self):
        """Get tag ID"""
        return self.id
    
    def get_name(self):
        """Get tag name"""
        return self.name
    
    def get_tasks(self):
        """Get tasks associated with this tag"""
        return self.tasks.all()
    
    # Setters
    def set_name(self, name):
        """Set tag name"""
        self.name = name
        self.save()
    
    # Business logic methods
    @classmethod
    def create_tag(cls, name):
        """Create a new tag or get existing one"""
        tag, created = cls.objects.get_or_create(name=name.lower())
        return tag
    
    def add_to_task(self, task):
        """Add this tag to a task"""
        self.tasks.add(task)
        return True
    
    def remove_from_task(self, task):
        """Remove this tag from a task"""
        self.tasks.remove(task)
        return True