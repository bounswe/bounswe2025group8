from rest_framework import serializers
from core.models import Photo
from .task_serializers import TaskSerializer
from typing import Optional
import logging

logger = logging.getLogger(__name__)


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
        """Convert relative URL to absolute URL"""
        if not url:
            return None
            
        # If already absolute, return as is
        if url.startswith('http://') or url.startswith('https://'):
            return url
            
        request = self.context.get('request') if hasattr(self, 'context') else None
        if request:
            try:
                absolute = request.build_absolute_uri(url)
                # Debug: Log what host Django is using
                logger.info(f"Building absolute URI - Host: {request.get_host()}, Relative: {url}, Absolute: {absolute}")
                logger.info(f"Headers - X-Forwarded-Host: {request.META.get('HTTP_X_FORWARDED_HOST')}, Host: {request.META.get('HTTP_HOST')}")
                return absolute
            except Exception as e:
                logger.error(f"Error building absolute URI: {e}")
                pass
        
        # Fallback: if no request context, return the URL (still relative but valid)
        logger.warning(f"No request context for URL: {url}, returning relative")
        return url

    def get_url(self, obj: Photo) -> Optional[str]:
        """Get absolute photo URL"""
        if obj.url:
            # Use the ImageField's url property which gives the correct media path
            relative_url = obj.url.url
            absolute_url = self._absolute(relative_url)
            
            # Debug logging
            logger.debug(f"Photo URL - Relative: {relative_url}, Absolute: {absolute_url}")
            
            return absolute_url
        return None

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
