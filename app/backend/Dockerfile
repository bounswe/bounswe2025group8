FROM python:3.9-slim

WORKDIR /app

# Install PostgreSQL client for database connectivity
RUN apt-get update && apt-get install -y postgresql-client

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Make wait-for-db script executable
RUN chmod +x wait-for-db.sh

# Expose port
EXPOSE 8000