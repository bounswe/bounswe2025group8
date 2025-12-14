from rest_framework import serializers
from core.models import RegisteredUser, Administrator
from django.contrib.auth.password_validation import validate_password
from core.utils import password_meets_requirements, validate_phone_number


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the RegisteredUser model"""
    profile_photo = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()
    badges_count = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    surname = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = RegisteredUser
        fields = ['id', 'name', 'surname', 'username', 'email', 
                 'phone_number', 'location', 'rating', 
                 'completed_task_count', 'is_active', 'profile_photo',
                 'followers_count', 'following_count', 'is_following',
                 'badges', 'badges_count']
        read_only_fields = ['id', 'rating', 'completed_task_count', 'is_active', 
                          'profile_photo', 'followers_count', 'following_count', 
                          'is_following', 'badges', 'badges_count']
    
    def get_name(self, obj):
        """Return *deleted if user is banned"""
        return '*deleted' if not obj.is_active else obj.name
    
    def get_surname(self, obj):
        """Return empty string if user is banned"""
        return '' if not obj.is_active else obj.surname
    
    def get_username(self, obj):
        """Return *deleted if user is banned"""
        return '*deleted' if not obj.is_active else obj.username
    
    def get_profile_photo(self, obj):
        """Get the absolute URL for the profile photo"""
        # Return None if user is banned
        if not obj.is_active:
            return None
        if obj.profile_photo:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None
    
    def get_followers_count(self, obj):
        """Get the number of followers"""
        return obj.followers_set.count()
    
    def get_following_count(self, obj):
        """Get the number of users this user is following"""
        return obj.following_set.count()
    
    def get_is_following(self, obj):
        """Check if the current user is following this user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from core.models import UserFollows
            return UserFollows.objects.filter(
                follower=request.user, 
                following=obj
            ).exists()
        return False
    
    def get_badges(self, obj):
        """Get user's badges"""
        from core.api.serializers.badge_serializers import UserBadgeSimpleSerializer
        badges = obj.earned_badges.select_related('badge').all()[:10]  # Limit to 10 most recent
        return UserBadgeSimpleSerializer(badges, many=True).data
    
    def get_badges_count(self, obj):
        """Get total number of badges earned"""
        return obj.earned_badges.count()


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new user"""
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = RegisteredUser
        fields = ['name', 'surname', 'username', 'email', 
                 'phone_number', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        """Validate user data"""
        # Check if passwords match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Check password strength
        if not password_meets_requirements(data['password']):
            raise serializers.ValidationError({"password": 
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."})
        
        # Validate phone number
        if not validate_phone_number(data['phone_number']):
            raise serializers.ValidationError({"phone_number": "Invalid phone number format."})
        
        return data
    
    def create(self, validated_data):
        """Create a new user instance"""
        validated_data.pop('confirm_password')
        user = RegisteredUser.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information"""
    class Meta:
        model = RegisteredUser
        fields = ['name', 'surname', 'username', 'phone_number', 'location']
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if not validate_phone_number(value):
            raise serializers.ValidationError("Invalid phone number format.")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        """Validate password change data"""
        # Check if new passwords match
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Check password strength
        if not password_meets_requirements(data['new_password']):
            raise serializers.ValidationError({"new_password": 
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."})
        
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset"""
    email = serializers.EmailField(required=True)


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for resetting password with token"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        """Validate password reset data"""
        # Check if passwords match
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Check password strength
        if not password_meets_requirements(data['new_password']):
            raise serializers.ValidationError({"new_password": 
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."})
        
        return data


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for administrators to view user details"""
    reports = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = RegisteredUser
        fields = ['id', 'name', 'surname', 'username', 'email', 
                 'phone_number', 'location', 'rating', 
                 'completed_task_count', 'is_active', 'reports']