from rest_framework import serializers
from core.models import Photo
from .task_serializers import TaskSerializer
from typing import Optional


class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for Photo model with absolute URLs and accessibility fields"""
    task = TaskSerializer(read_only=True)
    url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    alt_text = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        # Keep backward-compatibility by exposing multiple keys for the image URL
        fields = ['id', 'url', 'photo_url', 'image', 'uploaded_at', 'alt_text', 'task']
        read_only_fields = ['id', 'uploaded_at', 'alt_text', 'task']

    def _absolute(self, url: Optional[str]) -> Optional[str]:
        request = self.context.get('request') if hasattr(self, 'context') else None
        if request and url:
            try:
                return request.build_absolute_uri(url)
            except Exception:
                return url
        return url

    def get_url(self, obj: Photo) -> Optional[str]:
        return self._absolute(obj.get_url())

    def get_photo_url(self, obj: Photo) -> Optional[str]:
        # Alias used in some frontend usages
        return self.get_url(obj)

    def get_image(self, obj: Photo) -> Optional[str]:
        # Alias used by some components as a generic image field
        return self.get_url(obj)

    def get_alt_text(self, obj: Photo) -> str:
        # Provide a helpful default alt text for accessibility
        task_title = getattr(obj.task, 'title', None)
        return f"Photo for {task_title}" if task_title else "Task photo"


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
