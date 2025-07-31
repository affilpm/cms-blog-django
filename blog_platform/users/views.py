from django.views.generic import TemplateView
from core.views.mixins import JWTLoginRequiredMixin
    
class RegisterView(JWTLoginRequiredMixin,TemplateView):
    template_name = 'users/register.html'

class LoginView(TemplateView):
    template_name = 'users/login.html'