from rest_framework import serializers
from core.models import RegisteredUser, Administrator
from django.contrib.auth.password_validation import validate_password
from core.utils import password_meets_requirements, validate_phone_number


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the RegisteredUser model"""
    class Meta:
        model = RegisteredUser
        fields = ['id', 'name', 'surname', 'username', 'email', 
                 'phone_number', 'location', 'rating', 
                 'completed_task_count', 'is_active']
        read_only_fields = ['id', 'rating', 'completed_task_count', 'is_active']


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