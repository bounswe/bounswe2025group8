from rest_framework import serializers
from core.models import Bookmark, BookmarkTag, Tag
from .task_serializers import TaskSerializer
from .user_serializers import UserSerializer


class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for Bookmark model"""
    user = UserSerializer(read_only=True)
    task = TaskSerializer(read_only=True)
    tags = serializers.StringRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'task', 'timestamp', 'tags']
        read_only_fields = ['id', 'user', 'task', 'timestamp', 'tags']


class BookmarkCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new bookmark"""
    task_id = serializers.IntegerField(write_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Bookmark
        fields = ['task_id', 'tag_names']
    
    def validate_task_id(self, value):
        """Validate task exists"""
        from core.models import Task
        
        try:
            Task.objects.get(id=value)
            return value
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found.")
    
    def create(self, validated_data):
        """Create a new bookmark using the model method"""
        from core.models import Task
        
        # Get the user from the context
        user = self.context['request'].user
        
        # Get the task
        task = Task.objects.get(id=validated_data.pop('task_id'))
        
        # Create the bookmark
        bookmark = Bookmark.add_bookmark(user=user, task=task)
        
        # Add tags if provided
        if 'tag_names' in validated_data and validated_data['tag_names']:
            for tag_name in validated_data['tag_names']:
                tag = Tag.create_tag(tag_name)
                bookmark.add_tag(tag)
        
        return bookmark


class BookmarkTagSerializer(serializers.ModelSerializer):
    """Serializer for BookmarkTag model"""
    tag_name = serializers.CharField(source='tag.name', read_only=True)
    
    class Meta:
        model = BookmarkTag
        fields = ['id', 'tag_name']
        read_only_fields = ['id', 'tag_name']


class BookmarkUpdateSerializer(serializers.Serializer):
    """Serializer for adding or removing tags from a bookmark"""
    add_tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    remove_tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    
    def update(self, instance, validated_data):
        """Update bookmark tags"""
        # Add tags
        if 'add_tags' in validated_data and validated_data['add_tags']:
            for tag_name in validated_data['add_tags']:
                tag = Tag.create_tag(tag_name)
                instance.add_tag(tag)
        
        # Remove tags
        if 'remove_tags' in validated_data and validated_data['remove_tags']:
            for tag_name in validated_data['remove_tags']:
                try:
                    tag = Tag.objects.get(name=tag_name.lower())
                    instance.tags.remove(tag)
                except Tag.DoesNotExist:
                    pass  # Ignore if tag doesn't exist
        
        return instance