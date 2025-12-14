from django.core.management.base import BaseCommand
from core.models import Badge, BadgeType


class Command(BaseCommand):
    help = 'Populate the database with badge definitions'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating badges...')
        
        badges_data = [
            # Volunteer achievement badges
            {
                'badge_type': BadgeType.NEIGHBORHOOD_HERO,
                'name': 'Neighborhood Hero',
                'description': 'Volunteered for more than 10 different neighbors',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.JACK_OF_ALL_TRADES,
                'name': 'Jack of All Trades',
                'description': 'Volunteered in more than 5 different categories',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.SELECTED_VOLUNTEER,
                'name': 'Selected Volunteer',
                'description': 'Selected to volunteer from among multiple candidates',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.CARING_CONTRIBUTOR,
                'name': 'Caring Contributor',
                'description': 'Volunteered for more than 10 requests',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.HELP_AND_TRAVEL,
                'name': 'Help & Travel',
                'description': 'Completed volunteer assignments in at least two different cities',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.RAPID_RESPONDER,
                'name': 'Rapid Responder',
                'description': 'First to volunteer for a request within 15 minutes of posting',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.THE_UNSUNG_HERO,
                'name': 'The Unsung Hero',
                'description': 'Completed a request that had been pending for more than 3 days',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.THE_LIFESAVER,
                'name': 'The Lifesaver',
                'description': 'Successfully completed a request marked as "High Urgency"',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.NIGHT_OWL,
                'name': 'Night Owl',
                'description': 'Volunteered for a task during late-night hours (11 PM - 5 AM)',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.THE_HOLIDAY_HERO,
                'name': 'The Holiday Hero',
                'description': 'Volunteered on a national holiday',
                'icon_url': ''
            },
            
            # Review/Rating achievement badges
            {
                'badge_type': BadgeType.JUST_PERFECT,
                'name': 'Just Perfect',
                'description': 'Received 3 reviews with perfect scores (5.0) on all evaluation criteria',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.RISING_HELPER,
                'name': 'Rising Helper',
                'description': 'Received 5 or more positive feedback ratings (average >= 4.0)',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.GENTLE_COMMUNICATOR,
                'name': 'Gentle Communicator',
                'description': 'Received five "great communication" reviews (>= 4.5) from people you helped',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.MODEL_CITIZEN,
                'name': 'Model Citizen',
                'description': 'Achieved a >= 4.5 "Safety and Respect" rating',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.RELIABLE_NEIGHBOUR,
                'name': 'Reliable Neighbour',
                'description': 'Achieved a reliability rating higher than 4.5',
                'icon_url': ''
            },
            
            # Social achievement badges
            {
                'badge_type': BadgeType.PEOPLE_TRUST_YOU,
                'name': 'People Trust You',
                'description': 'Gained more than 10 followers',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.PLATE_NOT_EMPTY,
                'name': 'Plate is Not Sent Back Empty',
                'description': 'Both created requests and volunteered to help others',
                'icon_url': ''
            },
            
            # Task creation badges
            {
                'badge_type': BadgeType.FAR_SIGHTED,
                'name': 'Far Sighted',
                'description': 'Created a request with a deadline more than one month away',
                'icon_url': ''
            },
            {
                'badge_type': BadgeType.FULL_GALLERY,
                'name': 'Full Gallery',
                'description': 'Created a request using all 4 allowed photos',
                'icon_url': ''
            },
            
            # Engagement badges
            {
                'badge_type': BadgeType.THE_ICEBREAKER,
                'name': 'The Icebreaker',
                'description': 'Posted your first comment on the platform',
                'icon_url': ''
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for badge_data in badges_data:
            badge, created = Badge.objects.update_or_create(
                badge_type=badge_data['badge_type'],
                defaults={
                    'name': badge_data['name'],
                    'description': badge_data['description'],
                    'icon_url': badge_data['icon_url']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created badge: {badge.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated badge: {badge.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nBadge population complete! Created: {created_count}, Updated: {updated_count}'
            )
        )
