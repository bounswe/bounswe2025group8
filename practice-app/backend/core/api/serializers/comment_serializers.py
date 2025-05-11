from rest_framework import serializers
from core.models import Comment
from .user_serializers import UserSerializer
from .task_serializers import TaskSerializer


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'timestamp', 'user', 'task']
        read_only_fields = ['id', 'timestamp', 'user', 'task']


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new comment"""
    task_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Comment
        fields = ['content', 'task_id']
    
    def validate_task_id(self, value):
        """Validate task exists"""
        from core.models import Task
        
        try:
            Task.objects.get(id=value)
            return value
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found.")
    
    def create(self, validated_data):
        """Create a new comment using the model method"""
        from core.models import Task
        
        # Get the user from the context
        user = self.context['request'].user
        
        # Get the task
        task = Task.objects.get(id=validated_data.pop('task_id'))
        
        # Use the model method to add a comment
        comment = Comment.add_comment(
            user=user,
            task=task,
            content=validated_data['content']
        )
        
        return comment


class CommentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a comment"""
    class Meta:
        model = Comment
        fields = ['content']
    
    def update(self, instance, validated_data):
        """Update comment content"""
        if instance.user != self.context['request'].user:
            raise serializers.ValidationError("You can only edit your own comments.")
        
        # Use the model method to edit the comment
        instance.edit_comment(validated_data['content'])
        
        return instance