from django.core.management.base import BaseCommand
from core.models import Badge, BadgeType


class Command(BaseCommand):
    help = 'Creates all badge definitions in the database'

    def handle(self, *args, **options):
        self.stdout.write('Creating badges...')
        
        badges_data = [
            # Volunteer achievement badges
            {
                'badge_type': BadgeType.NEIGHBORHOOD_HERO,
                'name': 'Neighborhood Hero',
                'description': 'Completed 50 tasks in your neighborhood. You are a true community champion!',
                'icon_url': '/badges/neighborhood_hero.png'
            },
            {
                'badge_type': BadgeType.JACK_OF_ALL_TRADES,
                'name': 'Jack of All Trades',
                'description': 'Volunteered for tasks in at least 5 different categories. Your versatility is impressive!',
                'icon_url': '/badges/jack_of_all_trades.png'
            },
            {
                'badge_type': BadgeType.SELECTED_VOLUNTEER,
                'name': 'Selected Volunteer',
                'description': 'Been selected as the volunteer for 10 different tasks. People trust your skills!',
                'icon_url': '/badges/selected_volunteer.png'
            },
            {
                'badge_type': BadgeType.CARING_CONTRIBUTOR,
                'name': 'Caring Contributor',
                'description': 'Helped 10 different people in your community. Your kindness makes a difference!',
                'icon_url': '/badges/caring_contributor.png'
            },
            {
                'badge_type': BadgeType.HELP_AND_TRAVEL,
                'name': 'Help & Travel',
                'description': 'Volunteered in at least 3 different districts. You go the extra mile to help!',
                'icon_url': '/badges/help_and_travel.png'
            },
            {
                'badge_type': BadgeType.RAPID_RESPONDER,
                'name': 'Rapid Responder',
                'description': 'Applied to help within 1 hour of task posting 10 times. You are quick to help!',
                'icon_url': '/badges/rapid_responder.png'
            },
            {
                'badge_type': BadgeType.THE_UNSUNG_HERO,
                'name': 'The Unsung Hero',
                'description': 'Completed 5 tasks that no one else applied for. You help when others won\'t!',
                'icon_url': '/badges/unsung_hero.png'
            },
            {
                'badge_type': BadgeType.THE_LIFESAVER,
                'name': 'The Lifesaver',
                'description': 'Completed 10 urgent (Level 5) tasks. You are there when it matters most!',
                'icon_url': '/badges/lifesaver.png'
            },
            {
                'badge_type': BadgeType.NIGHT_OWL,
                'name': 'Night Owl',
                'description': 'Completed 5 tasks between 10 PM and 6 AM. You help at any hour!',
                'icon_url': '/badges/night_owl.png'
            },
            {
                'badge_type': BadgeType.THE_HOLIDAY_HERO,
                'name': 'The Holiday Hero',
                'description': 'Volunteered on 3 national holidays. Even during celebrations, you care!',
                'icon_url': '/badges/holiday_hero.png'
            },
            
            # Review/Rating achievement badges
            {
                'badge_type': BadgeType.JUST_PERFECT,
                'name': 'Just Perfect',
                'description': 'Received 5-star ratings on all criteria in 10 different reviews. Excellence is your standard!',
                'icon_url': '/badges/just_perfect.png'
            },
            {
                'badge_type': BadgeType.RISING_HELPER,
                'name': 'Rising Helper',
                'description': 'Improved your average rating from below 4.0 to above 4.5. Growth mindset at work!',
                'icon_url': '/badges/rising_helper.png'
            },
            {
                'badge_type': BadgeType.GENTLE_COMMUNICATOR,
                'name': 'Gentle Communicator',
                'description': 'Received 5-star communication ratings 15 times. You know how to connect!',
                'icon_url': '/badges/gentle_communicator.png'
            },
            {
                'badge_type': BadgeType.MODEL_CITIZEN,
                'name': 'Model Citizen',
                'description': 'Maintained an average rating of 4.8 or higher with at least 20 reviews. You set the standard!',
                'icon_url': '/badges/model_citizen.png'
            },
            {
                'badge_type': BadgeType.RELIABLE_NEIGHBOUR,
                'name': 'Reliable Neighbour',
                'description': 'Received 5-star reliability ratings 20 times. People know they can count on you!',
                'icon_url': '/badges/reliable_neighbour.png'
            },
            
            # Social achievement badges
            {
                'badge_type': BadgeType.PEOPLE_TRUST_YOU,
                'name': 'People Trust You',
                'description': 'Have 25 followers in the community. Your reputation speaks for itself!',
                'icon_url': '/badges/people_trust_you.png'
            },
            {
                'badge_type': BadgeType.PLATE_NOT_EMPTY,
                'name': 'Plate is Not Sent Back Empty',
                'description': 'Received thank-you comments on 15 completed tasks. Gratitude follows your help!',
                'icon_url': '/badges/plate_not_empty.png'
            },
            
            # Task creation badges
            {
                'badge_type': BadgeType.FAR_SIGHTED,
                'name': 'Far Sighted',
                'description': 'Created 10 tasks with deadlines more than 2 weeks in advance. You plan ahead!',
                'icon_url': '/badges/far_sighted.png'
            },
            {
                'badge_type': BadgeType.FULL_GALLERY,
                'name': 'Full Gallery',
                'description': 'Added photos to 15 different task requests. A picture is worth a thousand words!',
                'icon_url': '/badges/full_gallery.png'
            },
            
            # Engagement badges
            {
                'badge_type': BadgeType.THE_ICEBREAKER,
                'name': 'The Icebreaker',
                'description': 'Posted your first comment on the platform',
                'icon_url': '/badges/icebreaker.png'
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
        
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} new badges'))
        self.stdout.write(self.style.SUCCESS(f'Updated {updated_count} existing badges'))
        self.stdout.write(self.style.SUCCESS('Badge creation completed!'))
