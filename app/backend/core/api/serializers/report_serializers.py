from rest_framework import serializers
from core.models import TaskReport, UserReport, ReportType, ReportStatus, Task, RegisteredUser


class TaskNestedSerializer(serializers.ModelSerializer):
    """Nested serializer for Task in reports"""
    creator_id = serializers.IntegerField(source='creator.id', read_only=True)
    creator_username = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'created_at', 'creator_id', 'creator_username']
        read_only_fields = ['id', 'title', 'description', 'created_at', 'creator_id', 'creator_username']


class TaskReportSerializer(serializers.ModelSerializer):
    """Serializer for TaskReport model"""
    reporter = serializers.StringRelatedField(read_only=True)
    task = TaskNestedSerializer(read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.user.username', read_only=True, allow_null=True)

    class Meta:
        model = TaskReport
        fields = [
            'id', 'task', 'task_title', 'reporter', 'report_type',
            'report_type_display', 'description', 'status', 'status_display',
            'created_at', 'updated_at', 'reviewed_by_username', 'admin_notes'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at', 'reviewed_by_username']


class TaskReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a task report"""
    task_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TaskReport
        fields = ['task_id', 'report_type', 'description']
    
    def validate_task_id(self, value):
        """Validate task exists"""
        try:
            Task.objects.get(id=value)
            return value
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found.")
    
    def create(self, validated_data):
        """Create a new task report"""
        task = Task.objects.get(id=validated_data.pop('task_id'))
        reporter = self.context['request'].user
        
        report = TaskReport.create_report(
            task=task,
            reporter=reporter,
            report_type=validated_data['report_type'],
            description=validated_data['description']
        )
        
        return report


class UserNestedSerializer(serializers.ModelSerializer):
    """Nested serializer for User in reports"""
    class Meta:
        model = RegisteredUser
        fields = ['id', 'username', 'name', 'surname', 'email']
        read_only_fields = ['id', 'username', 'name', 'surname', 'email']


class UserReportSerializer(serializers.ModelSerializer):
    """Serializer for UserReport model"""
    reporter = serializers.StringRelatedField(read_only=True)
    reported_user = UserNestedSerializer(read_only=True)
    reported_user_username = serializers.CharField(source='reported_user.username', read_only=True)
    related_task_title = serializers.CharField(source='related_task.title', read_only=True, allow_null=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.user.username', read_only=True, allow_null=True)

    class Meta:
        model = UserReport
        fields = [
            'id', 'reported_user', 'reported_user_username', 'reporter',
            'report_type', 'report_type_display', 'description',
            'related_task', 'related_task_title', 'status', 'status_display',
            'created_at', 'updated_at', 'reviewed_by_username', 'admin_notes'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at', 'reviewed_by_username']


class UserReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a user report"""
    reported_user_id = serializers.IntegerField(write_only=True)
    related_task_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = UserReport
        fields = ['reported_user_id', 'report_type', 'description', 'related_task_id']
    
    def validate_reported_user_id(self, value):
        """Validate reported user exists"""
        try:
            RegisteredUser.objects.get(id=value)
            return value
        except RegisteredUser.DoesNotExist:
            raise serializers.ValidationError("User not found.")
    
    def validate_related_task_id(self, value):
        """Validate related task exists if provided"""
        if value:
            try:
                Task.objects.get(id=value)
                return value
            except Task.DoesNotExist:
                raise serializers.ValidationError("Task not found.")
        return value
    
    def create(self, validated_data):
        """Create a new user report"""
        reported_user = RegisteredUser.objects.get(id=validated_data.pop('reported_user_id'))
        reporter = self.context['request'].user
        
        related_task = None
        if 'related_task_id' in validated_data and validated_data['related_task_id']:
            related_task = Task.objects.get(id=validated_data.pop('related_task_id'))
        
        try:
            report = UserReport.create_report(
                reported_user=reported_user,
                reporter=reporter,
                report_type=validated_data['report_type'],
                description=validated_data['description'],
                related_task=related_task
            )
            return report
        except ValueError as e:
            raise serializers.ValidationError(str(e))


class ReportStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating report status (admin only)"""
    status = serializers.ChoiceField(choices=ReportStatus.choices)
    admin_notes = serializers.CharField(required=False, allow_blank=True)