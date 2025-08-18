# Use official Python image
FROM python:3.11-slim

# Prevent Python from writing pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project code
COPY . .

# Add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 8000

# Use entrypoint to run migrations and collectstatic before starting Gunicorn
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "blog_platform.wsgi:application", "--bind", "0.0.0.0:8000"]