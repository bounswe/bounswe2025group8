from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from core.models import RegisteredUser
from core.api.serializers.user_serializers import (
    UserCreateSerializer, PasswordResetRequestSerializer, PasswordResetSerializer
)
from core.utils import (
    format_response, generate_token, generate_reset_token_expiry, is_token_valid
)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(views.APIView):
    """View for user registration"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle POST requests to register a new user"""
        serializer = UserCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Create response data
            response_data = {
                'user_id': user.id,
                'name': user.name,
                'email': user.email
            }
            
            return Response(format_response(
                status='success',
                message='Registration successful. Please log in to continue.',
                data=response_data
            ), status=status.HTTP_201_CREATED)
        
        return Response(format_response(
            status='error',
            message='Registration failed.',
            data=serializer.errors
        ), status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    """View for user login"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle POST requests to login a user"""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(format_response(
                status='error',
                message='Please provide both email and password.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(email=email, password=password)
        
        if user:
            # Check if user is active
            if not user.is_active:
                return Response(format_response(
                    status='error',
                    message='Account is deactivated.'
                ), status=status.HTTP_401_UNAUTHORIZED)
            
            # Log in the user
            login(request, user)
            
            # Get or create token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response(format_response(
                status='success',
                message='Login successful.',
                data={'token': token.key, 'user_id': user.id}
            ))
        
        return Response(format_response(
            status='error',
            message='Invalid credentials.'
        ), status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(views.APIView):
    """View for user logout"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle POST requests to logout a user"""
        # Delete the user's token
        Token.objects.filter(user=request.user).delete()
        
        # Logout from session
        logout(request)
        
        return Response(format_response(
            status='success',
            message='Logout successful.'
        ))


class PasswordResetRequestView(views.APIView):
    """View for requesting password reset"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle POST requests to request password reset"""
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Always return the same response regardless of whether the email exists
            # This prevents user enumeration
            response_message = (
                "If your email exists in our system, "
                "you will receive a password reset link shortly."
            )
            
            # Check if user exists
            try:
                user = RegisteredUser.objects.get(email=email)
                
                # Generate token and expiry
                token = generate_token()
                expiry = generate_reset_token_expiry()
                
                # Store token and expiry in user instance
                # (You would need to add these fields to your model)
                user.reset_token = token
                user.reset_token_expiry = expiry
                user.save()
                
                # In a real implementation, send an email with the reset link
                # For now, we'll just return the token in the response for testing
                if settings.DEBUG:
                    return Response(format_response(
                        status='success',
                        message=response_message,
                        data={'token': token}  # Only include in DEBUG mode
                    ))
            except RegisteredUser.DoesNotExist:
                # User doesn't exist, but return the same message
                pass
            
            return Response(format_response(
                status='success',
                message=response_message
            ))
        
        return Response(format_response(
            status='error',
            message='Invalid email format.',
            data=serializer.errors
        ), status=status.HTTP_400_BAD_REQUEST)


class VerifyTokenView(views.APIView):
    """View for verifying reset token"""
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        """Handle GET requests to verify a reset token"""
        # Find user with this token
        try:
            user = RegisteredUser.objects.get(reset_token=token)
            
            # Check if token is expired
            if not is_token_valid(user.reset_token_expiry):
                return Response(format_response(
                    status='error',
                    message='Invalid or expired token. Please request a new password reset link.'
                ), status=status.HTTP_400_BAD_REQUEST)
            
            return Response(format_response(
                status='success',
                message='Token is valid.',
                data={
                    'email': user.email,
                    'token_expiry': user.reset_token_expiry
                }
            ))
        except RegisteredUser.DoesNotExist:
            return Response(format_response(
                status='error',
                message='Invalid or expired token. Please request a new password reset link.'
            ), status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(views.APIView):
    """View for resetting password with token"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle POST requests to reset password with token"""
        serializer = PasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            # Find user with this token
            try:
                user = RegisteredUser.objects.get(reset_token=token)
                
                # Check if token is expired
                if not is_token_valid(user.reset_token_expiry):
                    return Response(format_response(
                        status='error',
                        message='Invalid or expired token. Please request a new password reset link.'
                    ), status=status.HTTP_400_BAD_REQUEST)
                
                # Reset password
                user.set_password(new_password)
                
                # Clear token and expiry
                user.reset_token = None
                user.reset_token_expiry = None
                user.save()
                
                return Response(format_response(
                    status='success',
                    message='Password has been reset successfully. You can now log in with your new password.'
                ))
            except RegisteredUser.DoesNotExist:
                return Response(format_response(
                    status='error',
                    message='Invalid or expired token. Please request a new password reset link.'
                ), status=status.HTTP_400_BAD_REQUEST)
        
        return Response(format_response(
            status='error',
            message='Invalid data provided.',
            data=serializer.errors
        ), status=status.HTTP_400_BAD_REQUEST)


class CheckAvailabilityView(views.APIView):
    """View for checking email or phone number availability"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Handle GET requests to check availability"""
        email = request.query_params.get('email')
        phone_number = request.query_params.get('phone_number')
        
        if not email and not phone_number:
            return Response(format_response(
                status='error',
                message='Please provide either email or phone_number parameter.'
            ), status=status.HTTP_400_BAD_REQUEST)
        
        # Check email availability
        if email:
            email_exists = RegisteredUser.objects.filter(email=email).exists()
            if email_exists:
                return Response(format_response(
                    status='error',
                    available=False,
                    message='This email is already associated with an existing account.'
                ))
            else:
                return Response(format_response(
                    status='success',
                    available=True,
                    message='This email is available for registration.'
                ))
        
        # Check phone number availability
        if phone_number:
            phone_exists = RegisteredUser.objects.filter(phone_number=phone_number).exists()
            if phone_exists:
                return Response(format_response(
                    status='error',
                    available=False,
                    message='This phone number is already associated with an existing account.'
                ))
            else:
                return Response(format_response(
                    status='success',
                    available=True,
                    message='This phone number is available for registration.'
                ))