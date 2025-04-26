from django.db import models
from django.utils import timezone
from .task import Task


class Feed:
    """
    Feed class - Not a database model as it's a dynamic view
    of tasks based on user's preferences and location
    """
    
    def __init__(self, user):
        """Initialize feed with user"""
        self.user = user
    
    def get_user(self):
        """Get feed owner"""
        return self.user
    
    def load_feed(self, page=1, items_per_page=20):
        """
        Load personalized feed based on user preferences
        
        Args:
            page: Page number for pagination
            items_per_page: Number of items per page
            
        Returns:
            List of Task objects
        """
        # Calculate offset for pagination
        offset = (page - 1) * items_per_page
        
        # Base query for available tasks
        query = Task.objects.filter(
            status='POSTED',
            deadline__gt=timezone.now()
        ).exclude(
            creator=self.user  # Exclude user's own tasks
        ).order_by('deadline')  # Sort by deadline (earliest first)
        
        # Apply pagination
        tasks = query[offset:offset + items_per_page]
        
        return tasks
    
    def filter_feed(self, filter_criteria):
        """
        Filter the feed based on criteria
        
        Args:
            filter_criteria: Dictionary with filter parameters
                - category: Task category
                - location: Task location
                - tags: List of tag names
                - urgency: Minimum urgency level
                
        Returns:
            Filtered list of Task objects
        """
        query = Task.objects.filter(
            status='POSTED',
            deadline__gt=timezone.now()
        ).exclude(
            creator=self.user
        )
        
        # Apply filters based on criteria
        if 'category' in filter_criteria:
            query = query.filter(category=filter_criteria['category'])
            
        if 'location' in filter_criteria:
            query = query.filter(location__icontains=filter_criteria['location'])
            
        if 'tags' in filter_criteria and filter_criteria['tags']:
            for tag in filter_criteria['tags']:
                query = query.filter(tags__name=tag)
                
        if 'urgency' in filter_criteria:
            query = query.filter(urgency_level__gte=filter_criteria['urgency'])
            
        if 'deadline_before' in filter_criteria:
            query = query.filter(deadline__lte=filter_criteria['deadline_before'])
            
        if 'deadline_after' in filter_criteria:
            query = query.filter(deadline__gte=filter_criteria['deadline_after'])
        
        # Apply sorting
        sort_by = filter_criteria.get('sort_by', 'deadline')
        if sort_by == 'location':
            # This would require more complex location-based sorting
            # For simplicity, we'll just sort by deadline
            query = query.order_by('deadline')
        elif sort_by == 'urgency':
            query = query.order_by('-urgency_level')
        else:  # Default: deadline
            query = query.order_by('deadline')
        
        return query
    
    def refresh_feed(self):
        """Refresh the feed with latest tasks"""
        return self.load_feed(page=1)
    
    def get_bookmarked_tasks(self):
        """Get tasks bookmarked by the user"""
        from .bookmark import Bookmark
        bookmarks = Bookmark.objects.filter(user=self.user)
        return [bookmark.task for bookmark in bookmarks]
    
    def get_followed_users_tasks(self):
        """
        Get tasks from users that the current user follows
        This would require a UserFollows model to be implemented
        """
        # Placeholder implementation
        return []