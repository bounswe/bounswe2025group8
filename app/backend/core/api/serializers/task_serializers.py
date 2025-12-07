from rest_framework import serializers
from core.models import Task, TaskCategory, TaskStatus
from django.utils import timezone
from .user_serializers import UserSerializer
from core.utils import mask_address, mask_phone_number


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model with conditional field masking for privacy"""
    creator = serializers.SerializerMethodField()
    assignee = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    primary_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'category', 'category_display',
                  'location', 'deadline', 'requirements', 'urgency_level', 
                  'volunteer_number', 'status', 'status_display', 'is_recurring',
                  'creator', 'assignee', 'created_at', 'updated_at', 'primary_photo_url']
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display',
                           'category_display', 'creator', 'assignee', 'location']
    
    def _is_user_authorized(self, task, user):
        """
        Check if user is authorized to view sensitive information.
        User is authorized if they are the creator, assignee, or admin/superuser.
        """
        if not user or not user.is_authenticated:
            return False
        
        # Admins and superusers have full access
        if hasattr(user, 'is_staff') and user.is_staff:
            return True
        if hasattr(user, 'is_superuser') and user.is_superuser:
            return True
            
        return user == task.creator or user == task.assignee or user in task.assignees.all()
    
    def get_location(self, obj):
        """Get location with masking for unauthorized users"""
        request = self.context.get('request')
        user = request.user if request else None
        
        if self._is_user_authorized(obj, user):
            return obj.location
        else:
            return mask_address(obj.location)
    
    def get_creator(self, obj):
        """Get creator with phone number masking for unauthorized users"""
        request = self.context.get('request')
        user = request.user if request else None
        
        creator_data = UserSerializer(obj.creator, context=self.context).data
        
        # Mask phone number if user is not authorized
        if not self._is_user_authorized(obj, user):
            if 'phone_number' in creator_data:
                creator_data['phone_number'] = mask_phone_number(creator_data['phone_number'])
        
        return creator_data
    
    def get_assignee(self, obj):
        """Get assignee with phone number masking for unauthorized users"""
        if not obj.assignee:
            return None
            
        request = self.context.get('request')
        user = request.user if request else None
        
        assignee_data = UserSerializer(obj.assignee, context=self.context).data
        
        # Mask phone number if user is not authorized
        if not self._is_user_authorized(obj, user):
            if 'phone_number' in assignee_data:
                assignee_data['phone_number'] = mask_phone_number(assignee_data['phone_number'])
        
        return assignee_data
    
    def get_status_display(self, obj):
        """Get the display name for the status"""
        return dict(TaskStatus.choices)[obj.status]
    
    def get_category_display(self, obj):
        """Get the display name for the category"""
        return dict(TaskCategory.choices)[obj.category]

    def get_primary_photo_url(self, obj: Task):
        photo = getattr(obj, 'photos', None).first() if hasattr(obj, 'photos') else None
        if not photo or not photo.url:
            return None
        try:
            request = self.context.get('request') if hasattr(self, 'context') else None
            url = photo.url.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return photo.url.url


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
