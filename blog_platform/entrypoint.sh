#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e

# Run migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Execute CMD
exec "$@"