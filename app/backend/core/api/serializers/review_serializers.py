from rest_framework import serializers
from core.models import Review, Task
from .user_serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model with detailed ratings"""
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    is_volunteer_to_requester = serializers.SerializerMethodField()
    is_requester_to_volunteer = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'score', 'comment', 'timestamp', 'reviewer', 'reviewee', 'task',
            # Volunteer -> Requester ratings
            'accuracy_of_request', 'communication_volunteer_to_requester', 
            'safety_and_preparedness',
            # Requester -> Volunteer ratings
            'reliability', 'task_completion', 'communication_requester_to_volunteer',
            'safety_and_respect',
            # Helper fields
            'is_volunteer_to_requester', 'is_requester_to_volunteer'
        ]
        read_only_fields = ['id', 'timestamp', 'reviewer', 'reviewee', 'task', 'score']
    
    def get_is_volunteer_to_requester(self, obj):
        """Check if this is a volunteer reviewing requester"""
        return obj.is_volunteer_to_requester_review()
    
    def get_is_requester_to_volunteer(self, obj):
        """Check if this is a requester reviewing volunteer"""
        return obj.is_requester_to_volunteer_review()


class ReviewCreateSerializer(serializers.Serializer):
    """Serializer for creating a new review with detailed ratings"""
    reviewee_id = serializers.IntegerField(write_only=True)
    task_id = serializers.IntegerField(write_only=True)
    comment = serializers.CharField(required=False, allow_blank=True)
    
    # Volunteer -> Requester ratings
    accuracy_of_request = serializers.FloatField(
        required=False, min_value=1.0, max_value=5.0,
        help_text="Was the task as described?"
    )
    communication_volunteer_to_requester = serializers.FloatField(
        required=False, min_value=1.0, max_value=5.0,
        help_text="Was the requester easy to communicate with?"
    )
    safety_and_preparedness = serializers.FloatField(
        required=False, min_value=1.0, max_value=5.0,
        help_text="Did you feel safe? Was requester prepared?"
    )
    
    # Requester -> Volunteer ratings
    reliability = serializers.FloatField(
        required=False, min_value=1.0, max_value=5.0,
        help_text="Did volunteer arrive on time?"
    )
    task_completion = serializers.FloatField(
        required=False, min_value=1.0, max_value=5.0,
        help_text="Did volunteer complete the task?"
    )
    communication_requester_to_volunteer = serializers.FloatField(
        required=False, min_value=1.0, max_value=5.0,
        help_text="How clear was volunteer's communication?"
    )
    safety_and_respect = serializers.FloatField(
        required=False, min_value=1.0, max_value=5.0,
        help_text="Did you feel safe and respected?"
    )
    
    def validate(self, data):
        """Validate review data"""
        # Check that at least one set of ratings is provided
        volunteer_to_requester_fields = [
            'accuracy_of_request', 
            'communication_volunteer_to_requester', 
            'safety_and_preparedness'
        ]
        requester_to_volunteer_fields = [
            'reliability', 
            'task_completion', 
            'communication_requester_to_volunteer',
            'safety_and_respect'
        ]
        
        has_volunteer_ratings = any(data.get(f) is not None for f in volunteer_to_requester_fields)
        has_requester_ratings = any(data.get(f) is not None for f in requester_to_volunteer_fields)
        
        if not has_volunteer_ratings and not has_requester_ratings:
            raise serializers.ValidationError(
                "At least one set of ratings (volunteer-to-requester OR requester-to-volunteer) must be provided."
            )
        
        if has_volunteer_ratings and has_requester_ratings:
            raise serializers.ValidationError(
                "Cannot provide both volunteer-to-requester AND requester-to-volunteer ratings in the same review."
            )
        
        # Get the user from context
        reviewer = self.context['request'].user
        
        # Get reviewee
        reviewee_id = data.pop('reviewee_id')
        from core.models import RegisteredUser
        try:
            reviewee = RegisteredUser.objects.get(id=reviewee_id)
        except RegisteredUser.DoesNotExist:
            raise serializers.ValidationError({"reviewee_id": "Reviewee not found."})
        
        # Get task
        task_id = data.pop('task_id')
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise serializers.ValidationError({"task_id": "Task not found."})
        
        # Store for create method
        data['reviewer'] = reviewer
        data['reviewee'] = reviewee
        data['task'] = task
        
        return data
    
    def create(self, validated_data):
        """Create a new review using the model method"""
        reviewer = validated_data.pop('reviewer')
        reviewee = validated_data.pop('reviewee')
        task = validated_data.pop('task')
        comment = validated_data.pop('comment', '')
        
        try:
            review = Review.submit_review(
                reviewer=reviewer,
                reviewee=reviewee,
                task=task,
                comment=comment,
                **validated_data  # Pass all rating fields
            )
            return review
        except ValueError as e:
            raise serializers.ValidationError(str(e))


class ReviewUpdateSerializer(serializers.Serializer):
    """Serializer for updating a review"""
    comment = serializers.CharField(required=False, allow_blank=True)
    
    # Volunteer -> Requester ratings
    accuracy_of_request = serializers.FloatField(required=False, min_value=1.0, max_value=5.0)
    communication_volunteer_to_requester = serializers.FloatField(required=False, min_value=1.0, max_value=5.0)
    safety_and_preparedness = serializers.FloatField(required=False, min_value=1.0, max_value=5.0)
    
    # Requester -> Volunteer ratings
    reliability = serializers.FloatField(required=False, min_value=1.0, max_value=5.0)
    task_completion = serializers.FloatField(required=False, min_value=1.0, max_value=5.0)
    communication_requester_to_volunteer = serializers.FloatField(required=False, min_value=1.0, max_value=5.0)
    safety_and_respect = serializers.FloatField(required=False, min_value=1.0, max_value=5.0)
    
    def update(self, instance, validated_data):
        """Update review"""
        # Check if trying to update someone else's review
        if instance.reviewer != self.context['request'].user:
            raise serializers.ValidationError("You can only update your own reviews.")
        
        # Update comment if provided
        if 'comment' in validated_data:
            instance.set_comment(validated_data['comment'])
        
        # Update rating fields if provided
        for field, value in validated_data.items():
            if field != 'comment' and value is not None:
                setattr(instance, field, value)
        
        instance.save()
        return instance