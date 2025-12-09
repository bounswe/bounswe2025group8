from django.db import models
from django.core.exceptions import ValidationError
from .user import RegisteredUser


class UserFollows(models.Model):
    """Model representing user follow relationships"""
    
    class Meta:
        app_label = 'core'
        # Ensure a user can only follow another user once
        unique_together = ('follower', 'following')
        # Order by most recent follows first
        ordering = ['-created_at']
        verbose_name_plural = 'User follows'
    
    follower = models.ForeignKey(
        RegisteredUser,
        on_delete=models.CASCADE,
        related_name='following_set',
        help_text='The user who is following'
    )
    
    following = models.ForeignKey(
        RegisteredUser,
        on_delete=models.CASCADE,
        related_name='followers_set',
        help_text='The user being followed'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        """Return string representation of follow relationship"""
        return f"{self.follower.username} follows {self.following.username}"
    
    def clean(self):
        """Validate that a user cannot follow themselves"""
        if self.follower == self.following:
            raise ValidationError("A user cannot follow themselves.")
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.clean()
        super().save(*args, **kwargs)
