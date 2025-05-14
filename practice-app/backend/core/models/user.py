from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    """Manager for user profiles"""
    
    def create_user(self, email, name, surname, username, phone_number, password=None):
        """Create a new user profile"""
        if not email:
            raise ValueError('User must have an email address')
        
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            name=name,
            surname=surname,
            username=username,
            phone_number=phone_number
        )
        
        user.set_password(password)
        user.save(using=self._db)
        
        return user
    
    def create_superuser(self, email, name, surname, username, phone_number, password):
        """Create and save a new superuser with given details"""
        user = self.create_user(
            email=email,
            name=name,
            surname=surname,
            username=username,
            phone_number=phone_number,
            password=password
        )
        
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        
        return user


class RegisteredUser(AbstractBaseUser, PermissionsMixin):
    """Database model for users in the system"""
    class Meta:
        app_label = 'core'
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    phone_number = models.CharField(max_length=20)
    location = models.CharField(max_length=255, blank=True)
    rating = models.FloatField(default=0.0)
    completed_task_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    reset_token = models.CharField(max_length=100, null=True, blank=True)
    reset_token_expiry = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'surname', 'username', 'phone_number']
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='registered_user_set',  # Add this line
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='registered_user_set',  # Add this line
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    def __str__(self):
        """Return string representation of user"""
        return self.email
    
    # Getters
    def get_name(self):
        """Get user's name"""
        return self.name
    
    def get_surname(self):
        """Get user's surname"""
        return self.surname
    
    def get_username(self):
        """Get user's username"""
        return self.username
    
    def get_email(self):
        """Get user's email"""
        return self.email
    
    def get_phone_number(self):
        """Get user's phone number"""
        return self.phone_number
    
    def get_location(self):
        """Get user's location"""
        return self.location
    
    def get_rating(self):
        """Get user's rating"""
        return self.rating
    
    def get_completed_task_count(self):
        """Get user's completed task count"""
        return self.completed_task_count
    
    # Setters
    def set_name(self, name):
        """Set user's name"""
        self.name = name
        self.save()
    
    def set_surname(self, surname):
        """Set user's surname"""
        self.surname = surname
        self.save()
    
    def set_username(self, username):
        """Set user's username"""
        self.username = username
        self.save()
    
    def set_email(self, email):
        """Set user's email"""
        self.email = email
        self.save()
    
    def set_phone_number(self, phone_number):
        """Set user's phone number"""
        self.phone_number = phone_number
        self.save()
    
    def set_location(self, location):
        """Set user's location"""
        self.location = location
        self.save()
    
    def set_rating(self, rating):
        """Set user's rating"""
        self.rating = rating
        self.save()
    
    def set_completed_task_count(self, count):
        """Set user's completed task count"""
        self.completed_task_count = count
        self.save()
    
    def increment_completed_task_count(self):
        """Increment user's completed task count by 1"""
        self.completed_task_count += 1
        self.save()
    
    # Business logic methods as per class diagram
    def login(self, email, password):
        """Login method - this would be handled by Django auth"""
        # Django authentication handles this
        pass
    
    def logout(self):
        """Logout method - this would be handled by Django auth"""
        # Django authentication handles this
        pass
    
    def recover_password(self, email):
        """Password recovery - this would be handled by Django auth"""
        # Django authentication handles this
        pass
    
    def edit_profile_info(self):
        """Edit profile info - this would be handled by form processing"""
        # This will be implemented in the views
        pass
    
    def edit_notification_preferences(self):
        """Edit notification preferences"""
        # This will be implemented in the views
        pass
    
    def follow_user(self, user):
        """Follow another user"""
        # This would involve a UserFollows model (to be implemented)
        pass
    
    def unfollow_user(self, user):
        """Unfollow a user"""
        # This would involve a UserFollows model (to be implemented)
        pass
    
    def report_user(self, user, reason):
        """Report a user"""
        # This would involve a UserReport model (to be implemented)
        pass


class Administrator(models.Model):
    """Model for administrators with extra permissions"""
    user = models.OneToOneField(RegisteredUser, on_delete=models.CASCADE)
    
    def __str__(self):
        """Return string representation of admin"""
        return f"Admin: {self.user.username}"
    
    def ban_user(self, user):
        """Ban a user"""
        user.is_active = False
        user.save()
        return True
    
    def moderate_content(self):
        """Content moderation functionality"""
        # Implementation in views
        pass
    
    def manage_reports(self):
        """Handle user reports"""
        # Implementation in views
        pass


# Note: Guest is not a database model since it represents non-authenticated users
class Guest:
    """Non-authenticated user (not stored in DB)"""
    
    @staticmethod
    def register(name, surname, username, email, phone_number, password):
        """Register a new user"""
        return RegisteredUser.objects.create_user(
            email=email,
            name=name,
            surname=surname,
            username=username,
            phone_number=phone_number,
            password=password
        )
    
    @staticmethod
    def view_public_requests():
        """View public task requests"""
        # This will be implemented in views
        from .task import Task
        return Task.objects.filter(status='POSTED')