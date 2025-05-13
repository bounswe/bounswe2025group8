from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from core.models import Bookmark, Task
from core.api.serializers.bookmark_serializers import (
    BookmarkSerializer, BookmarkCreateSerializer, BookmarkUpdateSerializer
)
from core.permissions import IsOwner
from core.utils import format_response, paginate_results


class BookmarkViewSet(viewsets.ModelViewSet):
    """ViewSet for managing bookmarks"""
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Only owners can view, update, or delete their bookmarks
        """
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwner()]
        else:
            return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Return user's bookmarks"""
        return Bookmark.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return BookmarkCreateSerializer
        elif self.action in ['update', 'partial_update', 'update_tags']:
            return BookmarkUpdateSerializer
        return BookmarkSerializer
    
    def list(self, request, *args, **kwargs):
        """Handle GET requests to list user's bookmarks"""
        # Filter by tag if provided
        tag_param = request.query_params.get('tag')
        if tag_param:
            bookmarks = self.get_queryset().filter(tags__name=tag_param)
        else:
            bookmarks = self.get_queryset()
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(bookmarks.order_by('-timestamp'), page=page, items_per_page=limit)
        
        # Serialize bookmarks
        serializer = self.get_serializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'bookmarks': serializer.data,
                'pagination': paginated['pagination']
            }
        ))
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to create a bookmark"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        bookmark = serializer.save()
        
        # Return response with the created bookmark
        response_serializer = BookmarkSerializer(bookmark)
        return Response(format_response(
            status='success',
            message='Task bookmarked successfully.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Handle PUT/PATCH requests to update bookmark tags"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        bookmark = serializer.save()
        
        # Return response with the updated bookmark
        response_serializer = BookmarkSerializer(bookmark)
        return Response(format_response(
            status='success',
            message='Bookmark tags updated successfully.',
            data=response_serializer.data
        ))
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests to remove a bookmark"""
        instance = self.get_object()
        
        # Remove bookmark
        instance.remove_bookmark()
        
        return Response(format_response(
            status='success',
            message='Bookmark removed successfully.'
        ), status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], url_path='update-tags')
    def update_tags(self, request, pk=None):
        """Custom action to update bookmark tags"""
        bookmark = self.get_object()
        serializer = self.get_serializer(bookmark, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_bookmark = serializer.save()
        
        # Return response with the updated bookmark
        response_serializer = BookmarkSerializer(updated_bookmark)
        return Response(format_response(
            status='success',
            message='Bookmark tags updated successfully.',
            data=response_serializer.data
        ))