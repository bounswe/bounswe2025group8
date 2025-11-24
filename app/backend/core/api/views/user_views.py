from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from core.models import RegisteredUser
from core.api.serializers.user_serializers import (
    UserSerializer, UserUpdateSerializer, PasswordChangeSerializer
)
from core.permissions import IsOwner
from core.utils import format_response
import os


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users"""
    queryset = RegisteredUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Only owners can update, partial_update, or delete their profile
        - Anyone can view profiles (list and retrieve)
        """
        if self.action in ['update', 'partial_update', 'destroy', 'change_password']:
            return [permissions.IsAuthenticated(), IsOwner()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        if self.action == 'change_password':
            return PasswordChangeSerializer
        return UserSerializer
    
    def update(self, request, *args, **kwargs):
        """Handle PUT requests to update user profile"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Get updated instance
        updated_instance = self.get_object()
        updated_serializer = UserSerializer(updated_instance)
        
        return Response(format_response(
            status='success',
            message='Profile updated successfully.',
            data=updated_serializer.data
        ))
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests to deactivate user account"""
        instance = self.get_object()
        # Instead of deleting, set is_active to False
        instance.is_active = False
        instance.save()
        
        return Response(format_response(
            status='success',
            message='Account deactivated successfully.'
        ), status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='change-password')
    def change_password(self, request, pk=None):
        """Custom action to change user password"""
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Check current password
            if not user.check_password(serializer.validated_data['current_password']):
                return Response(format_response(
                    status='error',
                    message='Current password is incorrect.'
                ), status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(format_response(
                status='success',
                message='Password changed successfully.'
            ))
        
        return Response(format_response(
            status='error',
            message='Invalid data provided.',
            data=serializer.errors
        ), status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='upload-photo', parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        """Upload profile photo for the user"""
        user = self.get_object()
        
        # Check if photo file is provided
        if 'photo' not in request.FILES:
            return Response(format_response(
                status='error',
                message='No photo file provided.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type and size
        image_file = request.FILES.get('photo')
        content_type = getattr(image_file, 'content_type', '') or ''
        if not content_type.startswith('image/'):
            return Response(format_response(
                status='error',
                message='Unsupported media type. Only image uploads are allowed.'
            ), status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
        
        try:
            max_mb = int(getattr(settings, 'MAX_PHOTO_UPLOAD_MB', 10))
        except Exception:
            max_mb = 10
        max_bytes = max_mb * 1024 * 1024
        size = getattr(image_file, 'size', None)
        if isinstance(size, int) and size > max_bytes:
            return Response(format_response(
                status='error',
                message=f'File too large. Maximum allowed size is {max_mb}MB.'
            ), status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        
        # Delete old profile photo if exists
        if user.profile_photo:
            old_photo_path = user.profile_photo.path
            if os.path.isfile(old_photo_path):
                try:
                    os.remove(old_photo_path)
                except Exception:
                    pass
        
        # Save new profile photo
        user.profile_photo = image_file
        user.save()
        
        # Return response with the uploaded photo URL
        serializer = UserSerializer(user, context={'request': request})
        return Response(format_response(
            status='success',
            message='Profile photo uploaded successfully.',
            data={
                'profile_photo': serializer.data.get('profile_photo')
            }
        ), status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], url_path='delete-photo')
    def delete_photo(self, request, pk=None):
        """Delete profile photo for the user"""
        user = self.get_object()
        
        if not user.profile_photo:
            return Response(format_response(
                status='error',
                message='No profile photo to delete.'
            ), status=status.HTTP_404_NOT_FOUND)
        
        # Delete the photo file
        photo_path = user.profile_photo.path
        if os.path.isfile(photo_path):
            try:
                os.remove(photo_path)
            except Exception:
                pass
        
        # Clear the profile_photo field
        user.profile_photo = None
        user.save()
        
        return Response(format_response(
            status='success',
            message='Profile photo deleted successfully.'
        ), status=status.HTTP_200_OK)