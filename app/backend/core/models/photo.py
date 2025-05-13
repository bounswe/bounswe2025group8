from django.db import models
import os
import uuid


def task_photo_path(instance, filename):
    """Generate unique file path for task photos"""
    # Get the file extension
    ext = filename.split('.')[-1]
    # Generate a unique filename
    filename = f"{uuid.uuid4()}.{ext}"
    # Return the upload path
    return os.path.join('task_photos', str(instance.task.id), filename)


class Photo(models.Model):
    """Model for task photos"""
    url = models.ImageField(upload_to=task_photo_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Foreign Key
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='photos'
    )
    
    def __str__(self):
        """Return string representation of photo"""
        return f"Photo for {self.task.title}"
    
    # Getters
    def get_photo_id(self):
        """Get photo ID"""
        return self.id
    
    def get_url(self):
        """Get photo URL"""
        return self.url.url if self.url else None
    
    def get_task(self):
        """Get associated task"""
        return self.task
    
    def get_uploaded_at(self):
        """Get upload timestamp"""
        return self.uploaded_at
    
    # Business logic methods
    @classmethod
    def upload_photo(cls, task, image_file):
        """Upload a new photo for a task"""
        photo = cls(task=task, url=image_file)
        photo.save()
        return photo
    
    def delete_photo(self):
        """Delete this photo"""
        # Delete the actual file
        if self.url:
            if os.path.isfile(self.url.path):
                os.remove(self.url.path)
        
        # Delete the database record
        self.delete()
        return True