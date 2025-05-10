from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from core.models import Task, TaskStatus
from core.api.serializers.task_serializers import (
    TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer, TaskStatusUpdateSerializer
)
from core.permissions import IsTaskCreator, IsTaskParticipant
from core.utils import format_response, paginate_results


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tasks"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Any user can list and retrieve tasks
        - Only authenticated users can create tasks
        - Only task creators can update, partial_update, or delete their tasks
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsTaskCreator()]
        elif self.action in ['create']:
            return [permissions.IsAuthenticated()]
        else:
            return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Return appropriate queryset based on filters"""
        queryset = Task.objects.all()
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by category
        category_param = self.request.query_params.get('category')
        if category_param:
            queryset = queryset.filter(category=category_param)
        
        # Filter by location
        location_param = self.request.query_params.get('location')
        if location_param:
            queryset = queryset.filter(location__icontains=location_param)
        
        # Filter by urgency
        urgency_param = self.request.query_params.get('urgency')
        if urgency_param:
            queryset = queryset.filter(urgency_level__gte=int(urgency_param))
        
        # Filter by tag
        tag_param = self.request.query_params.get('tag')
        if tag_param:
            queryset = queryset.filter(tags__name=tag_param)
        
        # Filter by search term
        search_param = self.request.query_params.get('search')
        if search_param:
            queryset = queryset.filter(
                Q(title__icontains=search_param) | 
                Q(description__icontains=search_param)
            )
        
        # Exclude expired tasks by default, unless specifically requested
        show_expired = self.request.query_params.get('show_expired', 'false').lower() == 'true'
        if not show_expired:
            # Check for and mark expired tasks
            now = timezone.now()
            expired_tasks = queryset.filter(status=TaskStatus.POSTED, deadline__lt=now)
            for task in expired_tasks:
                task.check_expiry()
            
            # Exclude expired tasks
            queryset = queryset.exclude(status=TaskStatus.EXPIRED)
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        elif self.action == 'update_status':
            return TaskStatusUpdateSerializer
        return TaskSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to create a task"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        
        # Return response with the created task
        response_serializer = TaskSerializer(task)
        return Response(format_response(
            status='success',
            message='Task created successfully.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Handle PUT/PATCH requests to update a task"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        
        # Return response with the updated task
        response_serializer = TaskSerializer(task)
        return Response(format_response(
            status='success',
            message='Task updated successfully.',
            data=response_serializer.data
        ))
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests to cancel a task"""
        instance = self.get_object()
        
        # Cancel task instead of deleting
        instance.cancel_task()
        
        # Send notification to assignee if one exists
        if instance.assignee:
            from core.models import Notification, NotificationType
            Notification.send_notification(
                user=instance.assignee,
                content=f"Task '{instance.title}' has been cancelled by the creator.",
                notification_type=NotificationType.TASK_CANCELLED,
                related_task=instance
            )
        
        return Response(format_response(
            status='success',
            message='Task has been cancelled successfully.',
            data={
                'task_id': instance.id,
                'title': instance.title,
                'status': instance.status,
                'cancelled_at': timezone.now().isoformat()
            }
        ))
    
    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Custom action to update task status"""
        instance = self.get_object()
        serializer = TaskStatusUpdateSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        
        # Return response with the updated task
        response_serializer = TaskSerializer(task)
        return Response(format_response(
            status='success',
            message=f"Task status updated to '{dict(TaskStatus.choices)[task.status]}'.",
            data=response_serializer.data
        ))


class UserTasksView(views.APIView):
    """View for listing tasks created by a specific user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        """Handle GET requests to retrieve user tasks"""
        # Get user tasks
        # If 'status' parameter is 'active', get tasks that are not completed, cancelled or expired
        status_param = request.query_params.get('status')
        
        if status_param == 'active':
            tasks = Task.objects.filter(
                creator_id=user_id,
                status__in=[TaskStatus.POSTED, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS]
            )
        else:
            tasks = Task.objects.filter(creator_id=user_id)
            
            # Apply additional filtering if status parameter provided
            if status_param:
                tasks = tasks.filter(status=status_param)
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(tasks, page=page, items_per_page=limit)
        
        # Serialize tasks
        serializer = TaskSerializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'tasks': serializer.data,
                'pagination': paginated['pagination']
            }
        ))


class CompleteTaskView(views.APIView):
    """View for marking a task as completed"""
    permission_classes = [permissions.IsAuthenticated, IsTaskCreator]
    
    def post(self, request, task_id):
        """Handle POST requests to mark a task as completed"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Check if user is the creator
        self.check_object_permissions(request, task)
        
        # Check if task can be completed
        if task.status not in [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS]:
            return Response(format_response(
                status='error',
                message=f"Cannot complete task with status '{dict(TaskStatus.choices)[task.status]}'."
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Complete task
        task.confirm_completion()
        
        # Send notifications
        from core.models import Notification, NotificationType
        
        # Notify assignee
        if task.assignee:
            Notification.send_task_completed_notification(task)
        
        return Response(format_response(
            status='success',
            message='Task marked as completed.',
            data={
                'task_id': task.id,
                'status': task.status,
                'completed_at': timezone.now().isoformat()
            }
        ))