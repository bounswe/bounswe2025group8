from django.contrib import admin
from core.models import Badge, UserBadge, BadgeType


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Admin interface for Badge model"""
    list_display = ['name', 'badge_type', 'created_at']
    list_filter = ['badge_type', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Badge Information', {
            'fields': ('badge_type', 'name', 'description', 'icon_url')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """Admin interface for UserBadge model"""
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['badge', 'earned_at']
    search_fields = ['user__username', 'user__email', 'badge__name']
    readonly_fields = ['earned_at']
    
    fieldsets = (
        ('Assignment', {
            'fields': ('user', 'badge')
        }),
        ('Metadata', {
            'fields': ('earned_at',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make user and badge readonly after creation"""
        if obj:  # Editing an existing object
            return self.readonly_fields + ['user', 'badge']
        return self.readonly_fields
