import re

def format_response(status, message=None, data=None):
    """
    Format a consistent API response structure
    
    Args:
        status (str): 'success' or 'error'
        message (str, optional): Response message
        data (dict, optional): Response data
        
    Returns:
        dict: Formatted response dictionary
    """
    response = {'status': status}
    
    if message:
        response['message'] = message
        
    if data:
        response['data'] = data
        
    return response


def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent error responses.
    """
    from rest_framework.views import exception_handler
    from rest_framework.response import Response
    from rest_framework import status
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, there was an unhandled exception
    if response is None:
        return Response(
            format_response(
                status='error',
                message='An unexpected error occurred.',
            ),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Format the response to match our API response structure
    error_data = {}
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, dict):
            error_data = exc.detail
        elif isinstance(exc.detail, list):
            error_data = {'detail': exc.detail}
        else:
            error_data = {'detail': str(exc.detail)}
    
    response.data = format_response(
        status='error',
        message=str(exc),
        data=error_data if error_data else None
    )
    
    return response


def password_meets_requirements(password):
    """
    Check if a password meets the strength requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    
    Args:
        password (str): The password to check
        
    Returns:
        bool: True if password meets requirements, False otherwise
    """
    # Check length
    if len(password) < 8:
        return False
    
    # Check for uppercase letter
    if not any(char.isupper() for char in password):
        return False
    
    # Check for lowercase letter
    if not any(char.islower() for char in password):
        return False
    
    # Check for digit
    if not any(char.isdigit() for char in password):
        return False
    
    # Check for special character
    special_chars = r'[!@#$%^&*(),.?":{}|<>]'
    if not re.search(special_chars, password):
        return False
    
    return True


def validate_phone_number(phone_number):
    """
    Validate phone number format
    
    Args:
        phone_number (str): The phone number to validate
        
    Returns:
        bool: True if phone number is valid, False otherwise
    """
    # Basic phone number validation
    # Allows +, country code, and numbers
    pattern = r'^\+?[0-9]{10,15}$'
    return bool(re.match(pattern, phone_number))


def paginate_results(queryset, page=1, items_per_page=20):
    """
    Paginate queryset results
    
    Args:
        queryset: The queryset to paginate
        page (int): Page number (1-based)
        items_per_page (int): Number of items per page
        
    Returns:
        dict: Dictionary with paginated data and pagination metadata
    """
    # Ensure page is at least 1
    page = max(1, page)
    
    # Calculate start and end indices
    start = (page - 1) * items_per_page
    end = start + items_per_page
    
    # Get total count
    total_count = queryset.count()
    
    # Get paginated data
    data = queryset[start:end]
    
    # Calculate total pages
    total_pages = (total_count + items_per_page - 1) // items_per_page
    
    # Prepare pagination metadata
    pagination = {
        'total_records': total_count,
        'current_page': page,
        'total_pages': total_pages,
        'next_page': page + 1 if page < total_pages else None,
        'prev_page': page - 1 if page > 1 else None
    }
    
    return {
        'data': data,
        'pagination': pagination
    }


def generate_token(length=32):
    """
    Generate a random token for password reset
    
    Args:
        length (int): Length of the token
        
    Returns:
        str: Random token
    """
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_reset_token_expiry():
    """
    Generate expiry timestamp for password reset token (24 hours from now)
    
    Returns:
        datetime: Expiry timestamp
    """
    from django.utils import timezone
    import datetime
    
    return timezone.now() + datetime.timedelta(hours=24)


def is_token_valid(expiry_timestamp):
    """
    Check if a token is still valid based on its expiry timestamp
    
    Args:
        expiry_timestamp (datetime): Token expiry timestamp
        
    Returns:
        bool: True if token is valid, False otherwise
    """
    from django.utils import timezone
    
    if not expiry_timestamp:
        return False
    
    return timezone.now() < expiry_timestamp


def mask_address(address):
    """
    Mask detailed address information, keeping only city, state, and zip code.
    
    Args:
        address (str): Full address string
        
    Returns:
        str: Masked address with only general location
        
    Examples:
        "123 Main St, Apt 4B, New York, NY, 10001" -> "New York, NY, 10001"
        "456 Oak Ave, Los Angeles, CA, 90001" -> "Los Angeles, CA, 90001"
    """
    if not address:
        return address
    
    # Split by comma and get the last parts (typically city, state, zip)
    parts = [part.strip() for part in address.split(',')]
    
    # Keep last 3 parts if available (city, state, zip), otherwise keep last 2
    if len(parts) >= 3:
        return ', '.join(parts[-3:])
    elif len(parts) >= 2:
        return ', '.join(parts[-2:])
    else:
        # If address doesn't follow expected format, return as is
        return address


def mask_phone_number(phone_number):
    """
    Mask phone number for privacy.
    
    Args:
        phone_number (str): Full phone number
        
    Returns:
        str: Masked phone number showing only last 4 digits
        
    Examples:
        "+1234567890" -> "****7890"
        "1234567890" -> "****7890"
    """
    if not phone_number:
        return phone_number
    
    # Remove any non-digit characters except '+'
    cleaned = ''.join(c for c in phone_number if c.isdigit())
    
    # Show only last 4 digits
    if len(cleaned) > 4:
        return '****' + cleaned[-4:]
    else:
        return phone_number