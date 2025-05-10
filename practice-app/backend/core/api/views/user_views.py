from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from core.models import RegisteredUser
from core.api.serializers.user_serializers import (
    UserSerializer, UserUpdateSerializer, PasswordChangeSerializer
)
from core.permissions import IsOwner
from core.utils import format_response


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