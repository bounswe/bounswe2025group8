from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg


class Review(models.Model):
    """Model for user reviews"""
    score = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)]
    )
    comment = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Foreign Keys
    reviewer = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    reviewee = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    
    class Meta:
        # Ensure a user can only review another user once per task
        unique_together = ['reviewer', 'reviewee', 'task']
    
    def __str__(self):
        """Return string representation of review"""
        return f"Review by {self.reviewer.username} for {self.reviewee.username} ({self.score}/5)"
    
    # Getters
    def get_review_id(self):
        """Get review ID"""
        return self.id
    
    def get_score(self):
        """Get review score"""
        return self.score
    
    def get_comment(self):
        """Get review comment"""
        return self.comment
    
    def get_timestamp(self):
        """Get review timestamp"""
        return self.timestamp
    
    def get_reviewer(self):
        """Get reviewer user"""
        return self.reviewer
    
    def get_reviewee(self):
        """Get reviewee user"""
        return self.reviewee
    
    def get_task(self):
        """Get associated task"""
        return self.task
    
    # Setters
    def set_score(self, score):
        """Set review score"""
        self.score = score
        self.save()
        self.update_user_rating()
    
    def set_comment(self, comment):
        """Set review comment"""
        self.comment = comment
        self.save()
    
    # Business logic methods
    @classmethod
    def submit_review(cls, reviewer, reviewee, task, score, comment):
        """Submit a new review"""
        # Check if task is completed
        if task.status != 'COMPLETED':
            raise ValueError("Cannot review a task that is not completed")
        
        # Check if reviewer is the task creator or assignee
        if reviewer != task.creator and reviewer != task.assignee:
            raise ValueError("Only task participants can submit reviews")
        
        # Check if reviewee is the task creator or assignee
        if reviewee != task.creator and reviewee != task.assignee:
            raise ValueError("Can only review task participants")
        
        # Check if reviewer and reviewee are different users
        if reviewer == reviewee:
            raise ValueError("Cannot review yourself")
        
        # Check if review already exists
        existing = cls.objects.filter(
            reviewer=reviewer, 
            reviewee=reviewee, 
            task=task
        ).first()
        
        if existing:
            # Update existing review
            existing.score = score
            existing.comment = comment
            existing.save()
            existing.update_user_rating()
            return existing
        
        # Create new review
        review = cls(
            reviewer=reviewer,
            reviewee=reviewee,
            task=task,
            score=score,
            comment=comment
        )
        review.save()
        
        # Update user rating
        review.update_user_rating()
        
        # Send notification (if implemented)
        from .notification import Notification, NotificationType
        Notification.send_notification(
            user=reviewee,
            content=f"You received a new review from {reviewer.username}",
            notification_type=NotificationType.NEW_REVIEW,
            related_task=task
        )
        
        return review
    
    def report_review(self, reason):
        """Report this review for moderation"""
        # This would involve a ReviewReport model (to be implemented)
        pass
    
    def update_user_rating(self):
        """Update the reviewee's rating based on all reviews"""
        reviewee = self.reviewee
        avg_rating = Review.objects.filter(
            reviewee=reviewee
        ).aggregate(Avg('score'))['score__avg'] or 0.0
        
        # Update user's rating
        reviewee.set_rating(avg_rating)
        return avg_rating