from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from core.models import Badge, UserBadge, BadgeType, RegisteredUser
from core.api.serializers.badge_serializers import (
    BadgeSerializer, 
    UserBadgeSerializer,
    UserBadgeSimpleSerializer
)
from core.services.badge_service import BadgeService


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing badges.
    Only admins can create/update badges through admin panel.
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = []  # Public read access
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get all available badge types"""
        badge_types = [
            {
                'value': choice[0],
                'label': choice[1]
            }
            for choice in BadgeType.choices
        ]
        return Response(badge_types)


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user badges.
    Users can view their own badges and others' badges.
    """
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = []  # Public read access
    
    def get_queryset(self):
        """Filter badges by user if user_id is provided"""
        queryset = UserBadge.objects.select_related('user', 'badge').all()
        user_id = self.request.query_params.get('user_id', None)
        
        if user_id is not None:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset.order_by('-earned_at')
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_badges(self, request):
        """Get authenticated user's badges"""
        badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        serializer = UserBadgeSimpleSerializer(badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def check_all(self, request):
        """Manually trigger badge checking for authenticated user"""
        user = request.user
        badges_awarded = BadgeService.check_all_badges_for_user(user)
        
        return Response({
            'message': f'Badge check completed. {len(badges_awarded)} new badges awarded.',
            'badges_awarded': [badge for badge in badges_awarded]
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def check_user(self, request):
        """Admin endpoint to trigger badge checking for a specific user"""
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = get_object_or_404(RegisteredUser, id=user_id)
        badges_awarded = BadgeService.check_all_badges_for_user(user)
        
        return Response({
            'message': f'Badge check completed for {user.username}. {len(badges_awarded)} new badges awarded.',
            'badges_awarded': [badge for badge in badges_awarded]
        })
