from django.db import models


class Bookmark(models.Model):
    """Model for bookmarking tasks"""
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Foreign Keys
    user = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    tags = models.ManyToManyField('Tag', related_name='bookmarks', blank=True)
    
    class Meta:
        # A user can bookmark a task only once
        unique_together = ['user', 'task']
    
    def __str__(self):
        """Return string representation of bookmark"""
        return f"{self.user.username} bookmarked {self.task.title}"
    
    # Getters
    def get_bookmark_id(self):
        """Get bookmark ID"""
        return self.id
    
    def get_user(self):
        """Get bookmark owner"""
        return self.user
    
    def get_task(self):
        """Get bookmarked task"""
        return self.task
    
    def get_timestamp(self):
        """Get bookmark timestamp"""
        return self.timestamp
    
    def get_tags(self):
        """Get tags associated with this bookmark"""
        return self.tags.all()
    
    # Business logic methods
    @classmethod
    def add_bookmark(cls, user, task):
        """Create a bookmark for a task"""
        # Check if bookmark already exists
        existing = cls.objects.filter(user=user, task=task).first()
        if existing:
            return existing
        
        # Create new bookmark
        bookmark = cls(user=user, task=task)
        bookmark.save()
        return bookmark
    
    def remove_bookmark(self):
        """Remove this bookmark"""
        self.delete()
        return True
    
    def add_tag(self, tag):
        """Add a tag to this bookmark"""
        # This would involve a BookmarkTag model or ManyToMany relationship
        self.tags.add(tag)
        return True


class BookmarkTag(models.Model):
    """M2M relationship between Bookmarks and Tags"""
    bookmark = models.ForeignKey(
        'Bookmark',
        on_delete=models.CASCADE,
        related_name='bookmark_tags'
    )
    tag = models.ForeignKey(
        'Tag',
        on_delete=models.CASCADE,
        related_name='bookmark_tags'
    )
    
    class Meta:
        unique_together = ['bookmark', 'tag']
    
    def __str__(self):
        """Return string representation"""
        return f"{self.bookmark} - {self.tag.name}"