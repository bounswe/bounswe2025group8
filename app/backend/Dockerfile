FROM python:3.9-slim

WORKDIR /app

<<<<<<< HEAD
# Install PostgreSQL client and Pillow dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Make wait-for-db script executable
RUN chmod +x wait-for-db.sh

# Expose port
EXPOSE 8000
=======
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .


EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
>>>>>>> ali-sonmez/frontend/create-request
