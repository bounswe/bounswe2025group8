from rest_framework import serializers
from core.models import Volunteer, VolunteerStatus
from .user_serializers import UserSerializer
from .task_serializers import TaskSerializer


class VolunteerSerializer(serializers.ModelSerializer):
    """Serializer for Volunteer model"""
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Volunteer
        fields = ['id', 'user', 'task', 'status', 'status_display', 'volunteered_at']
        read_only_fields = ['id', 'user', 'task', 'volunteered_at', 'status_display']
    
    def get_status_display(self, obj):
        """Get the display name for the status"""
        return dict(VolunteerStatus.choices)[obj.status]


class VolunteerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new volunteer"""
    task_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Volunteer
        fields = ['task_id']
    
    def validate_task_id(self, value):
        """Validate task exists and is available for volunteers"""
        from core.models import Task
        
        try:
            task = Task.objects.get(id=value)
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found.")
        
        # Check if task is still accepting volunteers
        if task.status != 'POSTED':
            raise serializers.ValidationError("This task is not available for volunteers.")
        
        # Check if task deadline has passed
        from django.utils import timezone
        if task.deadline < timezone.now():
            # Mark task as expired
            task.check_expiry()
            raise serializers.ValidationError("This task has expired.")
        
        return value
    
    def create(self, validated_data):
        """Create a new volunteer instance"""
        from core.models import Task
        
        # Get the user from the context
        user = self.context['request'].user
        
        # Get the task
        task = Task.objects.get(id=validated_data.pop('task_id'))
        
        # Create volunteer using the model method
        volunteer = Volunteer.volunteer_for_task(user=user, task=task)
        
        if volunteer is None:
            raise serializers.ValidationError("Failed to volunteer for this task.")
        
        return volunteer


class VolunteerStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating volunteer status"""
    class Meta:
        model = Volunteer
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status transition is allowed"""
        volunteer = self.instance
        
        # Define allowed transitions
        allowed_transitions = {
            VolunteerStatus.PENDING: [VolunteerStatus.ACCEPTED, VolunteerStatus.REJECTED, VolunteerStatus.WITHDRAWN],
            VolunteerStatus.ACCEPTED: [VolunteerStatus.WITHDRAWN],
            # Terminal states
            VolunteerStatus.REJECTED: [],
            VolunteerStatus.WITHDRAWN: []
        }
        
        if value not in allowed_transitions.get(volunteer.status, []):
            current_status = dict(VolunteerStatus.choices)[volunteer.status]
            new_status = dict(VolunteerStatus.choices)[value]
            raise serializers.ValidationError(
                f"Cannot transition from '{current_status}' to '{new_status}'")
        
        return value
    
    def update(self, instance, validated_data):
        """Update volunteer status using model methods"""
        new_status = validated_data.get('status')
        
        if new_status == VolunteerStatus.ACCEPTED:
            success = instance.accept_volunteer()
            if not success:
                raise serializers.ValidationError("Failed to accept volunteer.")
        elif new_status == VolunteerStatus.REJECTED:
            success = instance.reject_volunteer()
            if not success:
                raise serializers.ValidationError("Failed to reject volunteer.")
        elif new_status == VolunteerStatus.WITHDRAWN:
            success = instance.withdraw_volunteer()
            if not success:
                raise serializers.ValidationError("Failed to withdraw volunteer.")
        
        # Refresh instance from database
        instance.refresh_from_db()
        return instance