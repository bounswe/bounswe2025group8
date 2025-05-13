from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the object has a user attribute and if the user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if the object has a creator attribute and if the user is the creator
        if hasattr(obj, 'creator'):
            return obj.creator == request.user
            
        # Check if the object is a user object itself
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
            
        return False


class IsTaskCreator(permissions.BasePermission):
    """
    Custom permission to only allow creators of a task to perform actions on it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user


class IsTaskParticipant(permissions.BasePermission):
    """
    Custom permission to only allow participants of a task (creator or assignee) to access it.
    """
    def has_object_permission(self, request, view, obj):
        return (obj.creator == request.user or obj.assignee == request.user)


class IsAdministrator(permissions.BasePermission):
    """
    Custom permission to only allow administrators to access.
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'administrator')
        
    def has_object_permission(self, request, view, obj):
        return hasattr(request.user, 'administrator')