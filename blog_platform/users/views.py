from django.views.generic import TemplateView
from django.shortcuts import render
from core.views.mixins import JWTLoginRequiredMixin, SuperUserRequiredMixin, RedirectAuthenticatedUserMixin

class RegisterView(RedirectAuthenticatedUserMixin, TemplateView):
    template_name = 'users/register.html'

class LoginView(RedirectAuthenticatedUserMixin, TemplateView):
    template_name = 'users/login.html'
    
    

    