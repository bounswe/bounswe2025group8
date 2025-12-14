"""
Management command to test badge system with sample scenarios
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import (
    RegisteredUser, Task, TaskCategory, TaskStatus, Volunteer,
    VolunteerStatus, Review, UserFollows, Badge, UserBadge
)
from core.services.badge_service import BadgeService


class Command(BaseCommand):
    help = 'Test badge system with various scenarios'

    def handle(self, *args, **options):
        self.stdout.write('=== Badge System Test ===\n')
        
        # Test 1: Caring Contributor Badge (10+ volunteers)
        self.test_caring_contributor()
        
        # Test 2: People Trust You Badge (10+ followers)
        self.test_people_trust_you()
        
        # Test 3: Jack of All Trades (5+ categories)
        self.test_jack_of_all_trades()
        
        # Test 4: Plate Not Empty (create and volunteer)
        self.test_plate_not_empty()
        
        self.stdout.write(self.style.SUCCESS('\n=== All Tests Complete ==='))

    def test_caring_contributor(self):
        """Test Caring Contributor badge"""
        self.stdout.write('\n--- Test: Caring Contributor Badge ---')
        
        # Create or get test user
        user, created = RegisteredUser.objects.get_or_create(
            email='badge_test_user@test.com',
            defaults={
                'name': 'Badge',
                'surname': 'Tester',
                'username': 'badge_tester',
                'phone_number': '+905559999999',
                'password': 'Test123!'
            }
        )
        
        if not created:
            user.set_password('Test123!')
            user.save()
        
        # Create task creator
        creator, _ = RegisteredUser.objects.get_or_create(
            email='task_creator@test.com',
            defaults={
                'name': 'Task',
                'surname': 'Creator',
                'username': 'task_creator',
                'phone_number': '+905558888888',
                'password': 'Test123!'
            }
        )
        
        # Check current accepted volunteers
        current_count = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED
        ).count()
        
        self.stdout.write(f'Current accepted volunteers: {current_count}')
        
        # Create tasks and volunteers to reach 11
        needed = 11 - current_count
        if needed > 0:
            self.stdout.write(f'Creating {needed} more volunteers...')
            for i in range(needed):
                task = Task.objects.create(
                    title=f'Caring Contributor Test Task {i}',
                    description='Test task for badge',
                    category=TaskCategory.OTHER,
                    location='Istanbul',
                    deadline=timezone.now() + timedelta(days=7),
                    creator=creator
                )
                
                Volunteer.objects.create(
                    user=user,
                    task=task,
                    status=VolunteerStatus.ACCEPTED
                )
        
        # Check badge
        result = BadgeService.check_caring_contributor(user)
        self.stdout.write(f'Badge awarded: {result}')
        
        # Check if user has the badge
        has_badge = UserBadge.objects.filter(
            user=user,
            badge__badge_type='CARING_CONTRIBUTOR'
        ).exists()
        
        if has_badge:
            self.stdout.write(self.style.SUCCESS('✓ CARING_CONTRIBUTOR badge verified!'))
        else:
            self.stdout.write(self.style.ERROR('✗ Badge not found!'))

    def test_people_trust_you(self):
        """Test People Trust You badge"""
        self.stdout.write('\n--- Test: People Trust You Badge ---')
        
        user = RegisteredUser.objects.get(email='badge_test_user@test.com')
        
        # Check current followers
        current_followers = UserFollows.objects.filter(following=user).count()
        self.stdout.write(f'Current followers: {current_followers}')
        
        # Create followers to reach 11
        needed = 11 - current_followers
        if needed > 0:
            self.stdout.write(f'Creating {needed} more followers...')
            for i in range(needed):
                follower, _ = RegisteredUser.objects.get_or_create(
                    email=f'follower{i}@test.com',
                    defaults={
                        'name': f'Follower{i}',
                        'surname': 'Test',
                        'username': f'follower{i}',
                        'phone_number': f'+90555777{i:04d}',
                        'password': 'Test123!'
                    }
                )
                
                UserFollows.objects.get_or_create(
                    follower=follower,
                    following=user
                )
        
        # Check badge
        result = BadgeService.check_people_trust_you(user)
        self.stdout.write(f'Badge awarded: {result}')
        
        # Check if user has the badge
        has_badge = UserBadge.objects.filter(
            user=user,
            badge__badge_type='PEOPLE_TRUST_YOU'
        ).exists()
        
        if has_badge:
            self.stdout.write(self.style.SUCCESS('✓ PEOPLE_TRUST_YOU badge verified!'))
        else:
            self.stdout.write(self.style.ERROR('✗ Badge not found!'))

    def test_jack_of_all_trades(self):
        """Test Jack of All Trades badge"""
        self.stdout.write('\n--- Test: Jack of All Trades Badge ---')
        
        user = RegisteredUser.objects.get(email='badge_test_user@test.com')
        creator = RegisteredUser.objects.get(email='task_creator@test.com')
        
        # Get all categories
        categories = [
            TaskCategory.GROCERY_SHOPPING,
            TaskCategory.TUTORING,
            TaskCategory.HOME_REPAIR,
            TaskCategory.MOVING_HELP,
            TaskCategory.HOUSE_CLEANING,
            TaskCategory.OTHER
        ]
        
        # Check current categories
        current_categories = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED
        ).values('task__category').distinct().count()
        
        self.stdout.write(f'Current categories: {current_categories}')
        
        # Create volunteers in each category
        for category in categories:
            # Check if already has this category
            exists = Volunteer.objects.filter(
                user=user,
                task__category=category,
                status=VolunteerStatus.ACCEPTED
            ).exists()
            
            if not exists:
                task = Task.objects.create(
                    title=f'Jack Test - {category}',
                    description='Test task',
                    category=category,
                    location='Istanbul',
                    deadline=timezone.now() + timedelta(days=7),
                    creator=creator
                )
                
                Volunteer.objects.create(
                    user=user,
                    task=task,
                    status=VolunteerStatus.ACCEPTED
                )
        
        # Check badge
        result = BadgeService.check_jack_of_all_trades(user)
        self.stdout.write(f'Badge awarded: {result}')
        
        # Check if user has the badge
        has_badge = UserBadge.objects.filter(
            user=user,
            badge__badge_type='JACK_OF_ALL_TRADES'
        ).exists()
        
        if has_badge:
            self.stdout.write(self.style.SUCCESS('✓ JACK_OF_ALL_TRADES badge verified!'))
        else:
            self.stdout.write(self.style.ERROR('✗ Badge not found!'))

    def test_plate_not_empty(self):
        """Test Plate Not Empty badge"""
        self.stdout.write('\n--- Test: Plate Not Empty Badge ---')
        
        user = RegisteredUser.objects.get(email='badge_test_user@test.com')
        
        # Check if user has created tasks
        has_created = Task.objects.filter(creator=user).exists()
        self.stdout.write(f'Has created tasks: {has_created}')
        
        if not has_created:
            self.stdout.write('Creating a task for user...')
            Task.objects.create(
                title='User Own Task',
                description='Test task created by user',
                category=TaskCategory.OTHER,
                location='Istanbul',
                deadline=timezone.now() + timedelta(days=7),
                creator=user
            )
        
        # Check if user has volunteered
        has_volunteered = Volunteer.objects.filter(
            user=user,
            status=VolunteerStatus.ACCEPTED
        ).exists()
        self.stdout.write(f'Has volunteered: {has_volunteered}')
        
        # Check badge
        result = BadgeService.check_plate_not_empty(user)
        self.stdout.write(f'Badge awarded: {result}')
        
        # Check if user has the badge
        has_badge = UserBadge.objects.filter(
            user=user,
            badge__badge_type='PLATE_NOT_EMPTY'
        ).exists()
        
        if has_badge:
            self.stdout.write(self.style.SUCCESS('✓ PLATE_NOT_EMPTY badge verified!'))
        else:
            self.stdout.write(self.style.ERROR('✗ Badge not found!'))
