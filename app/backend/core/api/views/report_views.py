from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from core.models import TaskReport, UserReport, ReportStatus
from core.api.serializers.report_serializers import (
    TaskReportSerializer, TaskReportCreateSerializer,
    UserReportSerializer, UserReportCreateSerializer,
    ReportStatusUpdateSerializer
)
from core.permissions import IsAdministrator
from core.utils import format_response, paginate_results


class TaskReportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing task reports"""
    queryset = TaskReport.objects.all()
    serializer_class = TaskReportSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Any authenticated user can create reports
        - Only report creator can view their own reports
        - Admins can view all reports and update status
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy', 'update_status']:
            return [permissions.IsAuthenticated(), IsAdministrator()]
        elif self.action in ['list', 'retrieve']:
            # Users can see their own reports, admins can see all
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Return appropriate queryset based on user"""
        user = self.request.user
        
        # Admins can see all reports
        if hasattr(user, 'administrator'):
            return TaskReport.objects.all()
        
        # Regular users can only see their own reports
        return TaskReport.objects.filter(reporter=user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return TaskReportCreateSerializer
        return TaskReportSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to create a task report"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        report = serializer.save()
        
        # Return response with the created report
        response_serializer = TaskReportSerializer(report)
        return Response(format_response(
            status='success',
            message='Task report submitted successfully.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        """Handle GET requests to list reports"""
        queryset = self.get_queryset()
        
        # Filter by status if provided
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(queryset.order_by('-created_at'), page=page, items_per_page=limit)
        
        # Serialize reports
        serializer = self.get_serializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'reports': serializer.data,
                'pagination': paginated['pagination']
            }
        ))
    
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Custom action for admins to update report status"""
        report = self.get_object()
        serializer = ReportStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get admin
        try:
            from core.models import Administrator
            admin = Administrator.objects.get(user=request.user)
        except Administrator.DoesNotExist:
            return Response(format_response(
                status='error',
                message='Only administrators can update report status.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Update status
        report.update_status(
            status=serializer.validated_data['status'],
            admin=admin,
            notes=serializer.validated_data.get('admin_notes', '')
        )
        
        # Return updated report
        response_serializer = TaskReportSerializer(report)
        return Response(format_response(
            status='success',
            message='Report status updated successfully.',
            data=response_serializer.data
        ))


class UserReportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user reports"""
    queryset = UserReport.objects.all()
    serializer_class = UserReportSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Any authenticated user can create reports
        - Only report creator can view their own reports
        - Admins can view all reports and update status
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy', 'update_status']:
            return [permissions.IsAuthenticated(), IsAdministrator()]
        elif self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Return appropriate queryset based on user"""
        user = self.request.user
        
        # Admins can see all reports
        if hasattr(user, 'administrator'):
            return UserReport.objects.all()
        
        # Regular users can only see their own reports
        return UserReport.objects.filter(reporter=user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return UserReportCreateSerializer
        return UserReportSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to create a user report"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        report = serializer.save()
        
        # Return response with the created report
        response_serializer = UserReportSerializer(report)
        return Response(format_response(
            status='success',
            message='User report submitted successfully.',
            data=response_serializer.data
        ), status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        """Handle GET requests to list reports"""
        queryset = self.get_queryset()
        
        # Filter by status if provided
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(queryset.order_by('-created_at'), page=page, items_per_page=limit)
        
        # Serialize reports
        serializer = self.get_serializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'reports': serializer.data,
                'pagination': paginated['pagination']
            }
        ))
    
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Custom action for admins to update report status"""
        report = self.get_object()
        serializer = ReportStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get admin
        try:
            from core.models import Administrator
            admin = Administrator.objects.get(user=request.user)
        except Administrator.DoesNotExist:
            return Response(format_response(
                status='error',
                message='Only administrators can update report status.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Update status
        report.update_status(
            status=serializer.validated_data['status'],
            admin=admin,
            notes=serializer.validated_data.get('admin_notes', '')
        )
        
        # Return updated report
        response_serializer = UserReportSerializer(report)
        return Response(format_response(
            status='success',
            message='Report status updated successfully.',
            data=response_serializer.data
        ))