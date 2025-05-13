from rest_framework import serializers
from core.models import Photo
from .task_serializers import TaskSerializer


class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for Photo model"""
    task = TaskSerializer(read_only=True)
    
    class Meta:
        model = Photo
        fields = ['id', 'url', 'uploaded_at', 'task']
        read_only_fields = ['id', 'uploaded_at', 'task']


class PhotoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new photo"""
    task_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Photo
        fields = ['url', 'task_id']
    
    def validate_task_id(self, value):
        """Validate task exists"""
        from core.models import Task
        
        try:
            task = Task.objects.get(id=value)
            
            # Check if user is the task creator
            request = self.context.get('request')
            if request and request.user != task.creator:
                raise serializers.ValidationError("You can only add photos to your own tasks.")
                
            return value
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found.")
    
    def create(self, validated_data):
        """Create a new photo using the model method"""
        from core.models import Task
        
        # Get the task
        task = Task.objects.get(id=validated_data.pop('task_id'))
        
        # Use the model method to upload the photo
        photo = Photo.upload_photo(
            task=task,
            image_file=validated_data['url']
        )
        
        return photo