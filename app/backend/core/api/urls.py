from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.api.views import (
    user_views, auth_views, task_views, volunteer_views, 
    review_views, bookmark_views, notification_views, 
    photo_views, admin_views, comment_views
)

router = DefaultRouter()
router.register(r'users', user_views.UserViewSet)
router.register(r'tasks', task_views.TaskViewSet)
router.register(r'volunteers', volunteer_views.VolunteerViewSet)
router.register(r'reviews', review_views.ReviewViewSet)
router.register(r'bookmarks', bookmark_views.BookmarkViewSet)
router.register(r'notifications', notification_views.NotificationViewSet)
router.register(r'comments', comment_views.CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/register/', auth_views.RegisterView.as_view(), name='register'),
    path('auth/login/', auth_views.LoginView.as_view(), name='login'),
    path('auth/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('auth/request-reset/', auth_views.PasswordResetRequestView.as_view(), name='request-reset'),
    path('auth/verify-token/<str:token>/', auth_views.VerifyTokenView.as_view(), name='verify-token'),
    path('auth/reset-password/', auth_views.ResetPasswordView.as_view(), name='reset-password'),
    path('auth/check-availability/', auth_views.CheckAvailabilityView.as_view(), name='check-availability'),
    
    # Task-specific endpoints
    path('tasks/<int:task_id>/volunteers/', volunteer_views.TaskVolunteersView.as_view(), name='task-volunteers'),
    path('tasks/<int:task_id>/reviews/', review_views.TaskReviewsView.as_view(), name='task-reviews'),
    path('tasks/<int:task_id>/photo/', photo_views.TaskPhotoView.as_view(), name='task-photo'),
    path('tasks/<int:task_id>/complete/', task_views.CompleteTaskView.as_view(), name='complete-task'),
    
    # User-specific endpoints
    path('users/<int:user_id>/tasks/', task_views.UserTasksView.as_view(), name='user-tasks'),
    path('users/<int:user_id>/reviews/', review_views.UserReviewsView.as_view(), name='user-reviews'),
    
    # Admin endpoints
    path('admin/reported-users/', admin_views.ReportedUsersView.as_view(), name='reported-users'),
    path('admin/users/<int:user_id>/', admin_views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/ban/', admin_views.BanUserView.as_view(), name='ban-user'),
]