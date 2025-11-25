from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from core.models import RegisteredUser, Administrator, Task, TaskReport, UserReport
from core.api.serializers.user_serializers import AdminUserSerializer
from core.api.serializers.report_serializers import TaskReportSerializer, UserReportSerializer
from core.permissions import IsAdministrator
from core.utils import format_response, paginate_results


class AdminReportsView(views.APIView):
    """View for listing all reports (admin only)"""
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]
    
    def get(self, request):
        """Handle GET requests to retrieve all reports"""
        # Get report type parameter
        report_type = request.query_params.get('type', 'all')  # 'task', 'user', or 'all'
        
        # Get status filter
        status_filter = request.query_params.get('status')
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        response_data = {}
        
        if report_type in ['task', 'all']:
            # Get task reports
            task_reports = TaskReport.objects.all()
            if status_filter:
                task_reports = task_reports.filter(status=status_filter)
            
            # Paginate task reports
            paginated_task = paginate_results(
                task_reports.order_by('-created_at'),
                page=page,
                items_per_page=limit
            )
            
            # Serialize task reports
            task_serializer = TaskReportSerializer(paginated_task['data'], many=True)
            response_data['task_reports'] = {
                'reports': task_serializer.data,
                'pagination': paginated_task['pagination']
            }
        
        if report_type in ['user', 'all']:
            # Get user reports
            user_reports = UserReport.objects.all()
            if status_filter:
                user_reports = user_reports.filter(status=status_filter)
            
            # Paginate user reports
            paginated_user = paginate_results(
                user_reports.order_by('-created_at'),
                page=page,
                items_per_page=limit
            )
            
            # Serialize user reports
            user_serializer = UserReportSerializer(paginated_user['data'], many=True)
            response_data['user_reports'] = {
                'reports': user_serializer.data,
                'pagination': paginated_user['pagination']
            }
        
        # Get statistics
        response_data['statistics'] = {
            'total_task_reports': TaskReport.objects.count(),
            'pending_task_reports': TaskReport.objects.filter(status='PENDING').count(),
            'total_user_reports': UserReport.objects.count(),
            'pending_user_reports': UserReport.objects.filter(status='PENDING').count(),
        }
        
        return Response(format_response(
            status='success',
            data=response_data
        ))


class ReportedUsersView(views.APIView):
    """View for listing reported users (admin only)"""
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]
    
    def get(self, request):
        """Handle GET requests to retrieve reported users"""
        # Get users with reports
        reported_users = RegisteredUser.objects.annotate(
            report_count=Count('reports_received')
        ).filter(report_count__gt=0).order_by('-report_count')
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(reported_users, page=page, items_per_page=limit)
        
        # Create response data
        response_data = []
        for user in paginated['data']:
            latest_report = user.reports_received.order_by('-created_at').first()
            response_data.append({
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'report_count': user.report_count,
                'last_reported_at': latest_report.created_at if latest_report else None
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
        user_reports = UserReport.objects.filter(reported_user=user)
        task_reports_count = TaskReport.objects.filter(task__creator=user).count()
        
        # Get flagged tasks
        flagged_tasks = []
        reported_tasks = Task.objects.filter(
            Q(creator=user) & Q(reports__isnull=False)
        ).distinct()
        
        for task in reported_tasks:
            latest_report = task.reports.order_by('-created_at').first()
            flagged_tasks.append({
                'task_id': task.id,
                'task_title': task.title,
                'created_at': task.created_at,
                'report_type': latest_report.report_type if latest_report else None,
                'report_description': latest_report.description if latest_report else None
            })
        
        # Serialize user reports
        user_reports_serialized = UserReportSerializer(user_reports, many=True).data
        
        # Create response data
        response_data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'surname': user.surname,
            'phone_number': user.phone_number,
            'location': user.location,
            'rating': user.rating,
            'completed_task_count': user.completed_task_count,
            'status': 'active' if user.is_active else 'banned',
            'user_reports': user_reports_serialized,
            'user_reports_count': user_reports.count(),
            'task_reports_count': task_reports_count,
            'flagged_tasks': flagged_tasks
        }
        
        return Response(format_response(
            status='success',
            data=response_data
        ))


class BanUserView(views.APIView):
    """View for banning a user (admin only)"""
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]
    
    def post(self, request, user_id):
        """Handle POST requests to ban a user"""
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
        from django.utils import timezone
        notification = Notification.send_notification(
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
                'username': user.username,
                'new_status': 'banned',
                'banned_at': timezone.now().isoformat(),
                'reason': reason
            }
        ))


class DeleteTaskView(views.APIView):
    """View for deleting a task (admin only)"""
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]
    
    def delete(self, request, task_id):
        """Handle DELETE requests to delete a task"""
        # Get reason
        reason = request.data.get('reason', 'Violates community guidelines')
        
        # Get task
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response(format_response(
                status='error',
                message='Task not found.'
            ), status=status.HTTP_404_NOT_FOUND)
        
        # Store task info before deletion
        task_info = {
            'task_id': task.id,
            'title': task.title,
            'creator_id': task.creator.id,
            'creator_username': task.creator.username
        }
        
        # Send notification to task creator
        from core.models import Notification, NotificationType
        Notification.send_notification(
            user=task.creator,
            content=f"Your task '{task.title}' has been removed by administrators. Reason: {reason}",
            notification_type=NotificationType.SYSTEM_NOTIFICATION
        )
        
        # Delete the task
        task.delete()
        
        return Response(format_response(
            status='success',
            message='Task deleted successfully.',
            data={
                **task_info,
                'reason': reason
            }
        ))