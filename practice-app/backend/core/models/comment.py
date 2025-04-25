from django.db import models


class Comment(models.Model):
    """Model for task comments"""
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Foreign Keys
    user = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    def __str__(self):
        """Return string representation of comment"""
        return f"Comment by {self.user.username} on {self.task.title}"
    
    # Getters
    def get_comment_id(self):
        """Get comment ID"""
        return self.id
    
    def get_content(self):
        """Get comment content"""
        return self.content
    
    def get_timestamp(self):
        """Get comment timestamp"""
        return self.timestamp
    
    def get_user(self):
        """Get comment author"""
        return self.user
    
    def get_task(self):
        """Get commented task"""
        return self.task
    
    # Setters
    def set_content(self, content):
        """Set comment content"""
        self.content = content
        self.save()
    
    # Business logic methods
    @classmethod
    def add_comment(cls, user, task, content):
        """Add a new comment to a task"""
        comment = cls(
            user=user,
            task=task,
            content=content
        )
        comment.save()
        return comment
    
    def delete_comment(self):
        """Delete this comment"""
        self.delete()
        return True
    
    def report_comment(self, reason):
        """Report this comment for moderation"""
        # This would involve a CommentReport model (to be implemented)
        pass
    
    def edit_comment(self, new_content):
        """Edit comment content"""
        self.content = new_content
        self.save()
        return True