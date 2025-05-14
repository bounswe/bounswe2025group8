from rest_framework import serializers
from core.models import Review, Task
from .user_serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'score', 'comment', 'timestamp', 'reviewer', 'reviewee', 'task']
        read_only_fields = ['id', 'timestamp', 'reviewer', 'reviewee', 'task']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new review"""
    reviewee_id = serializers.IntegerField(write_only=True)
    task_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = ['score', 'comment', 'reviewee_id', 'task_id']
    
    def validate(self, data):
        """Validate review data"""
        # Get the user from the context
        reviewer = self.context['request'].user
        
        # Get the reviewee
        reviewee_id = data.pop('reviewee_id')
        from core.models import RegisteredUser
        try:
            reviewee = RegisteredUser.objects.get(id=reviewee_id)
        except RegisteredUser.DoesNotExist:
            raise serializers.ValidationError({"reviewee_id": "Reviewee not found."})
        
        # Get the task
        task_id = data.pop('task_id')
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise serializers.ValidationError({"task_id": "Task not found."})
        
        # Store these for use in create method
        data['reviewee'] = reviewee
        data['task'] = task
        data['reviewer'] = reviewer
        
        return data
    
    def create(self, validated_data):
        """Create a new review using the model method"""
        reviewer = validated_data.pop('reviewer')
        reviewee = validated_data.pop('reviewee')
        task = validated_data.pop('task')
        
        try:
            # Use the model method to create review and handle validations
            review = Review.submit_review(
                reviewer=reviewer,
                reviewee=reviewee,
                task=task,
                score=validated_data['score'],
                comment=validated_data['comment']
            )
            return review
        except ValueError as e:
            # Handle validation errors from model method
            raise serializers.ValidationError(str(e))


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a review"""
    class Meta:
        model = Review
        fields = ['score', 'comment']
    
    def update(self, instance, validated_data):
        """Update review"""
        # Check if trying to update someone else's review
        if instance.reviewer != self.context['request'].user:
            raise serializers.ValidationError("You can only update your own reviews.")
        
        # Update fields
        if 'score' in validated_data:
            instance.set_score(validated_data['score'])
        
        if 'comment' in validated_data:
            instance.set_comment(validated_data['comment'])
        
        return instance