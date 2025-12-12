from django.db import models
from django.utils import timezone


class BadgeType(models.TextChoices):
    """Enumeration for badge types"""
    # Volunteer achievement badges
    NEIGHBORHOOD_HERO = 'NEIGHBORHOOD_HERO', 'Neighborhood Hero'
    JACK_OF_ALL_TRADES = 'JACK_OF_ALL_TRADES', 'Jack of All Trades'
    SELECTED_VOLUNTEER = 'SELECTED_VOLUNTEER', 'Selected Volunteer'
    CARING_CONTRIBUTOR = 'CARING_CONTRIBUTOR', 'Caring Contributor'
    HELP_AND_TRAVEL = 'HELP_AND_TRAVEL', 'Help & Travel'
    RAPID_RESPONDER = 'RAPID_RESPONDER', 'Rapid Responder'
    THE_UNSUNG_HERO = 'THE_UNSUNG_HERO', 'The Unsung Hero'
    THE_LIFESAVER = 'THE_LIFESAVER', 'The Lifesaver'
    NIGHT_OWL = 'NIGHT_OWL', 'Night Owl'
    THE_HOLIDAY_HERO = 'THE_HOLIDAY_HERO', 'The Holiday Hero'
    
    # Review/Rating achievement badges
    JUST_PERFECT = 'JUST_PERFECT', 'Just Perfect'
    RISING_HELPER = 'RISING_HELPER', 'Rising Helper'
    GENTLE_COMMUNICATOR = 'GENTLE_COMMUNICATOR', 'Gentle Communicator'
    MODEL_CITIZEN = 'MODEL_CITIZEN', 'Model Citizen'
    RELIABLE_NEIGHBOUR = 'RELIABLE_NEIGHBOUR', 'Reliable Neighbour'
    
    # Social achievement badges
    PEOPLE_TRUST_YOU = 'PEOPLE_TRUST_YOU', 'People Trust You'
    PLATE_NOT_EMPTY = 'PLATE_NOT_EMPTY', 'Plate is Not Sent Back Empty'
    
    # Task creation badges
    FAR_SIGHTED = 'FAR_SIGHTED', 'Far Sighted'
    FULL_GALLERY = 'FULL_GALLERY', 'Full Gallery'
    
    # Engagement badges
    THE_ICEBREAKER = 'THE_ICEBREAKER', 'The Icebreaker'


class Badge(models.Model):
    """Model for badge definitions"""
    badge_type = models.CharField(
        max_length=50,
        choices=BadgeType.choices,
        unique=True
    )
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon_url = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.badge_type})"
    
    class Meta:
        ordering = ['name']


class UserBadge(models.Model):
    """Model for user earned badges"""
    user = models.ForeignKey(
        'RegisteredUser',
        on_delete=models.CASCADE,
        related_name='earned_badges'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='awarded_to'
    )
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
