from django.test import TestCase
from django.utils import timezone
import datetime
from core.models import RegisteredUser, Task, Volunteer, VolunteerStatus


class VolunteerModelTests(TestCase):
    """Test cases for the Volunteer model"""

    def setUp(self):
        """Set up test data"""
        # Create a task creator
        self.creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creatoruser',
            phone_number='1234567890',
            password='password123'
        )
        
        # Create a volunteer user
        self.volunteer_user = RegisteredUser.objects.create_user(
            email='volunteer@example.com',
            name='Volunteer',
            surname='User',
            username='volunteeruser',
            phone_number='0987654321',
            password='password456'
        )
        
        # Create a second volunteer user
        self.volunteer_user2 = RegisteredUser.objects.create_user(
            email='volunteer2@example.com',
            name='Second',
            surname='Volunteer',
            username='secondvolunteer',
            phone_number='5555555555',
            password='password789'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            category='GROCERY_SHOPPING',
            location='Test Location',
            deadline=timezone.now() + datetime.timedelta(days=3),
            creator=self.creator
        )
        
        # Create a volunteer
        self.volunteer = Volunteer.objects.create(
            user=self.volunteer_user,
            task=self.task,
            status=VolunteerStatus.PENDING
        )

    def test_volunteer_creation(self):
        """Test volunteer creation"""
        self.assertEqual(self.volunteer.user, self.volunteer_user)
        self.assertEqual(self.volunteer.task, self.task)
        self.assertEqual(self.volunteer.status, VolunteerStatus.PENDING)
        
        # Check string representation
        expected_str = f"{self.volunteer_user.username} - {self.task.title} ({VolunteerStatus.PENDING})"
        self.assertEqual(str(self.volunteer), expected_str)

    def test_volunteer_getters(self):
        """Test volunteer getter methods"""
        self.assertEqual(self.volunteer.get_user(), self.volunteer_user)
        self.assertEqual(self.volunteer.get_task(), self.task)
        self.assertEqual(self.volunteer.get_status(), VolunteerStatus.PENDING)
        # Check volunteered_at is close to now
        self.assertTrue(
            (timezone.now() - self.volunteer.get_volunteered_at()).total_seconds() < 60
        )

    def test_volunteer_setters(self):
        """Test volunteer setter methods"""
        self.volunteer.set_status(VolunteerStatus.ACCEPTED)
        
        # Verify changes
        updated_volunteer = Volunteer.objects.get(id=self.volunteer.id)
        self.assertEqual(updated_volunteer.status, VolunteerStatus.ACCEPTED)

    def test_volunteer_for_task_method(self):
        """Test volunteer_for_task class method"""
        # Volunteer for a task
        new_volunteer = Volunteer.volunteer_for_task(
            user=self.volunteer_user2,
            task=self.task
        )
        
        # Verify volunteer was created
        self.assertIsNotNone(new_volunteer)
        self.assertEqual(new_volunteer.user, self.volunteer_user2)
        self.assertEqual(new_volunteer.task, self.task)
        self.assertEqual(new_volunteer.status, VolunteerStatus.PENDING)
        
        # Verify duplicate volunteering returns existing
        duplicate = Volunteer.volunteer_for_task(
            user=self.volunteer_user2,
            task=self.task
        )
        self.assertEqual(duplicate.id, new_volunteer.id)

    def test_volunteer_for_assigned_task(self):
        """Test volunteering for an already assigned task"""
        # Create a task that's already assigned
        assigned_task = Task.objects.create(
            title='Assigned Task',
            description='Already assigned',
            category='HOME_REPAIR',
            location='Somewhere',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.creator,
            status='ASSIGNED',
            assignee=self.volunteer_user
        )
        
        # Try to volunteer
        result = Volunteer.volunteer_for_task(
            user=self.volunteer_user2,
            task=assigned_task
        )
        
        # Should not be allowed
        self.assertIsNone(result)

    def test_withdraw_volunteer(self):
        """Test withdrawing as a volunteer"""
        # First accept the volunteer
        self.volunteer.status = VolunteerStatus.ACCEPTED
        self.volunteer.save()
        
        # Update the task to reflect assignment
        self.task.status = 'ASSIGNED'
        self.task.assignee = self.volunteer_user
        self.task.save()
        
        # Now withdraw
        self.assertTrue(self.volunteer.withdraw_volunteer())
        
        # Verify volunteer status changed
        updated_volunteer = Volunteer.objects.get(id=self.volunteer.id)
        self.assertEqual(updated_volunteer.status, VolunteerStatus.WITHDRAWN)
        
        # Verify task status changed back to POSTED
        updated_task = Task.objects.get(id=self.task.id)
        self.assertEqual(updated_task.status, 'POSTED')
        self.assertIsNone(updated_task.assignee)

    def test_accept_volunteer(self):
        """Test accepting a volunteer"""
        # Create a second volunteer for the same task
        second_volunteer = Volunteer.objects.create(
            user=self.volunteer_user2,
            task=self.task,
            status=VolunteerStatus.PENDING
        )
        
        # Accept the first volunteer
        self.assertTrue(self.volunteer.accept_volunteer())
        
        # Verify volunteer status changed
        updated_volunteer = Volunteer.objects.get(id=self.volunteer.id)
        self.assertEqual(updated_volunteer.status, VolunteerStatus.ACCEPTED)
        
        # Verify task was assigned
        updated_task = Task.objects.get(id=self.task.id)
        self.assertEqual(updated_task.status, 'ASSIGNED')
        self.assertEqual(updated_task.assignee, self.volunteer_user)
        
        # Verify other volunteers were rejected
        updated_second = Volunteer.objects.get(id=second_volunteer.id)
        self.assertEqual(updated_second.status, VolunteerStatus.REJECTED)

    def test_reject_volunteer(self):
        """Test rejecting a volunteer"""
        self.assertTrue(self.volunteer.reject_volunteer())
        
        # Verify volunteer status changed
        updated_volunteer = Volunteer.objects.get(id=self.volunteer.id)
        self.assertEqual(updated_volunteer.status, VolunteerStatus.REJECTED)
        
        # Verify task remained unassigned
        updated_task = Task.objects.get(id=self.task.id)
        self.assertEqual(updated_task.status, 'POSTED')
        self.assertIsNone(updated_task.assignee)


class VolunteerStatusEnumTests(TestCase):
    """Test cases for the VolunteerStatus enumeration"""

    def test_volunteer_status_enum(self):
        """Test VolunteerStatus enumeration"""
        self.assertEqual(VolunteerStatus.PENDING, 'PENDING')
        self.assertEqual(VolunteerStatus.ACCEPTED, 'ACCEPTED')
        self.assertEqual(VolunteerStatus.REJECTED, 'REJECTED')
        self.assertEqual(VolunteerStatus.WITHDRAWN, 'WITHDRAWN')
        
        # Test choices format
        choices = VolunteerStatus.choices
        self.assertTrue(('PENDING', 'Pending') in choices)
        self.assertTrue(('ACCEPTED', 'Accepted') in choices)
        self.assertTrue(('REJECTED', 'Rejected') in choices)
        self.assertTrue(('WITHDRAWN', 'Withdrawn') in choices)