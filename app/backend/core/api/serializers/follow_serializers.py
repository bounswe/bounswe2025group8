from rest_framework import serializers
from core.models import UserFollows, RegisteredUser


class FollowUserSerializer(serializers.Serializer):
    """Serializer for following/unfollowing a user"""
    message = serializers.CharField(read_only=True)


class FollowerSerializer(serializers.ModelSerializer):
    """Serializer for displaying follower information"""
    id = serializers.IntegerField(source='follower.id', read_only=True)
    username = serializers.CharField(source='follower.username', read_only=True)
    name = serializers.CharField(source='follower.name', read_only=True)
    surname = serializers.CharField(source='follower.surname', read_only=True)
    profile_photo = serializers.SerializerMethodField()
    followed_at = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = UserFollows
        fields = ['id', 'username', 'name', 'surname', 'profile_photo', 'followed_at']
    
    def get_profile_photo(self, obj):
        """Get the absolute URL for the profile photo"""
        if obj.follower.profile_photo:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.follower.profile_photo.url)
            return obj.follower.profile_photo.url
        return None


class FollowingSerializer(serializers.ModelSerializer):
    """Serializer for displaying following information"""
    id = serializers.IntegerField(source='following.id', read_only=True)
    username = serializers.CharField(source='following.username', read_only=True)
    name = serializers.CharField(source='following.name', read_only=True)
    surname = serializers.CharField(source='following.surname', read_only=True)
    profile_photo = serializers.SerializerMethodField()
    followed_at = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = UserFollows
        fields = ['id', 'username', 'name', 'surname', 'profile_photo', 'followed_at']
    
    def get_profile_photo(self, obj):
        """Get the absolute URL for the profile photo"""
        if obj.following.profile_photo:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.following.profile_photo.url)
            return obj.following.profile_photo.url
        return None
