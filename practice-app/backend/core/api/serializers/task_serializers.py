from rest_framework import serializers
from core.models import Task, TaskCategory, TaskStatus
from django.utils import timezone
from .user_serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    creator = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'category', 'category_display',
                  'location', 'deadline', 'requirements', 'urgency_level', 
                  'volunteer_number', 'status', 'status_display', 'is_recurring',
                  'creator', 'assignee', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display',
                           'category_display', 'creator', 'assignee']
    
    def get_status_display(self, obj):
        """Get the display name for the status"""
        return dict(TaskStatus.choices)[obj.status]
    
    def get_category_display(self, obj):
        """Get the display name for the category"""
        return dict(TaskCategory.choices)[obj.category]


class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new task"""
    class Meta:
        model = Task
        fields = ['title', 'description', 'category', 'location', 'deadline',
                 'requirements', 'urgency_level', 'volunteer_number', 'is_recurring']
    
    def validate_deadline(self, value):
        """Validate that deadline is in the future"""
        if value <= timezone.now():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value
    
    def validate_volunteer_number(self, value):
        """Validate volunteer number is positive"""
        if value <= 0:
            raise serializers.ValidationError("Volunteer number must be positive.")
        return value
    
    def create(self, validated_data):
        """Create a new task instance"""
        # Get the user from the context
        user = self.context['request'].user
        
        # Create task with user as creator
        task = Task.objects.create(creator=user, **validated_data)
        return task


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating an existing task"""
    class Meta:
        model = Task
        fields = ['title', 'description', 'category', 'location', 'deadline',
                 'requirements', 'urgency_level', 'volunteer_number', 'is_recurring']
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False},
            'category': {'required': False},
            'location': {'required': False},
            'deadline': {'required': False},
            'requirements': {'required': False},
            'urgency_level': {'required': False},
            'volunteer_number': {'required': False},
            'is_recurring': {'required': False}
        }
    
    def validate_deadline(self, value):
        """Validate that deadline is in the future"""
        if value <= timezone.now():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value
    
    def validate(self, data):
        """Validate the task can be updated"""
        task = self.instance
        
        # Check if task is in a state that can be updated
        if task.status in [TaskStatus.COMPLETED, TaskStatus.CANCELLED, TaskStatus.EXPIRED]:
            raise serializers.ValidationError(
                f"Cannot update task with status '{dict(TaskStatus.choices)[task.status]}'")
        
        return data


class TaskStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating task status"""
    class Meta:
        model = Task
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status transition is allowed"""
        task = self.instance
        
        # Define allowed transitions
        allowed_transitions = {
            TaskStatus.POSTED: [TaskStatus.ASSIGNED, TaskStatus.CANCELLED],
            TaskStatus.ASSIGNED: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED, TaskStatus.POSTED],
            TaskStatus.IN_PROGRESS: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
            # Terminal states
            TaskStatus.COMPLETED: [],
            TaskStatus.CANCELLED: [],
            TaskStatus.EXPIRED: []
        }
        
        if value not in allowed_transitions.get(task.status, []):
            current_status = dict(TaskStatus.choices)[task.status]
            new_status = dict(TaskStatus.choices)[value]
            raise serializers.ValidationError(
                f"Cannot transition from '{current_status}' to '{new_status}'")
        
        return value