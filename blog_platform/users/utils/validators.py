import re
from rest_framework.exceptions import ValidationError

def validate_email_format(value):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(pattern, value):
        raise ValidationError("Enter a valid email address.")
    return value

def validate_username_format(value):
    pattern = r'^[a-zA-Z0-9_.-]{4,30}$'
    if not re.match(pattern, value):
        raise ValidationError("Username must be 4-30 characters and only contain letters, numbers and _ . -")
    return value

def validate_name(value, field_name="Name"):
    if not value.isalpha():
        raise ValidationError(f"{field_name} must contain only letters.")
    return value

def validate_password_strength(value):
    pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[a-z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    if not re.match(pattern, value):
        raise ValidationError(
            "password must be at least 8 characters long. inlude uppercase, lowercase, number, and special character."
        )
    return value    