from rest_framework import serializers
from core.models import Notification, NotificationType
from .user_serializers import UserSerializer
from .task_serializers import TaskSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    user = UserSerializer(read_only=True)
    related_task = TaskSerializer(read_only=True)
    type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'content', 'timestamp', 'type', 'type_display', 
                 'is_read', 'user', 'related_task']
        read_only_fields = ['id', 'content', 'timestamp', 'type', 
                           'type_display', 'user', 'related_task']
    
    def get_type_display(self, obj):
        """Get the display name for the notification type"""
        return dict(NotificationType.choices)[obj.type]


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new notification"""
    user_id = serializers.IntegerField(write_only=True)
    related_task_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Notification
        fields = ['content', 'type', 'user_id', 'related_task_id']
    
    def validate(self, data):
        """Validate notification data"""
        # Get the user
        user_id = data.pop('user_id')
        from core.models import RegisteredUser
        try:
            user = RegisteredUser.objects.get(id=user_id)
        except RegisteredUser.DoesNotExist:
            raise serializers.ValidationError({"user_id": "User not found."})
        
        # Get the related task if provided
        related_task = None
        if 'related_task_id' in data:
            related_task_id = data.pop('related_task_id')
            if related_task_id:
                from core.models import Task
                try:
                    related_task = Task.objects.get(id=related_task_id)
                except Task.DoesNotExist:
                    raise serializers.ValidationError({"related_task_id": "Task not found."})
        
        # Store these for use in create method
        data['user'] = user
        data['related_task'] = related_task
        
        return data
    
    def create(self, validated_data):
        """Create a new notification using the model method"""
        user = validated_data.pop('user')
        related_task = validated_data.pop('related_task')
        
        # Use the model method to create notification
        notification = Notification.send_notification(
            user=user,
            content=validated_data['content'],
            notification_type=validated_data['type'],
            related_task=related_task
        )
        
        return notification


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating notification read status"""
    class Meta:
        model = Notification
        fields = ['is_read']
    
    def update(self, instance, validated_data):
        """Update notification read status"""
        if 'is_read' in validated_data and validated_data['is_read']:
            instance.mark_as_read()
        else:
            instance.is_read = validated_data.get('is_read', instance.is_read)
            instance.save()
        
        return instance