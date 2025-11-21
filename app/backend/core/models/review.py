from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg


class Review(models.Model):
    """Model for user reviews with detailed ratings"""
    
    # Common fields
    comment = models.TextField(blank=True)
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
    
    # Volunteer -> Requester ratings
    accuracy_of_request = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        null=True,
        blank=True,
        help_text="Was the task as described in the post?"
    )
    communication_volunteer_to_requester = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        null=True,
        blank=True,
        help_text="Was the requester easy to communicate with?"
    )
    safety_and_preparedness = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        null=True,
        blank=True,
        help_text="Did you feel safe at the location? Was the requester prepared?"
    )
    
    # Requester -> Volunteer ratings
    reliability = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        null=True,
        blank=True,
        help_text="Did the volunteer arrive at the agreed-upon time?"
    )
    task_completion = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        null=True,
        blank=True,
        help_text="Did the volunteer complete the task?"
    )
    communication_requester_to_volunteer = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        null=True,
        blank=True,
        help_text="How clear and polite was the volunteer's communication?"
    )
    safety_and_respect = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        null=True,
        blank=True,
        help_text="Did you feel safe and respected during the interaction?"
    )
    
    # Legacy field for backward compatibility
    score = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)],
        default=0.0,
        help_text="Overall average score (calculated automatically)"
    )
    
    class Meta:
        unique_together = ['reviewer', 'reviewee', 'task']
    
    def __init__(self, *args, **kwargs):
        # Check if score is being explicitly set
        if 'score' in kwargs and kwargs['score'] != 0.0:
            self._explicit_score = True
        super().__init__(*args, **kwargs)

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.reviewee.username} ({self.score}/5)"
    
    def save(self, *args, **kwargs):
        """Calculate overall score before saving"""
        # If score was explicitly set, use it (for backward compatibility)
        if hasattr(self, '_explicit_score'):
            super().save(*args, **kwargs)
            return
            
        # Determine review direction
        is_volunteer_to_requester = self.accuracy_of_request is not None
        
        if is_volunteer_to_requester:
            # Volunteer reviewing requester
            scores = [
                self.accuracy_of_request,
                self.communication_volunteer_to_requester,
                self.safety_and_preparedness
            ]
            scores = [s for s in scores if s is not None]
            self.score = sum(scores) / len(scores) if scores else 0.0
        else:
            # Requester reviewing volunteer
            scores = [
                self.reliability,
                self.task_completion,
                self.communication_requester_to_volunteer,
                self.safety_and_respect
            ]
            scores = [s for s in scores if s is not None]
            self.score = sum(scores) / len(scores) if scores else 0.0
        
        super().save(*args, **kwargs)
    
    # Getters
    def get_review_id(self):
        return self.id
    
    def get_score(self):
        return self.score
    
    def get_comment(self):
        return self.comment
    
    def get_timestamp(self):
        return self.timestamp
    
    def get_reviewer(self):
        return self.reviewer
    
    def get_reviewee(self):
        return self.reviewee
    
    def get_task(self):
        return self.task
    
    def is_volunteer_to_requester_review(self):
        """Check if this is a volunteer reviewing a requester"""
        return self.accuracy_of_request is not None
    
    def is_requester_to_volunteer_review(self):
        """Check if this is a requester reviewing a volunteer"""
        return self.reliability is not None
    
    # Setters
    def set_comment(self, comment):
        self.comment = comment
        self.save()
    
    def set_score(self, score):
        """Set the review score explicitly"""
        self.score = score
        self._explicit_score = True  # Mark that score was explicitly set
        self.save()
    
    # Business logic methods
    @classmethod
    def submit_review(cls, reviewer, reviewee, task, comment='', **ratings):
        """
        Submit a new review with detailed ratings
        
        Args:
            reviewer: User giving the review
            reviewee: User receiving the review
            task: Related task
            comment: Optional text review
            **ratings: Rating fields (e.g., accuracy_of_request=4.5, reliability=5.0)
        """
        # Check if task is completed
        if task.status != 'COMPLETED':
            raise ValueError("Cannot review a task that is not completed")
        
        # Get all task participants
        participant_ids = set()
        participant_ids.add(task.creator_id)
        participant_ids.update(task.get_assignees().values_list('id', flat=True))
        if task.assignee_id:
            participant_ids.add(task.assignee_id)
        
        accepted_volunteers = task.get_assigned_volunteers()
        for volunteer in accepted_volunteers:
            participant_ids.add(volunteer.user.id)
        
        # Validate participants
        if reviewer.id not in participant_ids:
            raise ValueError("Only task participants can submit reviews")
        
        if reviewee.id not in participant_ids:
            raise ValueError("Can only review task participants")
        
        if reviewer == reviewee:
            raise ValueError("Cannot review yourself")
        
        # Determine review type and validate ratings
        is_volunteer_reviewing_requester = reviewer.id in [v.user.id for v in accepted_volunteers]
        
        # Check if review already exists
        existing = cls.objects.filter(
            reviewer=reviewer,
            reviewee=reviewee,
            task=task
        ).first()
        
        if existing:
            # Update existing review
            existing.comment = comment
            
            # Handle legacy score parameter
            if 'score' in ratings:
                existing.score = ratings['score']
                existing._explicit_score = True
                ratings = {k: v for k, v in ratings.items() if k != 'score'}
            
            for key, value in ratings.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            existing.save()
            existing.update_user_rating()
            return existing

        # Create new review
        # Handle legacy score parameter
        explicit_score = ratings.pop('score', None)
        
        review = cls(
            reviewer=reviewer,
            reviewee=reviewee,
            task=task,
            comment=comment,
            **ratings
        )
        
        # Set explicit score if provided (for backward compatibility)
        if explicit_score is not None:
            review.score = explicit_score
            review._explicit_score = True
            
        review.save()        # Update user rating
        review.update_user_rating()
        
        # Send notification
        from .notification import Notification, NotificationType
        Notification.send_notification(
            user=reviewee,
            content=f"You received a new review from {reviewer.username}",
            notification_type=NotificationType.NEW_REVIEW,
            related_task=task
        )
        
        return review
    
    def update_user_rating(self):
        """Update the reviewee's overall rating based on all reviews"""
        reviewee = self.reviewee
        avg_rating = Review.objects.filter(
            reviewee=reviewee
        ).aggregate(Avg('score'))['score__avg'] or 0.0
        
        reviewee.set_rating(avg_rating)
        return avg_rating