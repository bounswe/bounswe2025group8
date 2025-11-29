from django.core.management.base import BaseCommand
from core.models import RegisteredUser, Administrator


class Command(BaseCommand):
    help = 'Creates an admin user for testing purposes'

    def handle(self, *args, **options):
        # Admin user credentials
        email = 'admin@nab.com'
        username = 'admin'
        name = 'Admin'
        surname = 'User'
        phone_number = '+905551234567'
        password = 'Admin123!'

        # Check if admin user already exists
        if RegisteredUser.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'Admin user with email "{email}" already exists!')
            )
            admin_user = RegisteredUser.objects.get(email=email)
            self.stdout.write(
                self.style.SUCCESS(f'Existing admin user: {admin_user.username} ({admin_user.email})')
            )

            # Ensure Administrator record exists for the existing user
            try:
                Administrator.objects.get_or_create(user=admin_user)
                self.stdout.write(
                    self.style.SUCCESS('✓ Administrator record verified/created')
                )
            except Exception as admin_error:
                self.stdout.write(
                    self.style.ERROR(f'Error creating Administrator record: {str(admin_error)}')
                )
            return

        if RegisteredUser.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User with username "{username}" already exists!')
            )
            return

        # Create superuser
        try:
            admin_user = RegisteredUser.objects.create_superuser(
                email=email,
                name=name,
                surname=surname,
                username=username,
                phone_number=phone_number,
                password=password
            )

            # Create Administrator record for custom admin permissions
            try:
                Administrator.objects.create(user=admin_user)
                self.stdout.write(
                    self.style.SUCCESS('✓ Created Administrator record')
                )
            except Exception as admin_error:
                self.stdout.write(
                    self.style.WARNING(f'Warning: Could not create Administrator record: {str(admin_error)}')
                )

            self.stdout.write(self.style.SUCCESS('Successfully created admin user!'))
            self.stdout.write(self.style.SUCCESS('=' * 50))
            self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
            self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
            self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
            self.stdout.write(self.style.SUCCESS(f'Phone: {phone_number}'))
            self.stdout.write(self.style.SUCCESS('=' * 50))
            self.stdout.write(
                self.style.WARNING('IMPORTANT: Change the password after first login!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {str(e)}')
            )
