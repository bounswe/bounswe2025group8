from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from core.models import Volunteer, Task, VolunteerStatus
from core.api.serializers.volunteer_serializers import (
    VolunteerSerializer, VolunteerCreateSerializer, VolunteerStatusUpdateSerializer
)
from core.permissions import IsOwner, IsTaskCreator
from core.utils import format_response, paginate_results


class VolunteerViewSet(viewsets.ModelViewSet):
    """ViewSet for managing volunteers"""
    queryset = Volunteer.objects.all()
    serializer_class = VolunteerSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Only owners can withdraw their volunteer application
        - Only task creators can accept/reject volunteer applications
        """
        if self.action in ['destroy', 'withdraw']:
            return [permissions.IsAuthenticated(), IsOwner()]
        elif self.action in ['update', 'partial_update', 'accept', 'reject']:
            # For these actions, we need to check if the user is the task creator
            # This will be handled in the action methods
            return [permissions.IsAuthenticated()]
        else:
            return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return VolunteerCreateSerializer
        elif self.action in ['update', 'partial_update', 'accept', 'reject', 'withdraw']:
            return VolunteerStatusUpdateSerializer
        return VolunteerSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to volunteer for a task"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        volunteer = serializer.save()
        
        # Send notification to task creator
        task = volunteer.task
        from core.models import Notification, NotificationType
        Notification.send_volunteer_applied_notification(volunteer)
        
        # Return response with the created volunteer
        response_serializer = VolunteerSerializer(volunteer)
        return Response(format_response(
            status='success',
            message='Successfully volunteered for the task.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Handle PUT/PATCH requests to update volunteer status"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if user is the task creator
        if request.user != instance.task.creator:
            return Response(format_response(
                status='error',
                message='Only the task creator can update volunteer status.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        volunteer = serializer.save()
        
        # Return response with the updated volunteer
        response_serializer = VolunteerSerializer(volunteer)
        return Response(format_response(
            status='success',
            message=f"Volunteer status updated to '{dict(VolunteerStatus.choices)[volunteer.status]}'.",
            data=response_serializer.data
        ))
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests to withdraw volunteer application"""
        instance = self.get_object()
        
        # Withdraw volunteer application
        instance.withdraw_volunteer()
        
        return Response(format_response(
            status='success',
            message='Volunteer application withdrawn successfully.'
        ), status=status.HTTP_200_OK)
    
    def perform_destroy(self, instance):
        """Override to prevent actual deletion"""
        # Instead of deleting, we'll call withdraw_volunteer
        # This is handled in the destroy method
        pass


class TaskVolunteersView(views.APIView):
    """View for listing volunteers for a specific task"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, task_id):
        """Handle GET requests to retrieve task volunteers"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Check if user is the creator
        if request.user != task.creator:
            return Response(format_response(
                status='error',
                message='Only the task creator can view volunteers.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Get volunteers
        status_param = request.query_params.get('status')
        if status_param:
            volunteers = Volunteer.objects.filter(task=task, status=status_param)
        else:
            volunteers = Volunteer.objects.filter(task=task)
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(volunteers, page=page, items_per_page=limit)
        
        # Serialize volunteers
        serializer = VolunteerSerializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'volunteers': serializer.data,
                'pagination': paginated['pagination']
            }
        ))
    
    def post(self, request, task_id):
        """Handle POST requests to update volunteer status"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Check if user is the creator
        if request.user != task.creator:
            return Response(format_response(
                status='error',
                message='Only the task creator can update volunteer status.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Get volunteer
        volunteer_id = request.data.get('volunteer_id')
        if not volunteer_id:
            return Response(format_response(
                status='error',
                message='Volunteer ID is required.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        try:
            volunteer = Volunteer.objects.get(id=volunteer_id, task=task)
        except Volunteer.DoesNotExist:
            return Response(format_response(
                status='error',
                message='Volunteer not found for this task.'
            ), status=status.HTTP_404_NOT_FOUND)
        
        # Get action
        action = request.data.get('action')
        if not action or action not in ['accept', 'reject']:
            return Response(format_response(
                status='error',
                message='Valid action (accept or reject) is required.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Perform action
        if action == 'accept':
            success = volunteer.accept_volunteer()
            if not success:
                return Response(format_response(
                    status='error',
                    message='Failed to accept volunteer.'
                ), status=status.HTTP_400_BAD_REQUEST)
                
            # Send notification
            from core.models import Notification, NotificationType
            Notification.send_task_assigned_notification(task, volunteer)
                
            message = 'Volunteer accepted successfully.'
        else:  # reject
            success = volunteer.reject_volunteer()
            if not success:
                return Response(format_response(
                    status='error',
                    message='Failed to reject volunteer.'
                ), status=status.HTTP_400_BAD_REQUEST)
                
            message = 'Volunteer rejected successfully.'
        
        # Return response
        serializer = VolunteerSerializer(volunteer)
        return Response(format_response(
            status='success',
            message=message,
            data=serializer.data
        ))