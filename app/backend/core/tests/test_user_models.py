from django.test import TestCase
from django.contrib.auth import get_user_model
from core.models import RegisteredUser, Administrator


class RegisteredUserModelTests(TestCase):
    """Test cases for the RegisteredUser model"""

    def setUp(self):
        """Set up test user"""
        self.user = RegisteredUser.objects.create_user(
            email='test@example.com',
            name='Test',
            surname='User',
            username='testuser',
            phone_number='1234567890',
            password='testpassword123'
        )

    def test_user_creation(self):
        """Test user creation with required fields"""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.name, 'Test')
        self.assertEqual(self.user.surname, 'User')
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.phone_number, '1234567890')
        self.assertTrue(self.user.check_password('testpassword123'))
        
        # Default values
        self.assertEqual(self.user.rating, 0.0)
        self.assertEqual(self.user.completed_task_count, 0)
        self.assertEqual(self.user.location, '')
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)

    def test_user_str_representation(self):
        """Test the string representation of a user"""
        self.assertEqual(str(self.user), 'test@example.com')

    def test_create_superuser(self):
        """Test creating a superuser"""
        admin_user = RegisteredUser.objects.create_superuser(
            email='admin@example.com',
            name='Admin',
            surname='User',
            username='adminuser',
            phone_number='0987654321',
            password='adminpassword123'
        )
        
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_staff)

    def test_user_getters(self):
        """Test user getter methods"""
        self.assertEqual(self.user.get_name(), 'Test')
        self.assertEqual(self.user.get_surname(), 'User')
        self.assertEqual(self.user.get_username(), 'testuser')
        self.assertEqual(self.user.get_email(), 'test@example.com')
        self.assertEqual(self.user.get_phone_number(), '1234567890')
        self.assertEqual(self.user.get_location(), '')
        self.assertEqual(self.user.get_rating(), 0.0)
        self.assertEqual(self.user.get_completed_task_count(), 0)

    def test_user_setters(self):
        """Test user setter methods"""
        self.user.set_name('Updated')
        self.user.set_surname('Name')
        self.user.set_username('updateduser')
        self.user.set_email('updated@example.com')
        self.user.set_phone_number('5555555555')
        self.user.set_location('New Location')
        self.user.set_rating(4.5)
        self.user.set_completed_task_count(10)
        
        # Verify changes
        updated_user = RegisteredUser.objects.get(id=self.user.id)
        self.assertEqual(updated_user.name, 'Updated')
        self.assertEqual(updated_user.surname, 'Name')
        self.assertEqual(updated_user.username, 'updateduser')
        self.assertEqual(updated_user.email, 'updated@example.com')
        self.assertEqual(updated_user.phone_number, '5555555555')
        self.assertEqual(updated_user.location, 'New Location')
        self.assertEqual(updated_user.rating, 4.5)
        self.assertEqual(updated_user.completed_task_count, 10)

    def test_increment_completed_task_count(self):
        """Test incrementing completed task count"""
        initial_count = self.user.completed_task_count
        self.user.increment_completed_task_count()
        
        # Verify increment
        self.assertEqual(self.user.completed_task_count, initial_count + 1)
        
        # Verify database updated
        updated_user = RegisteredUser.objects.get(id=self.user.id)
        self.assertEqual(updated_user.completed_task_count, initial_count + 1)


class AdministratorModelTests(TestCase):
    """Test cases for the Administrator model"""

    def setUp(self):
        """Set up test admin"""
        self.user = RegisteredUser.objects.create_user(
            email='admin@example.com',
            name='Admin',
            surname='User',
            username='adminuser',
            phone_number='1234567890',
            password='adminpassword123'
        )
        self.admin = Administrator.objects.create(user=self.user)

    def test_admin_creation(self):
        """Test administrator creation"""
        self.assertEqual(self.admin.user, self.user)
        self.assertEqual(str(self.admin), f"Admin: {self.user.username}")

    def test_ban_user(self):
        """Test admin can ban a user"""
        regular_user = RegisteredUser.objects.create_user(
            email='regular@example.com',
            name='Regular',
            surname='User',
            username='regularuser',
            phone_number='9876543210',
            password='userpassword123'
        )
        
        # Ban the user
        result = self.admin.ban_user(regular_user)
        
        # Verify user is banned (inactive)
        self.assertTrue(result)
        banned_user = RegisteredUser.objects.get(id=regular_user.id)
        self.assertFalse(banned_user.is_active)


class GuestUserTests(TestCase):
    """Test cases for the Guest user functionality"""

    def test_guest_register(self):
        """Test guest user can register"""
        from core.models.user import Guest
        
        new_user = Guest.register(
            name='New',
            surname='Guest',
            username='newguest',
            email='newguest@example.com',
            phone_number='1122334455',
            password='guestpassword123'
        )
        
        # Verify user was created
        self.assertIsInstance(new_user, RegisteredUser)
        self.assertEqual(new_user.name, 'New')
        self.assertEqual(new_user.email, 'newguest@example.com')
        
        # Verify user can be retrieved from database
        retrieved_user = RegisteredUser.objects.get(email='newguest@example.com')
        self.assertEqual(retrieved_user.id, new_user.id)

    def test_guest_view_public_requests(self):
        """Test guest can view public requests"""
        from core.models.user import Guest
        from core.models.task import Task, TaskCategory, TaskStatus
        from django.utils import timezone
        import datetime
        
        # Create a user
        user = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create some tasks
        Task.objects.create(
            title='Public Task 1',
            description='Description 1',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Location 1',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=user,
            status=TaskStatus.POSTED
        )
        
        Task.objects.create(
            title='Public Task 2',
            description='Description 2',
            category=TaskCategory.TUTORING,
            location='Location 2',
            deadline=timezone.now() + datetime.timedelta(days=2),
            creator=user,
            status=TaskStatus.POSTED
        )
        
        # Get public tasks as guest
        public_tasks = Guest.view_public_requests()
        
        # Verify public tasks are returned
        self.assertEqual(public_tasks.count(), 2)