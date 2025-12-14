"""
Badge evaluation service for checking and awarding badges to users.
This service contains all the business logic for determining when badges should be awarded.
"""
from django.db.models import Count, Q, Avg, F, Min
from django.utils import timezone
from datetime import timedelta, time
from core.models import (
    Badge, BadgeType, UserBadge, RegisteredUser, Volunteer, 
    VolunteerStatus, Task, TaskStatus, Review, UserFollows
)


class BadgeService:
    """Service class for badge evaluation and awarding"""
    
    # Turkish national holidays (month, day)
    TURKISH_HOLIDAYS = [
        (1, 1),   # New Year's Day
        (4, 23),  # National Sovereignty and Children's Day
        (5, 1),   # Labour Day
        (5, 19),  # Commemoration of Atatürk, Youth and Sports Day
        (7, 15),  # Democracy and National Unity Day
        (8, 30),  # Victory Day
        (10, 29), # Republic Day
        # Ramadan and Sacrifice holidays are variable, would need additional logic
    ]
    
    @staticmethod
    def award_badge(user, badge_type):
        """Award a badge to a user if they don't already have it"""
        try:
            badge = Badge.objects.get(badge_type=badge_type)
            user_badge, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge
            )
            return created
        except Badge.DoesNotExist:
            return False
    
    @staticmethod
    def check_neighborhood_hero(user):
        """Check if user volunteered for more than 10 different neighbors"""
        unique_requesters = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED
        ).values('task__creator').distinct().count()
        
        if unique_requesters > 10:
            return BadgeService.award_badge(user, BadgeType.NEIGHBORHOOD_HERO)
        return False
    
    @staticmethod
    def check_jack_of_all_trades(user):
        """Check if user volunteered in more than 5 different categories"""
        categories_count = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED
        ).values('task__category').distinct().count()
        
        if categories_count > 5:
            return BadgeService.award_badge(user, BadgeType.JACK_OF_ALL_TRADES)
        return False
    
    @staticmethod
    def check_selected_volunteer(user, task):
        """Check if user was selected from multiple volunteers"""
        # Check if this task had multiple volunteers
        volunteer_count = Volunteer.objects.filter(task=task).count()
        
        # Check if user was accepted
        user_volunteer = Volunteer.objects.filter(
            user=user,
            task=task,
            status=VolunteerStatus.ACCEPTED
        ).exists()
        
        if volunteer_count > 1 and user_volunteer:
            return BadgeService.award_badge(user, BadgeType.SELECTED_VOLUNTEER)
        return False
    
    @staticmethod
    def check_plate_not_empty(user):
        """Check if user both created requests and volunteered"""
        has_created_tasks = Task.objects.filter(creator=user).exists()
        has_volunteered = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED
        ).exists()
        
        if has_created_tasks and has_volunteered:
            return BadgeService.award_badge(user, BadgeType.PLATE_NOT_EMPTY)
        return False
    
    @staticmethod
    def check_people_trust_you(user):
        """Check if user has more than 10 followers"""
        follower_count = UserFollows.objects.filter(following=user).count()
        
        if follower_count > 10:
            return BadgeService.award_badge(user, BadgeType.PEOPLE_TRUST_YOU)
        return False
    
    @staticmethod
    def check_caring_contributor(user):
        """Check if user volunteered for more than 10 requests"""
        volunteer_count = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED
        ).count()
        
        if volunteer_count > 10:
            return BadgeService.award_badge(user, BadgeType.CARING_CONTRIBUTOR)
        return False
    
    @staticmethod
    def check_help_and_travel(user):
        """Check if user completed tasks in at least 2 different cities"""
        # Extract city from location (assuming format like "City, Country" or "City")
        completed_tasks = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED,
            task__status=TaskStatus.COMPLETED
        ).values_list('task__location', flat=True)
        
        cities = set()
        for location in completed_tasks:
            if location:
                # Extract first part before comma (city)
                city = location.split(',')[0].strip()
                cities.add(city)
        
        if len(cities) >= 2:
            return BadgeService.award_badge(user, BadgeType.HELP_AND_TRAVEL)
        return False
    
    @staticmethod
    def check_just_perfect(user):
        """Check if user received 3 reviews with perfect scores (5.0) on all criteria"""
        perfect_reviews = Review.objects.filter(
            reviewee=user,
            reliability=5.0,
            task_completion=5.0,
            communication_requester_to_volunteer=5.0,
            safety_and_respect=5.0
        ).exclude(
            Q(reliability__isnull=True) | 
            Q(task_completion__isnull=True) | 
            Q(communication_requester_to_volunteer__isnull=True) | 
            Q(safety_and_respect__isnull=True)
        ).count()
        
        if perfect_reviews >= 3:
            return BadgeService.award_badge(user, BadgeType.JUST_PERFECT)
        return False
    
    @staticmethod
    def check_rapid_responder(user, volunteer_record):
        """Check if user volunteered within 15 minutes of task posting"""
        task = volunteer_record.task
        time_diff = volunteer_record.volunteered_at - task.created_at
        
        if time_diff <= timedelta(minutes=15):
            return BadgeService.award_badge(user, BadgeType.RAPID_RESPONDER)
        return False
    
    @staticmethod
    def check_unsung_hero(user, task):
        """Check if user completed a task that was pending for more than 3 days"""
        if task.status != TaskStatus.COMPLETED:
            return False
        
        # Check if task was posted more than 3 days before completion
        time_pending = task.updated_at - task.created_at
        
        if time_pending > timedelta(days=3):
            # Check if user was the volunteer who completed it
            completed_by_user = Volunteer.objects.filter(
                user=user,
                task=task,
                status=VolunteerStatus.ACCEPTED
            ).exists()
            
            if completed_by_user:
                return BadgeService.award_badge(user, BadgeType.THE_UNSUNG_HERO)
        return False
    
    @staticmethod
    def check_rising_helper(user):
        """Check if user received 5+ positive feedback ratings (>= 4.0 average)"""
        avg_score = Review.objects.filter(reviewee=user).aggregate(
            avg=Avg('score')
        )['avg']
        
        review_count = Review.objects.filter(reviewee=user).count()
        
        if review_count >= 5 and avg_score and avg_score >= 4.0:
            return BadgeService.award_badge(user, BadgeType.RISING_HELPER)
        return False
    
    @staticmethod
    def check_gentle_communicator(user):
        """Check if user received 5 great communication reviews (>= 4.5)"""
        great_communication_count = Review.objects.filter(
            reviewee=user,
            communication_requester_to_volunteer__gte=4.5
        ).exclude(
            communication_requester_to_volunteer__isnull=True
        ).count()
        
        if great_communication_count >= 5:
            return BadgeService.award_badge(user, BadgeType.GENTLE_COMMUNICATOR)
        return False
    
    @staticmethod
    def check_lifesaver(user, task):
        """Check if user completed a high urgency task"""
        if task.status != TaskStatus.COMPLETED or task.urgency_level < 3:
            return False
        
        completed_by_user = Volunteer.objects.filter(
            user=user,
            task=task,
            status=VolunteerStatus.ACCEPTED
        ).exists()
        
        if completed_by_user:
            return BadgeService.award_badge(user, BadgeType.THE_LIFESAVER)
        return False
    
    @staticmethod
    def check_night_owl(user, volunteer_record):
        """Check if user volunteered during late-night hours (11 PM - 5 AM)"""
        volunteer_time = volunteer_record.volunteered_at.time()
        night_start = time(23, 0)  # 11 PM
        night_end = time(5, 0)     # 5 AM
        
        is_night = volunteer_time >= night_start or volunteer_time <= night_end
        
        if is_night:
            return BadgeService.award_badge(user, BadgeType.NIGHT_OWL)
        return False
    
    @staticmethod
    def check_model_citizen(user):
        """Check if user achieved >= 4.5 safety and respect rating"""
        avg_safety = Review.objects.filter(
            reviewee=user
        ).exclude(
            safety_and_respect__isnull=True
        ).aggregate(avg=Avg('safety_and_respect'))['avg']
        
        if avg_safety and avg_safety >= 4.5:
            return BadgeService.award_badge(user, BadgeType.MODEL_CITIZEN)
        return False
    
    @staticmethod
    def check_reliable_neighbour(user):
        """Check if user achieved reliability rating higher than 4.5"""
        avg_reliability = Review.objects.filter(
            reviewee=user
        ).exclude(
            reliability__isnull=True
        ).aggregate(avg=Avg('reliability'))['avg']
        
        if avg_reliability and avg_reliability > 4.5:
            return BadgeService.award_badge(user, BadgeType.RELIABLE_NEIGHBOUR)
        return False
    
    @staticmethod
    def check_holiday_hero(user, volunteer_record):
        """Check if user volunteered on a national holiday"""
        volunteer_date = volunteer_record.volunteered_at.date()
        holiday_tuple = (volunteer_date.month, volunteer_date.day)
        
        if holiday_tuple in BadgeService.TURKISH_HOLIDAYS:
            return BadgeService.award_badge(user, BadgeType.THE_HOLIDAY_HERO)
        return False
    
    @staticmethod
    def check_far_sighted(user, task):
        """Check if user created a request with deadline more than 1 month away"""
        if task.creator != user:
            return False
        
        time_diff = task.deadline - task.created_at
        
        if time_diff > timedelta(days=30):
            return BadgeService.award_badge(user, BadgeType.FAR_SIGHTED)
        return False
    
    @staticmethod
    def check_full_gallery(user, task):
        """Check if user created a request with all 4 photos"""
        if task.creator != user:
            return False
        
        photo_count = task.photos.count()
        
        if photo_count >= 4:
            return BadgeService.award_badge(user, BadgeType.FULL_GALLERY)
        return False
    
    @staticmethod
    def check_icebreaker(user):
        """Check if user posted their first comment"""
        from core.models import Comment
        
        # Check if this is user's first comment
        comment_count = Comment.objects.filter(user=user).count()
        
        if comment_count == 1:  # Just posted first comment
            return BadgeService.award_badge(user, BadgeType.THE_ICEBREAKER)
        return False
    
    @staticmethod
    def check_all_badges_for_user(user):
        """Check all applicable badges for a user"""
        badges_awarded = []
        
        # User-level badges (not task/volunteer specific)
        if BadgeService.check_neighborhood_hero(user):
            badges_awarded.append(BadgeType.NEIGHBORHOOD_HERO)
        
        if BadgeService.check_jack_of_all_trades(user):
            badges_awarded.append(BadgeType.JACK_OF_ALL_TRADES)
        
        if BadgeService.check_plate_not_empty(user):
            badges_awarded.append(BadgeType.PLATE_NOT_EMPTY)
        
        if BadgeService.check_people_trust_you(user):
            badges_awarded.append(BadgeType.PEOPLE_TRUST_YOU)
        
        if BadgeService.check_caring_contributor(user):
            badges_awarded.append(BadgeType.CARING_CONTRIBUTOR)
        
        if BadgeService.check_help_and_travel(user):
            badges_awarded.append(BadgeType.HELP_AND_TRAVEL)
        
        if BadgeService.check_just_perfect(user):
            badges_awarded.append(BadgeType.JUST_PERFECT)
        
        if BadgeService.check_rising_helper(user):
            badges_awarded.append(BadgeType.RISING_HELPER)
        
        if BadgeService.check_gentle_communicator(user):
            badges_awarded.append(BadgeType.GENTLE_COMMUNICATOR)
        
        if BadgeService.check_model_citizen(user):
            badges_awarded.append(BadgeType.MODEL_CITIZEN)
        
        if BadgeService.check_reliable_neighbour(user):
            badges_awarded.append(BadgeType.RELIABLE_NEIGHBOUR)
        
        return badges_awarded
    
    @staticmethod
    def check_volunteer_badges(user, volunteer_record):
        """Check badges related to volunteering action"""
        badges_awarded = []
        
        if BadgeService.check_selected_volunteer(user, volunteer_record.task):
            badges_awarded.append(BadgeType.SELECTED_VOLUNTEER)
        
        if BadgeService.check_rapid_responder(user, volunteer_record):
            badges_awarded.append(BadgeType.RAPID_RESPONDER)
        
        if BadgeService.check_night_owl(user, volunteer_record):
            badges_awarded.append(BadgeType.NIGHT_OWL)
        
        if BadgeService.check_holiday_hero(user, volunteer_record):
            badges_awarded.append(BadgeType.THE_HOLIDAY_HERO)
        
        return badges_awarded
    
    @staticmethod
    def check_task_completion_badges(user, task):
        """Check badges related to task completion"""
        badges_awarded = []
        
        if BadgeService.check_unsung_hero(user, task):
            badges_awarded.append(BadgeType.THE_UNSUNG_HERO)
        
        if BadgeService.check_lifesaver(user, task):
            badges_awarded.append(BadgeType.THE_LIFESAVER)
        
        return badges_awarded
    
    @staticmethod
    def check_task_creation_badges(user, task):
        """Check badges related to task creation"""
        badges_awarded = []
        
        if BadgeService.check_far_sighted(user, task):
            badges_awarded.append(BadgeType.FAR_SIGHTED)
        
        if BadgeService.check_full_gallery(user, task):
            badges_awarded.append(BadgeType.FULL_GALLERY)
        
        return badges_awarded
