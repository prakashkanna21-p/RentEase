# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBUG=False

# Install system dependencies (NO PostgreSQL libraries needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies (NO PostgreSQL packages)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application
COPY . .

# Create media directory
RUN mkdir -p /app/media

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Run the application with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "rentease_backend.wsgi:application"]