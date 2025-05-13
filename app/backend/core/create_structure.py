#!/usr/bin/env python
import os
import sys

def create_directory(path):
    """Create a directory if it doesn't exist."""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")
    else:
        print(f"Directory already exists: {path}")

def create_file(path):
    """Create an empty file if it doesn't exist."""
    if not os.path.exists(path):
        with open(path, 'w') as f:
            pass
        print(f"Created empty file: {path}")
    else:
        print(f"File already exists: {path}")

def main():
    # Check if we're in the core directory
    current_dir = os.path.basename(os.getcwd())
    if current_dir != "core":
        print("This script should be run from the 'core' directory.")
        sys.exit(1)
    
    # Create directories
    directories = [
        "api",
        "api/serializers",
        "api/views",
        "management",
        "management/commands"
    ]
    
    for directory in directories:
        create_directory(directory)
    
    # Create files
    files = [
        "api/__init__.py",
        "api/urls.py",
        "api/serializers/__init__.py",
        "api/serializers/user_serializers.py",
        "api/serializers/task_serializers.py",
        "api/serializers/volunteer_serializers.py",
        "api/serializers/review_serializers.py",
        "api/serializers/bookmark_serializers.py",
        "api/serializers/notification_serializers.py",
        "api/serializers/photo_serializers.py",
        "api/serializers/comment_serializers.py",
        "api/views/__init__.py",
        "api/views/user_views.py",
        "api/views/auth_views.py",
        "api/views/task_views.py",
        "api/views/volunteer_views.py",
        "api/views/review_views.py",
        "api/views/bookmark_views.py",
        "api/views/notification_views.py",
        "api/views/photo_views.py",
        "api/views/admin_views.py",
        "api/views/comment_views.py",
        "permissions.py",
        "utils.py",
        "management/commands/__init__.py",
        "management/commands/wait_for_db.py",
        "management/__init__.py"
    ]
    
    for file in files:
        create_file(file)
    
    print("\nDirectory structure created successfully!")
    print("Please copy and paste the code into the respective files.")

if __name__ == "__main__":
    main()