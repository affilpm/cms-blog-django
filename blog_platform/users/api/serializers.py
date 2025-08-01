from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from ..models import CustomUser
from ..utils.validators import (
    validate_email_format,
    validate_name,
    validate_password_strength,
    validate_username_format,
)
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only = True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def validate_email(self, value):
        return validate_email_format(value)
    
    def validate_username(self, value):
        return validate_username_format(value)
    
    def validate_first_name(self, value):
        return validate_name(value, field_name="First name")
    
    def validate_last_name(self, value):
        return validate_name(value, field_name='Last Name')
    
    def validate_password(self, value):
        return validate_password_strength(value)
        
    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError("Passwords do not match.")
        return data 
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(**validated_data)
        return user
        
           
        