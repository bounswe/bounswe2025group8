from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from core.models import Comment, Task
from core.api.serializers.comment_serializers import (
    CommentSerializer, CommentCreateSerializer, CommentUpdateSerializer
)
from core.permissions import IsOwner
from core.utils import format_response, paginate_results


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing comments"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Only owners can update or delete their comments
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwner()]
        else:
            return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return CommentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CommentUpdateSerializer
        return CommentSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to create a comment"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        
        # Return response with the created comment
        response_serializer = CommentSerializer(comment)
        return Response(format_response(
            status='success',
            message='Comment posted successfully.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Handle PUT/PATCH requests to update a comment"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        
        # Return response with the updated comment
        response_serializer = CommentSerializer(comment)
        return Response(format_response(
            status='success',
            message='Comment updated successfully.',
            data=response_serializer.data
        ))
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests to delete a comment"""
        instance = self.get_object()
        
        # Delete comment using the model method
        instance.delete_comment()
        
        return Response(format_response(
            status='success',
            message='Comment deleted successfully.'
        ), status=status.HTTP_204_NO_CONTENT)


class TaskCommentsView(views.APIView):
    """View for listing and creating comments for a specific task"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, task_id):
        """Handle GET requests to retrieve task comments"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Get comments
        comments = Comment.objects.filter(task=task).order_by('timestamp')
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(comments, page=page, items_per_page=limit)
        
        # Serialize comments
        serializer = CommentSerializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'comments': serializer.data,
                'pagination': paginated['pagination']
            }
        ))
    
    def post(self, request, task_id):
        """Handle POST requests to create a comment for a task"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Create serializer with data
        data = {
            'content': request.data.get('content'),
            'task_id': task.id
        }
        
        serializer = CommentCreateSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        
        # Return response with the created comment
        response_serializer = CommentSerializer(comment)
        return Response(format_response(
            status='success',
            message='Comment posted successfully.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)