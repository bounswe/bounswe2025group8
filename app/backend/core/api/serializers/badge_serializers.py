from rest_framework import serializers
from core.models import Badge, UserBadge, BadgeType


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model"""
    badge_type_display = serializers.CharField(source='get_badge_type_display', read_only=True)
    
    class Meta:
        model = Badge
        fields = ['id', 'badge_type', 'badge_type_display', 'name', 'description', 'icon_url', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge model"""
    badge = BadgeSerializer(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'user_id', 'username', 'badge', 'earned_at']
        read_only_fields = ['id', 'earned_at']


class UserBadgeSimpleSerializer(serializers.ModelSerializer):
    """Simplified serializer for displaying user's badges"""
    badge_name = serializers.CharField(source='badge.name', read_only=True)
    badge_type = serializers.CharField(source='badge.badge_type', read_only=True)
    badge_icon = serializers.CharField(source='badge.icon_url', read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['badge_name', 'badge_type', 'badge_icon', 'earned_at']
