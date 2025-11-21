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
        """Test volunteering for task that is at capacity"""
        # Create a task that requires only 1 volunteer and is already assigned
        assigned_task = Task.objects.create(
            title='Assigned Task',
            description='Already assigned',
            category='HOME_REPAIR',
            location='Somewhere',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.creator,
            volunteer_number=1
        )
        
        # Accept a volunteer so task is at capacity
        first_volunteer = Volunteer.volunteer_for_task(
            user=self.volunteer_user,
            task=assigned_task
        )
        first_volunteer.accept_volunteer()
        
        # Try to volunteer when task is at capacity
        result = Volunteer.volunteer_for_task(
            user=self.volunteer_user2,
            task=assigned_task
        )
        
        # Should not be allowed because task is at capacity (1/1)
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
        self.assertTrue(self.volunteer_user in updated_task.assignees.all())
        
        # Second volunteer should still be PENDING (not automatically rejected)
        # unless manually rejected or task is at capacity
        updated_second = Volunteer.objects.get(id=second_volunteer.id)
        self.assertEqual(updated_second.status, VolunteerStatus.PENDING)

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

    def test_multiple_volunteers_for_same_task(self):
        """Test multiple volunteers applying for the same task"""
        # Create additional volunteer users
        volunteer3 = RegisteredUser.objects.create_user(
            email='volunteer3@example.com',
            name='Third',
            surname='Volunteer',
            username='thirdvolunteer',
            phone_number='6666666666',
            password='password111'
        )
        
        # Multiple users volunteer for the same task
        vol_app2 = Volunteer.volunteer_for_task(
            user=self.volunteer_user2,
            task=self.task
        )
        
        vol_app3 = Volunteer.volunteer_for_task(
            user=volunteer3,
            task=self.task
        )
        
        # Verify all applications exist with PENDING status
        self.assertEqual(self.volunteer.status, VolunteerStatus.PENDING)
        self.assertEqual(vol_app2.status, VolunteerStatus.PENDING)
        self.assertEqual(vol_app3.status, VolunteerStatus.PENDING)
        
        # Verify task has 3 volunteer applications
        total_volunteers = Volunteer.objects.filter(task=self.task).count()
        self.assertEqual(total_volunteers, 3)
        
        # Accept the second volunteer
        vol_app2.accept_volunteer()
        
        # Verify only one accepted
        vol_app2.refresh_from_db()
        self.assertEqual(vol_app2.status, VolunteerStatus.ACCEPTED)
        
        # Others may remain PENDING if task needs multiple volunteers
        # or be REJECTED if task only needs one volunteer

    def test_volunteer_cannot_apply_twice(self):
        """Test that a user cannot volunteer twice for the same task"""
        # Try to volunteer again with the same user
        duplicate = Volunteer.volunteer_for_task(
            user=self.volunteer_user,
            task=self.task
        )
        
        # Should return existing volunteer application
        self.assertEqual(duplicate.id, self.volunteer.id)
        
        # Verify only one volunteer entry exists for this user-task pair
        volunteer_count = Volunteer.objects.filter(
            user=self.volunteer_user,
            task=self.task
        ).count()
        self.assertEqual(volunteer_count, 1)


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
