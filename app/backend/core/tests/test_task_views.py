from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
import datetime
from core.models import RegisteredUser, Task, TaskCategory, TaskStatus, Volunteer, VolunteerStatus


class TaskViewSetTests(APITestCase):
    """Test cases for TaskViewSet"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create users
        self.user1 = RegisteredUser.objects.create_user(
            email='user1@example.com',
            name='User',
            surname='One',
            username='user1',
            phone_number='1234567890',
            password='password123'
        )
        
        self.user2 = RegisteredUser.objects.create_user(
            email='user2@example.com',
            name='User',
            surname='Two',
            username='user2',
            phone_number='0987654321',
            password='password456'
        )
        
        # Create tasks
        self.task1 = Task.objects.create(
            title='Test Task 1',
            description='Description 1',
            category=TaskCategory.GROCERY_SHOPPING,
            location='Location 1',
            deadline=timezone.now() + datetime.timedelta(days=3),
            urgency_level=3,
            volunteer_number=1,
            creator=self.user1
        )
        
        self.task2 = Task.objects.create(
            title='Test Task 2',
            description='Description 2',
            category=TaskCategory.HOME_REPAIR,
            location='Location 2',
            deadline=timezone.now() + datetime.timedelta(days=5),
            urgency_level=5,
            volunteer_number=2,
            creator=self.user2
        )

    def test_list_tasks_unauthenticated(self):
        """Test listing tasks without authentication"""
        response = self.client.get('/api/tasks/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return tasks (list is public)
        self.assertIn('results', response.data)

    def test_list_tasks_authenticated(self):
        """Test listing tasks with authentication"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/tasks/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_retrieve_task_unauthenticated(self):
        """Test retrieving a single task without authentication"""
        response = self.client.get(f'/api/tasks/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Single object retrieval uses format_response wrapper
        if 'data' in response.data:
            self.assertEqual(response.data['data']['id'], self.task1.id)
            self.assertEqual(response.data['data']['title'], 'Test Task 1')
        else:
            # Direct serializer response
            self.assertEqual(response.data['id'], self.task1.id)
            self.assertEqual(response.data['title'], 'Test Task 1')

    def test_retrieve_task_authenticated(self):
        """Test retrieving a single task with authentication"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/tasks/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check for data wrapper or direct response
        if 'data' in response.data:
            self.assertEqual(response.data['data']['title'], 'Test Task 1')
        else:
            self.assertEqual(response.data['title'], 'Test Task 1')

    def test_create_task_unauthenticated(self):
        """Test creating a task without authentication - should fail"""
        task_data = {
            'title': 'New Task',
            'description': 'New Description',
            'category': TaskCategory.OTHER,
            'location': 'New Location',
            'deadline': (timezone.now() + datetime.timedelta(days=1)).isoformat(),
            'urgency_level': 2,
            'volunteer_number': 1
        }
        
        response = self.client.post('/api/tasks/', task_data, format='json')
        
        # Should fail because user is not authenticated
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_task_authenticated(self):
        """Test creating a task with authentication"""
        self.client.force_authenticate(user=self.user1)
        
        task_data = {
            'title': 'New Task',
            'description': 'New Description',
            'category': TaskCategory.OTHER,
            'location': 'New Location',
            'deadline': (timezone.now() + datetime.timedelta(days=1)).isoformat(),
            'urgency_level': 2,
            'volunteer_number': 1,
            'is_recurring': False
        }
        
        response = self.client.post('/api/tasks/', task_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['title'], 'New Task')
        self.assertEqual(response.data['data']['creator']['id'], self.user1.id)

    def test_create_task_with_invalid_data(self):
        """Test creating a task with invalid data"""
        self.client.force_authenticate(user=self.user1)
        
        # Missing required fields
        task_data = {
            'title': 'Incomplete Task'
        }
        
        response = self.client.post('/api/tasks/', task_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_task_as_creator(self):
        """Test updating a task as the creator"""
        self.client.force_authenticate(user=self.user1)
        
        update_data = {
            'title': 'Updated Task Title',
            'description': 'Updated Description'
        }
        
        response = self.client.patch(f'/api/tasks/{self.task1.id}/', update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['title'], 'Updated Task Title')

    def test_update_task_as_non_creator(self):
        """Test updating a task as a non-creator - should fail"""
        self.client.force_authenticate(user=self.user2)
        
        update_data = {
            'title': 'Trying to Update'
        }
        
        response = self.client.patch(f'/api/tasks/{self.task1.id}/', update_data, format='json')
        
        # Should fail because user2 is not the creator of task1
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_task_unauthenticated(self):
        """Test updating a task without authentication - should fail"""
        update_data = {
            'title': 'Trying to Update'
        }
        
        response = self.client.patch(f'/api/tasks/{self.task1.id}/', update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_task_as_creator(self):
        """Test deleting (canceling) a task as the creator"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.delete(f'/api/tasks/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify task was cancelled (not deleted)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, TaskStatus.CANCELLED)

    def test_delete_task_as_non_creator(self):
        """Test deleting a task as a non-creator - should fail"""
        self.client.force_authenticate(user=self.user2)
        
        response = self.client.delete(f'/api/tasks/{self.task1.id}/')
        
        # Should fail because user2 is not the creator of task1
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_task_unauthenticated(self):
        """Test deleting a task without authentication - should fail"""
        response = self.client.delete(f'/api/tasks/{self.task1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status"""
        # Create a completed task
        completed_task = Task.objects.create(
            title='Completed Task',
            description='Description',
            category=TaskCategory.OTHER,
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.user1,
            status=TaskStatus.COMPLETED
        )
        
        # Filter by POSTED status
        response = self.client.get('/api/tasks/', {'status': TaskStatus.POSTED})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should not include the completed task
        task_ids = [task['id'] for task in response.data.get('results', response.data.get('data', []))]
        self.assertNotIn(completed_task.id, task_ids)

    def test_filter_tasks_by_category(self):
        """Test filtering tasks by category"""
        response = self.client.get('/api/tasks/', {'category': TaskCategory.GROCERY_SHOPPING})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only include tasks with GROCERY_SHOPPING category
        tasks = response.data.get('results', response.data.get('data', []))
        for task in tasks:
            self.assertEqual(task['category'], TaskCategory.GROCERY_SHOPPING)

    def test_filter_tasks_by_location(self):
        """Test filtering tasks by location"""
        response = self.client.get('/api/tasks/', {'location': 'Location 1'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include task1 which has 'Location 1'
        task_ids = [task['id'] for task in response.data.get('results', response.data.get('data', []))]
        self.assertIn(self.task1.id, task_ids)

    def test_search_tasks(self):
        """Test searching tasks by title or description"""
        response = self.client.get('/api/tasks/', {'search': 'Test Task 1'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include task1
        task_ids = [task['id'] for task in response.data.get('results', response.data.get('data', []))]
        self.assertIn(self.task1.id, task_ids)

    def test_categories_endpoint(self):
        """Test the categories endpoint"""
        response = self.client.get('/api/tasks/categories/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        
        # Check that categories are returned with counts
        categories = response.data['data']
        self.assertTrue(len(categories) > 0)
        
        # Each category should have name, value, and task_count
        for category in categories:
            self.assertIn('name', category)
            self.assertIn('value', category)
            self.assertIn('task_count', category)

    def test_popular_tasks_endpoint(self):
        """Test the popular tasks endpoint"""
        response = self.client.get('/api/tasks/popular/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        
        # Should return tasks ordered by urgency and creation date
        tasks = response.data['data']
        if len(tasks) > 1:
            # Verify tasks are sorted by urgency (descending)
            for i in range(len(tasks) - 1):
                self.assertGreaterEqual(tasks[i]['urgency_level'], tasks[i + 1]['urgency_level'])

    def test_popular_tasks_with_limit(self):
        """Test the popular tasks endpoint with limit parameter"""
        response = self.client.get('/api/tasks/popular/', {'limit': 1})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data['data']), 1)


class CompleteTaskViewTests(APITestCase):
    """Test cases for CompleteTaskView"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create users
        self.creator = RegisteredUser.objects.create_user(
            email='creator@example.com',
            name='Creator',
            surname='User',
            username='creator',
            phone_number='1234567890',
            password='password123'
        )
        
        self.volunteer = RegisteredUser.objects.create_user(
            email='volunteer@example.com',
            name='Volunteer',
            surname='User',
            username='volunteer',
            phone_number='0987654321',
            password='password456'
        )
        
        # Create an assigned task
        self.task = Task.objects.create(
            title='Task to Complete',
            description='Description',
            category=TaskCategory.OTHER,
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.creator,
            assignee=self.volunteer,
            status=TaskStatus.ASSIGNED
        )

    def test_complete_task_as_creator(self):
        """Test completing a task as the creator"""
        self.client.force_authenticate(user=self.creator)
        
        response = self.client.post(f'/api/tasks/{self.task.id}/complete/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        
        # Verify task was marked as completed
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, TaskStatus.COMPLETED)

    def test_complete_task_as_non_creator(self):
        """Test completing a task as a non-creator - should fail"""
        self.client.force_authenticate(user=self.volunteer)
        
        response = self.client.post(f'/api/tasks/{self.task.id}/complete/')
        
        # Should fail because volunteer is not the creator
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_complete_task_unauthenticated(self):
        """Test completing a task without authentication - should fail"""
        response = self.client.post(f'/api/tasks/{self.task.id}/complete/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_complete_posted_task(self):
        """Test completing a task that is still in POSTED status - should fail"""
        self.client.force_authenticate(user=self.creator)
        
        # Create a posted task
        posted_task = Task.objects.create(
            title='Posted Task',
            description='Description',
            category=TaskCategory.OTHER,
            location='Location',
            deadline=timezone.now() + datetime.timedelta(days=1),
            creator=self.creator,
            status=TaskStatus.POSTED
        )
        
        response = self.client.post(f'/api/tasks/{posted_task.id}/complete/')
        
        # Should fail because task is not assigned or in progress
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
