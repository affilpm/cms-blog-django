from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from core.models.base import  TimeStampedModel

# Create your models here.

class CustomUser(AbstractUser, TimeStampedModel):
    email = models.EmailField(_('email address'), unique=True)
    profile_photo = models.ImageField(upload_to='profile_photos', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return self.email