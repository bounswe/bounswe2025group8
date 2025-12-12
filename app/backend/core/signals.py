"""
Django signals for automatic badge checking and awarding.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import Volunteer, Task, Review, UserFollows
from core.services.badge_service import BadgeService


@receiver(post_save, sender=Volunteer)
def check_volunteer_badges(sender, instance, created, **kwargs):
    """Check and award badges when a volunteer record is created or updated"""
    if instance.status == 'ACCEPTED':
        user = instance.user
        
        # Check volunteer-specific badges
        BadgeService.check_volunteer_badges(user, instance)
        
        # Check user-level badges that might be affected
        BadgeService.check_neighborhood_hero(user)
        BadgeService.check_jack_of_all_trades(user)
        BadgeService.check_caring_contributor(user)
        BadgeService.check_help_and_travel(user)
        BadgeService.check_plate_not_empty(user)


@receiver(post_save, sender=Task)
def check_task_badges(sender, instance, created, **kwargs):
    """Check and award badges when a task is created or updated"""
    user = instance.creator
    
    # Check task creation badges
    if created:
        BadgeService.check_task_creation_badges(user, instance)
    
    # Check task completion badges
    if instance.status == 'COMPLETED':
        # Check for all accepted volunteers
        volunteers = Volunteer.objects.filter(
            task=instance,
            status='ACCEPTED'
        )
        for volunteer in volunteers:
            BadgeService.check_task_completion_badges(volunteer.user, instance)


@receiver(post_save, sender=Review)
def check_review_badges(sender, instance, created, **kwargs):
    """Check and award badges when a review is created"""
    user = instance.reviewee
    
    # Check review-related badges
    BadgeService.check_just_perfect(user)
    BadgeService.check_rising_helper(user)
    BadgeService.check_gentle_communicator(user)
    BadgeService.check_model_citizen(user)
    BadgeService.check_reliable_neighbour(user)


@receiver(post_save, sender=UserFollows)
def check_follower_badges(sender, instance, created, **kwargs):
    """Check and award badges when someone gets a new follower"""
    if created:
        user = instance.following  # The user being followed
        BadgeService.check_people_trust_you(user)
