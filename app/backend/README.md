# Neighborhood Assistance Board Backend

This is the backend API for the Neighborhood Assistance Board application, built with Django REST Framework.

## Setup Instructions

### Prerequisites
- Python 3.9+
- PostgreSQL 14+
- Docker and Docker Compose (optional for containerized setup)

### Local Development Setup

1. Clone the repository
2. Navigate to the practice-app directory
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up the database:
   ```
   python manage.py migrate
   ```
5. Run the development server:
   ```
   python manage.py runserver
   ```

### Docker Setup

1. Build and start the containers:
   ```
   docker-compose up --build
   ```
2. The API will be available at http://localhost:8000/api/

## Project Structure

- `/core` - Core application with main functionality
- `/neighborhood_assistance_board` - Project settings and configuration