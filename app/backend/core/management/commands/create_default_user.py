from django.core.management.base import BaseCommand
from core.models import RegisteredUser


class Command(BaseCommand):
    help = 'Creates a default user for testing purposes'

    def handle(self, *args, **options):
        # Default user credentials
        email = 'suzan.uskudarli@gmail.com'
        username = 'suzan.uskudarli'
        name = 'Suzan'
        surname = 'Uskudarli'
        phone_number = '+905555555555'
        password = 'suzanUskudarli123!'

        # Check if user already exists by email
        if RegisteredUser.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email "{email}" already exists!')
            )
            user = RegisteredUser.objects.get(email=email)
            self.stdout.write(
                self.style.SUCCESS(f'Existing user: {user.username} ({user.email})')
            )
            return

        # Check if username is taken
        if RegisteredUser.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User with username "{username}" already exists!')
            )
            return

        # Create regular user
        try:
            user = RegisteredUser.objects.create_user(
                email=email,
                name=name,
                surname=surname,
                username=username,
                phone_number=phone_number,
                password=password
            )

            self.stdout.write(self.style.SUCCESS('Successfully created default user!'))
            self.stdout.write(self.style.SUCCESS('=' * 50))
            self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
            self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
            self.stdout.write(self.style.SUCCESS(f'Name: {name} {surname}'))
            self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
            self.stdout.write(self.style.SUCCESS(f'Phone: {phone_number}'))
            self.stdout.write(self.style.SUCCESS('=' * 50))
            self.stdout.write(
                self.style.WARNING('IMPORTANT: This is a test user. Change the password in production!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating default user: {str(e)}')
            )
