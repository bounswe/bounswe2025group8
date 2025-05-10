from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from core.models import Notification
from core.api.serializers.notification_serializers import (
    NotificationSerializer, NotificationCreateSerializer, NotificationUpdateSerializer
)
from core.permissions import IsOwner
from core.utils import format_response, paginate_results


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Only owners can view, update, or delete their notifications
        """
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy', 'mark_as_read', 'mark_all_as_read']:
            return [permissions.IsAuthenticated(), IsOwner()]
        else:
            return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Return user's notifications"""
        return Notification.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return NotificationCreateSerializer
        elif self.action in ['update', 'partial_update', 'mark_as_read', 'mark_all_as_read']:
            return NotificationUpdateSerializer
        return NotificationSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to create a notification"""
        # Check if user has admin permission
        if not hasattr(request.user, 'administrator'):
            return Response(format_response(
                status='error',
                message='Only administrators can create notifications.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notification = serializer.save()
        
        # Return response with the created notification
        response_serializer = NotificationSerializer(notification)
        return Response(format_response(
            status='success',
            message='Notification sent.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        """Handle GET requests to list user's notifications"""
        # Get unread parameter
        unread_only = request.query_params.get('unread', 'false').lower() == 'true'
        
        # Filter notifications
        if unread_only:
            notifications = self.get_queryset().filter(is_read=False)
        else:
            notifications = self.get_queryset()
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(notifications.order_by('-timestamp'), page=page, items_per_page=limit)
        
        # Serialize notifications
        serializer = self.get_serializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'notifications': serializer.data,
                'pagination': paginated['pagination'],
                'unread_count': self.get_queryset().filter(is_read=False).count()
            }
        ))
    
    def update(self, request, *args, **kwargs):
        """Handle PUT/PATCH requests to update a notification"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        notification = serializer.save()
        
        # Return response with the updated notification
        response_serializer = self.get_serializer(notification)
        return Response(format_response(
            status='success',
            message='Notification updated successfully.',
            data=response_serializer.data
        ))
    
    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        """Custom action to mark a notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        
        # Return response with the updated notification
        serializer = self.get_serializer(notification)
        return Response(format_response(
            status='success',
            message='Notification marked as read.',
            data=serializer.data
        ))
    
    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_as_read(self, request):
        """Custom action to mark all notifications as read"""
        # Get unread notifications
        unread_notifications = self.get_queryset().filter(is_read=False)
        
        # Mark all as read
        for notification in unread_notifications:
            notification.mark_as_read()
        
        return Response(format_response(
            status='success',
            message=f'{unread_notifications.count()} notifications marked as read.'
        ))