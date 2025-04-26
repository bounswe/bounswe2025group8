from django.db.models import Q
from django.utils import timezone
from .task import Task, TaskCategory
from .user import RegisteredUser


class Search:
    """
    Search utility class - Not a database model, but a utility class
    for searching tasks and users
    """
    
    @staticmethod
    def search_by_keyword(keyword):
        """
        Search tasks by keyword in title or description
        
        Args:
            keyword: Search term
            
        Returns:
            QuerySet of matching Task objects
        """
        if not keyword:
            return Task.objects.none()
        
        return Task.objects.filter(
            Q(title__icontains=keyword) | 
            Q(description__icontains=keyword)
        ).filter(
            deadline__gt=timezone.now()
        )
    
    @staticmethod
    def search_by_location(location):
        """
        Search tasks by location
        
        Args:
            location: Location search term
            
        Returns:
            QuerySet of matching Task objects
        """
        if not location:
            return Task.objects.none()
        
        return Task.objects.filter(
            location__icontains=location
        ).filter(
            deadline__gt=timezone.now()
        )
    
    @staticmethod
    def search_by_category(category):
        """
        Search tasks by category
        
        Args:
            category: TaskCategory value
            
        Returns:
            QuerySet of matching Task objects
        """
        if not category or category not in [c[0] for c in TaskCategory.choices]:
            return Task.objects.none()
        
        return Task.objects.filter(
            category=category
        ).filter(
            deadline__gt=timezone.now()
        )
    
    @staticmethod
    def search_by_tags(tags):
        """
        Search tasks by tags
        
        Args:
            tags: List of tag names
            
        Returns:
            QuerySet of matching Task objects
        """
        if not tags:
            return Task.objects.none()
        
        query = Task.objects.filter(deadline__gt=timezone.now())
        
        for tag in tags:
            query = query.filter(tags__name=tag)
            
        return query
    
    @staticmethod
    def search_users(keyword):
        """
        Search users by name, surname, or username
        
        Args:
            keyword: Search term
            
        Returns:
            QuerySet of matching RegisteredUser objects
        """
        if not keyword:
            return RegisteredUser.objects.none()
        
        return RegisteredUser.objects.filter(
            Q(name__icontains=keyword) | 
            Q(surname__icontains=keyword) | 
            Q(username__icontains=keyword)
        )
    
    @staticmethod
    def filter_by_rating(min_rating):
        """
        Filter users by minimum rating
        
        Args:
            min_rating: Minimum rating value
            
        Returns:
            QuerySet of matching RegisteredUser objects
        """
        if min_rating < 1.0 or min_rating > 5.0:
            return RegisteredUser.objects.none()
        
        return RegisteredUser.objects.filter(rating__gte=min_rating)
    
    @staticmethod
    def sort_by_deadline(ascending=True):
        """
        Sort tasks by deadline
        
        Args:
            ascending: If True, sort from earliest to latest
            
        Returns:
            QuerySet of Task objects sorted by deadline
        """
        order_by = 'deadline' if ascending else '-deadline'
        return Task.objects.filter(
            deadline__gt=timezone.now()
        ).order_by(order_by)
    
    @staticmethod
    def sort_by_proximity(location):
        """
        Sort tasks by proximity to a location
        This is a placeholder as real geo-sorting would require
        geocoding and distance calculations
        
        Args:
            location: Reference location
            
        Returns:
            QuerySet of Task objects
        """
        # In a real implementation, this would use geocoding and geospatial queries
        # For now, just return tasks that contain the location string
        return Task.objects.filter(
            location__icontains=location
        ).filter(
            deadline__gt=timezone.now()
        )
    
    @staticmethod
    def complex_search(keywords=None, location=None, category=None, 
                      tags=None, min_rating=None, sort_by='deadline'):
        """
        Combined search with multiple criteria
        
        Args:
            keywords: Search terms for title/description
            location: Location search term
            category: TaskCategory value
            tags: List of tag names
            min_rating: Minimum creator rating
            sort_by: Field to sort by ('deadline', 'rating', 'location')
            
        Returns:
            QuerySet of matching Task objects
        """
        # Start with all active tasks
        query = Task.objects.filter(
            status='POSTED',
            deadline__gt=timezone.now()
        )
        
        # Apply filters one by one
        if keywords:
            query = query.filter(
                Q(title__icontains=keywords) | 
                Q(description__icontains=keywords)
            )
            
        if location:
            query = query.filter(location__icontains=location)
            
        if category and category in [c[0] for c in TaskCategory.choices]:
            query = query.filter(category=category)
            
        if tags:
            for tag in tags:
                query = query.filter(tags__name=tag)
                
        if min_rating is not None and min_rating >= 1.0 and min_rating <= 5.0:
            query = query.filter(creator__rating__gte=min_rating)
        
        # Apply sorting
        if sort_by == 'rating':
            query = query.order_by('-creator__rating', 'deadline')
        elif sort_by == 'location':
            # Simplified location sorting
            if location:
                # Prioritize exact matches first
                query = sorted(
                    query,
                    key=lambda t: 0 if t.location.lower() == location.lower() else 1
                )
            else:
                query = query.order_by('deadline')
        else:  # Default: deadline
            query = query.order_by('deadline')
            
        return query