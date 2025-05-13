from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from core.models import Review, Task, RegisteredUser
from core.api.serializers.review_serializers import (
    ReviewSerializer, ReviewCreateSerializer, ReviewUpdateSerializer
)
from core.permissions import IsOwner
from core.utils import format_response, paginate_results


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for managing reviews"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        - Only owners can update or delete their reviews
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwner()]
        else:
            return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ReviewCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ReviewUpdateSerializer
        return ReviewSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to create a review"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        try:
            review = serializer.save()
            
            # Return response with the created review
            response_serializer = ReviewSerializer(review)
            return Response(format_response(
                status='success',
                message='Review submitted successfully.',
                data=response_serializer.data
            ), status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(format_response(
                status='error',
                message=str(e)
            ), status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Handle PUT/PATCH requests to update a review"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        
        # Return response with the updated review
        response_serializer = ReviewSerializer(review)
        return Response(format_response(
            status='success',
            message='Review updated successfully.',
            data=response_serializer.data
        ))
    
    def destroy(self, request, *args, **kwargs):
        """Handle DELETE requests to delete a review"""
        instance = self.get_object()
        instance.delete()
        
        return Response(format_response(
            status='success',
            message='Review deleted successfully.'
        ), status=status.HTTP_204_NO_CONTENT)


class TaskReviewsView(views.APIView):
    """View for listing reviews for a specific task"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, task_id):
        """Handle GET requests to retrieve task reviews"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Get reviews
        reviews = Review.objects.filter(task=task)
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Paginate results
        paginated = paginate_results(reviews, page=page, items_per_page=limit)
        
        # Serialize reviews
        serializer = ReviewSerializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'reviews': serializer.data,
                'pagination': paginated['pagination']
            }
        ))
    
    def post(self, request, task_id):
        """Handle POST requests to create a review for a task"""
        # Get task
        task = get_object_or_404(Task, id=task_id)
        
        # Check if task is completed
        if task.status != 'COMPLETED':
            return Response(format_response(
                status='error',
                message='Cannot review a task that is not completed.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is the task creator or assignee
        if request.user != task.creator and request.user != task.assignee:
            return Response(format_response(
                status='error',
                message='Only task participants can submit reviews.'
            ), status=status.HTTP_403_FORBIDDEN)
        
        # Determine reviewee (the other participant)
        if request.user == task.creator:
            reviewee = task.assignee
        else:
            reviewee = task.creator
        
        # Create serializer with data
        data = {
            'score': request.data.get('score'),
            'comment': request.data.get('comment'),
            'reviewee_id': reviewee.id,
            'task_id': task.id
        }
        
        serializer = ReviewCreateSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        try:
            review = serializer.save()
            
            # Return response with the created review
            response_serializer = ReviewSerializer(review)
            return Response(format_response(
                status='success',
                message='Review submitted successfully.',
                data=response_serializer.data
            ), status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(format_response(
                status='error',
                message=str(e)
            ), status=status.HTTP_400_BAD_REQUEST)


class UserReviewsView(views.APIView):
    """View for listing reviews for a specific user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        """Handle GET requests to retrieve user reviews"""
        # Get user
        user = get_object_or_404(RegisteredUser, id=user_id)
        
        # Get reviews received by the user
        reviews = Review.objects.filter(reviewee=user)
        
        # Get page and limit parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        
        # Check if sorting requested
        sort = request.query_params.get('sort', 'createdAt')
        order = request.query_params.get('order', 'desc')
        
        # Apply sorting
        if sort == 'createdAt':
            if order == 'desc':
                reviews = reviews.order_by('-timestamp')
            else:
                reviews = reviews.order_by('timestamp')
        elif sort == 'score':
            if order == 'desc':
                reviews = reviews.order_by('-score')
            else:
                reviews = reviews.order_by('score')
        
        # Paginate results
        paginated = paginate_results(reviews, page=page, items_per_page=limit)
        
        # Serialize reviews
        serializer = ReviewSerializer(paginated['data'], many=True)
        
        return Response(format_response(
            status='success',
            data={
                'reviews': serializer.data,
                'pagination': paginated['pagination']
            }
        ))