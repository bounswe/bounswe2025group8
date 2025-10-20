from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from core.models import Photo, Task
from core.api.serializers.photo_serializers import PhotoSerializer, PhotoCreateSerializer
from core.permissions import IsTaskCreator
from core.utils import format_response


class PhotoViewSet(viewsets.ModelViewSet):
    """ViewSet for managing photos"""
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Only task creators can upload, update, or delete photos
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsTaskCreator()]
        else:
            return [permissions.IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to upload a photo"""
        serializer = PhotoCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        photo = serializer.save()
        
        # Return response with the created photo
        response_serializer = PhotoSerializer(photo)
        return Response(format_response(
            status='success',
            message='Photo uploaded successfully.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests to delete a photo"""
        instance = self.get_object()
        
        # Delete photo using the model method
        instance.delete_photo()
        
        return Response(format_response(
            status='success',
            message='Photo deleted successfully.'
        ), status=status.HTTP_204_NO_CONTENT)


class TaskPhotoView(views.APIView):
    """View for managing photos for a specific task"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def get(self, request, task_id):
        """Handle GET requests to retrieve photos for a task"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Get photos
        photos = Photo.objects.filter(task=task)
        
        # Serialize photos
        serializer = PhotoSerializer(photos, many=True)
        
        return Response(format_response(
            status='success',
            data={'photos': serializer.data}
        ))
    
    def post(self, request, task_id):
        """Handle POST requests to upload a photo for a task"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Check if user is the creator
        if request.user != task.creator:
            return Response(format_response(
                status='error',
                message='Only the task creator can upload photos.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Check if photo file is provided
        if 'photo' not in request.FILES:
            return Response(format_response(
                status='error',
                message='No photo file provided.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Upload photo
        try:
            photo = Photo.upload_photo(
                task=task,
                image_file=request.FILES['photo']
            )
            
            # Return response with the created photo
            serializer = PhotoSerializer(photo)
            return Response(format_response(
                status='success',
                message='Photo attached successfully.',
                data={
                    'task_id': task.id,
                    'photo_id': photo.id,
                    'photo_url': photo.get_url(),
                    'uploaded_at': photo.uploaded_at.isoformat()
                }
            ), status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(format_response(
                status='error',
                message=f'Failed to upload photo: {str(e)}'
            ), status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, task_id):
        """Handle DELETE requests to delete a photo from a task"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Check if user is the creator
        if request.user != task.creator:
            return Response(format_response(
                status='error',
                message='Only the task creator can delete photos.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Get photo ID
        photo_id = request.query_params.get('photo_id')
        if not photo_id:
            return Response(format_response(
                status='error',
                message='Photo ID is required.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Get photo
        try:
            photo = Photo.objects.get(id=photo_id, task=task)
        except Photo.DoesNotExist:
            return Response(format_response(
                status='error',
                message='Photo not found for this task.'
            ), status=status.HTTP_404_NOT_FOUND)
        
        # Delete photo
        photo.delete_photo()
        
        return Response(format_response(
            status='success',
            message='Photo deleted successfully.'
        ), status=status.HTTP_204_NO_CONTENT)