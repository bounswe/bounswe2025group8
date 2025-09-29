from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count

from core.models import RegisteredUser, Administrator
from core.api.serializers.user_serializers import AdminUserSerializer
from core.permissions import IsAdministrator
from core.utils import format_response, paginate_results


class ReportedUsersView(views.APIView):
    """View for listing reported users"""
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]
    
    def get(self, request):
        """Handle GET requests to retrieve reported users"""
        # In a real implementation, there would be a ReportedUser model
        # For this implementation, we'll simulate it by counting notifications
        from core.models import Notification
        
        # Get users with reports
        # Assuming reports are stored as notifications of a specific type
        reported_users = RegisteredUser.objects.annotate(
            reports=Count('notifications', filter=models.Q(notifications__type='USER_REPORT'))
        ).filter(reports__gt=0).order_by('-reports')
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(reported_users, page=page, items_per_page=limit)
        
        # Create response data
        response_data = []
        for user in paginated['data']:
            response_data.append({
                'user_id': user.id,
                'username': user.username,
                'reports': user.reports,
                'last_reported_at': user.notifications.filter(type='USER_REPORT').latest('timestamp').timestamp
            })
        
        return Response(format_response(
            status='success',
            data={
                'users': response_data,
                'pagination': paginated['pagination']
            }
        ))


class AdminUserDetailView(views.APIView):
    """View for retrieving detailed user information (admin view)"""
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]
    
    def get(self, request, user_id):
        """Handle GET requests to retrieve user details"""
        # Get user
        user = get_object_or_404(RegisteredUser, id=user_id)
        
        # Get reports
        from core.models import Notification
        reports_count = Notification.objects.filter(
            type='USER_REPORT',
            related_user=user
        ).count()
        
        # Get flagged posts/tasks
        from core.models import Task
        flagged_tasks = []
        for task in Task.objects.filter(creator=user, status='REPORTED'):
            flagged_tasks.append({
                'task_id': task.id,
                'created_at': task.created_at,
                'reason': 'Content reported by users'  # In a real implementation, this would come from the report
            })
        
        # Create response data
        response_data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'status': 'active' if user.is_active else 'banned',
            'reports': reports_count,
            'flagged_posts': flagged_tasks
        }
        
        return Response(format_response(
            status='success',
            data=response_data
        ))


class BanUserView(views.APIView):
    """View for banning a user"""
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]
    
    def patch(self, request, user_id):
        """Handle PATCH requests to ban a user"""
        # Get reason
        reason = request.data.get('reason')
        if not reason:
            return Response(format_response(
                status='error',
                message='Reason for banning is required.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Get user
        try:
            user = RegisteredUser.objects.get(id=user_id)
        except RegisteredUser.DoesNotExist:
            return Response(format_response(
                status='error',
                message='User not found.'
            ), status=status.HTTP_404_NOT_FOUND)
        
        # Get admin
        try:
            admin = Administrator.objects.get(user=request.user)
        except Administrator.DoesNotExist:
            return Response(format_response(
                status='error',
                message='Admin not found.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Ban user
        success = admin.ban_user(user)
        if not success:
            return Response(format_response(
                status='error',
                message='Could not ban user.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Send notification to user
        from core.models import Notification, NotificationType
        Notification.send_notification(
            user=user,
            content=f"Your account has been banned for violating community guidelines: {reason}. You may appeal by emailing support@example.com.",
            notification_type=NotificationType.SYSTEM_NOTIFICATION
        )
        
        # Create response data
        return Response(format_response(
            status='success',
            message='User banned successfully.',
            data={
                'user_id': user.id,
                'new_status': 'banned',
                'banned_at': user.notifications.filter(
                    type=NotificationType.SYSTEM_NOTIFICATION
                ).latest('timestamp').timestamp.isoformat()
            }
        ))