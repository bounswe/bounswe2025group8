from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from core.models import RegisteredUser, UserFollows


class UserFollowingTests(APITestCase):
    """Test cases for user following functionality"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test users
        self.user1 = RegisteredUser.objects.create_user(
            email='user1@example.com',
            name='User',
            surname='One',
            username='user1',
            phone_number='1234567890',
            password='TestPassword123!'
        )
        
        self.user2 = RegisteredUser.objects.create_user(
            email='user2@example.com',
            name='User',
            surname='Two',
            username='user2',
            phone_number='0987654321',
            password='TestPassword123!'
        )
        
        self.user3 = RegisteredUser.objects.create_user(
            email='user3@example.com',
            name='User',
            surname='Three',
            username='user3',
            phone_number='5551234567',
            password='TestPassword123!'
        )
        
        # Authenticate with user1 for most tests
        self.client.force_authenticate(user=self.user1)

    def test_follow_user_success(self):
        """Test successfully following a user"""
        response = self.client.post(f'/api/users/{self.user2.id}/follow/')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('following', response.data['message'].lower())
        
        # Verify follow relationship exists
        self.assertTrue(
            UserFollows.objects.filter(
                follower=self.user1, 
                following=self.user2
            ).exists()
        )

    def test_follow_self_fails(self):
        """Test that a user cannot follow themselves"""
        response = self.client.post(f'/api/users/{self.user1.id}/follow/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('cannot follow yourself', response.data['message'].lower())

    def test_follow_already_following_fails(self):
        """Test that following a user twice fails"""
        # First follow
        UserFollows.objects.create(follower=self.user1, following=self.user2)
        
        # Try to follow again
        response = self.client.post(f'/api/users/{self.user2.id}/follow/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('already following', response.data['message'].lower())

    def test_unfollow_user_success(self):
        """Test successfully unfollowing a user"""
        # First create a follow relationship
        UserFollows.objects.create(follower=self.user1, following=self.user2)
        
        response = self.client.post(f'/api/users/{self.user2.id}/unfollow/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('unfollowed', response.data['message'].lower())
        
        # Verify follow relationship no longer exists
        self.assertFalse(
            UserFollows.objects.filter(
                follower=self.user1, 
                following=self.user2
            ).exists()
        )

    def test_unfollow_self_fails(self):
        """Test that a user cannot unfollow themselves"""
        response = self.client.post(f'/api/users/{self.user1.id}/unfollow/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('cannot unfollow yourself', response.data['message'].lower())

    def test_unfollow_not_following_fails(self):
        """Test that unfollowing a user you don't follow fails"""
        response = self.client.post(f'/api/users/{self.user2.id}/unfollow/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('not following', response.data['message'].lower())

    def test_get_followers_list(self):
        """Test retrieving a user's followers list"""
        # Create follow relationships (user2 and user3 follow user1)
        UserFollows.objects.create(follower=self.user2, following=self.user1)
        UserFollows.objects.create(follower=self.user3, following=self.user1)
        
        response = self.client.get(f'/api/users/{self.user1.id}/followers/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results (paginated)
        if 'results' in response.data:
            results = response.data['results']
        else:
            results = response.data.get('data', [])
        
        self.assertEqual(len(results), 2)
        
        # Verify the correct users are in the followers list
        follower_usernames = {follower['username'] for follower in results}
        self.assertIn('user2', follower_usernames)
        self.assertIn('user3', follower_usernames)

    def test_get_following_list(self):
        """Test retrieving a user's following list"""
        # Create follow relationships (user1 follows user2 and user3)
        UserFollows.objects.create(follower=self.user1, following=self.user2)
        UserFollows.objects.create(follower=self.user1, following=self.user3)
        
        response = self.client.get(f'/api/users/{self.user1.id}/following/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results (paginated)
        if 'results' in response.data:
            results = response.data['results']
        else:
            results = response.data.get('data', [])
        
        self.assertEqual(len(results), 2)
        
        # Verify the correct users are in the following list
        following_usernames = {user['username'] for user in results}
        self.assertIn('user2', following_usernames)
        self.assertIn('user3', following_usernames)

    def test_empty_followers_list(self):
        """Test retrieving followers list when user has no followers"""
        response = self.client.get(f'/api/users/{self.user1.id}/followers/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results (paginated)
        if 'results' in response.data:
            results = response.data['results']
        else:
            results = response.data.get('data', [])
        
        self.assertEqual(len(results), 0)

    def test_empty_following_list(self):
        """Test retrieving following list when user is not following anyone"""
        response = self.client.get(f'/api/users/{self.user1.id}/following/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results (paginated)
        if 'results' in response.data:
            results = response.data['results']
        else:
            results = response.data.get('data', [])
        
        self.assertEqual(len(results), 0)

    def test_user_profile_includes_follower_counts(self):
        """Test that user profile includes follower and following counts"""
        # Create some follow relationships
        UserFollows.objects.create(follower=self.user2, following=self.user1)
        UserFollows.objects.create(follower=self.user3, following=self.user1)
        UserFollows.objects.create(follower=self.user1, following=self.user2)
        
        response = self.client.get(f'/api/users/{self.user1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('followers_count', response.data)
        self.assertIn('following_count', response.data)
        self.assertEqual(response.data['followers_count'], 2)
        self.assertEqual(response.data['following_count'], 1)

    def test_user_profile_includes_is_following_flag(self):
        """Test that user profile includes is_following flag"""
        # user1 follows user2
        UserFollows.objects.create(follower=self.user1, following=self.user2)
        
        # Check user2's profile (should show is_following=True)
        response = self.client.get(f'/api/users/{self.user2.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('is_following', response.data)
        self.assertTrue(response.data['is_following'])
        
        # Check user3's profile (should show is_following=False)
        response = self.client.get(f'/api/users/{self.user3.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('is_following', response.data)
        self.assertFalse(response.data['is_following'])

    def test_follow_unauthenticated_fails(self):
        """Test that unauthenticated users cannot follow"""
        self.client.force_authenticate(user=None)
        
        response = self.client.post(f'/api/users/{self.user2.id}/follow/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_followers_serializer_includes_profile_photo(self):
        """Test that followers serializer includes profile photo field"""
        UserFollows.objects.create(follower=self.user2, following=self.user1)
        
        response = self.client.get(f'/api/users/{self.user1.id}/followers/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if response contains results (paginated)
        if 'results' in response.data:
            results = response.data['results']
        else:
            results = response.data.get('data', [])
        
        self.assertGreater(len(results), 0)
        self.assertIn('profile_photo', results[0])
        self.assertIn('followed_at', results[0])

    def test_user_follows_model_prevents_duplicate_follows(self):
        """Test that the UserFollows model prevents duplicate follow relationships"""
        # Create first follow
        UserFollows.objects.create(follower=self.user1, following=self.user2)
        
        # Try to create duplicate follow
        with self.assertRaises(Exception):
            UserFollows.objects.create(follower=self.user1, following=self.user2)

    def test_user_follows_model_prevents_self_follow(self):
        """Test that the UserFollows model prevents self-following"""
        with self.assertRaises(Exception):
            follow = UserFollows(follower=self.user1, following=self.user1)
            follow.save()


class UserFollowingIntegrationTests(APITestCase):
    """Integration tests for user following with other features"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test users
        self.user1 = RegisteredUser.objects.create_user(
            email='integration1@example.com',
            name='Integration',
            surname='User1',
            username='integrationuser1',
            phone_number='1111111111',
            password='TestPassword123!'
        )
        
        self.user2 = RegisteredUser.objects.create_user(
            email='integration2@example.com',
            name='Integration',
            surname='User2',
            username='integrationuser2',
            phone_number='2222222222',
            password='TestPassword123!'
        )
        
        self.client.force_authenticate(user=self.user1)

    def test_follow_unfollow_workflow(self):
        """Test complete follow-unfollow workflow"""
        # Initial state - not following
        response = self.client.get(f'/api/users/{self.user2.id}/')
        self.assertFalse(response.data['is_following'])
        self.assertEqual(response.data['followers_count'], 0)
        
        # Follow user
        response = self.client.post(f'/api/users/{self.user2.id}/follow/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify following state
        response = self.client.get(f'/api/users/{self.user2.id}/')
        self.assertTrue(response.data['is_following'])
        self.assertEqual(response.data['followers_count'], 1)
        
        # Unfollow user
        response = self.client.post(f'/api/users/{self.user2.id}/unfollow/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify unfollowed state
        response = self.client.get(f'/api/users/{self.user2.id}/')
        self.assertFalse(response.data['is_following'])
        self.assertEqual(response.data['followers_count'], 0)

    def test_mutual_following(self):
        """Test mutual following between two users"""
        # user1 follows user2
        UserFollows.objects.create(follower=self.user1, following=self.user2)
        
        # user2 follows user1
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(f'/api/users/{self.user1.id}/follow/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify mutual following
        response = self.client.get(f'/api/users/{self.user1.id}/')
        self.assertTrue(response.data['is_following'])
        self.assertEqual(response.data['followers_count'], 1)
        self.assertEqual(response.data['following_count'], 1)
