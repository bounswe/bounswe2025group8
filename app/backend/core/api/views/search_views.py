from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from django.db.models import Q
from core.models import RegisteredUser
from core.api.serializers.user_serializers import UserSerializer
from core.utils import format_response
from django_filters.rest_framework import DjangoFilterBackend


class UserSearchView(generics.ListAPIView):
    """
    Search API for users in the neighborhood assistance system.
    
    Query Parameters:
    - search: Generic search term (searches in name, surname, username, and location)
    - name: Filter by name
    - surname: Filter by surname
    - username: Filter by username
    - location: Filter by location
    - rating_min: Filter by minimum rating (e.g., 4.0)
    - rating_max: Filter by maximum rating (e.g., 5.0)
    """
    queryset = RegisteredUser.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'surname', 'username', 'location']
    ordering_fields = ['name', 'surname', 'username', 'rating', 'completed_task_count']
    ordering = ['rating']  # Default ordering

    def get_queryset(self):
        """
        Optionally restricts the returned users based on query parameters
        beyond what the filter backends provide
        """
        queryset = super().get_queryset()
        
        # Specific field filters
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
            
        surname = self.request.query_params.get('surname')
        if surname:
            queryset = queryset.filter(surname__icontains=surname)
            
        username = self.request.query_params.get('username')
        if username:
            queryset = queryset.filter(username__icontains=username)
            
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
            
        # Rating range filters
        rating_min = self.request.query_params.get('rating_min')
        if rating_min:
            try:
                rating_min = float(rating_min)
                queryset = queryset.filter(rating__gte=rating_min)
            except (ValueError, TypeError):
                pass
                
        rating_max = self.request.query_params.get('rating_max')
        if rating_max:
            try:
                rating_max = float(rating_max)
                queryset = queryset.filter(rating__lte=rating_max)
            except (ValueError, TypeError):
                pass
                
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return Response(format_response(
                status='success',
                message='Users retrieved successfully.',
                data=paginated_response.data
            ))
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(format_response(
            status='success',
            message='Users retrieved successfully.',
            data=serializer.data
        ))
